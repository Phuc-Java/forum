import React from "react";
// Import Component Client vừa tạo ở trên
import { SpiritRealm } from "./SpiritRealm.client";
import GalleryShell from "@/components/gallery/GalleryShell.client";

// Metadata cho SEO (Server Side)
export const metadata = {
  title: "Thiên Hương Quốc Sắc | Bộ Sưu Tập",
  description: "Nơi lưu giữ những khoảnh khắc tuyệt mỹ của nhân gian.",
};

export default function GalleryPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      {/* ========================================= */}
      {/* TẦNG 1: LINH GIỚI (CLIENT INTERACTIVE LAYER) */}
      {/* Chứa toàn bộ hiệu ứng nặng: Particles, Cursor, Dock */}
      {/* ========================================= */}
      <SpiritRealm />

      {/* ========================================= */}
      {/* TẦNG 2: NỀN TĨNH (STATIC BACKGROUNDS)     */}
      {/* Render cứng từ Server để đỡ tốn JS load    */}
      {/* ========================================= */}

      {/* Noise Texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0" />

      {/* Deep Vignette (Làm tối 4 góc để tập trung trung tâm) */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_120%)] pointer-events-none z-0" />

      {/* Vertical Lines (Kẻ dọc trang trí) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 flex justify-between px-[10%] max-w-7xl mx-auto">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
      </div>

      {/* --- CÁC COMPONENT CŨ CỦA BẠN (GIỮ NGUYÊN) --- */}

      {/* Text Dọc Trái */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 items-center opacity-60 z-10 pointer-events-none mix-blend-color-dodge">
        <div className="w-px h-40 bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent shadow-[0_0_10px_#d946ef]" />
        <span
          className="writing-vertical-rl text-[11px] uppercase tracking-[0.6em] text-fuchsia-300/80 font-mono"
          style={{ textShadow: "0 0 10px rgba(217,70,239,0.5)" }}
        >
          Thiên Hương Quốc Sắc
        </span>
      </div>

      {/* Text Dọc Phải */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 items-center opacity-60 z-10 pointer-events-none mix-blend-color-dodge">
        <div className="w-px h-40 bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent shadow-[0_0_10px_#d946ef]" />
        <span
          className="writing-vertical-rl text-[11px] uppercase tracking-[0.6em] text-fuchsia-300/80 font-mono rotate-180"
          style={{ textShadow: "0 0 10px rgba(217,70,239,0.5)" }}
        >
          Vạn Thế Lưu Danh
        </span>
      </div>

      {/* ========================================= */}
      {/* TẦNG 3: NỘI DUNG CHÍNH (CONTENT LAYER)    */}
      {/* ========================================= */}

      {/* Wrapper có z-index cao để đè lên các hiệu ứng nền nhưng nằm dưới Cursor */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Header ẩn hiện linh hoạt (Nếu có) */}
        <header className="w-full pt-12 pb-6 flex justify-center items-center opacity-80">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-fuchsia-500/50" />
          <div className="mx-4 w-2 h-2 rotate-45 border border-fuchsia-400 bg-fuchsia-900/50" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-fuchsia-500/50" />
        </header>

        {/* COMPONENT GALLERYSHELL CỦA BẠN */}
        <div className="flex-1 w-full max-w-[1920px] mx-auto">
          <GalleryShell />
        </div>

        {/* Footer Decoration (Nâng cấp) */}
        <footer className="relative pb-24 pt-12 text-center w-full opacity-50 z-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <p className="text-[10px] font-mono text-fuchsia-300 tracking-[0.5em] uppercase hover:text-fuchsia-100 transition-colors cursor-default">
            Xóm Nhà Lá • Gallery • Bản Sắc
          </p>
          <p className="mt-2 text-[8px] text-purple-500/50 tracking-widest">
            DESIGNED BY NGUYEN TUAN PHUC
          </p>
        </footer>
      </div>
    </main>
  );
}
