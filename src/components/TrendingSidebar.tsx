import React from 'react';
import { NewsPost } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { TrendingUp, Flame, ChevronRight } from 'lucide-react';

interface TrendingSidebarProps {
  posts: NewsPost[];
  onSelectPost: (post: NewsPost) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  posts,
  onSelectPost
}) => {
  // Sort posts by popularity (views + likes * 3)
  const trendingList = [...posts]
    .sort((a, b) => ((b.views || 0) + (b.likes || 0) * 3) - ((a.views || 0) + (a.likes || 0) * 3))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600 text-white rounded-lg shadow">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              ट्रेंडिंग खबरें (Trending)
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">पाठकों द्वारा सबसे ज्यादा पढ़ी गईं</span>
          </div>
        </div>
        <TrendingUp className="w-4 h-4 text-red-600" />
      </div>

      {/* Ranked List */}
      <div className="space-y-3">
        {trendingList.map((post, idx) => (
          <article
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="flex items-start gap-3 group cursor-pointer pb-3 last:pb-0 border-b last:border-0 border-gray-100"
          >
            {/* Rank Number Badge */}
            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
              idx === 0 
                ? 'bg-red-600 text-white shadow-sm' 
                : idx === 1 
                ? 'bg-red-100 text-red-700' 
                : idx === 2 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              0{idx + 1}
            </div>

            {/* Thumbnail */}
            <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img
                src={resolveImageUrl(post.imageUrl)}
                alt={post.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>

            {/* Headline Details */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide block mb-0.5">
                {post.category?.toString() || 'समाचार'}
              </span>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                <span>{post.views || 0} पाठक</span>
                <span>•</span>
                <span>{post.likes || 0} लाइक्स</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
