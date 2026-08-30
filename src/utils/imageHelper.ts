// Varta X News Media - Image and Logo Resolver for Static / Custom Domain Hosting (e.g., Netlify / GoDaddy)

export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 680" width="600" height="680">
  <defs>
    <!-- Chrome Outer Frame Gradient -->
    <linearGradient id="chromeOuter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23e6e8fa"/>
      <stop offset="20%" stop-color="%239aa0a6"/>
      <stop offset="45%" stop-color="%23ffffff"/>
      <stop offset="60%" stop-color="%235f6368"/>
      <stop offset="80%" stop-color="%23d8dce0"/>
      <stop offset="100%" stop-color="%233c4043"/>
    </linearGradient>

    <!-- Metallic Inner Frame Gradient -->
    <linearGradient id="chromeInner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%2343464a"/>
      <stop offset="50%" stop-color="%231a1c1e"/>
      <stop offset="100%" stop-color="%232d3033"/>
    </linearGradient>

    <!-- Glossy Red Banner Gradient -->
    <linearGradient id="redBanner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23ff2e2e"/>
      <stop offset="25%" stop-color="%23dc2626"/>
      <stop offset="70%" stop-color="%23991b1b"/>
      <stop offset="100%" stop-color="%23660000"/>
    </linearGradient>

    <!-- 3D Red X Gradient -->
    <linearGradient id="redX" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ff4d4d"/>
      <stop offset="40%" stop-color="%23e60000"/>
      <stop offset="100%" stop-color="%23800000"/>
    </linearGradient>

    <!-- Globe Sphere Gradient -->
    <radialGradient id="globeSphere" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="%23ffffff"/>
      <stop offset="25%" stop-color="%23e2e8f0"/>
      <stop offset="50%" stop-color="%2394a3b8"/>
      <stop offset="75%" stop-color="%23475569"/>
      <stop offset="100%" stop-color="%230f172a"/>
    </radialGradient>

    <!-- Globe Red Continents -->
    <linearGradient id="globeLand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ff2e2e"/>
      <stop offset="100%" stop-color="%23991b1b"/>
    </linearGradient>

    <!-- 3D Drop Shadow Filter -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="%23000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Outer Chrome Bevel Border -->
  <rect x="15" y="15" width="570" height="650" rx="42" fill="url(%23chromeOuter)"/>
  <rect x="23" y="23" width="554" height="634" rx="36" fill="%23050505"/>
  <rect x="28" y="28" width="544" height="624" rx="32" fill="url(%23chromeInner)"/>

  <!-- Main Dark Canvas -->
  <rect x="36" y="36" width="528" height="608" rx="26" fill="%230a0a0d"/>

  <!-- TOP RED BANNER "VARTA" -->
  <g filter="url(%23shadow)">
    <rect x="48" y="48" width="504" height="124" rx="18" fill="url(%23redBanner)" stroke="url(%23chromeOuter)" stroke-width="3"/>
    <path d="M 54 54 Q 300 68 546 54 L 546 80 Q 300 95 54 80 Z" fill="%23ffffff" opacity="0.25"/>
    <text x="300" y="138" font-family="'Impact', 'Arial Black', sans-serif" font-size="86" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="6" filter="url(%23shadow)">VARTA</text>
  </g>

  <!-- MIDDLE SECTION: GIANT 3D RED "X" & GLOBE -->
  <g transform="translate(0, 10)">
    <path d="M 170 190 L 270 300 L 170 410 L 220 410 L 300 320 L 380 410 L 430 410 L 330 300 L 430 190 L 380 190 L 300 280 L 220 190 Z" fill="%23000000" opacity="0.7" transform="translate(5, 8)"/>
    <path d="M 170 190 L 270 300 L 170 410 L 225 410 L 300 325 L 375 410 L 430 410 L 330 300 L 430 190 L 375 190 L 300 275 L 225 190 Z" fill="url(%23redX)" stroke="%23ff8080" stroke-width="2" filter="url(%23shadow)"/>
    <path d="M 170 190 L 300 275 L 225 190 Z" fill="%23ffffff" opacity="0.3"/>
    <path d="M 430 190 L 300 275 L 375 190 Z" fill="%23ffffff" opacity="0.25"/>

    <!-- 3D GLOBE -->
    <g transform="translate(435, 290)" filter="url(%23shadow)">
      <circle cx="0" cy="0" r="72" fill="none" stroke="%23dc2626" stroke-width="4" opacity="0.6"/>
      <circle cx="0" cy="0" r="68" fill="url(%23globeSphere)" stroke="url(%23chromeOuter)" stroke-width="2"/>
      <ellipse cx="0" cy="0" rx="68" ry="24" fill="none" stroke="%23334155" stroke-width="1.5" opacity="0.7"/>
      <ellipse cx="0" cy="0" rx="36" ry="68" fill="none" stroke="%23334155" stroke-width="1.5" opacity="0.7"/>
      <line x1="-68" y1="0" x2="68" y2="0" stroke="%23334155" stroke-width="2" opacity="0.8"/>
      <line x1="0" y1="-68" x2="0" y2="68" stroke="%23334155" stroke-width="2" opacity="0.8"/>
      <path d="M -25 -20 Q -10 -40 20 -35 Q 45 -10 35 25 Q 10 45 -20 30 Q -40 10 -25 -20 Z" fill="url(%23globeLand)" opacity="0.95"/>
      <ellipse cx="-20" cy="-25" rx="30" ry="16" fill="%23ffffff" opacity="0.35" transform="rotate(-25 -20 -25)"/>
    </g>

    <text x="300" y="475" font-family="'Impact', 'Arial Black', sans-serif" font-size="96" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="8" filter="url(%23shadow)">NEWS</text>
  </g>

  <!-- BOTTOM RED BANNER "MEDIA" -->
  <g filter="url(%23shadow)">
    <rect x="48" y="508" width="504" height="112" rx="18" fill="url(%23redBanner)" stroke="url(%23chromeOuter)" stroke-width="3"/>
    <path d="M 54 514 Q 300 528 546 514 L 546 540 Q 300 555 54 540 Z" fill="%23ffffff" opacity="0.25"/>
    <text x="300" y="588" font-family="'Impact', 'Arial Black', sans-serif" font-size="78" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="10" filter="url(%23shadow)">MEDIA</text>
  </g>
