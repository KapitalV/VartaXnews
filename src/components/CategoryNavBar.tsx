import React from 'react';
import { 
  Home, 
  MapPin, 
  Flame, 
  Video, 
  Users, 
  PhoneCall, 
  Sparkles, 
  Layers,
  ChevronRight
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  count?: number;
}

interface CategoryNavBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  activeTab: string;
  onSelectTab: (tab: 'feed' | 'videos' | 'team' | 'contact' | 'app' | 'horoscope') => void;
}

export const CategoryNavBar: React.FC<CategoryNavBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onSelectTab
}) => {
  return (
    <nav className="bg-red-700 text-white shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-0.5">
          
          <div className="flex items-center space-x-1 sm:space-x-1 min-w-max">
            {/* Home / Latest Feed */}
            <button
              type="button"
              onClick={() => {
                onSelectTab('feed');
                onSelectCategory('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'feed' && selectedCategory === 'all'
                  ? 'border-white bg-red-800 text-white shadow-inner'
                  : 'border-transparent text-red-100 hover:text-white hover:bg-red-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>मुख्य समाचार</span>
            </button>

            {/* Dynamic News Categories (Regional & Beat-based) */}
            {categories.map((cat) => {
              const isSelected = activeTab === 'feed' && selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectTab('feed');
                    onSelectCategory(cat.id);
                  }}
                  className={`flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                    isSelected
                      ? 'border-white bg-red-800 text-white shadow-inner'
                      : 'border-transparent text-red-100 hover:text-white hover:bg-red-800/60'
                  }`}
                >
                  <span>{cat.name}</span>
                  {typeof cat.count === 'number' && cat.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      isSelected ? 'bg-white text-red-700' : 'bg-red-900/80 text-red-200'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Divider */}
            <div className="h-5 w-px bg-red-500/50 mx-1 self-center" />

            {/* Video Desk Tab */}
            <button
              type="button"
              onClick={() => onSelectTab('videos')}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'videos'
                  ? 'border-white bg-red-800 text-white shadow-inner'
                  : 'border-transparent text-red-100 hover:text-white hover:bg-red-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-amber-300" />
              <span>वीडियो</span>
            </button>

            {/* Vedic Horoscope Tab */}
            <button
              type="button"
              onClick={() => onSelectTab('horoscope')}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'horoscope'
                  ? 'border-white bg-red-800 text-white shadow-inner'
                  : 'border-transparent text-amber-200 hover:text-white hover:bg-red-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>राशिफल</span>
            </button>

            {/* Press Team Tab */}
            <button
              type="button"
              onClick={() => onSelectTab('team')}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'team'
                  ? 'border-white bg-red-800 text-white shadow-inner'
                  : 'border-transparent text-red-100 hover:text-white hover:bg-red-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>संपादकीय टीम</span>
            </button>

            {/* Contact / Helpline Tab */}
            <button
              type="button"
              onClick={() => onSelectTab('contact')}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'contact'
                  ? 'border-white bg-red-800 text-white shadow-inner'
                  : 'border-transparent text-red-100 hover:text-white hover:bg-red-800/60'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>संपर्क / हेल्पलाइन</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
