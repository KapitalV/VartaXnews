/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsPost } from '../types';
import { resolveImageUrl } from './imageHelper';

export interface ShareResult {
  success: boolean;
  method: 'native-files' | 'native-text' | 'whatsapp' | 'clipboard' | 'download' | 'fallback';
  message: string;
}

/**
 * Returns the canonical share URL for WhatsApp, Telegram, Facebook, Twitter.
 * Uses /news/:id so server returns dynamic Open Graph meta tags (og:image, og:title, og:description).
 */
export function getNewsShareUrl(postId: string): string {
  if (typeof window === 'undefined') return `/news/${postId}`;
  return `${window.location.origin}/news/${postId}`;
}

/**
 * Converts a base64 data URL to a Blob.
 */
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Generates an HD News Photo Card Graphic with branding, photo, and Hindi headline.
 * Returns a JPEG Blob suitable for Web Share API and download.
 */
export async function generateNewsCardBlob(post: NewsPost): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const width = 1200;
      const height = 675;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Background
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, width, height);

      const resolvedImg = resolveImageUrl(post.imageUrl);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const drawCardContent = (loadedImg?: HTMLImageElement) => {
        try {
          if (loadedImg && loadedImg.width > 0) {
            // Draw background image scaled to fill
            const hRatio = width / loadedImg.width;
            const vRatio = height / loadedImg.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShiftX = (width - loadedImg.width * ratio) / 2;
            const centerShiftY = (height - loadedImg.height * ratio) / 2;
            ctx.drawImage(loadedImg, 0, 0, loadedImg.width, loadedImg.height,
              centerShiftX, centerShiftY, loadedImg.width * ratio, loadedImg.height * ratio);
          } else {
            // Placeholder gradient background
            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, '#1e293b');
            bgGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);
          }

          // Dark vignette overlay from top and bottom for readability
          const darkGrad = ctx.createLinearGradient(0, 0, 0, height);
          darkGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
          darkGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.2)');
          darkGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.75)');
          darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
          ctx.fillStyle = darkGrad;
          ctx.fillRect(0, 0, width, height);

          // Top Header Bar
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(0, 0, width, 56);

          // Header Text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px "Noto Sans Devanagari", system-ui, sans-serif';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔴 वार्ता एक्स न्यूज़ मीडिया लाइव (VARTA X NEWS LIVE)', 40, 28);

          // Breaking Tag or Category Pill
          const catText = post.isBreaking ? '🚨 ब्रेकिंग न्यूज़' : (post.category?.toString() || 'ताज़ा खबर');
          ctx.font = 'bold 20px "Noto Sans Devanagari", system-ui, sans-serif';
          const catWidth = ctx.measureText(catText).width + 32;
          ctx.fillStyle = post.isBreaking ? '#ef4444' : '#ffffff';
          ctx.beginPath();
          ctx.roundRect(width - catWidth - 40, 12, catWidth, 32, 8);
          ctx.fill();

          ctx.fillStyle = post.isBreaking ? '#ffffff' : '#0f172a';
          ctx.fillText(catText, width - catWidth - 24, 28);

          // Bottom Area: Headline & Details
          const maxHeadlineWidth = width - 80;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 42px "Noto Sans Devanagari", system-ui, sans-serif';
          ctx.textBaseline = 'alphabetic';

          // Word wrap headline
          const words = post.title.split(' ');
          let line = '';
          const lines: string[] = [];
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxHeadlineWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
              if (lines.length >= 3) break;
            } else {
              line = testLine;
            }
          }
          if (lines.length < 3 && line) {
            lines.push(line);
          }

          const startY = height - (lines.length * 52) - 80;
          for (let i = 0; i < lines.length; i++) {
            // Text shadow for high contrast
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText(lines[i].trim(), 40, startY + (i * 52));
          }

          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Footer info bar
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(40, height - 60, width - 80, 2);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 20px "Noto Sans Devanagari", system-ui, sans-serif';
          const authorText = `✍️ रिपोर्टर: ${post.authorName || 'वार्ता एक्स डेस्क'} • झाँसी, उत्तर प्रदेश`;
          ctx.fillText(authorText, 40, height - 25);

          const websiteText = '🌐 www.vartaxnews.com';
          const webWidth = ctx.measureText(websiteText).width;
          ctx.fillStyle = '#ef4444';
          ctx.fillText(websiteText, width - webWidth - 40, height - 25);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.92);
        } catch (err) {
          console.warn('[ShareHelper] Canvas render error:', err);
          resolve(null);
        }
      };

      if (resolvedImg.startsWith('data:image/')) {
        img.onload = () => drawCardContent(img);
        img.onerror = () => drawCardContent();
        img.src = resolvedImg;
      } else {
        // Use proxy or direct URL
        let proxyUrl = resolvedImg;
        if (resolvedImg.startsWith('http') && !resolvedImg.includes(window.location.host)) {
          proxyUrl = `/api/image-proxy?url=${encodeURIComponent(resolvedImg)}`;
        }
        img.onload = () => drawCardContent(img);
        img.onerror = () => {
          // Retry direct without proxy
          if (proxyUrl !== resolvedImg) {
            const retryImg = new Image();
            retryImg.crossOrigin = 'anonymous';
            retryImg.onload = () => drawCardContent(retryImg);
            retryImg.onerror = () => drawCardContent();
            retryImg.src = resolvedImg;
          } else {
            drawCardContent();
          }
        };
        img.src = proxyUrl;
      }
    } catch {
      resolve(null);
    }
  });
}

