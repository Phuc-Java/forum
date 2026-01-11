"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwordTerminalLoader from "./SwordTerminalLoader";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        position: "relative",
        // BỎ padding-top: Để nội dung tràn lên sát đỉnh màn hình.
        // Nav của bạn sẽ đè lên trên (overlay) phần trên cùng của iframe.
        paddingTop: 0,
      }}
    >
      {/* --- LỚP LOADER --- */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <SwordTerminalLoader onFinished={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* --- NỘI DUNG CHÍNH --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          // KÍCH HOẠT GPU 100%
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        {/* --- IFRAME --- */}
        <iframe
          src="/van-kiem-quy-tong/VanKiemQuyTong.html"
          title="van-kiem-quy-tong"
          scrolling="no"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; geolocation; microphone; camera; midi"
          loading="eager"
          style={{
            border: "none",
            width: "100%",
            height: "100%",
            display: "block",
            overflow: "hidden",
            pointerEvents: "all",
          }}
        />

        {/* --- OVERLAY DUY NHẤT (Vignette) --- */}
        {/* Chỉ giữ lại lớp tối góc để tạo chiều sâu */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
            background:
              "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.8) 100%)",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* ĐÃ XÓA NÚT RỜI KHỎI BÍ CẢNH */}
      </motion.div>
    </div>
  );
}
