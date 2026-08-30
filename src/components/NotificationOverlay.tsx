/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Bell, BellOff, X, Volume2, VolumeX, Radio } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationOverlayProps {
  onNotificationClick: (id: string) => void;
  incomingNotification: PushNotification | null;
  onClearNotification: () => void;
}

export default function NotificationOverlay({
  onNotificationClick,
  incomingNotification,
  onClearNotification
}: NotificationOverlayProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Play synthetic news chime using Web Audio API
  const playPulseSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Chime Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 880; // A5 pitch
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.2);

      // Chime Beep 2 (Slightly higher pitch, slightly delayed)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1109; // C#6 pitch
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      }, 150);

    } catch (e) {
      console.warn('Audio synthesis skipped due to user interaction restrictions', e);
    }
  };

  // Whenever a new pushing notification comes in, trigger reactions
  useEffect(() => {
    if (incomingNotification) {
      playPulseSound();

      // Send standard browser operating system push notification if allowed
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const nativeNotification = new Notification("वर्ता एक्स ब्रेकिंग न्यूज़!", {
            body: incomingNotification.title + "\n" + incomingNotification.message,
            icon: '/input_file_0.png',
            tag: incomingNotification.id,
          });
          nativeNotification.onclick = () => {
            onNotificationClick(incomingNotification.id);
            window.focus();
          };
        } catch (e) {
          console.error("Failed to showcase native notification", e);
        }
      }

      // Automatically clear after 6 seconds
      const timer = setTimeout(() => {
        onClearNotification();
      }, 6500);

      return () => clearTimeout(timer);
    }
  }, [incomingNotification]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert("यह ब्राउज़र पुश नोटिफिकेशन का समर्थन नहीं करता है। (This browser does not support web notifications)");
      return;
    }
    try {
      const resp = await Notification.requestPermission();
      setPermission(resp);
      if (resp === 'granted') {
        const testNotify = new Notification("वार्ता एक्स न्यूज़", {
          body: "पुश नोटिफिकेशन सफलतापूर्वक सक्रिय हो गई हैं!",
          icon: '/input_file_0.png'
        });
        playPulseSound();
      }
    } catch (e) {
      console.error("Error setting up notifications", e);
    }
  };

  return (
    <>
      {/* Dynamic Desktop Prompt - Perm status */}
      <div className="bg-[#0f0f0f] text-gray-300 py-1.5 px-4 text-xs flex justify-between items-center border-b border-white/5 shrink-0 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>आधिकारिक न्यूज़ पोर्टल • 24 घंटे लाइव देश-विदेश की खबरें</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Sound Controls */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="hover:text-white flex items-center gap-1 transition-colors font-medium px-1 shadow-sm"
            title={soundEnabled ? "आवाज बंद करें" : "आवाज चालू करें"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-red-400" />
                <span className="hidden sm:inline">ध्वनि चालू</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-gray-400" />
                <span className="hidden sm:inline">उत्सव म्यूट</span>
              </>
            )}
          </button>

          {/* Web Push Notification subscription trigger */}
          {permission !== 'granted' ? (
            <button 
              onClick={requestPermission}
              className="bg-red-700 hover:bg-red-600 text-[10px] font-bold text-white uppercase px-2.5 py-1 rounded transition-all duration-250 flex items-center gap-1.5 active:scale-95 shadow border border-red-500/20"
            >
              <Bell className="h-3 w-3 animate-bounce" />
              पुश नोटिफिकेशन ऑन करें
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/45 px-2 py-0.5 rounded border border-emerald-900/30">
              <Bell className="h-3 w-3" />
              अलर्ट सक्रिय है
            </span>
          )}
        </div>
      </div>

      {/* Beautiful fly-in Toast breaking notification banner */}
      {incomingNotification && (
        <div 
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-950 border border-red-600 rounded-xl shadow-2xl overflow-hidden animate-[slideUp_0.4s_ease-out] select-none text-white cursor-pointer"
          onClick={() => onNotificationClick(incomingNotification.id)}
        >
          {/* Ribbon Header bar */}
          <div className="bg-gradient-to-r from-red-800 to-black p-2.5 px-4 flex items-center justify-between border-b border-red-900/60">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-red-100 flex items-center gap-1">
                <Radio className="h-3 w-3 text-yellow-400 animate-pulse" />
                VARTA X ब्रेकिंग अलर्ट
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClearNotification();
              }}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Notification Body Info */}
          <div className="p-4 flex gap-3">
            <div className="bg-red-950/50 p-2.5 rounded-lg border border-red-900 shrink-0 h-fit flex items-center justify-center">
              <Bell className="h-5 w-5 text-red-500 animate-[shake_1s_infinite]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-150 leading-snug line-clamp-2">
                {incomingNotification.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-normal">
                {incomingNotification.message}
              </p>
              <div className="text-[10px] text-red-400 font-bold mt-2.5 flex items-center gap-1 hover:underline">
                विस्तृत रिपोर्ट देखने के लिए यहाँ क्लिक करें &rarr;
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
