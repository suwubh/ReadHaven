// app/api/shelves/remove-book/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { shelfBookId } = body;

    if (!shelfBookId) {
      return NextResponse.json(
        { error: 'Missing shelf book ID' },
        { status: 400 }
      );
    }

    // Verify the book belongs to a shelf owned by the user
    const shelfBook = await prisma.shelfBook.findUnique({
      where: { id: shelfBookId },
      include: {
        shelf: true,
      },
    });

    if (!shelfBook || shelfBook.shelf.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Book not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the book from the shelf
    await prisma.shelfBook.delete({
      where: { id: shelfBookId },
    });

    return NextResponse.json({
      success: true,
      message: 'Book removed from shelf',
    });
  } catch (error) {
    console.error('Remove from shelf error:', error);
    return NextResponse.json(
      { error: 'Failed to remove book from shelf' },
      { status: 500 }
    );
  }
}