</svg>`;

export const HEMANT_RAJPUT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
  <defs>
    <linearGradient id="bgHemant" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23f1f5f9"/>
      <stop offset="100%" stop-color="%23cbd5e1"/>
    </linearGradient>
    <linearGradient id="shirtSky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2338bdf8"/>
      <stop offset="50%" stop-color="%230284c7"/>
      <stop offset="100%" stop-color="%230369a1"/>
    </linearGradient>
    <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23fcd34d"/>
      <stop offset="50%" stop-color="%23f59e0b"/>
      <stop offset="100%" stop-color="%23d97706"/>
    </linearGradient>
  </defs>

  <rect width="400" height="520" rx="16" fill="url(%23bgHemant)"/>

  <!-- Shoulders & Sky Blue Polo Shirt -->
  <path d="M 40 520 L 70 380 Q 200 340 330 380 L 360 520 Z" fill="url(%23shirtSky)"/>
  <!-- Collar -->
  <path d="M 140 370 L 200 420 L 260 370 L 220 360 L 200 375 L 180 360 Z" fill="%230284c7" stroke="%230369a1" stroke-width="2"/>
  
  <!-- Neck -->
  <rect x="170" y="300" width="60" height="70" fill="%23d97706" rx="10"/>

  <!-- Face Head -->
  <ellipse cx="200" cy="230" rx="75" ry="95" fill="%23f59e0b"/>

  <!-- Hair -->
  <path d="M 125 210 Q 130 130 200 135 Q 270 130 275 210 Q 250 145 200 148 Q 150 145 125 210 Z" fill="%231e293b"/>

  <!-- Eyes -->
  <ellipse cx="170" cy="220" rx="12" ry="8" fill="%23ffffff"/>
  <ellipse cx="230" cy="220" rx="12" ry="8" fill="%23ffffff"/>
  <circle cx="170" cy="220" r="5" fill="%230f172a"/>
  <circle cx="230" cy="220" r="5" fill="%230f172a"/>

  <!-- Eyebrows -->
  <path d="M 152 205 Q 170 198 185 205" fill="none" stroke="%230f172a" stroke-width="4" stroke-linecap="round"/>
  <path d="M 215 205 Q 230 198 248 205" fill="none" stroke="%230f172a" stroke-width="4" stroke-linecap="round"/>

  <!-- Prominent Neat Dark Mustache (Hemant ji signature) -->
  <path d="M 150 270 Q 200 248 250 270 Q 235 285 200 272 Q 165 285 150 270 Z" fill="%230f172a"/>

  <!-- Superdry Text on Shirt -->
  <text x="130" y="470" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="%230f172a" opacity="0.8" transform="rotate(-15 130 470)">SUPERDRY</text>
  <text x="120" y="500" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="%230f172a" opacity="0.8">54 STATES</text>
  
  <!-- Badge Header Overlay -->
  <rect x="0" y="0" width="400" height="42" fill="%23000000" opacity="0.75"/>
  <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="900" fill="%2338bdf8" text-anchor="middle" letter-spacing="2">HEMANT RAJPUT | कटेरा देहात रिपोर्टर</text>
</svg>`;

