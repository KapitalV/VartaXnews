import React, { useState } from 'react';
import { Search, ShieldAlert, Video, Award, Radio, Menu, X, Smartphone, Sparkles, Users } from 'lucide-react';

interface MainHeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onOpenAdmin: () => void;
  onOpenAppModal?: () => void;
  onNavigateHome: () => void;
  onNavigateTab: (tab: any) => void;
  activeTab: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  onSearch,
  searchQuery,
  onOpenAdmin,
  onOpenAppModal,
  onNavigateHome,
  onNavigateTab,
  activeTab
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch.trim());
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand Masthead */}
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none" onClick={onNavigateHome}>
            <div className="relative group">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-md border-2 border-red-500/30 group-hover:scale-105 transition-transform duration-200">
                <span className="tracking-tighter">VX</span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-none">
                  वार्ता <span className="text-red-600">X</span> न्यूज़
                </h1>
                <span className="hidden xs:inline-block px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded uppercase tracking-wider">
                  24x7 HD
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 font-semibold mt-1 tracking-wide">
                सच | सटीक | निष्पक्ष • खबर हमारी जिम्मेदारी
              </p>
            </div>
          </div>

          {/* Center / Search bar for desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="खबरें, क्षेत्र, घटना या रिपोर्टर खोजें..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-20 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    onSearch('');
                  }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
              >
                खोजें
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="खोजें"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Video Desk Quick Link */}
            <button
              type="button"
              onClick={() => onNavigateTab('videos')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                activeTab === 'videos'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-red-600" />
              <span>वीडियो बुलेटिन</span>
            </button>

            {/* Team Directory Quick Link */}
            <button
              type="button"
              onClick={() => onNavigateTab('team')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                activeTab === 'team'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-red-600" />
              <span>संपादकीय टीम</span>
            </button>

            {/* App Install Button */}
            {onOpenAppModal && (
              <button
                type="button"
                onClick={onOpenAppModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>ऐप डाउनलोड</span>
              </button>
            )}

            {/* Admin Desk Login / Switch */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden xs:inline">एडमिन / रिपोर्टर</span>
              <span className="xs:hidden">एडमिन</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Area */}
        {isSearchOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="खबरें, क्षेत्र या रिपोर्टर खोजें..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-20 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded"
              >
                खोजें
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
