import React, { useState } from 'react';
import { NewsPost } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { 
  Clock, 
  MapPin, 
  Eye, 
  Heart, 
  Share2, 
  Volume2, 
  VolumeX, 
  Check 
} from 'lucide-react';

interface NewsCardProps {
  post: NewsPost;
  onSelect: (post: NewsPost) => void;
  onLike?: (postId: string, e: React.MouseEvent) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  post,
  onSelect,
  onLike
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${post.title}. ${post.summary || post.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#post-${post.id}`;
    const shareData = {
      title: post.title,
      text: post.summary || post.title,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const imgSrc = !imgError ? resolveImageUrl(post.imageUrl) : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80';

  return (
    <article
      onClick={() => onSelect(post)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
    >
      {/* Thumbnail Aspect Ratio */}
      <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={post.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
          {post.isBreaking && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded tracking-wider uppercase shadow">
              ब्रेकिंग
            </span>
          )}
          <span className="px-2 py-0.5 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold rounded">
            {post.category?.toString() || 'समाचार'}
          </span>
        </div>

        {post.district && (
          <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-semibold rounded flex items-center gap-1 shadow-sm">
            <MapPin className="w-2.5 h-2.5 text-red-600" />
            <span>{post.district}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span className="font-medium text-gray-600 truncate max-w-[120px]">
              {post.authorName || 'संवाददाता'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }) : 'आज'}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
            {post.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
            {post.summary || post.content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.views || 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleSpeech}
              title={isPlayingAudio ? "ऑडियो बंद करें" : "समाचार सुनें"}
              className={`p-1.5 rounded-md border transition-all ${
                isPlayingAudio 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-gray-600" />}
            </button>

            {onLike && (
              <button
                type="button"
                onClick={(e) => onLike(post.id, e)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 transition-colors text-[11px] font-medium"
              >
                <Heart className="w-3 h-3 text-red-500" />
                <span>{post.likes || 0}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
              title="शेयर करें"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
