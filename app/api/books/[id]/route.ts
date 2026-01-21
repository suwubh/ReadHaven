// app/api/books/[id]/route.ts

import { NextResponse } from 'next/server';

async function fetchFromGoogle(id: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}`
    );
    
    if (!response.ok) return null;
    
    const item = await response.json();
    
    return {
      id: item.id,
      title: item.volumeInfo?.title || '',
      subtitle: item.volumeInfo?.subtitle || '',
      authors: item.volumeInfo?.authors || [],
      description: item.volumeInfo?.description || '',
      publishedDate: item.volumeInfo?.publishedDate || '',
      publisher: item.volumeInfo?.publisher || '',
      pageCount: item.volumeInfo?.pageCount || 0,
      categories: item.volumeInfo?.categories || [],
      averageRating: item.volumeInfo?.averageRating || 0,
      ratingsCount: item.volumeInfo?.ratingsCount || 0,
      thumbnail: item.volumeInfo?.imageLinks?.thumbnail || 
                 item.volumeInfo?.imageLinks?.smallThumbnail || '',
      coverImage: item.volumeInfo?.imageLinks?.large ||
                  item.volumeInfo?.imageLinks?.medium ||
                  item.volumeInfo?.imageLinks?.thumbnail || '',
      language: item.volumeInfo?.language || 'en',
      isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier || '',
      previewLink: item.volumeInfo?.previewLink || '',
      infoLink: item.volumeInfo?.infoLink || '',
      source: 'google',
    };
  } catch (error) {
    return null;
  }
}

async function fetchFromOpenLibrary(id: string) {
  try {
    // Fetch work details
    const workResponse = await fetch(
      `https://openlibrary.org/works/${id}.json`
    );
    
    if (!workResponse.ok) return null;
    
    const work = await workResponse.json();
    
    // Get description
    let description = '';
    if (work.description) {
      description = typeof work.description === 'string' 
        ? work.description 
        : work.description.value || '';
    }
    
    // Get author names
    const authorNames: string[] = [];
    if (work.authors && work.authors.length > 0) {
      for (const authorRef of work.authors.slice(0, 3)) {
        try {
          const authorKey = authorRef.author?.key || authorRef.key;
          if (authorKey) {
            const authorResponse = await fetch(
              `https://openlibrary.org${authorKey}.json`
            );
            if (authorResponse.ok) {
              const author = await authorResponse.json();
              authorNames.push(author.name);
            }
          }
        } catch (err) {
          // Skip if author fetch fails
        }
      }
    }
    
    // Get cover image
    const coverId = work.covers?.[0];
    const coverImage = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : '';
    
    // Get editions for additional details
    let publishedDate = '';
    let publisher = '';
    let pageCount = 0;
    let isbn = '';
    
    try {
      const editionsResponse = await fetch(
        `https://openlibrary.org/works/${id}/editions.json?limit=1`
      );
      if (editionsResponse.ok) {
        const editionsData = await editionsResponse.json();
        const firstEdition = editionsData.entries?.[0];
        
        if (firstEdition) {
          publishedDate = firstEdition.publish_date || '';
          publisher = firstEdition.publishers?.[0] || '';
          pageCount = firstEdition.number_of_pages || 0;
          isbn = firstEdition.isbn_13?.[0] || firstEdition.isbn_10?.[0] || '';
        }
      }
    } catch (err) {
      // Optional
    }
    
    // Get ratings
    let averageRating = 0;
    let ratingsCount = 0;
    try {
      const ratingsResponse = await fetch(
        `https://openlibrary.org/works/${id}/ratings.json`
      );
      if (ratingsResponse.ok) {
        const ratings = await ratingsResponse.json();
        averageRating = ratings.summary?.average || 0;
        ratingsCount = ratings.summary?.count || 0;
      }
    } catch (err) {
      // Optional
    }
    
    return {
      id,
      title: work.title || '',
      subtitle: work.subtitle || '',
      authors: authorNames.length > 0 ? authorNames : [],
      description,
      publishedDate,
      publisher,
      pageCount,
      categories: work.subjects?.slice(0, 5) || [],
      averageRating,
      ratingsCount,
      thumbnail: coverImage,
      coverImage,
      language: 'en',
      isbn,
      previewLink: `https://openlibrary.org/works/${id}`,
      infoLink: `https://openlibrary.org/works/${id}`,
      source: 'openlibrary',
    };
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Determine source from ID format
    const isGoogleId = id.length < 20 && !id.startsWith('OL');
    
    let googleData = null;
    let openLibraryData = null;
    
    if (isGoogleId) {
      // Try Google first, fallback to Open Library
      googleData = await fetchFromGoogle(id);
      if (!googleData) {
        // Search Open Library by title if we have it
        openLibraryData = await fetchFromOpenLibrary(id);
      }
    } else {
      // It's an Open Library ID
      openLibraryData = await fetchFromOpenLibrary(id);
      if (!openLibraryData) {
        googleData = await fetchFromGoogle(id);
      }
    }
    
    // Merge data from both sources (prioritize based on quality)
    let book: any = {};
    
    if (googleData && openLibraryData) {
      // Merge both - use best data from each
      book = {
        id,
        title: googleData.title || openLibraryData.title || 'Unknown Title',
        subtitle: googleData.subtitle || openLibraryData.subtitle || '',
        authors: googleData.authors.length > 0 ? googleData.authors : openLibraryData.authors || ['Unknown Author'],
        description: googleData.description || openLibraryData.description || 'No description available',
        publishedDate: googleData.publishedDate || openLibraryData.publishedDate || '',
        publisher: googleData.publisher || openLibraryData.publisher || '',
        pageCount: googleData.pageCount || openLibraryData.pageCount || 0,
        categories: googleData.categories.length > 0 ? googleData.categories : openLibraryData.categories || [],
        averageRating: googleData.averageRating || openLibraryData.averageRating || 0,
        ratingsCount: googleData.ratingsCount || openLibraryData.ratingsCount || 0,
        // Prefer Open Library covers (better quality)
        thumbnail: openLibraryData.thumbnail || googleData.thumbnail || '/images/no-cover.jpg',
        coverImage: openLibraryData.coverImage || googleData.coverImage || '/images/no-cover.jpg',
        language: googleData.language || openLibraryData.language || 'en',
        isbn: googleData.isbn || openLibraryData.isbn || '',
        previewLink: googleData.previewLink || openLibraryData.previewLink || '',
        infoLink: googleData.infoLink || openLibraryData.infoLink || '',
      };
    } else if (googleData) {
      book = {
        ...googleData,
        title: googleData.title || 'Unknown Title',
        authors: googleData.authors.length > 0 ? googleData.authors : ['Unknown Author'],
        description: googleData.description || 'No description available',
        thumbnail: googleData.thumbnail || '/images/no-cover.jpg',
        coverImage: googleData.coverImage || '/images/no-cover.jpg',
      };
      delete book.source;
    } else if (openLibraryData) {
      book = {
        ...openLibraryData,
        title: openLibraryData.title || 'Unknown Title',
        authors: openLibraryData.authors.length > 0 ? openLibraryData.authors : ['Unknown Author'],
        description: openLibraryData.description || 'No description available',
        thumbnail: openLibraryData.thumbnail || '/images/no-cover.jpg',
        coverImage: openLibraryData.coverImage || '/images/no-cover.jpg',
      };
      delete book.source;
    } else {
      throw new Error('Book not found in any source');
    }
    
    return NextResponse.json(book);
  } catch (error) {
    console.error('Book detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}