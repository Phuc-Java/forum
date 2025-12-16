import React from "react";
import { Noto_Serif_SC, Cinzel } from "next/font/google";
import { INTRO_DATA } from "../data";

const notoserif = Noto_Serif_SC({ subsets: ["latin"], weight: ["900"] });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });

// =============================================================================
// SUB-COMPONENT: NÚT NGỌC GIẢN (SPIRIT BUTTON)
// Nút bấm phong cách thẻ ngọc, phát sáng khi hover
// =============================================================================
const SpiritLink = ({
  href,
  label,
  iconPath,
}: {
  href: string;
  label: string;
  iconPath: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative px-8 py-3 flex items-center gap-3 overflow-hidden transition-all duration-500"
  >
    {/* 1. Nền tối mờ */}
    <div className="absolute inset-0 bg-white/5 skew-x-12 border-l border-r border-white/10 group-hover:bg-yellow-500/10 group-hover:border-yellow-500/50 transition-all duration-500" />

    {/* 2. Viền trên dưới (Co lại khi hover) */}
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-yellow-500 transition-all duration-500" />
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-yellow-500 transition-all duration-500" />

    {/* 3. Icon */}
    <svg
      className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] transition-all duration-300 relative z-10"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={iconPath} />
    </svg>

    {/* 4. Text */}
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors duration-300 relative z-10 font-dao">
      {label}
    </span>

    {/* 5. Particles bay lên khi hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
      <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-yellow-500 rounded-full animate-[float_2s_infinite]" />
      <div className="absolute bottom-0 left-1/4 w-0.5 h-0.5 bg-yellow-500 rounded-full animate-[float_3s_infinite]" />
    </div>
  </a>
);

// =============================================================================
// MAIN FOOTER
// =============================================================================
export default function FooterDao() {
  return (
    <footer className="relative w-full h-[300px] flex flex-col items-center justify-center bg-[#020202] border-t border-white/5 overflow-hidden">
      {/* --- BACKGROUND: ĐẠO PHÁP TỰ NHIÊN --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <div
          className={`text-[12vw] md:text-[8vw] font-black tracking-[1em] text-white flex gap-16 ${notoserif.className}`}
        >
          <span>道</span>
          <span>法</span>
          <span>自</span>
          <span>然</span>
        </div>
      </div>

      {/* Hiệu ứng sương mù dưới đáy */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-yellow-900/10 to-transparent pointer-events-none" />

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 1. DANH SÁCH LIÊN KẾT (Chỉ 2 cái) */}
        <div className="flex items-center gap-8 md:gap-16">
          {/* Facebook Link */}
          <SpiritLink
            href="https://facebook.com/nguyen.tuan.phuc.942283" // Thay link facebook của Tông Chủ vào đây
            label="Facebook"
            iconPath="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />

          {/* Divider: Kiếm nhỏ ở giữa */}
          <div className="h-8 w-[1px] bg-white/10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-600 rotate-45" />
          </div>

          {/* Portfolio Link */}
          <SpiritLink
            href="https://nguyen-tuan-phuc-deptroai-nextjs.vercel.app/"
            label="Portfolio"
            iconPath="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
          />
        </div>

        {/* 2. COPYRIGHT */}
        <div className="text-center">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-yellow-700 to-transparent mx-auto mb-3" />
          <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
            © 2024 Nguyen Tuan Phuc • All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
