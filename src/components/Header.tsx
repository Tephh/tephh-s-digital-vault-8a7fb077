import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Moon, Sun, Heart, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { theme, setTheme, language, setLanguage, t } = useTheme();
  const { getTotalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 3, minutes: 0, seconds: 0 });

  useEffect(() => {
    const savedEndTime = localStorage.getItem('couponEndTime');
    let endTime: number;

    if (savedEndTime) {
      endTime = parseInt(savedEndTime);
    } else {
      endTime = Date.now() + 3 * 60 * 60 * 1000; // 3 hours from now
      localStorage.setItem('couponEndTime', endTime.toString());
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        // Reset countdown
        endTime = Date.now() + 3 * 60 * 60 * 1000;
        localStorage.setItem('couponEndTime', endTime.toString());
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const themeIcons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    cute: <Heart className="w-4 h-4" />,
  };

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'cute')[] = ['light', 'dark', 'cute'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Coupon Banner */}
      <div className="bg-gradient-to-r from-accent to-gold-dark py-2 px-4">
        <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
          <span className="countdown-badge">
            🎉 {t('coupon.text')} <strong>TEP26</strong> {t('coupon.discount')}!
          </span>
          <span className="font-khmer text-accent-foreground/80">
            {t('coupon.expires')}: {String(countdown.hours).padStart(2, '0')}:
            {String(countdown.minutes).padStart(2, '0')}:
            {String(countdown.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="glass-card border-0 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gradient-gold">Tephh</span>
              <span className="text-2xl font-bold text-foreground">Shop</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="font-medium hover:text-primary transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/shop" className="font-medium hover:text-primary transition-colors">
                {t('nav.shop')}
              </Link>
              <Link to="/about" className="font-medium hover:text-primary transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/faq" className="font-medium hover:text-primary transition-colors">
                {t('nav.faq')}
              </Link>
              <Link to="/contact" className="font-medium hover:text-primary transition-colors">
                {t('nav.contact')}
              </Link>
                {user && isAdmin && (
                  <Link to="/admin" className="font-medium hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === 'en' ? 'kh' : 'en')}
                className="relative"
              >
                <Globe className="w-4 h-4" />
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                  {language.toUpperCase()}
                </span>
              </Button>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={cycleTheme}>
                {themeIcons[theme]}
              </Button>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Login Button */}
              {!user && (
                <Link to="/login" className="hidden md:block">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-card border-0 border-t animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <Link to="/" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('nav.home')}
              </Link>
              <Link to="/shop" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('nav.shop')}
              </Link>
              <Link to="/about" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('nav.about')}
              </Link>
              <Link to="/faq" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('nav.faq')}
              </Link>
              <Link to="/contact" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('nav.contact')}
              </Link>
              {user && isAdmin && (
                <Link to="/admin" className="py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}
              {!user && (
                <Link to="/login" className="py-2" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">{t('nav.login')}</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
