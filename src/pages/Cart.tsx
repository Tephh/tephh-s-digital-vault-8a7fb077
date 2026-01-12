import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { getAppIcon } from '@/data/products';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const { t } = useTheme();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getDiscountedPrice, applyCoupon, couponCode, couponDiscount, clearCart } = useCart();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      toast.success('Coupon applied successfully!');
    } else {
      toast.error('Invalid coupon code');
    }
    setCouponInput('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">{t('cart.title')}</span>
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-semibold mb-4">{t('cart.empty')}</h2>
              <p className="text-muted-foreground mb-8">Start shopping to add items to your cart</p>
              <Link to="/shop">
                <Button className="btn-gold">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="glass-card p-4 flex gap-4">
                    {/* Product Icon */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-4xl shrink-0">
                      {getAppIcon(item.app)}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.duration}</p>
                      <p className="text-lg font-bold text-gradient-gold mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 space-y-6 sticky top-32">
                  <h3 className="text-xl font-semibold">Order Summary</h3>

                  {/* Coupon Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleApplyCoupon}>Apply</Button>
                    </div>
                    {couponCode && (
                      <p className="text-sm text-green-500">
                        ✓ {couponCode} applied ({couponDiscount}% off)
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Discount ({couponDiscount}%)</span>
                        <span>-${(getTotalPrice() - getDiscountedPrice()).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-3 border-t">
                      <span>{t('cart.total')}</span>
                      <span className="text-gradient-gold">${getDiscountedPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link to="/checkout">
                    <Button className="w-full btn-gold text-lg py-6">
                      {t('cart.checkout')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  {/* Trust Badges */}
                  <div className="text-center text-xs text-muted-foreground">
                    🔒 Secure payment with KHQR
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
