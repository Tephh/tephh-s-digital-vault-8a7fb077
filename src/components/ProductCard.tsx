import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart, Product } from '@/contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAppColor, getAppIcon } from '@/data/products';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useTheme();
  const { addToCart } = useCart();

  const delay = index * 100;

  return (
    <div
      className="glass-card-hover group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image Container */}
      <div className={`relative h-40 bg-gradient-to-br ${getAppColor(product.app)} rounded-t-2xl overflow-hidden`}>
        {/* App Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl product-zoom opacity-90">{getAppIcon(product.app)}</span>
        </div>

        {/* Duration Badge */}
        {product.duration && (
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.duration}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            product.category === 'account' ? 'bg-primary/90 text-primary-foreground' :
            product.category === 'topup' ? 'bg-accent text-accent-foreground' :
            'bg-purple-500/90 text-white'
          }`}>
            {product.category === 'account' ? 'Account' : product.category === 'topup' ? 'Top Up' : 'Code'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link to={`/product/${product.id}`}>
            <Button size="sm" variant="secondary" className="rounded-full">
              <Eye className="w-4 h-4 mr-1" />
              {t('products.viewDetails')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gradient-gold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            className="btn-primary-gradient rounded-full gap-1"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{t('products.addToCart')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
