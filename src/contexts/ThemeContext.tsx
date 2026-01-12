import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'cute';
type Language = 'en' | 'kh';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.faq': 'FAQ',
    'nav.policy': 'Policy',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.cart': 'Cart',
    
    // Hero
    'hero.title': 'Premium Digital Products',
    'hero.subtitle': 'Get your favorite apps at the best prices. Safe, fast, and reliable.',
    'hero.cta': 'Shop Now',
    'hero.trusted': 'Trusted by 1000+ customers',
    
    // Products
    'products.title': 'Our Products',
    'products.subtitle': 'Premium accounts & subscriptions at unbeatable prices',
    'products.all': 'All',
    'products.accounts': 'Accounts',
    'products.topup': 'Top Up',
    'products.addToCart': 'Add to Cart',
    'products.viewDetails': 'View Details',
    'products.month': 'month',
    'products.months': 'months',
    'products.year': 'year',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',
    
    // Coupon
    'coupon.text': 'Use code',
    'coupon.discount': 'for 5-10% OFF',
    'coupon.newUser': 'New users only',
    'coupon.expires': 'Expires in',
    
    // Features
    'features.safe': 'Safe & Secure',
    'features.safeDesc': 'All transactions are encrypted and secure',
    'features.fast': 'Fast Delivery',
    'features.fastDesc': 'Instant delivery after payment',
    'features.cheap': 'Best Prices',
    'features.cheapDesc': 'Cheapest prices guaranteed',
    'features.support': '24/7 Support',
    'features.supportDesc': 'Contact us anytime on Telegram',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact Us',
    
    // Why Premium
    'why.title': 'Why Go Premium?',
    'why.noAds': 'No More Annoying Ads',
    'why.noAdsDesc': 'Enjoy uninterrupted experience without any advertisements',
    'why.unlimited': 'Unlimited Access',
    'why.unlimitedDesc': 'Access all features and content without restrictions',
    'why.quality': 'Best Quality',
    'why.qualityDesc': 'Enjoy highest quality streaming and downloads',
  },
  kh: {
    // Header
    'nav.home': 'ទំព័រដើម',
    'nav.shop': 'ហាង',
    'nav.about': 'អំពី',
    'nav.contact': 'ទំនាក់ទំនង',
    'nav.faq': 'សំណួរ',
    'nav.policy': 'គោលការណ៍',
    'nav.login': 'ចូល',
    'nav.register': 'ចុះឈ្មោះ',
    'nav.cart': 'កន្ត្រក',
    
    // Hero
    'hero.title': 'ផលិតផលឌីជីថល ប្រ៊ីមៀម',
    'hero.subtitle': 'ទទួលបានកម្មវិធីដែលអ្នកចូលចិត្ត ក្នុងតម្លៃល្អបំផុត។ សុវត្ថិភាព រហ័ស និងអាចទុកចិត្តបាន។',
    'hero.cta': 'ទិញឥឡូវ',
    'hero.trusted': 'ទុកចិត្តដោយអតិថិជន 1000+',
    
    // Products
    'products.title': 'ផលិតផលរបស់យើង',
    'products.subtitle': 'គណនី និងការជាវ ប្រ៊ីមៀម ក្នុងតម្លៃល្អបំផុត',
    'products.all': 'ទាំងអស់',
    'products.accounts': 'គណនី',
    'products.topup': 'បញ្ចូលប្រាក់',
    'products.addToCart': 'ដាក់ក្នុងកន្ត្រក',
    'products.viewDetails': 'មើលលម្អិត',
    'products.month': 'ខែ',
    'products.months': 'ខែ',
    'products.year': 'ឆ្នាំ',
    
    // Cart
    'cart.title': 'កន្ត្រកទិញទំនិញ',
    'cart.empty': 'កន្ត្រករបស់អ្នកទទេ',
    'cart.total': 'សរុប',
    'cart.checkout': 'បង់ប្រាក់',
    'cart.remove': 'លុប',
    
    // Coupon
    'coupon.text': 'ប្រើកូដ',
    'coupon.discount': 'បញ្ចុះ 5-10%',
    'coupon.newUser': 'អ្នកប្រើថ្មីតែប៉ុណ្ណោះ',
    'coupon.expires': 'ផុតកំណត់ក្នុង',
    
    // Features
    'features.safe': 'សុវត្ថិភាព',
    'features.safeDesc': 'រាល់ប្រតិបត្តិការត្រូវបានអ៊ិនគ្រីប និងមានសុវត្ថិភាព',
    'features.fast': 'ដឹកជញ្ជូនរហ័ស',
    'features.fastDesc': 'ដឹកជញ្ជូនភ្លាមៗបន្ទាប់ពីបង់ប្រាក់',
    'features.cheap': 'តម្លៃល្អបំផុត',
    'features.cheapDesc': 'តម្លៃថោកបំផុតធានា',
    'features.support': 'ជំនួយ 24/7',
    'features.supportDesc': 'ទាក់ទងយើងគ្រប់ពេលវេលាតាម Telegram',
    
    // Footer
    'footer.rights': 'រក្សាសិទ្ធិគ្រប់យ៉ាង',
    'footer.contact': 'ទំនាក់ទំនងយើង',
    
    // Why Premium
    'why.title': 'ហេតុអ្វីត្រូវប្រើ Premium?',
    'why.noAds': 'គ្មានការផ្សាយពាណិជ្ជកម្មរំខាន',
    'why.noAdsDesc': 'រីករាយជាមួយបទពិសោធន៍ដោយគ្មានការរំខាន',
    'why.unlimited': 'ចូលប្រើប្រាស់គ្មានដែនកំណត់',
    'why.unlimitedDesc': 'ចូលប្រើមុខងារ និងខ្លឹមសារទាំងអស់ដោយគ្មានការរឹតបន្តឹង',
    'why.quality': 'គុណភាពល្អបំផុត',
    'why.qualityDesc': 'រីករាយជាមួយការស្ទ្រីម និងការទាញយកគុណភាពខ្ពស់បំផុត',
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'cute');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
