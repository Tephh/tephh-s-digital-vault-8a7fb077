import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Music, Video, Film, Sparkles, MessageCircle, ChevronRight, Ban, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAppIcon } from '@/lib/appIcons';

const appBenefits = [
  {
    app: 'spotify',
    name: 'Spotify Premium',
    icon: Music,
    color: 'from-green-500 to-green-600',
    benefits: ['Ad-free music streaming', 'Unlimited skips', 'Offline downloads', 'High quality audio (320kbps)', 'Play any song on demand'],
    freeIssues: ['Annoying ads every few songs', 'Limited skips (6 per hour)', 'No offline mode', 'Shuffle play only on mobile'],
    latestUpdate: 'Now supports AI DJ feature and lossless audio!',
  },
  {
    app: 'youtube',
    name: 'YouTube Premium',
    icon: Video,
    color: 'from-red-500 to-red-600',
    benefits: ['Ad-free videos', 'Background play', 'Download videos offline', 'YouTube Music Premium included', 'Picture-in-Picture mode'],
    freeIssues: ['Multiple ads before and during videos', 'No background playback', 'Cannot download videos', 'Ads interrupt your experience'],
    latestUpdate: 'Enhanced video quality up to 4K HDR with Premium!',
  },
  {
    app: 'netflix',
    name: 'Netflix',
    icon: Film,
    color: 'from-red-600 to-red-800',
    benefits: ['Stream movies & TV shows', 'Multiple quality options (480p-4K)', 'Download for offline', 'No ads ever', 'Multiple profiles'],
    freeIssues: ['No free tier available', 'Basic plan has ads', 'Limited device support', 'Price keeps increasing'],
    latestUpdate: 'All quality tiers from 480p to 4K available at best prices!',
  },
  {
    app: 'capcut',
    name: 'CapCut Pro',
    icon: Film,
    color: 'from-violet-500 to-purple-600',
    benefits: ['Remove watermark', 'Access all effects & filters', 'Premium templates', 'Cloud storage', 'Export in 4K quality'],
    freeIssues: ['Watermark on exports', 'Limited effects', 'Basic templates only', 'Limited export options'],
    latestUpdate: 'New AI video enhancement and auto-captions!',
  },
  {
    app: 'discord',
    name: 'Discord Nitro',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-600',
    benefits: ['Animated avatars & banners', 'Custom emoji anywhere', '100MB file uploads', 'HD video streaming', 'Server boosts included'],
    freeIssues: ['Static profile only', 'Limited emoji usage', '8MB file limit', 'Basic video quality'],
    latestUpdate: 'Now includes 2 server boosts and custom profiles!',
  },
];

const BlogSection: React.FC = () => {
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
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 relative">
      <div className="absolute inset-0 angkor-pattern opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="scroll-reveal text-center space-y-4 mb-16 opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why <span className="text-gradient-gold">Premium</span> Matters
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the difference premium makes for your favorite apps
          </p>
        </div>

        <div className="space-y-12">
          {appBenefits.map((app, index) => (
            <div 
              key={app.app}
              className={`scroll-reveal glass-card p-6 md:p-8 opacity-0 translate-y-8 transition-all duration-700`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* App Header */}
                <div className="md:w-1/3 space-y-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                    <img src={getAppIcon(app.app)} alt={app.name} className="w-14 h-14 object-contain" />
                  </div>
                  <h3 className="text-2xl font-bold">{app.name}</h3>
                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm text-accent font-medium">🆕 {app.latestUpdate}</p>
                  </div>
                  <Link to={`/shop?app=${app.app}`}>
                    <Button className="btn-gold w-full group">
                      View Plans
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Comparison */}
                <div className="md:w-2/3 grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                    <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      Free Version Problems
                    </h4>
                    <ul className="space-y-2">
                      {app.freeIssues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5">✕</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Premium Benefits
                    </h4>
                    <ul className="space-y-2">
                      {app.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="scroll-reveal text-center mt-12 opacity-0 translate-y-8 transition-all duration-700">
          <Link to="/shop">
            <Button className="btn-primary-gradient text-lg px-8 py-6">
              Browse All Products
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