/**
 * Downloads the generated HD News Photo card directly to the user's device.
 */
export async function downloadNewsPhotoCard(post: NewsPost): Promise<boolean> {
  const blob = await generateNewsCardBlob(post);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VartaX-News-${post.id}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return true;
}

/**
 * Converts an image or generates a news graphic File for the Web Share API.
 */
async function getShareableImageFile(post: NewsPost): Promise<File | null> {
  try {
    // 1. Try generating HD branded news card
    const cardBlob = await generateNewsCardBlob(post);
    if (cardBlob) {
      return new File([cardBlob], `varta-news-${post.id}.jpg`, { type: 'image/jpeg' });
    }

    // 2. Fallback: load raw image
    const resolvedImg = resolveImageUrl(post.imageUrl);
    if (resolvedImg.startsWith('data:image/')) {
      const blob = dataURLtoBlob(resolvedImg);
      return new File([blob], `varta-news-${post.id}.jpg`, { type: blob.type || 'image/jpeg' });
    }

    let fetchUrl = resolvedImg;
    if (resolvedImg.startsWith('http') && !resolvedImg.includes(window.location.host)) {
      fetchUrl = `/api/image-proxy?url=${encodeURIComponent(resolvedImg)}`;
    }
    const res = await fetch(fetchUrl);
    if (res.ok) {
      const blob = await res.blob();
      return new File([blob], `varta-news-${post.id}.jpg`, { type: blob.type || 'image/jpeg' });
    }
    return null;
  } catch (err) {
    console.warn('[ShareHelper] Could not prepare image file:', err);
    return null;
  }
}

/**
 * Generates a high-impact Hindi news caption with direct link and brand header for social sharing.
 */
export function buildNewsShareCaption(post: NewsPost): string {
  const shareUrl = getNewsShareUrl(post.id);
  const categoryTag = post.category ? `#${post.category.toString().replace(/\s+/g, '')}` : '#VartaXNews';
  const breakingPrefix = post.isBreaking ? '🚨 *ब्रेकिंग न्यूज़ (Breaking Alert)* 🚨\n\n' : '';
  const snippet = (post.summary || post.content || '').slice(0, 160).trim();

  return `${breakingPrefix}🔴 *वार्ता एक्स न्यूज़ मीडिया लाइव (VARTA X NEWS)*
━━━━━━━━━━━━━━━━━━━━
📰 *${post.title}*

${snippet}${snippet.length >= 160 ? '...' : ''}

🏷️ ${categoryTag} #Jhansi #UPNews #VartaXNewsMedia
🔗 *पूरी खबर और फोटो/वीडियो देखें:*
👉 ${shareUrl}`;
}

/**
 * Shares a news post with photo image and link.
 * 1. Tries Web Share API Level 2 (files + text + url) to attach real image on mobile.
 * 2. Tries standard Web Share API.
 * 3. Falls back to direct WhatsApp link or clipboard copy.
 */
