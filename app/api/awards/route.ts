// app/api/awards/route.ts

import { NextResponse } from 'next/server';

interface Recommendation {
  title: string;
  author: string;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

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
    const controller = new AbortController();
    const groqTimeoutMs = 8000;
    const timeoutId = setTimeout(() => controller.abort(), groqTimeoutMs);

    let groqResponse: Response;
    try {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
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
    } catch (error) {
      if (isAbortError(error)) {
        return NextResponse.json(
          { error: `Groq request timed out after ${groqTimeoutMs}ms` },
          { status: 504 }
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get recommendations' },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();

    if (!groqData || !Array.isArray(groqData.choices) || groqData.choices.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Groq API response: missing choices' },
        { status: 500 }
      );
    }

    const firstChoice = groqData.choices[0];
    if (
      !firstChoice ||
      !firstChoice.message ||
      !firstChoice.message.content ||
      typeof firstChoice.message.content !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid Groq API response: missing message content' },
        { status: 500 }
      );
    }

    const content = firstChoice.message.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content received' },
        { status: 500 }
      );
    }

    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedRecommendations: unknown;
    try {
      parsedRecommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse recommendations' },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsedRecommendations) || parsedRecommendations.length === 0) {
      return NextResponse.json(
        { error: 'Groq response format error: expected a non-empty recommendations array' },
        { status: 500 }
      );
    }

    if (
      !parsedRecommendations.every(
        (item) =>
          item &&
          typeof item === 'object' &&
          'title' in item &&
          'author' in item &&
          typeof (item as { title?: unknown }).title === 'string' &&
          typeof (item as { author?: unknown }).author === 'string'
      )
    ) {
      return NextResponse.json(
        { error: 'Groq response format error: invalid recommendation entries' },
        { status: 500 }
      );
    }

    const recommendations = parsedRecommendations as Recommendation[];

    const baseUrl = new URL(request.url).origin;
     
    // PARALLEL PROCESSING - Fetch all books at once instead of one by one
    const bookPromises = recommendations.map(async (rec: Recommendation) => {
      try {
        const searchQuery = `${rec.title} ${rec.author}`;
        const searchUrl = new URL('/api/books/search', baseUrl);
        searchUrl.searchParams.set('q', searchQuery);
        searchUrl.searchParams.set('page', '1');

        const searchResponse = await fetch(
          searchUrl,
          { cache: 'no-store' }
        );

        if (!searchResponse.ok) return null;

        const searchData = await searchResponse.json();
        if (!searchData.books || searchData.books.length === 0) return null;

        const searchBook = searchData.books[0];
         
        // Fetch full details in parallel too
        const detailUrl = new URL(`/api/books/${searchBook.id}`, baseUrl);
        const detailResponse = await fetch(
          detailUrl,
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
        const fallbackUrl = new URL('/api/books/search', baseUrl);
        fallbackUrl.searchParams.set('q', categorySearch);
        fallbackUrl.searchParams.set('page', '1');

        const fallbackResponse = await fetch(
          fallbackUrl,
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
