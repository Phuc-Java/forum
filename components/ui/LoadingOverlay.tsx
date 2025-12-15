/* eslint-disable */
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isLoading: boolean;
}

/**
 * Loading overlay with spinner animation
 * Shows during page transitions
 */
export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin" />
            </div>

            {/* Loading text */}
            <p className="text-white text-sm font-light tracking-[0.3em] animate-pulse">
              LOADING
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