export async function shareNewsPost(post: NewsPost): Promise<ShareResult> {
  const shareUrl = getNewsShareUrl(post.id);
  const caption = buildNewsShareCaption(post);

  // 1. Try Native Web Share with Attached Image File (Supported on Android Chrome, iOS Safari)
  if (navigator.share) {
    try {
      const imageFile = await getShareableImageFile(post);

      if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title: post.title,
          text: caption,
          url: shareUrl,
          files: [imageFile],
        });
        return { success: true, method: 'native-files', message: 'फोटो व लिंक सफलतापूर्वक शेयर किया गया!' };
      }

      // If file share not supported by this browser version, share rich text & link
      await navigator.share({
        title: post.title,
        text: caption,
        url: shareUrl,
      });
      return { success: true, method: 'native-text', message: 'समाचार लिंक शेयर किया गया!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'native-text', message: 'शेयरिंग रद्द की गई' };
      }
      console.warn('[ShareHelper] Native share failed, falling back to WhatsApp:', err);
    }
  }

  // 2. Direct WhatsApp Share fallback (Automatically generates rich media card preview from /news/:id)
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = `https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'whatsapp', message: 'व्हाट्सएप पर शेयर किया जा रहा है...' };
  } catch {
    // 3. Clipboard fallback
    try {
      await navigator.clipboard.writeText(caption);
      return { success: true, method: 'clipboard', message: 'समाचार और लिंक कॉपी कर लिया गया है!' };
    } catch {
      return { success: false, method: 'fallback', message: 'शेयर करने में असमर्थ' };
    }
  }
}

/**
 * Direct WhatsApp share with photo and link
 */
export function shareToWhatsApp(post: NewsPost): void {
  const caption = buildNewsShareCaption(post);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const whatsappUrl = `https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Direct Facebook share
 */
export function shareToFacebook(post: NewsPost): void {
  const shareUrl = getNewsShareUrl(post.id);
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
}

/**
 * Direct Twitter (X) share
 */
export function shareToTwitter(post: NewsPost): void {
  const shareUrl = getNewsShareUrl(post.id);
  const text = `🔴 ${post.title}\n\nपूरी खबर देखें वार्ता एक्स न्यूज़ पर:`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
}

/**
 * Direct Telegram share
 */
