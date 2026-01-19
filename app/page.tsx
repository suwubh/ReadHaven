// app/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import HeroSection from './components/HeroSection';
import RecommendationsSection from './components/RecommendationsSection';
import DiscoverSection from './components/DiscoverSection';
import AwardsSection from './components/AwardsSection';
import SearchBrowseSection from './components/SearchBrowseSection';
import SignInContainer from './components/SignInContainer';
import ProfileContainer from './components/ProfileContainer';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';

export default async function Home() {
  const session = await getServerSession(authOptions);

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
            <ProfileContainer user={session.user} />
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