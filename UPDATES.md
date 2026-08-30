# Varta X News Portal - Recent Updates & Changelog

## 1. Image Crop & Fit Modal Integration (`src/components/ImageCropModal.tsx`)
- **Interactive Cropper**: Built a full-featured modal supporting real-time drag, pan, zoom (`0.5x` to `3x`), and `90°` step rotations.
- **Preset Aspect Ratios**: Added quick aspect-ratio presets:
  - **16:9 (News Cover)**: Optimal for news story thumbnails and lead banners.
  - **1:1 (Square)**: Tailored for Channel Logo and Team/Reporter profile pictures.
  - **3:1 (Ad Banner)**: Tailored for wide horizontal local sponsor ads.
  - **Free / Custom**: Unrestricted custom framing.
- **Client-side Canvas Rendering**: High-fidelity canvas-based image export producing optimized WebP/JPEG data URLs and blobs without server dependency.
- **Original Fallback**: Option to skip cropping and preserve original image dimensions.

---

## 2. Admin Panel Enhancements & Crop Integration (`src/components/AdminPanel.tsx`)
- **Crop Buttons on All Media Uploaders**:
  - **News Post Thumbnail**: Added a direct *"क्रॉप / रीसाइज करें"* button after uploading or choosing an image.
  - **Channel Main Logo**: Added a 1:1 cropping shortcut for instant logo adjustments.
  - **Channel Head / Leadership Photo (हृदयांश गुप्ता)**: Added 1:1 profile cropper integration.
  - **Team Member & Reporter Photos**: Integrated profile crop actions inside the Team Management section.
  - **Local Sponsor Ad Banner**: Integrated a 3:1 banner cropper for advertising uploads.
- **Form Structure & Bug Fixes**:
  - Repaired malformed JSX and nested form tags in the Team Management and News Publishing modules.
  - Removed duplicate and stray form code fragments.
  - Restored clean state management for thumbnail previews, logo reset actions, and team members.

---

## 3. Build & Stability Verification
- Resolved TypeScript compilation and JSX transformation issues.
- Clean build verification with `lint_applet` (`tsc --noEmit`) and `compile_applet` (`vite build`).
