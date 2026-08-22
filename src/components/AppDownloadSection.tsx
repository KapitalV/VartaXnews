/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Smartphone, ArrowRight, ShieldCheck, Tv, Info, Copy, Check } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';

interface AppDownloadProps {
  onInstallClick?: () => void;
  isInstallable?: boolean;
  channelLogo?: string;
}

export default function AppDownloadSection({ onInstallClick, isInstallable = false, channelLogo = '/input_file_0.png' }: AppDownloadProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const webAppUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 py-2 text-white">
      {/* Header Info */}
      <div className="text-center md:text-left">
        <h3 className="text-lg font-extrabold text-gray-100 tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Smartphone className="h-5 w-5 text-red-500 animate-pulse" />
          वार्ता एक्स न्यूज़ आधिकारिक मोबाइल ऐप इंस्टॉल करें
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          बिना किसी धीमे डाउनलोड के, केवल एक क्लिक में वार्ता एक्स ऐप को अपने मोबाइल पर इंस्टॉल करें।
        </p>
      </div>

      {/* Main Grid: Direct Download Panel & Step Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Action & PWA Benefits */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#121212] via-[#161616] to-[#200a0a] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Accent lighting */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-6 relative">
            
            {/* Visual Logo + Tag */}
            <div className="flex items-center gap-4">
              <img 
                src={resolveImageUrl(channelLogo)} 
                alt="Varta X Logo" 
                className="h-16 w-16 object-contain rounded-xl border border-white/10 shadow-lg"
              />
              <div>
                <span className="bg-red-750/90 text-yellow-300 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded border border-red-500/30">
                  ★ OFFICIAL LATEST VERSION ★
                </span>
                <h4 className="text-xl font-bold text-gray-150">Varta X News App (PWA)</h4>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">संस्करण v1.0.8 • लाइटवेट (केवल 500 KB)</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-semibold">
              वार्ता एक्स न्यूज़ ऐप को नवीनतम <strong className="text-red-400">PWA (Progressive Web App)</strong> तकनीक पर तैयार किया गया है। यह एंड्रॉइड फोन में सामान्य <strong className="text-red-400">APK</strong> की तरह ही स्थापित होता है, होम स्क्रीन पर आइकॉन जोड़ता है और सीधा पूर्ण-स्क्रीन (Full-Screen) लाइव न्यूज़ अनुभव प्रदान करता है।
            </p>

            <div className="border-t border-white/5 pt-5 space-y-3.5">
              <h5 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">ऐप की मुख्य विशेषताएं (Key Features):</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 p-2 bg-black/35 rounded-xl border border-white/5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>24 घण्टे सुपरफास्ट लाइव खबरें</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-black/35 rounded-xl border border-white/5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>ब्रेकिंग न्यूज़ पुश नोटिफिकेशन्स</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-black/35 rounded-xl border border-white/5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>ऑफलाइन मोड (बिना इंटरनेट पढ़ना)</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-black/35 rounded-xl border border-white/5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>लो-डेटा कम्पेटिबिलिटी</span>
                </div>
              </div>
            </div>

            {/* Installation Action Buttons */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              {isInstallable ? (
                <button
                  onClick={onInstallClick}
                  className="w-full bg-red-700 hover:bg-red-650 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-sm cursor-pointer border border-red-500/20 active:scale-98"
                >
                  <Download className="h-5 w-5 animate-bounce" />
                  मोबाइल फोन में इंस्टॉल करें (Install App) &rarr;
                </button>
              ) : (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-red-300">
                    <Info className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
                    <p className="font-semibold leading-relaxed">
                      यदि आपके फोन पर इंस्टॉल बटन सक्रिय नहीं है, तो आप अपने क्रोम ब्राउज़र के मेनू (ऊपर दायें कोने में तीन बिंदु <code className="bg-white/5 px-1 py-0.5 rounded text-white inline-block">⋮</code>) को दबाकर <strong className="text-white">"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> या <strong className="text-white">"Install App" (ऐप इंस्टॉल करें)</strong> पर क्लिक कर इसे तत्काल मोबाइल ऐप बना सकते हैं।
                    </p>
                  </div>
                </div>
              )}

              {/* Share link block helper */}
              <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-left w-full sm:w-auto">
                  <span className="block text-[9px] text-gray-500 font-bold uppercase">अपने व्हाट्सएप पर लिंक पाने के लिए</span>
                  <span className="font-mono text-gray-300 select-all truncate max-w-[200px] block">{webAppUrl}</span>
                </div>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl hover:bg-neutral-850 hover:text-white transition-colors flex items-center justify-center gap-1.5 font-bold cursor-pointer text-[11px]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>लिंक कॉपी हुआ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-red-500" />
                      <span>वेब URL कॉपी करें</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Steps Guide Visual Representation */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Trust Seal */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <span className="block font-bold text-gray-200">100% सुरक्षित और वायरस-मुक्त</span>
              <span className="text-gray-400">यह ऐप आपके फोन के रिसोर्सेज या किसी व्यक्तिगत डेटा को एक्सेस नहीं करता है।</span>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-5 shadow-xl">
            <h4 className="text-sm font-bold text-gray-150 flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <Smartphone className="h-4 w-4 text-red-550" />
              आसान 3-स्टेप इंस्टॉलेशन गाइड
            </h4>

            <div className="space-y-4 text-xs font-semibold">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="h-6 w-6 rounded-full bg-red-950 border border-red-700 text-red-400 flex items-center justify-center text-[11px] font-black shrink-0 font-mono">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-gray-100">अपने मोबाइल में क्रोम (Chrome) खोलें</h5>
                  <p className="text-gray-400 mt-0.5">इस न्यूज़ वेबसाइट को खोलकर अपने मोबाइल ब्राउज़र में लोड होने दें।</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="h-6 w-6 rounded-full bg-red-950 border border-red-700 text-red-400 flex items-center justify-center text-[11px] font-black shrink-0 font-mono">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-gray-100">मेन्यू <code className="bg-white/5 px-1 rounded text-red-400">⋮</code> पर क्लिक करें</h5>
                  <p className="text-gray-400 mt-0.5">ब्राउज़र की दाईं तरफ शीर्ष पर दिए गए 3-बिंदु वाले आइकन को दबाएं।</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="h-6 w-6 rounded-full bg-red-950 border border-red-700 text-red-400 flex items-center justify-center text-[11px] font-black shrink-0 font-mono">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-gray-100">"Add to Home Screen" या "Install" चुनें</h5>
                  <p className="text-gray-400 mt-0.5">यह आपके फोन के होम स्क्रीन पर वार्ता एक्स ऐप का आइकन रख देगा जिससे आप तुरंत इसे कभी भी खोल सकेंगे।</p>
                </div>
              </div>
            </div>

            <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-[10px] text-gray-400 text-center leading-relaxed">
              💡 <strong>नोट:</strong> एप्पल (iOS) फोन उपभोक्ता इसे सफारी (Safari) में खोलकर 'Share' बटन पर क्लिक करें, और फिर <strong>'Add to Home Screen'</strong> पर क्लिक करें।
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
