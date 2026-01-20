// app/profile/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfilePageClient from './ProfilePageClient';

async function getUserProfileData(userId: string) {
  const [user, shelves, reviews, readingGoals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        createdAt: true,
      },
    }),
    prisma.shelf.findMany({
      where: { userId },
      include: {
        books: true,
      },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.readingGoal.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
    }),
  ]);

  const totalBooks = shelves.reduce((sum, shelf) => sum + shelf.books.length, 0);
  const currentYearGoal = readingGoals.find(g => g.year === new Date().getFullYear());

  // Get favorite genres from reviewed books
  const reviewedBookIds = reviews.map(r => r.bookId);

  return {
    user,
    totalBooks,
    totalReviews: reviews.length,
    shelves,
    recentReviews: reviews,
    currentYearGoal,
    memberSince: user?.createdAt,
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const profileData = await getUserProfileData(session.user.id);

  return <ProfilePageClient data={profileData} session={session} />;
}