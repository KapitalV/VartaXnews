import React, { useState, useEffect } from 'react';
import { VideoBulletin } from '../types';
import { 
  Play, 
  Eye, 
  Clock, 
  MessageSquare, 
  Send, 
  Share2, 
  Check, 
  Radio, 
  Flame,
  Tv,
  Film
} from 'lucide-react';

interface VideoSectionProps {
  videos: VideoBulletin[];
  onOpenLiveChat?: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoBulletin | null>(null);
  const [copied, setCopied] = useState(false);

  // Viewer simulation chat comments for live video stream feel
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: '1', user: 'अमित सोनी (झाँसी)', text: 'सटीक ग्राउंड रिपोर्टिंग!', time: 'अभी' },
    { id: '2', user: 'राकेश राजपूत (कटेरा)', text: 'वार्ता X न्यूज़ सच की आवाज है', time: '1m' },
    { id: '3', user: 'सुरेश कुमार (मऊरानीपुर)', text: 'लाइव कवरेज बहुत अच्छा है', time: '2m' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        user: 'आप (दर्शक)',
        text: chatInput.trim(),
        time: 'अभी'
      }
    ]);
    setChatInput('');
  };

  const handleShare = () => {
    if (!selectedVideo) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: selectedVideo.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800 mb-1">कोई वीडियो बुलेटिन उपलब्ध नहीं है</h3>
        <p className="text-xs text-gray-500">एडमिन डेस्क से नया वीडियो बुलेटिन अपलोड करें।</p>
      </div>
    );
  }

  const currentVid = selectedVideo || videos[0];

  // Helper to construct YouTube embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    return url;
  };

  const videoSrc = currentVid.videoUrl || currentVid.youtube_url || '';

  return (
    <div className="space-y-8">
      {/* Video Studio Section Masthead */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full mb-2 border border-red-200">
              <Tv className="w-3.5 h-3.5 text-red-600" />
              <span>वार्ता X डिजिटल वीडियो डेस्क</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              विशेष वीडियो बुलेटिन एवं ग्राउंड रिपोर्ट
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>HD स्ट्रीम</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Broadcast Stage: Video Player + Live Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Player & Headline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-300">
            {videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be') ? (
              <iframe
                src={getEmbedUrl(videoSrc)}
                title={currentVid.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : videoSrc ? (
              <video
                src={videoSrc}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Play className="w-16 h-16 text-red-600 mb-2 opacity-80" />
                <p className="text-sm font-semibold">{currentVid.title}</p>
                <span className="text-xs text-gray-500 mt-1">वीडियो स्ट्रीम लोड हो रही है...</span>
              </div>
            )}
          </div>

          {/* Current Video Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-red-600 text-white font-bold rounded text-[11px]">
                  {currentVid.category || 'वीडियो रिपोर्ट'}
                </span>
                <span className="font-semibold text-gray-800">{currentVid.authorName || 'वार्ता X वीडियो डेस्क'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {currentVid.views || 250} दर्शक
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-600 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'कॉपी हुआ' : 'शेयर'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
              {currentVid.title}
            </h1>
            {currentVid.description && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {currentVid.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Live Interactive Audience Chat Stream */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col h-[460px] lg:h-auto justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900 leading-none">लाइव दर्शक चैट</h3>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                सक्रिय
              </span>
            </div>

            {/* Chat message stream */}
            <div className="space-y-2.5 overflow-y-auto max-h-[300px] lg:max-h-[380px] pr-1">
              {chatMessages.map(msg => (
                <div key={msg.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                    <span className="font-bold text-gray-800">{msg.user}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-gray-700">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-gray-100 mt-2 flex gap-2">
            <input
              type="text"
              placeholder="अपनी प्रतिक्रिया लिखें..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              type="submit"
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* Video Playlist Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            <span>अन्य सभी वीडियो बुलेटिन ({videos.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((vid) => {
            const isCurrent = selectedVideo?.id === vid.id;
            return (
              <div
                key={vid.id}
                onClick={() => {
                  setSelectedVideo(vid);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                className={`rounded-xl border p-2 transition-all cursor-pointer group flex flex-col justify-between ${
                  isCurrent
                    ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-600/30'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow'
                }`}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80'}
                    alt={vid.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded">
                      प्लेइंग
                    </span>
                  )}
                </div>

                <div className="px-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                    {vid.category || 'वीडियो'}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mb-1">
                    {vid.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                    <span>{vid.duration || '2:30'}</span>
                    <span>{vid.views || 100} व्यूज</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default VideoSection;
