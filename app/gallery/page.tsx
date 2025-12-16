import React from "react";
import GalleryShell from "@/components/gallery/GalleryShell.client";

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

      <GalleryShell />
      {/* --- Footer Decoration --- */}
      <div className="pb-8 text-center w-full opacity-30">
        <p className="text-[9px] font-mono text-purple-300 tracking-[0.3em]">
          XOM NHA LA • GALLERY • v2.0
        </p>
      </div>
    </main>
  );
}
