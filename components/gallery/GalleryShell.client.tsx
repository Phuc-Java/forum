"use client";

import React from "react";
import dynamic from "next/dynamic";

const ThreeDCarousel = dynamic(() => import("@/components/ui/3d-carousel"), {
  loading: () => (
    <div className="w-full flex items-center justify-center py-8 text-slate-400">
      Loading 3D...
    </div>
  ),
});

const ExpandingCards = dynamic(
  () => import("@/components/ui/expanding-cards"),
  {
    loading: () => (
      <div className="w-full flex items-center justify-center py-8 text-slate-400">
        Loading cards...
      </div>
    ),
  }
);

const EnhancedCarousel = dynamic(
  () => import("@/components/ui/enhanced-carousel"),
  {
    loading: () => (
      <div className="w-full flex items-center justify-center py-8 text-slate-400">
        Loading carousel...
      </div>
    ),
  }
);

import GalleryHeader from "./GalleryHeader.client";

export default function GalleryShell() {
  return (
    <>
      <div className="relative z-10 w-full pt-24 pb-20 flex flex-col items-center gap-20">
        {/* --- SECTION 1: 3D CAROUSEL --- */}
        <div className="w-full max-w-[1400px] px-4 mx-auto flex flex-col items-center">
          <GalleryHeader>
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
          </GalleryHeader>

          <div className="relative w-full flex justify-center items-center py-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="w-full scale-90 md:scale-100 origin-center">
              <ThreeDCarousel />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: EXPANDING CARDS (Mới) --- */}
        <div className="w-full max-w-[1400px] px-12 mx-auto flex flex-col items-center">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-2">
              TOP TIER BEAUTIES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              TUYỆT SẮC <span className="text-purple-400">GIAI NHÂN</span>
            </h2>
          </div>

          <div className="w-full flex justify-center">
            <ExpandingCards />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] px-4 mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-2">
            MOTION COLLECTION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            HOA TRONG <span className="text-purple-400">GƯƠNG</span>
          </h2>
        </div>

        <div className="w-full">
          <EnhancedCarousel />
        </div>
      </div>
    </>
  );
}
