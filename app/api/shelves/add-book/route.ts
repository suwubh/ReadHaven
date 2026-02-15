// app/api/shelves/add-book/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureDefaultShelves } from '@/lib/shelves';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shelfId, bookId, bookData } = body;

    if (!shelfId || !bookId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure default shelves exist for users created outside the custom signup flow.
    await ensureDefaultShelves(session.user.id);

    // Verify the requested shelf belongs to the current user.
    const shelf = await prisma.shelf.findFirst({
      where: {
        id: shelfId,
        userId: session.user.id,
      },
    });

    if (!shelf) {
      return NextResponse.json(
        { error: 'Shelf not found' },
        { status: 404 }
      );
    }

    // Check if book is already on this shelf
    const existingBook = await prisma.shelfBook.findUnique({
      where: {
        shelfId_bookId: {
          shelfId,
          bookId,
        },
      },
    });

    if (existingBook) {
      return NextResponse.json(
        { error: 'Book already on this shelf' },
        { status: 400 }
      );
    }

    // Add book to shelf
    const shelfBook = await prisma.shelfBook.create({
      data: {
        shelfId,
        bookId,
        title: bookData.title,
        authors: bookData.authors,
        thumbnail: bookData.thumbnail,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Book added to shelf',
      data: shelfBook,
    });
  } catch (error) {
    console.error('Add to shelf error:', error);
    return NextResponse.json(
      { error: 'Failed to add book to shelf' },
      { status: 500 }
    );
  }
}
