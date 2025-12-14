"use client";

import React from "react";
import { motion } from "framer-motion";
import ThreeDCarousel from "@/components/ui/3d-carousel";
import ExpandingCards from "@/components/ui/expanding-cards";
import EnhancedCarousel from "@/components/ui/enhanced-carousel";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#050505] relative overflow-x-hidden w-full">
      {/* ========================================= */}
      {/* LỚP NỀN & TRANG TRÍ (DECORATIONS)         */}
      {/* ========================================= */}

      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black pointer-events-none z-0"></div>

      {/* Trang trí 4 góc (Fixed) */}
      <div className="fixed top-8 left-8 w-64 h-64 border-l border-t border-purple-500/20 rounded-tl-3xl pointer-events-none z-0 hidden lg:block"></div>
      <div className="fixed bottom-8 right-8 w-64 h-64 border-r border-b border-purple-500/20 rounded-br-3xl pointer-events-none z-0 hidden lg:block"></div>

      {/* Text Dọc Trang Trí (Chỉnh vị trí fixed để không bị che bởi Nav) */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-8 items-center opacity-40 z-0">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
        <span className="writing-vertical-rl text-[10px] uppercase tracking-[0.5em] text-purple-400 font-mono">
          Thiên Hương Quốc Sắc
        </span>
      </div>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-8 items-center opacity-40 z-0">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
        <span className="writing-vertical-rl text-[10px] uppercase tracking-[0.5em] text-purple-400 font-mono rotate-180">
          Vạn Thế Lưu Danh
        </span>
      </div>

      {/* ========================================= */}
      {/* NỘI DUNG CHÍNH (CONTAINER)                */}
      {/* ========================================= */}

      <div className="relative z-10 w-full pt-24 pb-20 flex flex-col items-center gap-20">
        {/* --- SECTION 1: 3D CAROUSEL --- */}
        <div className="w-full max-w-[1400px] px-4 mx-auto flex flex-col items-center">
          {/* Header 1 */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-4 mb-2 opacity-80">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-purple-500"></div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] glow-text">
                  Elite Collection
                </span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-purple-500"></div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                CỰC PHẨM{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 animate-gradient-x">
                  NHÂN GIAN
                </span>
              </h2>
            </motion.div>
          </div>

          {/* Div chứa 3D (Căn giữa tuyệt đối) */}
          <div className="relative w-full flex justify-center items-center py-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
            {/* Component 3D Carousel (Giữ nguyên) */}
            <div className="w-full scale-90 md:scale-100 origin-center">
              <ThreeDCarousel />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: EXPANDING CARDS (Mới) --- */}
        <div className="w-full max-w-[1400px] px-12 mx-auto flex flex-col items-center">
          {/* Header 2 */}
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-2">
              TOP TIER BEAUTIES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              TUYỆT SẮC <span className="text-purple-400">GIAI NHÂN</span>
            </h2>
          </div>

          {/* Component Expanding Cards (Căn giữa) */}
          <div className="w-full flex justify-center">
            <ExpandingCards />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1400px] px-4 mx-auto flex flex-col items-center">
        {/* Header cho phần mới */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-2">
            MOTION COLLECTION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            HOA TRONG <span className="text-purple-400">GƯƠNG</span>
          </h2>
        </div>

        {/* Component Mới */}
        <div className="w-full">
          <EnhancedCarousel />
        </div>
      </div>
      {/* --- Footer Decoration --- */}
      <div className="pb-8 text-center w-full opacity-30">
        <p className="text-[9px] font-mono text-purple-300 tracking-[0.3em]">
          XOM NHA LA • GALLERY • v2.0
        </p>
      </div>
    </main>
  );
}
