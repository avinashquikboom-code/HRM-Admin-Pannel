"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PointZoomImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  onDownload?: (url: string, index: number) => void;
  title?: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;
const ZOOM_STEP = 0.3;

export default function PointZoomImageViewer({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  onDownload,
  title,
}: PointZoomImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Multi-touch pinch tracking
  const touchDistanceRef = useRef<number | null>(null);
  const touchFocalRef = useRef<{ x: number; y: number } | null>(null);

  // Reset zoom and position on image change or modal open
  const resetTransform = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetTransform();
    }
  }, [isOpen, currentIndex, resetTransform]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1 && onIndexChange) {
        onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      } else if (e.key === 'ArrowRight' && images.length > 1 && onIndexChange) {
        onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      } else if (e.key === '+' || e.key === '=') {
        zoomAtCenter(1 + ZOOM_STEP);
      } else if (e.key === '-' || e.key === '_') {
        zoomAtCenter(1 - ZOOM_STEP);
      } else if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onIndexChange, onClose, resetTransform]);

  // ── Core Point-Based Zoom Formula ──
  const zoomAtPoint = useCallback((focalX: number, focalY: number, newScaleTarget: number) => {
    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScaleTarget));
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = focalX - rect.left;
    const cursorY = focalY - rect.top;

    if (clampedScale <= 1.05) {
      setScale(clampedScale);
      setTranslate({ x: 0, y: 0 });
      return;
    }

    // World coordinate before zoom
    const worldX = (cursorX - translate.x) / scale;
    const worldY = (cursorY - translate.y) / scale;

    // Calculate new translation to keep cursor at world coordinate
    const nextTranslateX = cursorX - worldX * clampedScale;
    const nextTranslateY = cursorY - worldY * clampedScale;

    setScale(clampedScale);
    setTranslate({ x: nextTranslateX, y: nextTranslateY });
  }, [scale, translate]);

  const zoomAtCenter = useCallback((factor: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoomAtPoint(centerX, centerY, scale * factor);
  }, [scale, zoomAtPoint]);

  // ── Mouse Wheel Zoom ──
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1 + ZOOM_STEP : 1 - ZOOM_STEP;
    zoomAtPoint(e.clientX, e.clientY, scale * zoomFactor);
  };

  // ── Double Click / Double Tap ──
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (scale > 1.2) {
      resetTransform();
    } else {
      zoomAtPoint(e.clientX, e.clientY, 2.5);
    }
  };

  // ── Mouse Drag / Panning ──
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Primary click only
    setIsDragging(true);
    setDragStart({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ── Touch Gestures (Pinch-to-zoom & Touch Pan) ──
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - translate.x,
        y: e.touches[0].clientY - translate.y,
      });
      touchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchDistanceRef.current = dist;
      touchFocalRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      setTranslate({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current && touchFocalRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentFocal = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const pinchFactor = currentDist / touchDistanceRef.current;
      zoomAtPoint(currentFocal.x, currentFocal.y, scale * pinchFactor);

      touchDistanceRef.current = currentDist;
      touchFocalRef.current = currentFocal;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
    touchFocalRef.current = null;
  };

  if (!isOpen || !images[currentIndex]) return null;

  const currentImageUrl = images[currentIndex];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
          {/* Info pill */}
          <div className="pointer-events-auto flex items-center gap-2.5 text-white/90 text-xs font-bold bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 shadow-xl">
            <Camera size={14} className="text-primary" />
            <span>{title || 'Image Preview'}</span>
            {images.length > 1 && (
              <span className="text-white/60 font-mono text-[11px] border-l border-white/20 pl-2">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Controls pill */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-xl">
            <button
              onClick={() => zoomAtCenter(1 - ZOOM_STEP)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut size={16} />
            </button>

            <button
              onClick={resetTransform}
              className="px-2.5 py-1 text-white text-xs font-mono font-bold hover:bg-white/15 rounded-lg transition-all cursor-pointer"
              title="Reset Zoom (0)"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={() => zoomAtCenter(1 + ZOOM_STEP)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn size={16} />
            </button>

            <div className="w-[1px] h-4 bg-white/20 mx-1" />

            <button
              onClick={() => setRotation((r) => (r - 90) % 360)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Rotate Counter-Clockwise"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Rotate Clockwise"
            >
              <RotateCw size={15} />
            </button>

            <button
              onClick={resetTransform}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 size={15} />
            </button>

            {onDownload && (
              <>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button
                  onClick={() => onDownload(currentImageUrl, currentIndex)}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  title="Download Image"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </>
            )}

            <div className="w-[1px] h-4 bg-white/20 mx-1" />

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/90 hover:text-white bg-white/15 hover:bg-rose-500/80 transition-all cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Left & Right Navigation Arrows */}
        {images.length > 1 && onIndexChange && (
          <>
            <button
              onClick={() => onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 shadow-2xl transition-all cursor-pointer z-40"
              title="Previous Photo"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1)}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 shadow-2xl transition-all cursor-pointer z-40"
              title="Next Photo"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Viewport Canvas Container */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            touchAction: 'none',
          }}
        >
          <div
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)',
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
          >
            <img
              ref={imgRef}
              src={currentImageUrl}
              alt={`View ${currentIndex + 1}`}
              draggable={false}
              className="max-h-[82vh] max-w-[88vw] object-contain rounded-lg shadow-2xl pointer-events-auto"
            />
          </div>
        </div>

        {/* Bottom Quick Help Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/50 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 pointer-events-none">
          Scroll to zoom at cursor • Drag to pan • Double-click to toggle zoom
        </div>
      </div>
    </AnimatePresence>
  );
}
