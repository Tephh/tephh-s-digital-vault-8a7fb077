import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, Shield, Zap, DollarSign, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import angkorWatBg from '@/assets/angkor-wat-bg.jpg';

const HeroSection: React.FC = () => {
  const { t } = useTheme();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${angkorWatBg})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />

      {/* Water Ripple Effect */}
      <div className="absolute inset-0 water-ripple" />

      {/* 3D Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl float-3d" />
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-accent/20 rounded-full blur-3xl float-3d" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-primary/15 rounded-full blur-3xl float-3d" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('hero.trusted')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span className="text-gradient-gold">Premium</span>{' '}
            <span className="text-foreground">Digital</span>
            <br />
            <span className="text-foreground">Products</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to="/shop">
              <Button className="btn-gold text-lg px-8 py-6 group">
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="rounded-xl px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="glass-card p-4 text-center space-y-2">
              <Shield className="w-8 h-8 mx-auto text-primary" />
              <h4 className="font-semibold text-sm">{t('features.safe')}</h4>
            </div>
            <div className="glass-card p-4 text-center space-y-2">
              <Zap className="w-8 h-8 mx-auto text-accent" />
              <h4 className="font-semibold text-sm">{t('features.fast')}</h4>
            </div>
            <div className="glass-card p-4 text-center space-y-2">
              <DollarSign className="w-8 h-8 mx-auto text-green-500" />
              <h4 className="font-semibold text-sm">{t('features.cheap')}</h4>
            </div>
            <div className="glass-card p-4 text-center space-y-2">
              <Headphones className="w-8 h-8 mx-auto text-primary" />
              <h4 className="font-semibold text-sm">{t('features.support')}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
