"use client";

import React, { useState } from "react";
import { INTRO_DATA, IZone } from "../data";

// =============================================================================
// SUB-COMPONENT: VÒNG MA PHÁP (RUNE CIRCLE)
// Xoay chậm ở nền, tăng tốc khi hover
// =============================================================================
const RuneCircle = ({ isHovered }: { isHovered: boolean }) => (
  <div
    className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-700 ${
      isHovered ? "opacity-30" : "opacity-5"
    }`}
  >
    <svg
      viewBox="0 0 200 200"
      className={`w-[180%] h-[180%] text-yellow-500/50 transition-transform duration-[2000ms] ease-out ${
        isHovered ? "animate-[spin_10s_linear_infinite]" : "rotate-0"
      }`}
    >
      <defs>
        <path
          id="circlePath"
          d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
        />
      </defs>
      <circle
        cx="100"
        cy="100"
        r="74"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <text
        fill="currentColor"
        fontSize="10"
        letterSpacing="4px"
        fontWeight="bold"
      >
        <textPath href="#circlePath" startOffset="0%">
          XOM NHÀ LÁ • THƯỢNG CỔ TÔNG MÔN • VẠN PHÁP QUY TÔNG •
        </textPath>
      </text>
      {/* Các ký tự Rune giả lập */}
      <g transform="translate(100, 100)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect
            key={i}
            x="-2"
            y="-68"
            width="4"
            height="8"
            fill="currentColor"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
    </svg>
  </div>
);

// =============================================================================
// MAIN COMPONENT: CẤM ĐỊA KHAI MỞ
// =============================================================================
export default function PlacesShowcase() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Hàm map ID sang đường dẫn thực tế (Tông Chủ có thể sửa lại cho đúng route của web)
  const getRoute = (id: string) => {
    switch (id) {
      // Case 'id-trong-data-ts': return 'duong-dan-thuc-te';

      case "tien-phu":
        return "/"; // Trang chủ
      case "tang-kinh-cac":
        return "/shop"; // Ví dụ: Trang tài liệu
      case "tran-tang-cac":
        return "/3Dtest"; // Ví dụ: Trang code
      case "dang-toan-nang":
        return "/chat"; // Ví dụ: Trang Chatbot
      case "thien-co-lau":
        return "/earn"; // Ví dụ: Trang Game
      case "dong-chi-hoi":
        return "/events/giang-sinh"; // Ví dụ: Trang Event
      case "my-nhan-cac":
        return "/gallery"; // Ví dụ: Trang Ảnh
      case "chung-tu":
        return "/members"; // Trang Chúng Tu
      case "bao-kho":
        return "/resources"; // Trang Bảo Khố
      case "cao-tri":
        return "/forum"; // Trang Cáo Tri
      case "my-crush":
        return "/events/my-crush"; // Trang My Crush (Nhập pass)
      case "van-tuong-dai":
        return "/phim"; // Trang Vạn Tượng Đài
      case "ho-so":
        return "/profile"; // Trang Profile (kèm nút sửa)
      case "quan-tri":
        return "/admin"; // Trang Admin
      default:
        return "#"; // Mặc định nếu không tìm thấy thì đứng yên
    }
  };

  return (
    <section className="relative w-full py-32 px-4 bg-[#030303] overflow-hidden border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-24">
          <span className="text-yellow-600 tracking-[0.5em] text-sm uppercase font-bold mb-4 block animate-pulse">
            ❖ Bản Đồ Tông Môn ❖
          </span>
          <h2 className="text-5xl md:text-6xl font-dao text-gold-gradient mb-6 drop-shadow-2xl">
            THẬP TỨ ĐẠI BÍ CẢNH
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-600" />
            <div className="w-2 h-2 rotate-45 bg-yellow-500" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-600" />
          </div>
        </div>

        {/* GRID CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INTRO_DATA.zones.map((zone: IZone) => {
            const isHovered = hoveredZone === zone.id;

            return (
              <a
                key={zone.id}
                href={getRoute(zone.id)} // Link đến trang thật
                className="block group relative h-[480px] perspective-1000 cursor-pointer"
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* 3D CARD CONTAINER */}
                <div
                  className={`
                    relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 ease-out transform-style-3d
                    border border-white/10 bg-[#080808]
                    ${
                      isHovered
                        ? "scale-[1.02] border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.15)]"
                        : "shadow-lg"
                    }
                  `}
                >
                  {/* 1. BACKGROUND LAYERS */}
                  {/* Nền tối */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black opacity-90" />

                  {/* Vòng Ma Pháp (Xoay khi hover) */}
                  <RuneCircle isHovered={isHovered} />

                  {/* Icon khổng lồ làm nền (Parallax nhẹ) */}
                  <svg
                    className={`absolute -right-12 -bottom-12 w-80 h-80 text-white/[0.03] transition-transform duration-700 ease-out ${
                      isHovered ? "scale-110 -rotate-12 translate-x-4" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={zone.iconPath} />
                  </svg>

                  {/* Hiệu ứng quét sáng (Scanner) */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] transition-transform duration-1000 ${
                      isHovered ? "translate-x-[200%]" : ""
                    }`}
                  />

                  {/* 2. MAIN CONTENT */}
                  <div className="relative z-10 p-8 h-full flex flex-col items-center text-center">
                    {/* Floating Badge (Loại khu vực) */}
                    <div className="absolute top-6 right-6">
                      <span
                        className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${
                          isHovered
                            ? "text-yellow-500 border-yellow-500/50 bg-yellow-900/10"
                            : "text-gray-600 border-gray-800"
                        }`}
                      >
                        {zone.id === "tien-phu" ? "Core" : "Zone"} 0
                        {INTRO_DATA.zones.indexOf(zone) + 1}
                      </span>
                    </div>

                    {/* ICON CHÍNH (Bay lên khi hover) */}
                    <div className="mt-8 mb-8 relative">
                      {/* Hào quang sau icon */}
                      <div
                        className={`absolute inset-0 bg-yellow-500 blur-xl rounded-full transition-opacity duration-500 ${
                          isHovered ? "opacity-40" : "opacity-0"
                        }`}
                      />

                      <div
                        className={`
                         relative w-20 h-20 rounded-2xl flex items-center justify-center 
                         bg-gradient-to-br from-gray-800 to-black border border-white/10
                         shadow-[5px_5px_15px_rgba(0,0,0,0.5)]
                         transition-all duration-500 transform
                         ${
                           isHovered
                             ? "translate-y-[-10px] border-yellow-500 text-yellow-400 rotate-3"
                             : "text-gray-400"
                         }
                       `}
                      >
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={zone.iconPath}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* TITLES */}
                    <h3
                      className={`text-2xl md:text-3xl font-bold font-dao mb-2 transition-colors duration-300 ${
                        isHovered ? "text-gold-gradient" : "text-white"
                      }`}
                    >
                      {zone.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                      <div
                        className={`h-[1px] w-8 transition-all duration-500 ${
                          isHovered ? "w-12 bg-yellow-600" : "bg-gray-700"
                        }`}
                      />
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-mono">
                        {zone.subTitle}
                      </p>
                      <div
                        className={`h-[1px] w-8 transition-all duration-500 ${
                          isHovered ? "w-12 bg-yellow-600" : "bg-gray-700"
                        }`}
                      />
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                      {zone.description}
                    </p>

                    {/* ACTION BUTTON (Fake Button, vì thẻ A bao trùm) */}
                    <div className="mt-auto">
                      <div
                        className={`
                         flex items-center gap-2 px-6 py-3 
                         border transition-all duration-500
                         ${
                           isHovered
                             ? "border-yellow-500 bg-yellow-500/10 text-yellow-500 tracking-[0.2em]"
                             : "border-white/10 text-gray-500 tracking-widest"
                         }
                       `}
                      >
                        <span className="text-xs font-bold uppercase">
                          {isHovered ? "Khai Mở Bí Cảnh" : "Xem Chi Tiết"}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isHovered ? "translate-x-2" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GLOW BORDER EFFECT (Viền sáng chạy xung quanh khi hover) */}
                <div
                  className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500 opacity-0 transition-opacity duration-500 -z-10 blur-sm ${
                    isHovered ? "opacity-50" : ""
                  }`}
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
