import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Ban, Infinity, Sparkles } from 'lucide-react';

const WhyPremiumSection: React.FC = () => {
  const { t } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const reasons = [
    {
      icon: <Ban className="w-12 h-12" />,
      title: t('why.noAds'),
      description: t('why.noAdsDesc'),
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: <Infinity className="w-12 h-12" />,
      title: t('why.unlimited'),
      description: t('why.unlimitedDesc'),
      gradient: 'from-primary to-blue-600',
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: t('why.quality'),
      description: t('why.qualityDesc'),
      gradient: 'from-accent to-yellow-400',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="scroll-reveal text-center space-y-4 mb-16 opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t('why.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop dealing with annoying ads and limitations. Upgrade to premium today!
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Version */}
          <div className="scroll-reveal glass-card p-8 relative overflow-hidden opacity-0 translate-y-8 transition-all duration-700 delay-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-bold mb-6 text-destructive">Free Version 😔</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">✕</span>
                <span className="text-muted-foreground">Annoying ads every few minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">✕</span>
                <span className="text-muted-foreground">Limited skips and features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">✕</span>
                <span className="text-muted-foreground">Low quality streaming</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">✕</span>
                <span className="text-muted-foreground">No offline downloads</span>
              </li>
            </ul>
          </div>

          {/* Premium Version */}
          <div className="scroll-reveal glass-card p-8 relative overflow-hidden border-2 border-primary/30 opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-3 -right-3">
              <span className="countdown-badge text-xs">BEST VALUE</span>
            </div>
            <h3 className="text-xl font-bold mb-6 text-primary">Premium Version 🎉</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</span>
                <span>100% ad-free experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</span>
                <span>Unlimited skips & all features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</span>
                <span>Highest quality streaming</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</span>
                <span>Download for offline</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`scroll-reveal glass-card-hover p-8 text-center space-y-4 opacity-0 translate-y-8 transition-all duration-700`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
            >
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${reason.gradient} flex items-center justify-center text-white shadow-lg`}>
                {reason.icon}
              </div>
              <h3 className="text-xl font-semibold">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPremiumSection;
