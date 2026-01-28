import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Moon, Sun, Heart, Globe, User } from 'lucide-react';
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
      {/* Coupon Banner - Fixed for mobile/Android */}
      <div className="bg-gradient-to-r from-accent to-accent/80 py-2 px-2 sm:px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-accent-foreground font-medium whitespace-nowrap">
              🎉 <span className="hidden xs:inline">{t('coupon.text')}</span> 
              <strong className="mx-1">TEP26</strong> 
              <span className="hidden xs:inline">{t('coupon.discount')}!</span>
              <span className="xs:hidden">10% OFF!</span>
            </span>
            <span className="font-mono text-accent-foreground/90 text-xs">
              ⏰ {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="glass-card border-0 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold text-gradient-gold">Tephh</span>
              <span className="text-xl sm:text-2xl font-bold text-foreground">Shop</span>
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
                <Link to="/admin" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === 'en' ? 'kh' : 'en')}
                className="relative h-9 w-9"
              >
                <Globe className="w-4 h-4" />
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                  {language.toUpperCase()}
                </span>
              </Button>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={cycleTheme} className="h-9 w-9">
                {themeIcons[theme]}
              </Button>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Account */}
              {user ? (
                <Link to="/my-account" className="hidden md:block">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">My Account</span>
                  </Button>
                </Link>
              ) : (
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
                className="md:hidden h-9 w-9"
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
              {user && (
                <Link to="/my-account" className="py-2 font-medium text-primary" onClick={() => setIsMenuOpen(false)}>
                  My Account
                </Link>
              )}
              {user && isAdmin && (
                <Link to="/admin" className="py-2 font-medium text-primary" onClick={() => setIsMenuOpen(false)}>
                  Admin Dashboard
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
