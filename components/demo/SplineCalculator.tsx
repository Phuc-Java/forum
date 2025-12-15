"use client";
import React from "react";
import Spline from "@splinetool/react-spline";

export default function SplineCalculator() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-[#060010] overflow-hidden relative">
      {/* Spline Component */}
      <Spline
        // Trỏ đúng đường dẫn file trong thư mục public của bạn
        scene="/3D/real_calculator.spline"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Loading Overlay (Tùy chọn, hiện khi đang tải) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-[#060010] -z-10">
        <div className="animate-pulse text-purple-500 text-sm font-mono">
          Loading 3D Scene...
        </div>
      </div>
    </div>
  );
}
