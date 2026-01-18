// app/page.tsx
import React from 'react';
import HeroSection from './components/HeroSection';
import RecommendationsSection from './components/RecommendationsSection';
import DiscoverSection from './components/DiscoverSection';
import AwardsSection from './components/AwardsSection';
import SearchBrowseSection from './components/SearchBrowseSection';
import SignInContainer from './components/SignInContainer';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <RecommendationsSection />
      <DiscoverSection />
      <AwardsSection />
      <SearchBrowseSection />
      <SignInContainer />
      <RightSidebar />
      <Footer />
    </main>
  );
}