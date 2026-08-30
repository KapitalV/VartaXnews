/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsPost } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { 
  shareNewsPost, 
  shareToWhatsApp, 
  shareToFacebook, 
  shareToTwitter, 
  shareToTelegram,
  buildNewsShareCaption,
  getNewsShareUrl,
  downloadNewsPhotoCard
} from '../utils/shareHelper';
import { 
  X, 
  Share2, 
  Check, 
  Copy, 
  Send, 
  Image as ImageIcon,
  Download,
  ExternalLink,
  Smartphone,
  Sparkles
} from 'lucide-react';

interface ShareModalProps {
  post: NewsPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ post, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const imgSrc = resolveImageUrl(post.imageUrl);
  const shareUrl = getNewsShareUrl(post.id);

  const handleCopyLink = async () => {
    try {
      const caption = buildNewsShareCaption(post);
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setStatusMsg('फोटो विवरण व लिंक कॉपी हो गया!');
      setTimeout(() => {
        setCopied(false);
        setStatusMsg(null);
      }, 2500);
    } catch {
      setStatusMsg('कॉपी करने में त्रुटि हुई');
    }
  };

  const handleNativeShare = async () => {
    setIsSharingNative(true);
    try {
      const result = await shareNewsPost(post);
      setStatusMsg(result.message);
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setIsSharingNative(false);
    }
  };

  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      const success = await downloadNewsPhotoCard(post);
      if (success) {
        setStatusMsg('फोटो कार्ड डाउनलोड हो गया! अब आप इसे गैलरी से सीधे व्हाट्सएप पर भेज सकते हैं।');
      } else {
        setStatusMsg('डाउनलोड करने में समस्या आई, कृपया दोबारा प्रयास करें');
      }
      setTimeout(() => setStatusMsg(null), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">समाचार शेयर करें (Share News)</h3>
              <p className="text-white/80 text-[11px]">फोटो व लिंक के साथ सोशल मीडिया पर साझा करें</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview Card */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 relative">
              <img 
                src={imgSrc} 
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded flex items-center gap-0.5">
                <ImageIcon className="w-2.5 h-2.5" />
                <span>फोटो</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                {post.category?.toString() || 'समाचार'}
              </span>
              <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-1 leading-snug">
                {post.title}
              </h4>
              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                {post.summary || post.content}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center justify-center gap-1.5 font-medium text-center animate-fadeIn">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* 1. Primary Action: Smart Share (Photo + Link) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isSharingNative}
              className="py-3 px-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>{isSharingNative ? 'शेयर हो रहा है...' : '📱 स्मार्ट शेयर (फोटो + लिंक)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="py-3 px-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4 text-red-400 shrink-0" />
              <span>{isDownloading ? 'तैयार हो रहा है...' : '📥 फोटो कार्ड डाउनलोड'}</span>
            </button>
          </div>

          {/* 2. Direct Channels */}
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>सोशल मीडिया पर सीधा शेयर करें (Direct Share):</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => shareToWhatsApp(post)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] transition-all group cursor-pointer"
                title="व्हाट्सएप पर फोटो व लिंक शेयर करें"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 ml-0.5" />
                </div>
                <span className="text-[11px] font-bold mt-1.5 text-gray-800">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => shareToTelegram(post)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold mt-1.5 text-gray-800">Telegram</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => shareToFacebook(post)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <span className="font-black text-lg">f</span>
                </div>
                <span className="text-[11px] font-bold mt-1.5 text-gray-800">Facebook</span>
              </button>

              {/* Twitter (X) */}
              <button
                type="button"
                onClick={() => shareToTwitter(post)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-black/10 hover:bg-black/20 text-black transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <span className="font-bold text-sm">𝕏</span>
                </div>
                <span className="text-[11px] font-bold mt-1.5 text-gray-800">Twitter (𝕏)</span>
              </button>
            </div>
          </div>

          {/* 3. Link Copy Bar */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="bg-transparent text-xs text-gray-600 px-2 flex-1 outline-none font-mono select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                <span>{copied ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
