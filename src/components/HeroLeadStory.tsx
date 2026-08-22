import React, { useState } from 'react';
import { NewsPost } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { 
  Clock, 
  MapPin, 
  Eye, 
  Share2, 
  Volume2, 
  VolumeX, 
  Heart, 
  Check, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface HeroLeadStoryProps {
  post: NewsPost;
  onSelectPost: (post: NewsPost) => void;
  onLikePost: (postId: string, e: React.MouseEvent) => void;
}

export const HeroLeadStory: React.FC<HeroLeadStoryProps> = ({
  post,
  onSelectPost,
  onLikePost
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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

  const imgSrc = !imgError ? resolveImageUrl(post.imageUrl) : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80';

  return (
    <article 
      onClick={() => onSelectPost(post)}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col justify-between"
    >
      {/* High-Resolution Lead Image with Gradient Vignette */}
      <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={post.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="eager"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Lead Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          {post.isBreaking ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-md text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>ब्रेकिंग न्यूज़ (Lead Story)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-bold uppercase tracking-wider shadow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>प्रमुख खबर</span>
            </div>
          )}

          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-md border border-white/10">
            {post.category?.toString() || 'उत्तर प्रदेश'}
          </span>
        </div>

        {/* District Tag */}
        {post.district && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md text-gray-900 rounded-md text-xs font-bold shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>{post.district}</span>
          </div>
        )}
      </div>

      {/* Editorial Content Container */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Byline */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">{post.authorName || 'वार्ता X मुख्य संवाददाता'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'आज'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views || 1} पाठक</span>
            </div>
          </div>

          {/* Lead Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-950 group-hover:text-red-600 transition-colors leading-tight mb-3">
            {post.title}
          </h2>

          {/* Summary */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
            {post.summary || post.content}
          </p>
        </div>

        {/* Lead Interaction Bar */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeech}
              title={isPlayingAudio ? "ऑडियो रोकें" : "पूरी खबर सुनें"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isPlayingAudio 
                  ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-600" />
                  <span>ऑडियो बंद</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-gray-600" />
                  <span>खबर सुनें</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => onLikePost(post.id, e)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>{post.likes || 0} पसंद</span>
            </button>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
              title="शेयर करें"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
              <span>पूरी खबर पढ़ें</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
