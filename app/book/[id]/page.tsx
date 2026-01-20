// app/book/[id]/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import BookDetailClient from './BookDetailClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getBookData(id: string) {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/books/${id}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }

  return response.json();
}

async function getUserBookData(userId: string | undefined, bookId: string) {
  if (!userId) return null;

  const shelves = await prisma.shelf.findMany({
    where: { userId },
  });

  const review = await prisma.review.findFirst({
    where: {
      userId,
      bookId,
    },
  });

  return { shelves, review };
}

export default async function BookDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const book = await getBookData(resolvedParams.id);
  const userData = await getUserBookData(session?.user?.id, resolvedParams.id);

  return (
    <BookDetailClient
      book={book}
      session={session}
      userShelves={userData?.shelves || []}
      userReview={userData?.review || null}
    />
  );
}