import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import WhyPremiumSection from '@/components/WhyPremiumSection';
import BlogSection from '@/components/BlogSection';
import AboutMeSection from '@/components/AboutMeSection';
import CheckoutGuide from '@/components/CheckoutGuide';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <WhyPremiumSection />
        <BlogSection />
        <AboutMeSection />
        <CheckoutGuide />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
