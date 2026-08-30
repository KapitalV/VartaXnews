import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  X, 
  Move, 
  Maximize2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspectRatioPreset?: number | null; // e.g. 16/9, 1/1, 3/1, null for free
  title?: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onUseOriginal?: () => void;
  onClose: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatioPreset = 16 / 9,
  title = 'फोटो क्रॉप व एडजस्ट करें (Crop & Fit)',
  onCropComplete,
  onUseOriginal,
  onClose
}) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(aspectRatioPreset);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Sync aspect ratio when preset prop changes
  useEffect(() => {
    if (isOpen) {
      setAspectRatio(aspectRatioPreset);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, aspectRatioPreset, imageSrc]);

  // Measure container dimensions
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imageRef.current = img;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Dragging / Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handling for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Calculate crop window size based on container and aspect ratio
  const getCropBoxDimensions = useCallback(() => {
    const padding = 32;
    const maxWidth = Math.max(200, (containerSize.width || 400) - padding * 2);
    const maxHeight = Math.max(160, (containerSize.height || 340) - padding * 2);

    if (!aspectRatio) {
      // Free / Auto (take full inner box)
      return { width: maxWidth, height: maxHeight };
    }

    let w = maxWidth;
    let h = w / aspectRatio;

    if (h > maxHeight) {
      h = maxHeight;
      w = h * aspectRatio;
    }

    return { width: Math.round(w), height: Math.round(h) };
  }, [containerSize, aspectRatio]);

  const cropBox = getCropBoxDimensions();

  // Execute Canvas Crop
  const handleApplyCrop = async () => {
    if (!imageSrc || !imageRef.current) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        if (img.complete) resolve(true);
        img.onload = () => resolve(true);
        img.onerror = reject;
      });

      // Target canvas dimensions
      const targetWidth = Math.min(1600, Math.max(800, cropBox.width * 2));
      const targetHeight = aspectRatio ? Math.round(targetWidth / aspectRatio) : Math.round(cropBox.height * (targetWidth / cropBox.width));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not initialize canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background clean
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Scale factor from visual crop box to output canvas
      const scaleToOutput = targetWidth / cropBox.width;

      ctx.save();
      // Move to center of canvas
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply offset and zoom
      const drawX = offset.x * scaleToOutput;
      const drawY = offset.y * scaleToOutput;

      // Base display scale of image inside container
      const baseScale = Math.min(
        (cropBox.width / (img.naturalWidth || 1)),
        (cropBox.height / (img.naturalHeight || 1))
      ) * 1.35;

      const finalWidth = img.naturalWidth * baseScale * zoom * scaleToOutput;
      const finalHeight = img.naturalHeight * baseScale * zoom * scaleToOutput;

      ctx.drawImage(
        img,
        drawX - finalWidth / 2,
        drawY - finalHeight / 2,
        finalWidth,
        finalHeight
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
            onCropComplete(blob, dataUrl);
            onClose();
          } else {
            throw new Error('Blob generation failed');
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.90
      );
    } catch (err) {
      console.error('Error during image crop:', err);
      // Fallback
      if (onUseOriginal) onUseOriginal();
      onClose();
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <Crop className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                फोटो को ड्रैग कर के सेट करें, ज़ूम करें या पहलू अनुपात (Aspect Ratio) बदलें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Preset Selector */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">आकार (Ratio):</span>
            
            <button
              type="button"
              onClick={() => setAspectRatio(16 / 9)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                aspectRatio && Math.abs(aspectRatio - 16 / 9) < 0.05
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              16:9 (खबर/न्यूज़)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(4 / 3)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                aspectRatio && Math.abs(aspectRatio - 4 / 3) < 0.05
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              4:3 (मानक)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(1)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                aspectRatio && Math.abs(aspectRatio - 1) < 0.05
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1:1 (वर्ग/प्रोफाइल)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(3 / 1)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                aspectRatio && Math.abs(aspectRatio - 3 / 1) < 0.05
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3:1 (बैनर/विज्ञापन)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(null)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                aspectRatio === null
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              फ्री (Free Crop)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="घूमाएं (Rotate 90°)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">घूमाएं</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="रीसेट करें"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">रीसेट</span>
            </button>
          </div>
        </div>

        {/* Interactive Workspace Area */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 bg-black min-h-[280px] sm:min-h-[360px] max-h-[55vh] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* The Transformable Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop source"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              maxWidth: '85%',
              maxHeight: '85%',
              objectFit: 'contain'
            }}
            className="pointer-events-none drop-shadow-2xl"
          />

          {/* Semi-transparent Dim Mask around the Crop Box */}
          <div 
            className="absolute border-2 border-red-500 rounded-lg pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] transition-all duration-200 flex flex-col justify-between"
            style={{
              width: `${cropBox.width}px`,
              height: `${cropBox.height}px`
            }}
          >
            {/* Rule of thirds grid lines */}
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-3 border-l-3 border-red-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-3 border-r-3 border-red-400" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-3 border-l-3 border-red-400" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-3 border-r-3 border-red-400" />
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white/80 pointer-events-none flex items-center gap-1.5">
            <Move className="w-3 h-3 text-red-400" />
            <span>फोटो को घुमाकर/खिसका कर बॉक्स में सेट करें</span>
          </div>
        </div>

        {/* Zoom & Scaling Slider Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onUseOriginal && (
              <button
                type="button"
                onClick={() => {
                  onUseOriginal();
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer hidden sm:block"
              >
                मूल फोटो उपयोग करें
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              रद्द करें
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApplyCrop}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'क्रॉप हो रहा है...' : 'क्रॉप व सेव करें'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
