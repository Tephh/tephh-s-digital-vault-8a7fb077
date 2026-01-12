import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, Facebook, Mail, MapPin, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">Contact Us</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions? We're here to help! Reach out to us through any of these channels.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Contact Methods */}
            <div className="space-y-6">
              {/* Telegram */}
              <a
                href="https://t.me/tephh"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-hover p-6 flex items-center gap-4 block"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Telegram</h3>
                  <p className="text-muted-foreground">@tephh</p>
                  <p className="text-sm text-primary">Fastest response ⚡</p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/putephh"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-hover p-6 flex items-center gap-4 block"
              >
                <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Instagram className="w-7 h-7 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instagram</h3>
                  <p className="text-muted-foreground">@putephh</p>
                  <p className="text-sm text-muted-foreground">DM us anytime</p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/putephh"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-hover p-6 flex items-center gap-4 block"
              >
                <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <Facebook className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Facebook</h3>
                  <p className="text-muted-foreground">@putephh</p>
                  <p className="text-sm text-muted-foreground">Message us</p>
                </div>
              </a>
            </div>

            {/* Info Card */}
            <div className="glass-card p-8 space-y-6">
              <h3 className="text-xl font-semibold">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-muted-foreground text-sm">Usually within 1-2 hours during business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground text-sm">Cambodia 🇰🇭</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  For the fastest response, please contact us via Telegram. We're available 24/7!
                </p>
                <a href="https://t.me/tephh" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full btn-primary-gradient">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on Telegram
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
