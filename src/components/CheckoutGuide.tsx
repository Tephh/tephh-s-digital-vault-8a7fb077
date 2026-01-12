import React from 'react';
import { ShoppingCart, CreditCard, MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';

const CheckoutGuide: React.FC = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: 'Choose Products',
      description: 'Browse our shop and select your favorite premium apps. Click on products to see details, then add to cart.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: CreditCard,
      title: 'Pay with KHQR',
      description: 'Scan the KHQR code with your Bakong app. Enter your Telegram username for delivery.',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: MessageCircle,
      title: 'Get Notified',
      description: 'We verify your payment automatically. You\'ll receive a Telegram notification once confirmed.',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: CheckCircle,
      title: 'Receive Product',
      description: 'Your account details or codes will be delivered via Telegram. Enjoy your premium experience!',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            How to <span className="text-gradient-primary">Checkout</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple 4-step process to get your premium products
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-border">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="glass-card p-6 text-center space-y-4 h-full">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <div className="w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Tips */}
          <div className="mt-12 glass-card p-6 md:p-8">
            <h3 className="font-semibold text-lg mb-4">💡 Tips for Smooth Checkout</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Make sure your Telegram username is correct - we deliver there!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>For Top Up orders, provide your account email (password is optional)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use coupon code TEP26 for 5-10% off your first order</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Contact @tephh on Telegram if you have any issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutGuide;