export function shareToTelegram(post: NewsPost): void {
  const shareUrl = getNewsShareUrl(post.id);
  const text = `🔴 *${post.title}*\n\nपूरी खबर देखें वार्ता एक्स न्यूज़ पर:`;
  const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* =========================================================================
   RASHIFAL & HOROSCOPE PHOTO CARD & SHARING HELPERS
   ========================================================================= */

import { ZodiacSign } from '../types';

/**
 * Returns the canonical share URL for a specific Rashi on WhatsApp/Social Media.
 * Uses /rashifal/:id so server returns dynamic Open Graph meta tags.
 */
export function getRashifalShareUrl(signId: string): string {
  if (typeof window === 'undefined') return `/rashifal/${signId}`;
  return `${window.location.origin}/rashifal/${signId}`;
}

/**
 * Builds a clean, focused, concise WhatsApp share caption for a single Rashi.
 * Does NOT dump all 12 rashis in text; only provides the requested Rashi's summary and a direct deep link.
 */
export function buildRashifalShareCaption(sign: ZodiacSign): string {
  const shareUrl = getRashifalShareUrl(sign.id);
  
  return `✨ *वार्ता एक्स दैनिक राशिफल - ${sign.hindiName} राशि (${sign.englishName} ${sign.symbol})*\n\n` +
    `💫 *भाग्य:* ${sign.luckPercentage}% | 🔢 *शुभ अंक:* ${sign.luckyNumber} | 🎨 *शुभ रंग:* ${sign.luckyColor}\n` +
    `🪐 *ग्रह स्वामी:* ${sign.ruler} | 🌟 *तत्व:* ${sign.element}\n\n` +
    `🔮 *आज का भाग्यफल:*\n${sign.generalPrediction}\n\n` +
    `🚩 *आज का महाउपाय:*\n${sign.remedy}\n\n` +
    `👉 *पूरी ज्योतिष गणना व अन्य 12 राशियों का राशिफल देखें:*\n${shareUrl}`;
}

/**
 * Generates an HD Celestial Vedic Rashifal Photo Card Graphic (1200x675).
 * Contains Zodiac Symbol, Rashi Name, Lucky Stats, Prediction summary, and Varta X branding.
 */
export async function generateRashifalCardBlob(sign: ZodiacSign): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const width = 1200;
      const height = 675;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // 1. Mystic Celestial Dark Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0518');
      bgGrad.addColorStop(0.5, '#190a33');
      bgGrad.addColorStop(1, '#2a0845');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative Golden Astral Rings & Stars
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width - 150, 150, 220, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width - 150, 150, 280, 0, Math.PI * 2);
      ctx.stroke();

      // Random twinkling small gold dots
      ctx.fillStyle = '#fde047';
      const starCoords = [
        [100, 120], [250, 90], [450, 140], [80, 400], [200, 520],
        [1100, 450], [980, 550], [850, 100], [650, 80], [1050, 280]
      ];
      starCoords.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 3. Top Header Strip
      const topGrad = ctx.createLinearGradient(0, 0, width, 0);
      topGrad.addColorStop(0, '#dc2626');
      topGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔴 वार्ता एक्स ज्योतिष संस्थान • दैनिक पंचांग एवं राशिफल', 40, 30);

      const todayStr = new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 20px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`📅 ${todayStr}`, width - 40, 30);
      ctx.textAlign = 'left';

      // 4. Main Zodiac Emblem & Title Section (Top Area)
      // Golden glowing badge circle
      ctx.save();
      const symbolCenterX = 120;
      const symbolCenterY = 165;
      
      const badgeGrad = ctx.createLinearGradient(symbolCenterX - 50, symbolCenterY - 50, symbolCenterX + 50, symbolCenterY + 50);
      badgeGrad.addColorStop(0, '#f59e0b');
      badgeGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.arc(symbolCenterX, symbolCenterY, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 58px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sign.symbol, symbolCenterX, symbolCenterY + 2);
      ctx.restore();

      // Zodiac Title & Details
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 44px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(`${sign.hindiName} राशि (${sign.englishName})`, 200, 125);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 20px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.fillText(`स्वामी ग्रह: ${sign.ruler}  |  तत्व: ${sign.element}  |  नामाक्षर: ${sign.letters}`, 200, 180);

      // 5. 4 Metric Pills Box
      const statsY = 240;
      const statBoxes = [
        { label: 'आज का भाग्य', val: `${sign.luckPercentage}%`, color: '#eab308' },
        { label: 'शुभ अंक', val: `${sign.luckyNumber}`, color: '#38bdf8' },
        { label: 'शुभ रंग', val: `${sign.luckyColor}`, color: '#f43f5e' },
        { label: 'राशि स्वामी', val: `${sign.ruler}`, color: '#a855f7' },
      ];

      const boxW = 265;
      const boxH = 75;
      const boxGap = 20;
      const boxStartX = 40;

      statBoxes.forEach((item, idx) => {
        const bx = boxStartX + idx * (boxW + boxGap);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        
        // Rounded Rect
        ctx.beginPath();
        ctx.roundRect(bx, statsY, boxW, boxH, 14);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 15px "Noto Sans Devanagari", system-ui, sans-serif';
        ctx.fillText(item.label, bx + 16, statsY + 22);

        // Value
        ctx.fillStyle = item.color;
        ctx.font = 'bold 22px "Noto Sans Devanagari", system-ui, sans-serif';
        ctx.fillText(item.val, bx + 16, statsY + 48);
      });

      // 6. Detailed Horoscope Prediction Box
      const predBoxY = 335;
      const predBoxH = 180;
      const predBoxW = width - 80;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, predBoxY, predBoxW, predBoxH, 18);
      ctx.fill();
      ctx.stroke();

      // Heading: आज का संपूर्ण भविष्यफल
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 22px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.fillText('🔮 आज का संपूर्ण भविष्यफल (Daily Prediction):', 65, predBoxY + 28);

      // Prediction text wrapped
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '500 21px "Noto Sans Devanagari", system-ui, sans-serif';
      
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) => {
        const words = text.split(' ');
        let line = '';
        let lineCount = 0;
        let curY = y;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lineCount++;
            if (lineCount >= maxLines) {
              ctx.fillText(line.trim() + '...', x, curY);
              return;
            }
            ctx.fillText(line.trim(), x, curY);
            line = words[n] + ' ';
            curY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), x, curY);
      };

      wrapText(sign.generalPrediction, 65, predBoxY + 65, predBoxW - 50, 32, 3);

      // 7. Remedy Banner (Mahaupaay)
      const remedyY = 530;
      const remedyH = 75;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(40, remedyY, predBoxW, remedyH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 18px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.fillText('🚩 आज का अचूक महाउपाय:', 65, remedyY + 24);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Noto Sans Devanagari", system-ui, sans-serif';
      wrapText(sign.remedy, 65, remedyY + 48, predBoxW - 50, 24, 1);

      // 8. Bottom Footer Branding
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px "Noto Sans Devanagari", system-ui, sans-serif';
      ctx.fillText('🌐 वार्ता एक्स न्यूज़ • दैनिक राशिफल एवं पंचांग | www.vartaxnews.com/rashifal', 40, height - 25);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('📲 झाँसी • कटेरा • मऊरानीपुर लाइव अपडेट्स', width - 40, height - 25);

      // Export Blob
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);

    } catch (err) {
      console.error('[ShareHelper] Failed to generate Rashifal card blob:', err);
      resolve(null);
    }
  });
}

