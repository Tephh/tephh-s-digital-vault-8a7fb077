import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: 'How do I purchase a product?',
      answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You can pay using KHQR (Bakong). After payment is verified, you will receive your product via Telegram.',
    },
    {
      question: 'What is the difference between Account and Top Up?',
      answer: 'Account: You receive login credentials for a premium account. Top Up: We upgrade YOUR existing account to premium. Top Up is more expensive but you keep your own account with all your data.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'After payment is confirmed, delivery is usually instant to within 30 minutes. For Top Up services, it may take up to 2 hours as we need to process your account.',
    },
    {
      question: 'Is it safe to provide my account credentials for Top Up?',
      answer: 'Yes, your credentials are only used to upgrade your account and are never stored. If you prefer not to share, you can contact us on Telegram and we will guide you through an alternative method.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept KHQR (Bakong) payments. This is the most convenient payment method for Cambodian customers.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'Refunds are available if the product is not delivered or does not work as described. Please contact us within 24 hours of purchase. Digital products cannot be refunded once delivered and working.',
    },
    {
      question: 'How do I use the coupon code?',
      answer: 'Enter the coupon code TEP26 at checkout to get 5-10% off your order. This coupon is for new users only.',
    },
    {
      question: 'What happens after my subscription expires?',
      answer: 'For accounts, the account will expire and you will need to purchase again. For top-ups, your account will revert to free version. We offer renewal discounts for returning customers.',
    },
    {
      question: 'How can I contact support?',
      answer: 'The fastest way to reach us is via Telegram @tephh. We also respond on Instagram and Facebook @putephh. We aim to respond within 1-2 hours.',
    },
    {
      question: 'Why are your prices so cheap?',
      answer: 'We source our products through legitimate partnerships and regional pricing differences. All products are 100% genuine and working.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-primary">FAQ</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Frequently Asked Questions - Find answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-card px-6 border-0"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Still have questions */}
            <div className="glass-card p-8 mt-12 text-center">
              <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Contact us directly and we'll help you out!
              </p>
              <a
                href="https://t.me/tephh"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
