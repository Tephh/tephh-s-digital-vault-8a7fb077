import React from 'react';

const MarqueeBanner: React.FC = () => {
  const items = [
    '🔥 Premium Accounts at Best Prices',
    '⚡ Instant Delivery via Telegram',
    '🛡️ Full Duration Warranty',
    '💰 Cheapest in Cambodia',
    '🎧 24/7 Customer Support',
    '✨ Spotify • YouTube • CapCut • Alight Motion • Discord',
  ];

  const content = items.join('   •   ');

  return (
    <div className="w-full overflow-hidden bg-primary/10 border-y border-primary/20 backdrop-blur-sm py-2.5">
      <div className="marquee-track flex whitespace-nowrap">
        <span className="marquee-content text-sm font-medium text-primary px-4">
          {content}
        </span>
        <span className="marquee-content text-sm font-medium text-primary px-4" aria-hidden>
          {content}
        </span>
      </div>
    </div>
  );
};

export default MarqueeBanner;
