import React from 'react';
import { NewsPost } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { Radio, Clock, ChevronRight } from 'lucide-react';

interface LatestNewsFeedProps {
  posts: NewsPost[];
  onSelectPost: (post: NewsPost) => void;
}

export const LatestNewsFeed: React.FC<LatestNewsFeedProps> = ({
  posts,
  onSelectPost
}) => {
  // Sort posts strictly by creation date for Live News Wire
  const latestList = [...posts]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      {/* Wire Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              लाइव न्यूज़ वायर (News Wire)
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">ताज़ा ब्रेकिंग अपडेट्स 24x7</span>
          </div>
        </div>
        <Radio className="w-4 h-4 text-red-600" />
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-gray-100">
        {latestList.map((post) => (
          <article
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="relative pl-6 group cursor-pointer"
          >
            {/* Timeline Dot */}
            <div className="absolute left-[5px] top-1.5 w-2 h-2 rounded-full bg-red-600 ring-4 ring-white group-hover:scale-125 transition-transform" />

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="font-bold text-red-600">
                  {post.category?.toString() || 'ताज़ा खबर'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {post.createdAt ? new Date(post.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : 'अभी'}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h4>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