export const ANKESH_GUPTA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
  <defs>
    <linearGradient id="bgAnkesh" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%231e293b"/>
      <stop offset="100%" stop-color="%230f172a"/>
    </linearGradient>
    <pattern id="stripedShirt" width="400" height="40" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="400" height="20" fill="%23dc2626"/>
      <rect x="0" y="20" width="400" height="20" fill="%231e3a8a"/>
    </pattern>
  </defs>

  <rect width="400" height="520" rx="16" fill="url(%23bgAnkesh)"/>

  <!-- Torso & Red/Blue Striped Shirt -->
  <path d="M 30 520 L 60 360 Q 200 320 340 360 L 370 520 Z" fill="url(%23stripedShirt)"/>
  
  <!-- Neck -->
  <rect x="170" y="280" width="60" height="70" fill="%23d97706" rx="10"/>

  <!-- Face Head (Ankesh ji) -->
  <ellipse cx="200" cy="210" rx="72" ry="88" fill="%23f59e0b"/>

  <!-- Hair -->
  <path d="M 128 190 Q 140 120 200 125 Q 260 120 272 190 Q 240 135 200 138 Q 160 135 128 190 Z" fill="%231e293b"/>

  <!-- Stubble Beard -->
  <path d="M 140 220 C 140 280, 260 280, 260 220 C 260 290, 140 290, 140 220 Z" fill="%230f172a" opacity="0.35"/>

  <!-- Eyes -->
  <circle cx="172" cy="205" r="5" fill="%230f172a"/>
  <circle cx="228" cy="205" r="5" fill="%230f172a"/>

  <!-- VARTA X PRESS LANYARD ID CARD -->
  <path d="M 155 350 L 195 440 L 205 440 L 245 350" stroke="%2338bdf8" stroke-width="8" fill="none"/>
  <!-- ID Badge Card -->
  <rect x="160" y="440" width="80" height="75" rx="6" fill="%23000000" stroke="%23dc2626" stroke-width="2"/>
  <rect x="170" y="448" width="60" height="20" rx="3" fill="%23dc2626"/>
  <text x="200" y="462" font-family="'Arial Black', sans-serif" font-size="10" font-weight="900" fill="%23ffffff" text-anchor="middle">VARTA X</text>
  <text x="200" y="482" font-family="sans-serif" font-size="11" font-weight="800" fill="%23ffffff" text-anchor="middle">PRESS</text>

  <!-- HAND HOLDING VARTA X NEWS CUBE MICROPHONE -->
  <g transform="translate(140, 310)">
    <!-- Mic Stand Pole -->
    <rect x="50" y="80" width="20" height="130" fill="%231e293b" rx="4"/>
    <!-- Mic Black Cube Top -->
    <rect x="25" y="30" width="70" height="55" rx="8" fill="%230a0a0d" stroke="%23dc2626" stroke-width="2"/>
    <rect x="30" y="35" width="60" height="22" rx="4" fill="%23dc2626"/>
    <text x="60" y="50" font-family="'Arial Black', sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">VARTA X</text>
    <text x="60" y="74" font-family="'Arial Black', sans-serif" font-size="13" font-weight="900" fill="%23ffffff" text-anchor="middle">NEWS</text>
    <!-- Mic Foam Ball Top -->
    <ellipse cx="60" cy="20" rx="22" ry="20" fill="%23171717"/>
  </g>

  <!-- Badge Header Overlay -->
  <rect x="0" y="0" width="400" height="42" fill="%23000000" opacity="0.85"/>
  <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="900" fill="%23ef4444" text-anchor="middle" letter-spacing="2">ANKESH GUPTA | कटेरा ग्राउंड रिपोर्टर</text>
