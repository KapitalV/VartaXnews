import React, { useState, useEffect } from 'react';
import { NewsPost, CommentItem } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { fetchComments, addComment, subscribeToComments } from '../services/commentService';
import { 
  X, 
  Clock, 
  MapPin, 
  Eye, 
  Heart, 
  Share2, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  Check, 
  ArrowLeft,
  Calendar,
  Sparkles
} from 'lucide-react';

interface NewsDetailModalProps {
  post: NewsPost;
  onClose: () => void;
  onLikePost?: (postId: string, e: React.MouseEvent) => void;
  relatedPosts?: NewsPost[];
  onSelectRelatedPost?: (post: NewsPost) => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  post,
  onClose,
  onLikePost,
  relatedPosts = [],
  onSelectRelatedPost
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch comments and subscribe
  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      const data = await fetchComments(post.id);
      if (isMounted) setComments(data);
    };
    loadComments();

    const unsub = subscribeToComments(post.id, async () => {
      const freshComments = await fetchComments(post.id);
      if (isMounted) setComments(freshComments);
    });

    return () => {
      isMounted = false;
      unsub();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [post.id]);

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${post.title}. ${post.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShare = async () => {
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const name = commentName.trim() || 'पाठक';
      const created = await addComment(post.id, name, commentText.trim());
      setComments(prev => [...prev, created]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      
      {/* Modal Card Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fadeIn">
        
        {/* Top Sticky Action Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md border border-red-200">
              {post.category?.toString() || 'समाचार'}
            </span>
            {post.district && (
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600" />
                {post.district}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeech}
              title={isPlayingAudio ? "ऑडियो बंद करें" : "समाचार सुनें"}
              className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                isPlayingAudio 
                  ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-gray-600" />}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
              title="शेयर करें"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-gray-600" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors ml-1"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Editorial Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>

          {/* Journalist Byline & Date Bar */}
          <div className="flex flex-wrap items-center justify-between py-3 border-y border-gray-100 text-xs text-gray-500 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs border border-red-200">
                {(post.authorName || 'व')[0]}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">{post.authorName || 'वार्ता X मुख्य संवाददाता'}</span>
                <span className="text-[10px] text-gray-400">{post.authorRole || 'ग्राउंड रिपोर्टर, कटेरा ब्यूरो'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'आज'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                {post.views || 1} व्यूज
              </span>
            </div>
          </div>

          {/* Article Featured Image */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
            <img
              src={resolveImageUrl(post.imageUrl)}
              alt={post.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover"
            />
            {post.isBreaking && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-md shadow-md">
                🔴 ग्राउंड रिपोर्ट (Breaking Ground Coverage)
              </span>
            )}
          </div>

          {/* Article Body Text */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-normal whitespace-pre-line text-sm sm:text-base">
            {post.content}
          </div>

          {/* Reader Reaction & Like Strip */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">क्या आपको यह खबर महत्वपूर्ण लगी?</span>
            </div>
            {onLikePost && (
              <button
                type="button"
                onClick={(e) => onLikePost(post.id, e)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-gray-800 hover:text-red-600 rounded-xl border border-gray-300 font-bold text-xs shadow-sm transition-all"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>पसंद करें ({post.likes || 0})</span>
              </button>
            )}
          </div>

          {/* Reader Discussion / Comments Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-gray-900">
                पाठकों की प्रतिक्रिया ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="आपका नाम (वैकल्पिक)"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <textarea
                rows={2}
                required
                placeholder="इस समाचार पर अपनी राय लिखें..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingComment ? 'भेजा जा रहा है...' : 'टिप्पणी भेजें'}</span>
              </button>
            </form>

            {/* Comment Stream */}
            <div className="space-y-3">
              {comments.map((c, i) => (
                <div key={c.id || i} className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{c.name}</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {c.date ? new Date(c.date).toLocaleDateString('hi-IN') : 'हाल ही में'}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Category Stories */}
          {relatedPosts.length > 0 && onSelectRelatedPost && (
            <div className="pt-8 border-t border-gray-200 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>संबंधित अन्य खबरें</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedPost(rel)}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-red-50 rounded-xl border border-gray-200 transition-colors cursor-pointer group"
                  >
                    <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={resolveImageUrl(rel.imageUrl)}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString('hi-IN') : 'आज'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
