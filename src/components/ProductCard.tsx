import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, ArrowLeft, Package, Clock, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAppIcon, getAppColor, getAppEmoji } from '@/lib/appIcons';
import { DatabaseProduct } from '@/hooks/useProducts';

interface ProductCardProps {
  product: DatabaseProduct;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useTheme();
  const { addToCart } = useCart();
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const delay = index * 100;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: product.image_url || '',
      category: product.category as 'account' | 'topup' | 'code',
      app: product.app as 'spotify' | 'youtube' | 'capcut' | 'alight' | 'discord',
      duration: product.duration || undefined,
      durationMonths: product.duration_months || undefined,
    });
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Determine if we should show product image or app icon
  const hasProductImage = product.image_url && !imageError;

  return (
    <div
      className="group h-[340px] perspective-1000"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front Side - Liquid Glass Card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden
          bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02]
          backdrop-blur-xl border border-white/20 dark:border-white/10
          shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(255,255,255,0.1)]
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)]
          hover:shadow-[0_16px_48px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.15)]
          dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.08)]
          hover:scale-[1.02] transition-all duration-500">
          
          {/* Liquid Glass Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent 
            dark:from-white/10 pointer-events-none opacity-60" />
          
          {/* Image Container with Product Photo */}
          <div className={`relative h-40 bg-gradient-to-br ${getAppColor(product.app)} overflow-hidden`}>
            {/* Background Blur Layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            
            {/* Product Image or App Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hasProductImage ? (
                <img 
                  src={product.image_url!}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => setImageError(true)}
                />
              ) : (
                <img 
                  src={getAppIcon(product.app)} 
                  alt={product.name}
                  className="w-20 h-20 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
              )}
            </div>

            {/* App Icon Overlay (when showing product image) */}
            {hasProductImage && (
              <div className="absolute bottom-3 left-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 
                  flex items-center justify-center shadow-lg">
                  <img 
                    src={getAppIcon(product.app)} 
                    alt={product.app}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Duration Badge */}
            {product.duration && (
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-black/30 backdrop-blur-md text-white text-xs font-semibold 
                  px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                  {product.duration}
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md
                border shadow-lg ${
                product.category === 'account' 
                  ? 'bg-primary/80 text-primary-foreground border-primary/30' 
                  : product.category === 'topup' 
                  ? 'bg-accent/80 text-accent-foreground border-accent/30' 
                  : 'bg-purple-500/80 text-white border-purple-400/30'
              }`}>
                {product.category === 'account' ? 'Account' : product.category === 'topup' ? 'Top Up' : 'Code'}
              </span>
            </div>

            {/* Click to Flip Indicator */}
            <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs">
                <Sparkles className="w-3 h-3" />
                <span>Details</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-base leading-tight line-clamp-1">{product.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">{product.description}</p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gradient-gold">${product.price.toFixed(2)}</span>
                {product.original_price && (
                  <span className="text-xs text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="btn-primary-gradient rounded-full gap-1.5 text-xs px-4 py-2 h-9
                  shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Back Side - Details with Liquid Glass */}
        <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-2xl overflow-hidden
          bg-gradient-to-br from-white/15 to-white/5 dark:from-white/8 dark:to-white/[0.02]
          backdrop-blur-xl border border-white/25 dark:border-white/10
          shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(255,255,255,0.15)]
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.08)]
          p-5 flex flex-col">
          
          {/* Glass Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent 
            dark:from-white/5 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 
                  backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  <img 
                    src={getAppIcon(product.app)} 
                    alt={product.app}
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{product.app}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20" 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 dark:bg-white/[0.03]">
                <Package className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Product Type</p>
                  <p className="text-muted-foreground capitalize text-xs">{product.category}</p>
                </div>
              </div>

              {product.duration && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 dark:bg-white/[0.03]">
                  <Clock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground text-xs">{product.duration}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 dark:bg-white/[0.03]">
                <Shield className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Warranty</p>
                  <p className="text-muted-foreground text-xs">Full duration guaranteed</p>
                </div>
              </div>

              {product.long_description && (
                <p className="text-muted-foreground text-xs line-clamp-2 px-1">{product.long_description}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
              <span className="text-xl font-bold text-gradient-gold">${product.price.toFixed(2)}</span>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="btn-gold rounded-full gap-1.5 text-xs px-4
                  shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
