import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Policy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Terms of Service and Policies
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {/* Terms of Service */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Terms of Service</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By using Tephh Shop, you agree to these terms. Please read them carefully.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All products are for personal use only</li>
                  <li>Reselling of products is prohibited</li>
                  <li>We reserve the right to refuse service to anyone</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Product availability is not guaranteed</li>
                </ul>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold">Refund Policy</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We want you to be satisfied with your purchase. Here's our refund policy:
                </p>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Eligible for Refund</p>
                      <p className="text-sm">Product not delivered within 24 hours, product not working as described, wrong product delivered</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Not Eligible for Refund</p>
                      <p className="text-sm">Product delivered and working, user error, changed mind after delivery, account banned due to user actions</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm">
                  Refund requests must be made within 24 hours of purchase via Telegram.
                </p>
              </div>
            </div>

            {/* Delivery Policy */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Delivery Policy</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We aim to deliver all orders as quickly as possible:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Accounts & Codes:</strong> Instant to 30 minutes after payment verification</li>
                  <li><strong>Top Up Services:</strong> 30 minutes to 2 hours after payment verification</li>
                  <li>Delivery is via Telegram direct message</li>
                  <li>Please ensure your Telegram username/number is correct</li>
                  <li>If you don't receive your order within the expected time, contact us immediately</li>
                </ul>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your privacy is important to us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We only collect information necessary to process your order</li>
                  <li>Account credentials for top-up services are never stored after use</li>
                  <li>We do not share your information with third parties</li>
                  <li>Payment information is processed securely through KHQR/Bakong</li>
                  <li>You can request deletion of your data at any time</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center pt-8">
              <p className="text-muted-foreground">
                If you have any questions about our policies, please contact us on Telegram{' '}
                <a href="https://t.me/tephh" className="text-primary hover:underline">@tephh</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Policy;
