import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye, ArrowLeft, Package, Clock, Shield } from 'lucide-react';
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

  return (
    <div
      className="perspective-1000 h-[320px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d cursor-pointer ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div className="absolute inset-0 glass-card-hover backface-hidden">
          {/* Image Container */}
          <div className={`relative h-36 bg-gradient-to-br ${getAppColor(product.app)} rounded-t-2xl overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={getAppIcon(product.app)} 
                alt={product.name}
                className="w-20 h-20 object-contain drop-shadow-lg product-zoom"
              />
            </div>

            {product.duration && (
              <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {product.duration}
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                product.category === 'account' ? 'bg-primary/90 text-primary-foreground' :
                product.category === 'topup' ? 'bg-accent text-accent-foreground' :
                'bg-purple-500/90 text-white'
              }`}>
                {product.category === 'account' ? 'Account' : product.category === 'topup' ? 'Top Up' : 'Code'}
              </span>
            </div>

            {/* View Details Hint */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-5 h-5 text-white/70" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-1">{product.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gradient-gold">${product.price.toFixed(2)}</span>
                {product.original_price && (
                  <span className="text-xs text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="btn-primary-gradient rounded-full gap-1 text-xs px-3 py-1 h-8"
              >
                <ShoppingCart className="w-3 h-3" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Back Side - Details */}
        <div className="absolute inset-0 glass-card backface-hidden [transform:rotateY(180deg)] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getAppEmoji(product.app)}</span>
              <h3 className="font-semibold text-sm">{product.name}</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Product Type</p>
                <p className="text-muted-foreground capitalize">{product.category}</p>
              </div>
            </div>

            {product.duration && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-muted-foreground">{product.duration}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Warranty</p>
                <p className="text-muted-foreground">Full duration guaranteed</p>
              </div>
            </div>

            {product.long_description && (
              <p className="text-muted-foreground line-clamp-3">{product.long_description}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-lg font-bold text-gradient-gold">${product.price.toFixed(2)}</span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="btn-gold rounded-full gap-1 text-xs"
            >
              <ShoppingCart className="w-3 h-3" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
