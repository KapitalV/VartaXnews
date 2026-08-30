import React from 'react';
import { NewsPost, LocalAd } from '../types';
import { Zap, Sparkles } from 'lucide-react';

interface BreakingTickerProps {
  breakingPosts: NewsPost[];
  activeTickerAds?: LocalAd[];
  onSelectPost: (post: NewsPost) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  breakingPosts,
  activeTickerAds = [],
  onSelectPost
}) => {
  const hasAds = activeTickerAds && activeTickerAds.length > 0;
  if ((!breakingPosts || breakingPosts.length === 0) && !hasAds) return null;

  return (
    <div className="bg-red-600 text-white shadow-inner overflow-hidden border-b border-red-700">
      <div className="max-w-7xl mx-auto flex items-center h-10 px-3 sm:px-6 lg:px-8">
        
        {/* Flash Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 text-xs font-black uppercase tracking-wider rounded shrink-0 shadow-sm z-10">
          <Zap className="w-3.5 h-3.5 fill-red-600 text-red-600 animate-pulse" />
          <span>ब्रेकिंग न्यूज़</span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="flex-1 overflow-hidden relative ml-3">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 hover:pause">
            {/* Sponsored Ticker Announcements (Only shown if admin activated them) */}
            {activeTickerAds.map((ad) => (
              <a
                key={`ticker-ad-${ad.id}`}
                href={ad.targetUrl || (ad.phone ? `tel:${ad.phone}` : '#')}
                target={ad.targetUrl ? '_blank' : '_self'}
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-xs hover:bg-amber-300 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-red-700 fill-red-700" />
                <span className="bg-red-700 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">विज्ञापन</span>
                <span>{ad.clientName}: {ad.tickerText || 'विशेष ऑफर व जानकारी'}</span>
              </a>
            ))}

            {breakingPosts.concat(breakingPosts).map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                onClick={() => onSelectPost(post)}
                className="inline-flex items-center gap-2 cursor-pointer hover:underline text-xs sm:text-sm font-semibold text-white/95 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                <span>{post.title}</span>
                {post.district && (
                  <span className="text-[10px] bg-red-800/80 text-red-100 px-1.5 py-0.5 rounded font-mono">
                    {post.district}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
