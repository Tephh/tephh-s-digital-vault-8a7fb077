import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useTheme } from '@/contexts/ThemeContext';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { getAppIcon } from '@/lib/appIcons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Shop: React.FC = () => {
  const { t } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeApp, setActiveApp] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useProducts({
    category: activeCategory !== 'all' ? activeCategory : undefined,
    app: activeApp !== 'all' ? activeApp : undefined,
  });

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

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];

    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.app.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Already sorted by created_at desc from API
        break;
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveApp('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  const hasActiveFilters = activeCategory !== 'all' || activeApp !== 'all' || searchQuery.trim() || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 sm:pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">{t('products.title')}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              {t('products.subtitle')}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="glass-card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle (Mobile) */}
              <Button
                variant="outline"
                className="sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* App Filter */}
          <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 ${!showFilters && 'hidden sm:flex'}`}>
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`category-pill flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-5 py-2 ${activeApp === app.id ? 'active' : ''}`}
              >
                <span>{app.icon}</span>
                <span className="hidden xs:inline">{app.label}</span>
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 ${!showFilters && 'hidden sm:flex'}`}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          {!isLoading && filteredProducts && (
            <div className="text-center mb-6 text-sm text-muted-foreground">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && filteredProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!filteredProducts || filteredProducts.length === 0) && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">No products found for this filter.</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
