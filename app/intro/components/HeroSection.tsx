"use client";

import React, { useState, useEffect } from "react";
import { INTRO_DATA } from "../data";

// =============================================================================
// SUB-COMPONENT: ÂM DƯƠNG NGƯ (YIN YANG ICON)
// =============================================================================
const YinYangIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} filter="url(#glow-yy)">
    <defs>
      <filter id="glow-yy">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="black"
      stroke="#eab308"
      strokeWidth="2"
    />
    <path
      d="M50 2a48 48 0 0 1 0 96 24 24 0 0 1 0-48 24 24 0 0 0 0-48z"
      fill="#eab308"
    />
    <circle cx="50" cy="26" r="6" fill="black" />
    <circle cx="50" cy="74" r="6" fill="#eab308" />
  </svg>
);

// =============================================================================
// SUB-COMPONENT: TRẬN PHÁP NỀN (SPINNING RUNE ARRAY)
// Hiệu ứng vòng xoay ma pháp sau khi mở phong ấn
// =============================================================================
const SpiritArrayBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
    {/* Vòng ngoài cùng */}
    <div className="absolute w-[800px] h-[800px] border border-yellow-500/20 rounded-full animate-[spin_60s_linear_infinite]">
      <div className="absolute inset-0 border-t border-b border-yellow-500/50" />
    </div>
    {/* Vòng giữa - Rune */}
    <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-yellow-500/30 animate-[spin_40s_linear_infinite_reverse]">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <div
          key={deg}
          className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-500 rounded-full"
          style={{ transform: `rotate(${deg}deg) translateY(-300px)` }}
        />
      ))}
    </div>
    {/* Vòng trong */}
    <div className="absolute w-[400px] h-[400px] border-[20px] border-yellow-500/5 rounded-full animate-pulse" />
  </div>
);

