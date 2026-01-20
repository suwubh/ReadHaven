// app/api/books/[id]/route.ts

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch book details from Google Books API
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}`
    );

    if (!response.ok) {
      throw new Error('Book not found');
    }

    const item = await response.json();

    // Transform to cleaner format
    const book = {
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      subtitle: item.volumeInfo?.subtitle || '',
      authors: item.volumeInfo?.authors || ['Unknown Author'],
      description: item.volumeInfo?.description || 'No description available',
      publishedDate: item.volumeInfo?.publishedDate || '',
      publisher: item.volumeInfo?.publisher || '',
      pageCount: item.volumeInfo?.pageCount || 0,
      categories: item.volumeInfo?.categories || [],
      averageRating: item.volumeInfo?.averageRating || 0,
      ratingsCount: item.volumeInfo?.ratingsCount || 0,
      thumbnail: item.volumeInfo?.imageLinks?.thumbnail || 
                 item.volumeInfo?.imageLinks?.smallThumbnail || 
                 '/images/no-cover.jpg',
      coverImage: item.volumeInfo?.imageLinks?.large ||
                  item.volumeInfo?.imageLinks?.medium ||
                  item.volumeInfo?.imageLinks?.thumbnail ||
                  '/images/no-cover.jpg',
      language: item.volumeInfo?.language || 'en',
      isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier || '',
      previewLink: item.volumeInfo?.previewLink || '',
      infoLink: item.volumeInfo?.infoLink || '',
    };

    return NextResponse.json(book);
  } catch (error) {
    console.error('Book detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}