// app/api/books/search/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const maxResults = 20;
    const startIndex = (page - 1) * maxResults;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Google Books API
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();

    // Transform the data to a cleaner format
    const books = data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      authors: item.volumeInfo?.authors || ['Unknown Author'],
      description: item.volumeInfo?.description || 'No description available',
      publishedDate: item.volumeInfo?.publishedDate || '',
      pageCount: item.volumeInfo?.pageCount || 0,
      categories: item.volumeInfo?.categories || [],
      averageRating: item.volumeInfo?.averageRating || 0,
      ratingsCount: item.volumeInfo?.ratingsCount || 0,
      thumbnail: item.volumeInfo?.imageLinks?.thumbnail || 
                 item.volumeInfo?.imageLinks?.smallThumbnail || 
                 '/images/no-cover.jpg',
      language: item.volumeInfo?.language || 'en',
      isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier || '',
    })) || [];

    return NextResponse.json({
      books,
      totalItems: data.totalItems || 0,
      currentPage: page,
      hasMore: startIndex + maxResults < (data.totalItems || 0),
    });
  } catch (error) {
    console.error('Book search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}