/**
 * Downloads the HD Vedic Rashifal Photo Card as a JPEG file.
 */
export async function downloadRashifalPhotoCard(sign: ZodiacSign): Promise<boolean> {
  try {
    const blob = await generateRashifalCardBlob(sign);
    if (!blob) return false;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VartaX-Rashifal-${sign.englishName}-${new Date().toISOString().split('T')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('[ShareHelper] Failed to download Rashifal photo card:', err);
    return false;
  }
}

/**
 * Smart Share for Rashifal:
 * Tries Web Share API with Photo Card Blob & Link.
 * Falls back to WhatsApp with direct deep link.
 */
export async function shareRashifal(sign: ZodiacSign): Promise<ShareResult> {
  const shareUrl = getRashifalShareUrl(sign.id);
  const caption = buildRashifalShareCaption(sign);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const cardBlob = await generateRashifalCardBlob(sign);
      if (cardBlob && navigator.canShare) {
        const imageFile = new File([cardBlob], `rashifal-${sign.englishName}.jpg`, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [imageFile] })) {
          await navigator.share({
            title: `वार्ता एक्स राशिफल: ${sign.hindiName} राशि`,
            text: caption,
            url: shareUrl,
            files: [imageFile],
          });
          return { success: true, method: 'native-files', message: 'राशिफल फोटो व लिंक शेयर किया गया!' };
        }
      }

      await navigator.share({
        title: `वार्ता एक्स राशिफल: ${sign.hindiName} राशि`,
        text: caption,
        url: shareUrl,
      });
      return { success: true, method: 'native-text', message: 'राशिफल लिंक शेयर किया गया!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'native-text', message: 'शेयरिंग रद्द की गई' };
      }
      console.warn('[ShareHelper] Native Rashifal share failed, falling back to WhatsApp:', err);
    }
  }

  // WhatsApp fallback
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = `https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'whatsapp', message: 'व्हाट्सएप पर शेयर किया जा रहा है...' };
  } catch {
    try {
      await navigator.clipboard.writeText(caption);
      return { success: true, method: 'clipboard', message: 'राशिफल और लिंक कॉपी कर लिया गया है!' };
    } catch {
      return { success: false, method: 'fallback', message: 'शेयर करने में असमर्थ' };
    }
  }
}

/**
 * Direct WhatsApp Share for Rashifal
 */
export function shareRashifalToWhatsApp(sign: ZodiacSign): void {
  const caption = buildRashifalShareCaption(sign);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const whatsappUrl = `https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Direct Facebook Share for Rashifal
 */
export function shareRashifalToFacebook(sign: ZodiacSign): void {
  const shareUrl = getRashifalShareUrl(sign.id);
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
}

/**
 * Direct Twitter (X) Share for Rashifal
 */
export function shareRashifalToTwitter(sign: ZodiacSign): void {
  const shareUrl = getRashifalShareUrl(sign.id);
  const text = `✨ आज का दैनिक राशिफल: ${sign.hindiName} राशि (${sign.englishName} ${sign.symbol})\n\nसंपूर्ण भविष्यफल व महाउपाय देखें वार्ता एक्स न्यूज़ पर:`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
}

/**
 * Direct Telegram Share for Rashifal
 */
export function shareRashifalToTelegram(sign: ZodiacSign): void {
  const shareUrl = getRashifalShareUrl(sign.id);
  const text = `✨ *दैनिक राशिफल: ${sign.hindiName} राशि (${sign.englishName} ${sign.symbol})*\n\nसंपूर्ण भविष्यफल व महाउपाय देखें वार्ता एक्स न्यूज़ पर:`;
  const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
