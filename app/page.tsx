// app/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HeroSection from './components/HeroSection';
import RecommendationsSection from './components/RecommendationsSection';
import DiscoverSection from './components/DiscoverSection';
import AwardsSection from './components/AwardsSection';
import SearchBrowseSection from './components/SearchBrowseSection';
import SignInContainer from './components/SignInContainer';
import ProfileContainer from './components/ProfileContainer';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';

async function getUserStats(userId: string) {
  const [shelves, reviews, readingGoal] = await Promise.all([
    prisma.shelf.findMany({
      where: { userId },
      include: {
        books: true,
      },
    }),
    prisma.review.findMany({
      where: { userId },
    }),
    prisma.readingGoal.findFirst({
      where: {
        userId,
        year: new Date().getFullYear(),
      },
    }),
  ]);

     const totalBooks = shelves.reduce((sum, shelf) => sum + shelf.books.length, 0);
  const reviewsCount = reviews.length;

  return {
    shelves,
    totalBooks,
    reviewsCount,
    readingGoal,
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  let userStats = null;

  if (session?.user?.id) {
    userStats = await getUserStats(session.user.id);
  }

  return (
    <main>
      <HeroSection />

      <section className="page-layout">
        <div className="left-content">
          <RecommendationsSection />
          <DiscoverSection />
          <AwardsSection />
          <SearchBrowseSection />
        </div>

        <aside className="right-column">
          {session?.user ? (
            <ProfileContainer user={session.user} stats={userStats} />
          ) : (
            <SignInContainer />
          )}
          <RightSidebar />
        </aside>
      </section>

      <Footer />
    </main>
  );
}