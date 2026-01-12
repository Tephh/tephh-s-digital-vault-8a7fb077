import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { MessageCircle, Instagram, Facebook, Mail, Shield, Zap, CreditCard } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTheme();

  return (
    <footer className="relative mt-20">
      {/* Wave Decoration */}
      <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-secondary">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>

      <div className="bg-secondary pt-32 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gradient-gold">Tephh</span>
                <span className="text-2xl font-bold">Shop</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Premium digital products at the best prices. Safe, fast, and reliable service for all your digital needs.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://t.me/tephh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/putephh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/putephh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
                <Link to="/policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Policy
                </Link>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Products</h4>
              <div className="flex flex-col gap-2">
                <Link to="/shop?app=spotify" className="text-muted-foreground hover:text-primary transition-colors">
                  🎵 Spotify Premium
                </Link>
                <Link to="/shop?app=youtube" className="text-muted-foreground hover:text-primary transition-colors">
                  📺 YouTube Premium
                </Link>
                <Link to="/shop?app=capcut" className="text-muted-foreground hover:text-primary transition-colors">
                  🎬 CapCut Pro
                </Link>
                <Link to="/shop?app=alight" className="text-muted-foreground hover:text-primary transition-colors">
                  ✨ Alight Motion
                </Link>
                <Link to="/shop?app=discord" className="text-muted-foreground hover:text-primary transition-colors">
                  💬 Discord Nitro
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">{t('footer.contact')}</h4>
              <div className="flex flex-col gap-3">
                <a
                  href="https://t.me/tephh"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  @tephh
                </a>
                <a
                  href="https://instagram.com/putephh"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @putephh
                </a>
                <a
                  href="https://facebook.com/putephh"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  @putephh
                </a>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 py-8 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-5 h-5 text-accent" />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>KHQR Payment</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-8 border-t border-border/50">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Tephh Shop. {t('footer.rights')}.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              Made with ❤️ by K'TEPHH Kon Khmer Kamjea
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
