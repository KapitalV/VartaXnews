import React from 'react';
import { LocalAd } from '../types';
import { ExternalLink, Phone, Sparkles } from 'lucide-react';

interface LocalAdBannerProps {
  ad?: LocalAd | null;
  slot?: string;
  className?: string;
}

export const LocalAdBanner: React.FC<LocalAdBannerProps> = ({ ad, className = '' }) => {
  if (!ad || !ad.isActive) {
    return null; // Return nothing if no active ad is present
  }

  const handleClick = () => {
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    } else if (ad.phone) {
      window.location.href = `tel:${ad.phone}`;
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Sponsor badge */}
      <div className="px-3 py-1 bg-amber-500/10 border-b border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-900">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
          <span>विशेष प्रायोजक (Sponsored Partner)</span>
        </span>
        <span className="text-[10px] text-amber-700 font-medium">वार्ता एक्स मीडिया विज्ञापन</span>
      </div>

      <div 
        onClick={handleClick} 
        className="cursor-pointer group flex flex-col sm:flex-row items-center p-3 sm:p-4 gap-4"
      >
        {ad.bannerUrl && (
          <div className="w-full sm:w-48 h-28 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={ad.bannerUrl} 
              alt={ad.clientName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 text-left w-full">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
            {ad.clientName}
          </h4>
          {ad.tickerText && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {ad.tickerText}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {ad.phone && (
              <a
                href={`tel:${ad.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>कॉल करें ({ad.phone})</span>
              </a>
            )}
            
            {ad.targetUrl && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs group-hover:bg-red-700 transition-colors">
                <span>जानकारी देखें</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
