// app/shelf/[name]/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ShelfPageClient from './ShelfPageClient';

interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

function formatShelfName(slug: string): string {
  // Handle special cases first
  const specialCases: { [key: string]: string } = {
    'want-to-read': 'Want to Read',
    'currently-reading': 'Currently Reading',
    'read': 'Read',
    'favorites': 'Favorites',
  };

  if (specialCases[slug]) {
    return specialCases[slug];
  }

  // Default formatting for custom shelves
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function getShelfData(userId: string, shelfName: string) {
  const shelf = await prisma.shelf.findFirst({
    where: {
      userId,
      name: shelfName,
    },
    include: {
      books: {
        orderBy: {
          addedAt: 'desc',
        },
      },
    },
  });

  return shelf;
}

export default async function ShelfPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const shelfName = formatShelfName(resolvedParams.name);
  const shelf = await getShelfData(session.user.id, shelfName);

  if (!shelf) {
    return (
      <div className="shelf-not-found">
        <h1>Shelf not found</h1>
        <p>The shelf "{shelfName}" does not exist.</p>
      </div>
    );
  }

  return <ShelfPageClient shelf={shelf} user={session.user} />;
}