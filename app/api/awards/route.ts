// app/api/awards/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Use faster model and get only 5 books
    const prompt = `You are a book recommendation expert. For the category "${category}", provide exactly 5 specific, real book titles.

Format as JSON array:
[
  {"title": "Book Title", "author": "Author Name"}
]

Only JSON, no extra text.`;

    // Use FASTER model: llama-3.1-8b-instant (much faster than 70b)
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // FAST MODEL
        messages: [
          {
            role: 'system',
            content: 'You are a book expert. Respond only with JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower = faster
        max_tokens: 500,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get recommendations' },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content received' },
        { status: 500 }
      );
    }

    let recommendations;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse recommendations' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // PARALLEL PROCESSING - Fetch all books at once instead of one by one
    const bookPromises = recommendations.map(async (rec: any) => {
      try {
        const searchQuery = `${rec.title} ${rec.author}`;
        const searchResponse = await fetch(
          `${baseUrl}/api/books/search?q=${encodeURIComponent(searchQuery)}&page=1`,
          { cache: 'no-store' }
        );

        if (!searchResponse.ok) return null;

        const searchData = await searchResponse.json();
        if (!searchData.books || searchData.books.length === 0) return null;

        const searchBook = searchData.books[0];
        
        // Fetch full details in parallel too
        const detailResponse = await fetch(
          `${baseUrl}/api/books/${searchBook.id}`,
          { cache: 'no-store' }
        );
        
        if (!detailResponse.ok) {
          return {
            ...searchBook,
            description: searchBook.description || 'A highly recommended book.',
            thumbnail: searchBook.thumbnail || '/images/no-cover.jpg',
          };
        }

        const fullBook = await detailResponse.json();
        
        return {
          id: fullBook.id,
          title: fullBook.title || searchBook.title,
          authors: fullBook.authors || searchBook.authors || ['Unknown Author'],
          thumbnail: fullBook.coverImage || fullBook.thumbnail || searchBook.thumbnail || '/images/no-cover.jpg',
          averageRating: fullBook.averageRating || searchBook.averageRating || 0,
          ratingsCount: fullBook.ratingsCount || searchBook.ratingsCount || 0,
          description: fullBook.description || searchBook.description || 'A highly recommended book.',
          publishedDate: fullBook.publishedDate || searchBook.publishedDate || '',
        };
      } catch (error) {
        console.error(`Error fetching book:`, error);
        return null;
      }
    });

    // Wait for all books to fetch in parallel
    const booksResults = await Promise.all(bookPromises);
    const books = booksResults.filter(book => book !== null);

    // If we still don't have enough, quick fallback
    if (books.length < 3) {
      try {
        const categorySearch = category.replace(/best\s+/i, '').replace(/\d{4}/g, '').trim();
        const fallbackResponse = await fetch(
          `${baseUrl}/api/books/search?q=${encodeURIComponent(categorySearch)}&page=1`,
          { cache: 'no-store' }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.books) {
            for (const fallbackBook of fallbackData.books) {
              if (books.length >= 5) break;
              if (!books.find(b => b.id === fallbackBook.id)) {
                books.push({
                  ...fallbackBook,
                  description: fallbackBook.description || 'A highly recommended book.',
                  thumbnail: fallbackBook.thumbnail || '/images/no-cover.jpg',
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Fallback error:', error);
      }
    }

    return NextResponse.json({ books: books.slice(0, 5) });
  } catch (error) {
    console.error('Awards API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}