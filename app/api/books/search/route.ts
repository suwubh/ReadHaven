// app/api/books/search/route.ts

import { NextResponse } from 'next/server';

async function searchOpenLibrary(query: string, offset: number, limit: number) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&offset=${offset}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn,ratings_average,ratings_count,subject`
  );
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.docs?.map((item: any) => ({
    id: item.key?.replace('/works/', '') || `ol-${Date.now()}`,
    title: item.title || 'Unknown Title',
    authors: item.author_name || ['Unknown Author'],
    publishedDate: item.first_publish_year?.toString() || '',
    thumbnail: item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
      : '/images/no-cover.jpg',
    averageRating: item.ratings_average || 0,
    ratingsCount: item.ratings_count || 0,
    categories: item.subject?.slice(0, 3) || [],
    isbn: item.isbn?.[0] || '',
    source: 'openlibrary',
  })) || [];
}

async function searchGoogleBooks(query: string, startIndex: number, maxResults: number) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&startIndex=${startIndex}&maxResults=${maxResults}`
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data.items?.map((item: any) => ({
    id: item.id,
    title: item.volumeInfo?.title || 'Unknown Title',
    authors: item.volumeInfo?.authors || ['Unknown Author'],
    publishedDate: item.volumeInfo?.publishedDate || '',
    thumbnail: item.volumeInfo?.imageLinks?.thumbnail || '/images/no-cover.jpg',
    averageRating: item.volumeInfo?.averageRating || 0,
    ratingsCount: item.volumeInfo?.ratingsCount || 0,
    categories: item.volumeInfo?.categories || [],
    isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier || '',
    source: 'google',
  })) || [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search both APIs in parallel
    const [openLibraryBooks, googleBooks] = await Promise.all([
      searchOpenLibrary(query, offset, limit),
      searchGoogleBooks(query, offset, limit),
    ]);

    // Combine and deduplicate results
    const allBooks = [...(openLibraryBooks || []), ...(googleBooks || [])];
    
    // Remove duplicates based on title and author similarity
    const uniqueBooks = allBooks.filter((book, index, self) => {
      return index === self.findIndex((b) => 
        b.title.toLowerCase() === book.title.toLowerCase() &&
        b.authors[0]?.toLowerCase() === book.authors[0]?.toLowerCase()
      );
    });

    // Sort by rating and recency
    const sortedBooks = uniqueBooks.sort((a, b) => {
      // Prioritize books with ratings
      if (a.ratingsCount > 0 && b.ratingsCount === 0) return -1;
      if (b.ratingsCount > 0 && a.ratingsCount === 0) return 1;
      
      // Then by rating
      if (a.averageRating !== b.averageRating) {
        return b.averageRating - a.averageRating;
      }
      
      // Then by publish date
      return (b.publishedDate || '0') > (a.publishedDate || '0') ? 1 : -1;
    });

    const books = sortedBooks.slice(0, limit).map(book => ({
      ...book,
      description: '', // Will be fetched on detail page
      pageCount: 0,
      language: 'en',
    }));

    return NextResponse.json({
      books,
      totalItems: uniqueBooks.length,
      currentPage: page,
      hasMore: uniqueBooks.length > limit,
    });
  } catch (error) {
    console.error('Book search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}