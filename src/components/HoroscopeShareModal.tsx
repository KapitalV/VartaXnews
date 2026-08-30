import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  MessageCircle, 
  Sparkles,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { ZodiacSign } from '../types';
import { 
  shareRashifal, 
  downloadRashifalPhotoCard, 
  generateRashifalCardBlob,
  getRashifalShareUrl, 
  shareRashifalToWhatsApp, 
  shareRashifalToTelegram, 
  shareRashifalToFacebook, 
  shareRashifalToTwitter 
} from '../utils/shareHelper';

interface HoroscopeShareModalProps {
  sign: ZodiacSign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HoroscopeShareModal: React.FC<HoroscopeShareModalProps> = ({
  sign,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sign) {
      setIsGenerating(true);
      setStatusMessage(null);
      setCopied(false);
      generateRashifalCardBlob(sign).then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
        setIsGenerating(false);
      });
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, sign]);

  if (!isOpen || !sign) return null;

  const shareUrl = getRashifalShareUrl(sign.id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setStatusMessage('राशिफल लिंक कॉपी कर लिया गया!');
      setTimeout(() => {
        setCopied(false);
        setStatusMessage(null);
      }, 3000);
    } catch {
      setStatusMessage('कॉपी करने में असमर्थ');
    }
  };

  const handleNativeShare = async () => {
    setIsGenerating(true);
    const res = await shareRashifal(sign);
    setIsGenerating(false);
    setStatusMessage(res.message);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    const success = await downloadRashifalPhotoCard(sign);
    setIsGenerating(false);
    if (success) {
      setStatusMessage('HD फोटो कार्ड डाउनलोड हो गया!');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#120a21] border border-purple-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-purple-800/40 bg-gradient-to-r from-purple-950 via-slate-900 to-red-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow">
              {sign.symbol}
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                <span>{sign.hindiName} राशि दैनिक राशिफल</span>
                <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-yellow-300 rounded-full font-bold">
                  {sign.englishName}
                </span>
              </h3>
              <p className="text-[11px] text-gray-300 font-medium">फोटो कार्ड व सीधा राशिफल पेज लिंक शेयर करें</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {/* Status Message Notification */}
          {statusMessage && (
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-center text-xs font-bold text-amber-200 animate-fadeIn">
              {statusMessage}
            </div>
          )}

          {/* HD Photo Card Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-300">
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                HD राशिफल फोटो कार्ड (ऑटो-जनरेटेड)
              </span>
              <span className="text-[10px] text-gray-400 font-normal">व्हाट्सएप व सोशल मीडिया रेडी</span>
            </div>

            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-purple-500/30 shadow-inner flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-amber-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-xs font-bold">HD राशिफल कार्ड तैयार हो रहा है...</span>
                </div>
              ) : previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={`${sign.hindiName} राशि कार्ड`}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">कार्ड लोड हो रहा है...</div>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-gray-200">
              <span className="block text-[10px] text-gray-400 font-bold">भाग्य प्रतिशत</span>
              <span className="font-extrabold text-amber-400 text-sm">{sign.luckPercentage}%</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-gray-200">
              <span className="block text-[10px] text-gray-400 font-bold">शुभ अंक</span>
              <span className="font-extrabold text-blue-400 text-sm">{sign.luckyNumber}</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-gray-200">
              <span className="block text-[10px] text-gray-400 font-bold">शुभ रंग</span>
              <span className="font-extrabold text-rose-400 text-xs truncate block">{sign.luckyColor}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>📱 स्मार्ट शेयर (फोटो + लिंक)</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 shadow transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>📥 फोटो कार्ड डाउनलोड करें</span>
            </button>
          </div>

          {/* Social Platforms Row */}
          <div className="space-y-2 pt-1 border-t border-purple-800/30">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              सीधा सोशल मीडिया पर शेयर करें:
            </span>

            <div className="grid grid-cols-4 gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => shareRashifalToWhatsApp(sign)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="WhatsApp पर शेयर करें"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-[10px] font-bold">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => shareRashifalToTelegram(sign)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="Telegram पर शेयर करें"
              >
                <Send className="w-5 h-5" />
                <span className="text-[10px] font-bold">Telegram</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => shareRashifalToFacebook(sign)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                title="Facebook पर शेयर करें"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-[10px] font-bold">Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => shareRashifalToTwitter(sign)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/40 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Twitter (X) पर शेयर करें"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="text-[10px] font-bold">Twitter (𝕏)</span>
              </button>
            </div>
          </div>

          {/* Copy Direct Link Box */}
          <div className="p-3 bg-black/60 rounded-xl border border-purple-500/20 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] text-gray-400 font-bold">सीधा राशिफल पेज लिंक (Direct Deep Link):</span>
              <p className="text-xs text-amber-300 font-mono truncate">{shareUrl}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ' : 'कॉपी'}</span>
            </button>
          </div>

          <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-500/20 text-center">
            <p className="text-[11px] text-amber-200/90 font-medium">
              💡 <strong>नोट:</strong> कोई भी यूजर इस लिंक पर क्लिक करेगा तो वह सीधे वार्ता X न्यूज़ के राशिफल पेज पर <strong>{sign.hindiName} राशि</strong> के भविष्यफल पर पहुंचेगा।
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
