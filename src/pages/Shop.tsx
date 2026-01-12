import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { useTheme } from '@/contexts/ThemeContext';

const Shop: React.FC = () => {
  const { t } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeApp, setActiveApp] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('products.all') },
    { id: 'account', label: t('products.accounts') },
    { id: 'topup', label: t('products.topup') },
    { id: 'code', label: 'Codes' },
  ];

  const apps = [
    { id: 'all', label: 'All Apps', icon: '📱' },
    { id: 'spotify', label: 'Spotify', icon: '🎵' },
    { id: 'youtube', label: 'YouTube', icon: '📺' },
    { id: 'capcut', label: 'CapCut', icon: '🎬' },
    { id: 'alight', label: 'Alight Motion', icon: '✨' },
    { id: 'discord', label: 'Discord', icon: '💬' },
  ];

  const filteredProducts = products.filter(product => {
    const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
    const appMatch = activeApp === 'all' || product.app === activeApp;
    return categoryMatch && appMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">{t('products.title')}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('products.subtitle')}
            </p>
          </div>

          {/* App Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`category-pill flex items-center gap-2 ${activeApp === app.id ? 'active' : ''}`}
              >
                <span>{app.icon}</span>
                <span>{app.label}</span>
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found for this filter.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