</svg>`;

export const HRADYANSH_GUPTA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
  <defs>
    <linearGradient id="bgAnsh" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230284c7"/>
      <stop offset="40%" stop-color="%230f172a"/>
      <stop offset="100%" stop-color="%231e1b4b"/>
    </linearGradient>
    <linearGradient id="blazerGrey" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2394a3b8"/>
      <stop offset="50%" stop-color="%2364748b"/>
      <stop offset="100%" stop-color="%23334155"/>
    </linearGradient>
  </defs>

  <rect width="400" height="520" rx="16" fill="url(%23bgAnsh)"/>

  <!-- Bokeh Ambient Studio Lights -->
  <circle cx="280" cy="80" r="45" fill="%2338bdf8" opacity="0.35"/>
  <circle cx="80" cy="120" r="30" fill="%23f472b6" opacity="0.25"/>

  <!-- Torso: Grey Suit Blazer & Pink Shirt -->
  <!-- Pink Shirt Base -->
  <path d="M 120 370 L 200 440 L 280 370 L 280 520 L 120 520 Z" fill="%23fbcfe8"/>
  <path d="M 195 400 L 195 520" stroke="%23f472b6" stroke-width="3"/>
  <circle cx="195" cy="430" r="3" fill="%23ffffff"/>
  <circle cx="195" cy="470" r="3" fill="%23ffffff"/>

  <!-- Grey Blazer Outer -->
  <path d="M 20 520 L 60 360 Q 200 340 340 360 L 380 520 L 260 520 L 200 420 L 140 520 Z" fill="url(%23blazerGrey)"/>
  <!-- Lapels -->
  <path d="M 120 360 L 180 430 L 140 520 Z" fill="%23475569"/>
  <path d="M 280 360 L 220 430 L 260 520 Z" fill="%23475569"/>

  <!-- Neck -->
  <rect x="172" y="270" width="56" height="70" fill="%23f59e0b" rx="10"/>

  <!-- Face Head (Hradyansh Gupta - Ansh ji) -->
  <ellipse cx="200" cy="205" rx="68" ry="82" fill="%23f59e0b"/>

  <!-- Stylish Sleek Dark Hair sweeping across forehead -->
  <path d="M 128 190 C 130 110, 270 100, 275 190 C 240 140, 200 130, 128 190 Z" fill="%2309090b"/>
  <path d="M 130 180 Q 200 200 250 170 Q 200 150 130 180 Z" fill="%2309090b"/>

  <!-- Subtle Mustache -->
  <path d="M 175 240 Q 200 235 225 240 Q 200 248 175 240 Z" fill="%2318181b" opacity="0.8"/>

  <!-- Eyes -->
  <ellipse cx="170" cy="195" rx="10" ry="7" fill="%23ffffff"/>
  <ellipse cx="230" cy="195" rx="10" ry="7" fill="%23ffffff"/>
  <circle cx="170" cy="195" r="4.5" fill="%2309090b"/>
  <circle cx="230" cy="195" r="4.5" fill="%2309090b"/>

  <!-- Badge Header Overlay -->
  <rect x="0" y="0" width="400" height="42" fill="%23000000" opacity="0.85"/>
  <text x="200" y="27" font-family="sans-serif" font-size="16" font-weight="900" fill="%2338bdf8" text-anchor="middle" letter-spacing="2">HRADYANSH GUPTA | CHIEF EDITOR & CHANNEL HEAD</text>
</svg>`;

const INPUT_FILE_MAP: Record<string, string> = {
  '/input_file_0.png': DEFAULT_LOGO_SVG,
  '/input_file_1.png': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
  '/input_file_2.png': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80',
  '/input_file_3.png': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  '/input_file_4.png': HEMANT_RAJPUT_SVG,
  '/input_file_5.png': ANKESH_GUPTA_SVG,
  '/input_file_6.png': HRADYANSH_GUPTA_SVG,
  '/input_file_7.png': 'https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=1200&q=80',
  '/input_file_8.png': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Resizes and compresses any uploaded image File or base64 Data URL to a lightweight
 * optimized WebP/JPEG data URL string.
 * This prevents browser localStorage QuotaExceededError and prevents uploaded photos
 * and channel logos from disappearing or failing to persist.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1000,
  maxHeight = 800,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const processSrc = (src: string) => {
      // If already an SVG or tiny string, return directly
      if (src.startsWith('data:image/svg+xml') || src.length < 1000) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(src);
            return;
          }

          // Fill neutral background for smooth rendering
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Attempt WebP compression first (smaller size), fallback to JPEG
          try {
            const webp = canvas.toDataURL('image/webp', quality);
            if (webp.startsWith('data:image/webp') && webp.length > 50) {
              resolve(webp);
              return;
            }
          } catch {
            // fallback
          }

          const jpeg = canvas.toDataURL('image/jpeg', quality);
          resolve(jpeg);
        } catch {
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      processSrc(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processSrc(result);
        } else {
          resolve(DEFAULT_LOGO_SVG);
        }
      };
      reader.onerror = () => resolve(DEFAULT_LOGO_SVG);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

export function resolveImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return DEFAULT_LOGO_SVG;

  // Custom user uploaded base64 data URLs or blob URLs should always be returned untouched
  if (url.startsWith('data:image/') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle stored relative input file URLs
  if (INPUT_FILE_MAP[url]) {
    return INPUT_FILE_MAP[url];
  }

  // Handle case where URL is just input_file_X.png without leading slash
  const withSlash = url.startsWith('/') ? url : `/${url}`;
  if (INPUT_FILE_MAP[withSlash]) {
    return INPUT_FILE_MAP[withSlash];
  }

  return url;
}

export const optimizeImageForStorage = (
  fileOrDataUrl: File | string | Blob,
  maxWidth = 1200,
  quality = 0.82
) => compressImage(fileOrDataUrl as any, maxWidth, 1000, quality);

