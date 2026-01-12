import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ProductSection from '@/components/ProductSection';
import WhyPremiumSection from '@/components/WhyPremiumSection';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProductSection />
        <WhyPremiumSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
