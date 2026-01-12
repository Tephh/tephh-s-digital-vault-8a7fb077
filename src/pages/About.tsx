import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageCircle, Instagram, Facebook, Shield, Zap, Award, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">About Us</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn more about Tephh Shop and our mission
            </p>
          </div>

          {/* About Content */}
          <div className="max-w-4xl mx-auto">
            {/* Owner Section */}
            <div className="glass-card p-8 md:p-12 mb-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Photo Placeholder */}
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl shrink-0">
                  👤
                </div>

                <div className="text-center md:text-left space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Hi, I'm <span className="text-gradient-gold">Sin SokTephh</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to Tephh Shop! I'm a Cambodian entrepreneur passionate about making premium digital products accessible to everyone. 
                    I started this shop to help people enjoy their favorite apps without breaking the bank. 
                    Quality and customer satisfaction are my top priorities.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                    <a
                      href="https://t.me/tephh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <MessageCircle className="w-5 h-5" />
                      @tephh
                    </a>
                    <a
                      href="https://instagram.com/putephh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Instagram className="w-5 h-5" />
                      @putephh
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="glass-card p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  All transactions are encrypted and your data is protected. We never store sensitive information.
                </p>
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Instant delivery after payment confirmation. Get your products within minutes.
                </p>
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Best Prices</h3>
                <p className="text-muted-foreground">
                  We offer the most competitive prices in Cambodia. Quality products at affordable rates.
                </p>
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold">Customer Love</h3>
                <p className="text-muted-foreground">
                  24/7 support via Telegram. We're here to help you with any questions or concerns.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gradient-gold">1000+</div>
                  <div className="text-muted-foreground">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">5000+</div>
                  <div className="text-muted-foreground">Orders Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-gold">99%</div>
                  <div className="text-muted-foreground">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">24/7</div>
                  <div className="text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
