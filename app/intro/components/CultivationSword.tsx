"use client";

import React, { useEffect, useState } from "react";

export default function CultivationSword() {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Map % cuộn trang thành tên cảnh giới tu tiên
  const getCultivationLevel = (progress: number) => {
    if (progress < 10) return { title: "Phàm Nhân", color: "#a3a3a3" };
    if (progress < 30) return { title: "Luyện Khí", color: "#22c55e" };
    if (progress < 50) return { title: "Trúc Cơ", color: "#3b82f6" };
    if (progress < 75) return { title: "Kim Đan", color: "#a855f7" };
    if (progress < 95) return { title: "Nguyên Anh", color: "#eab308" };
    return { title: "Độ Kiếp", color: "#dc2626" };
  };

  const level = getCultivationLevel(scrollProgress);

  const checkpoints = [
    { id: "hero", label: "Sơn Môn", pos: 0 },
    { id: "roles", label: "Cảnh Giới", pos: 30 },
    { id: "places", label: "Cấm Địa", pos: 60 },
    { id: "footer", label: "Viên Mãn", pos: 95 },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(Number(scroll) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 h-[60vh] flex flex-col items-center">
      {/* 1. HIỂN THỊ CẢNH GIỚI HIỆN TẠI */}
      <div
        className="absolute -left-32 transition-all duration-300 pointer-events-none"
        style={{ top: `${scrollProgress}%`, transform: "translateY(-50%)" }}
      >
        <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] text-right min-w-[120px]">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            Cảnh giới
          </p>
          <h3
            className="text-xl font-bold font-talisman animate-pulse"
            style={{
              color: level.color,
              textShadow: `0 0 10px ${level.color}`,
            }}
          >
            {level.title}
          </h3>
          <p className="text-[9px] text-gray-400 font-mono mt-1">
            {Math.round(scrollProgress)}% Thiên Đạo
          </p>
        </div>
        <div className="absolute top-1/2 -right-8 w-8 h-[1px] bg-white/20" />
      </div>

      {/* 2. THANH KIẾM */}
      <div className="relative w-1 h-full bg-white/10 rounded-full">
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-yellow-400 to-red-500 shadow-[0_0_15px_rgba(234,179,8,0.8)] rounded-full transition-all duration-100 ease-out"
          style={{ height: `${scrollProgress}%` }}
        />
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-6 border border-yellow-600 bg-black rotate-45" />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-yellow-600 text-xl">
          ▼
        </div>

        {/* 3. CÁC CHECKPOINTS */}
        {checkpoints.map((point) => {
          const isActive = scrollProgress >= point.pos;
          return (
            <div
              key={point.id}
              className="absolute left-1/2 -translate-x-1/2 group cursor-pointer"
              style={{ top: `${point.pos}%` }}
              onClick={() => scrollToSection(point.id)}
            >
              <div
                className={`w-3 h-3 rotate-45 border transition-all duration-500 ${
                  isActive
                    ? "bg-yellow-500 border-yellow-200 scale-125 shadow-[0_0_10px_yellow]"
                    : "bg-black border-gray-600 hover:border-white"
                }`}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-yellow-500/80 mr-2">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
