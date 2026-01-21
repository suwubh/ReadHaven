// app/book/[id]/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import BookDetailClient from './BookDetailClient';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

async function getBookData(id: string) {
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/books/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    // ❌ never throw Error() in App Router data fetch
    // ✅ tell Next.js to render 404 instead
    notFound();
  }

  return response.json();
}

async function getUserBookData(userId: string | undefined, bookId: string) {
  if (!userId) return null;

  const [shelves, review] = await Promise.all([
    prisma.shelf.findMany({
      where: { userId },
    }),
    prisma.review.findFirst({
      where: {
        userId,
        bookId,
      },
    }),
  ]);

  return { shelves, review };
}

export default async function BookDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  const book = await getBookData(params.id);
  const userData = await getUserBookData(session?.user?.id, params.id);

  return (
    <BookDetailClient
      book={book}
      session={session}
      userShelves={userData?.shelves ?? []}
      userReview={userData?.review ?? null}
    />
  );
}