// =============================================================================
// MAIN COMPONENT: HERO GATE
// =============================================================================
export default function HeroGate() {
  const [isSealed, setIsSealed] = useState(true);
  const [isBurning, setIsBurning] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. LOGIC KHÓA SCROLL
  useEffect(() => {
    if (isSealed) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    };
  }, [isSealed]);

  const breakSeal = () => {
    setIsBurning(true);
    setTimeout(() => {
      setIsSealed(false);
      setShowContent(true);
    }, 1500);
  };

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Vẫn chạy parallax nhẹ kể cả khi đã mở phong ấn để tạo độ sâu
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Hàm render chữ dọc cho bùa chú
  const renderVerticalText = (text: string) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="block text-4xl md:text-5xl font-talisman font-black text-[#1a1a1a] drop-shadow-md my-1"
      >
        {char}
      </span>
    ));
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-void-noise overflow-hidden">
      {/* =====================================================================
          LAYER 1: BACKGROUND (Chung)
         ===================================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Bát quái nền mờ */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] opacity-[0.03] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(-50%, -50%) rotate(${mousePos.x * 0.2}deg)`,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-[spin_120s_linear_infinite]"
          >
            <path
              fill="currentColor"
              d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 98C23.5 98 2 76.5 2 50S23.5 2 50 2s48 21.5 48 48-21.5 48-48 48z"
            />
          </svg>
        </div>

        {/* Hạt bụi lơ lửng */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-yellow-500/30 rounded-full animate-[float_10s_infinite_linear]"
            style={{
              width: Math.random() * 3 + "px",
              height: Math.random() * 3 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      {/* =====================================================================
          LAYER 2: PHONG ẤN (Giữ nguyên logic cũ)
         ===================================================================== */}
      {isSealed && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-1000 ${
            isBurning ? "pointer-events-none" : ""
          }`}
        >
          {/* --- LÁ BÙA TRÁI --- */}
          <div
            className={`!absolute top-0 bottom-0 w-24 md:w-32 bg-[#e2c792] shadow-[5px_0_30px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between py-6 origin-center z-20 talisman-strip border-r-2 border-yellow-900/30 ${
              isBurning ? "animate-burn-away" : ""
            }`}
            style={{
              left: "200px",
              transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-50 mix-blend-multiply" />
            <div className="absolute left-2 top-0 bottom-0 w-px border-r border-dashed border-red-900/40" />
            <div className="absolute right-2 top-0 bottom-0 w-px border-l border-dashed border-red-900/40" />
            <div className="relative z-10 w-16 h-16 border-[3px] border-red-800 text-red-800 font-bold grid place-items-center opacity-70 mix-blend-multiply mask-rough">
              <span className="text-xl font-talisman">CẤM</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-grow py-4 select-none mix-blend-multiply opacity-90">
              {renderVerticalText(INTRO_DATA.seal.leftText)}
            </div>
            <div className="text-red-900/50 text-xl">▼</div>
          </div>

          {/* --- LÁ BÙA PHẢI --- */}
          <div
            className={`!absolute top-0 bottom-0 w-24 md:w-32 bg-[#e2c792] shadow-[-5px_0_30px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between py-6 origin-center z-20 talisman-strip border-l-2 border-yellow-900/30 ${
              isBurning ? "animate-burn-away" : ""
            }`}
            style={{
              right: "200px",
              animationDelay: "0.1s",
              transform: `translate(${mousePos.x * -1}px, ${
                mousePos.y * -1
              }px)`,
            }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-50 mix-blend-multiply" />
            <div className="absolute left-2 top-0 bottom-0 w-px border-r border-dashed border-red-900/40" />
            <div className="absolute right-2 top-0 bottom-0 w-px border-l border-dashed border-red-900/40" />
            <div className="relative z-10 w-16 h-16 border-[3px] border-red-800 text-red-800 font-bold grid place-items-center opacity-70 mix-blend-multiply mask-rough">
              <span className="text-xl font-talisman">PHONG</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-grow py-4 select-none mix-blend-multiply opacity-90">
              {renderVerticalText(INTRO_DATA.seal.rightText)}
            </div>
            <div className="relative z-10 w-20 h-20 border-[3px] border-red-800 text-red-800 font-bold grid place-items-center opacity-70 mix-blend-multiply mask-rough">
              <div className="flex flex-col items-center leading-none">
                <span className="text-[10px] border-b border-red-800 mb-1">
                  Xóm Nhà Lá
                </span>
                <span className="text-2xl font-talisman">ẤN</span>
              </div>
            </div>
          </div>

          {/* --- NÚT KÍCH HOẠT --- */}
          <div
            className={`absolute z-50 flex flex-col items-center gap-6 ${
              isBurning ? "opacity-0 scale-0 transition-all duration-500" : ""
            }`}
          >
            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse" />
            <button
              onClick={breakSeal}
              className="relative group w-32 h-32 rounded-full shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-transform duration-500 hover:scale-110 active:scale-95"
            >
              <YinYangIcon className="w-full h-full animate-[spin_10s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite]" />
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 animate-[ping_2s_infinite]" />
            </button>
            <span className="text-yellow-400 font-dao tracking-[0.3em] text-sm bg-black/80 px-4 py-2 rounded border border-yellow-900/50 uppercase animate-bounce select-none">
              Nhấn Ấn Để Phá Giải
            </span>
          </div>

          <div
            className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-0 ${
              isBurning ? "opacity-0 duration-1000" : ""
            }`}
          />
        </div>
      )}

      {/* =====================================================================
          LAYER 3: NỘI DUNG CHÍNH (ĐƯỢC THIẾT KẾ LẠI SIÊU ĐẸP)
         ===================================================================== */}
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center transition-all duration-1000 transform ${
          showContent
            ? "opacity-100 translate-y-0 filter-none"
            : "opacity-0 translate-y-20 blur-sm"
        }`}
      >
        {/* --- TRẬN PHÁP NỀN (Chỉ hiện khi mở khóa) --- */}
        {showContent && <SpiritArrayBackground />}

        {/* --- LOGO TÔNG MÔN --- */}
        <div className="mb-12 relative animate-float">
          {/* Hào quang tỏa ra từ logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500/20 blur-[50px] rounded-full animate-pulse" />

          <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-b from-gray-800 to-black border-2 border-yellow-600/50 shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur-md">
            <div className="absolute inset-1 rounded-full border border-yellow-500/20" />
            <svg
              className="w-14 h-14 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2zm0 2.83L19.17 12H18v8h-4v-6H10v6H6v-8H4.83L12 4.83z" />
            </svg>
          </div>
        </div>

        {/* --- TIÊU ĐỀ LỚN (Text Gradient Gold) --- */}
        <div className="relative mb-6 group cursor-default">
          {/* Hiệu ứng bóng chữ mờ phía sau */}
          <h1 className="absolute top-0 left-0 w-full text-6xl md:text-9xl font-black font-dao text-yellow-500/20 blur-sm transform scale-105 select-none">
            {INTRO_DATA.meta.title}
          </h1>
          <h1 className="relative text-6xl md:text-9xl font-black font-dao text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]">
            {INTRO_DATA.meta.title}
          </h1>
        </div>

        {/* --- SUBTITLE (Trang trí kiểu đối câu) --- */}
        <div className="flex items-center justify-center gap-6 mb-16 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
          <div className="hidden md:block w-24 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          <div className="text-xl md:text-2xl text-yellow-100 font-talisman tracking-[0.3em] uppercase text-shadow-glow flex items-center gap-4">
            <span className="text-yellow-600 text-sm">✦</span>
            {INTRO_DATA.meta.concept}
            <span className="text-yellow-600 text-sm">✦</span>
          </div>
          <div className="hidden md:block w-24 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
        </div>

        {/* --- SLOGAN & DESCRIPTION --- */}
        <div className="max-w-3xl mx-auto mb-20 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
          <p className="text-gray-300 text-lg leading-relaxed font-light border-l-4 border-yellow-600/50 pl-6 bg-gradient-to-r from-yellow-900/10 to-transparent py-4 text-justify md:text-center md:border-l-0 md:border-t md:border-b md:py-8 md:bg-none">
            Vùng đất của những dòng code tối thượng. Nơi quy tụ anh hào, chia sẻ
            bí kíp thất truyền. Cùng nhau tu luyện, phi thăng cảnh giới.
          </p>
          <div className="mt-4 text-yellow-500/60 font-mono text-xs tracking-widest uppercase">
            — {INTRO_DATA.meta.slogan} —
          </div>
        </div>

        {/* --- ACTION BUTTONS (Hiệu ứng Neon) --- */}
        <div className="flex flex-col md:flex-row gap-8 opacity-0 animate-[fadeInUp_1s_ease-out_1.2s_forwards]">
          {/* Nút Chính: Nhập Môn */}
          <button
            onClick={() =>
              document
                .getElementById("roles")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-sm"
          >
            {/* Viền chạy */}
            <div className="absolute inset-0 w-full h-full border border-yellow-500/30" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500 transition-all group-hover:w-full group-hover:h-full" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500 transition-all group-hover:w-full group-hover:h-full" />

            {/* Nền Hover */}
            <div className="absolute inset-0 bg-yellow-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />

            <span className="relative z-10 text-yellow-500 font-bold tracking-[0.2em] uppercase text-sm group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] transition-all">
              Nhập Môn Ngay
            </span>
          </button>

          {/* Nút Phụ: Tìm Hiểu */}
          <button
            onClick={() =>
              document
                .getElementById("places")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group px-10 py-4 flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm font-light tracking-widest uppercase border-b border-transparent group-hover:border-white transition-all">
              Du Ngoạn Cấm Địa
            </span>
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .writing-vertical-rl {
          writing-mode: vertical-rl;
          text-orientation: upright;
        }
        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(253, 224, 71, 0.5);
        }
        .mask-rough {
          mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
