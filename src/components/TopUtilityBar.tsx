import React, { useState, useEffect } from 'react';
import { Radio, MapPin, Phone, ShieldCheck, Clock, Sun } from 'lucide-react';

interface TopUtilityBarProps {
  onLiveClick?: () => void;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({ onLiveClick }) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const dateStr = now.toLocaleDateString('hi-IN', options);
      const timeStr = now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentDateTime(`${dateStr} | ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#111827] text-gray-300 text-xs border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap justify-between items-center gap-2">
        {/* Left: Date, Time & Bureau */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-gray-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="hidden xs:inline">{currentDateTime}</span>
            <span className="xs:hidden">आज का ताज़ा समाचार</span>
          </div>

          <span className="hidden sm:inline text-gray-600">|</span>

          <div className="hidden sm:flex items-center gap-1 text-gray-400">
            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
            <span>झाँसी ब्यूरो (बुंदेलखंड / उ.प्र.)</span>
          </div>
        </div>

        {/* Right: Live Stream status, Helpline & Certified Badge */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs ml-auto">
          <div className="flex items-center gap-1 text-gray-400">
            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden md:inline">हेल्पलाइन:</span>
            <a href="tel:+916393874723" className="hover:text-white font-mono transition-colors font-medium">
              +91 6393874723
            </a>
          </div>

          <span className="text-gray-600">|</span>

          <button 
            type="button"
            onClick={onLiveClick}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px] tracking-wide hover:bg-red-700 transition-colors uppercase cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
            <span>लाइव टीवी</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-amber-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>प्रेस परिषद प्रमाणित</span>
          </div>
        </div>
      </div>
    </div>
  );
};
