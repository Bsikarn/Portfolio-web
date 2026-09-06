import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from "lucide-react";
import { getTransformedUrl } from "../lib/supabase";

export default function ImageModal({
  isOpen,
  onClose,
  items = [],
  initialIndex = 0,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomMode(false);
  }, [initialIndex]);

  // Reset zoom & loading state when changing image or opening modal
  useEffect(() => {
    setIsZoomMode(false);
    if (imgRef.current && imgRef.current.complete) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isZoomMode) {
          setIsZoomMode(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft" && items.length > 1 && !isZoomMode) {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "ArrowRight" && items.length > 1 && !isZoomMode) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, isZoomMode, onClose]);

  if (!isOpen || !items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const isVideo = typeof currentItem === "object" ? currentItem?.type === "video" : false;
  const currentUrl = typeof currentItem === "string" ? currentItem : currentItem?.url || "";

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsZoomMode(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIsZoomMode(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const toggleZoomMode = (e) => {
    e.stopPropagation();
    setIsZoomMode((prev) => !prev);
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (isZoomMode) {
              setIsZoomMode(false);
            } else {
              onClose();
            }
          }}
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
        >
          {/* Top Right Close Button (Semi-transparent white 80%) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close modal"
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 hover:bg-white/95 transition-colors z-[10000] cursor-pointer shadow-lg"
          >
            <X size={22} />
          </button>

          {/* Center Image / Video Display Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={
              isZoomMode
                ? "relative w-full h-full flex items-center justify-center overflow-visible z-20"
                : "relative max-w-[90vw] max-h-[80vh] flex items-center justify-center overflow-hidden"
            }
          >
            {/* Loading Indicator Spinner */}
            {isLoading && !isVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2 pointer-events-none">
                <Loader2 className="w-9 h-9 text-white/80 animate-spin" />
              </div>
            )}

            {isVideo ? (
              <iframe
                src={currentUrl}
                allowFullScreen
                className="w-[85vw] h-[70vh] rounded-2xl border-0 bg-black"
                title="Video Lightbox"
              />
            ) : (
              <motion.div
                className="relative flex items-center justify-center"
                style={{
                  cursor: isZoomMode ? "grab" : "default",
                }}
              >
                <motion.img
                  ref={imgRef}
                  key={currentUrl + (isZoomMode ? "-zoomed" : "-normal")}
                  initial={{ scale: isZoomMode ? 2.2 : 0.95, opacity: 0.8, x: 0, y: 0 }}
                  animate={{ scale: isZoomMode ? 2.2 : 1, opacity: isLoading ? 0.3 : 1, x: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  drag={isZoomMode}
                  dragConstraints={{ left: -3000, right: 3000, top: -3000, bottom: 3000 }}
                  dragElastic={0}
                  dragMomentum={false}
                  src={getTransformedUrl(currentUrl, { width: 1200 })}
                  alt="Modal Preview"
                  loading="lazy"
                  onLoad={() => setIsLoading(false)}
                  onError={(e) => {
                    setIsLoading(false);
                    e.target.src = currentUrl;
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={
                    isZoomMode
                      ? "max-w-[98vw] max-h-[95vh] object-contain rounded-xl shadow-2xl transition-opacity duration-200"
                      : "max-w-[90vw] max-h-[75vh] object-contain rounded-xl shadow-2xl transition-opacity duration-200"
                  }
                />
              </motion.div>
            )}
          </div>

          {/* Bottom Floating Control Bar (Semi-transparent white 80%) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 text-slate-800 shadow-xl z-[10000]"
          >
            {/* Zoom Toggle Button */}
            {!isVideo && (
              <button
                type="button"
                onClick={toggleZoomMode}
                title={isZoomMode ? "Exit Zoom Mode" : "Enable Zoom Mode"}
                aria-label={isZoomMode ? "Exit Zoom Mode" : "Enable Zoom Mode"}
                className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  isZoomMode
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                    : "bg-slate-900/10 text-slate-800 hover:bg-slate-900/20"
                }`}
              >
                {isZoomMode ? <X size={18} /> : <ZoomIn size={18} />}
              </button>
            )}

            {/* Pagination & Nav Buttons grouped together */}
            {items.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="p-1.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold tracking-widest px-2 font-mono text-slate-800">
                  {currentIndex + 1} / {items.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="p-1.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

