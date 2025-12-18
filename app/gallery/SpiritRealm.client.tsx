"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- TIỆN ÍCH (UTILS) ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm random số trong khoảng
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// --- CẤU HÌNH (CONSTANTS) ---
const NUM_PETALS = 20; // Số lượng cánh hoa rơi
const RUNE_TEXT = "THIÊN ĐỊA HUYỀN HOÀNG VŨ TRỤ HỒNG HOANG"; // Cổ ngữ chạy vòng tròn

// ==========================================
// 1. LINH THỨC (SPIRIT CURSOR) - Con trỏ thần thức
// ==========================================
const SpiritCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Dùng spring để tạo độ trễ "như khói"
  const springConfig = { damping: 20, stiffness: 250, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Tâm điểm (Core) */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-fuchsia-200 rounded-full blur-[1px] z-[9999] pointer-events-none mix-blend-screen"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Hào quang (Aura) */}
      <motion.div
        className="fixed top-0 left-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 blur-xl z-[9998] pointer-events-none"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Vòng xoáy (Spinning Ring) */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-fuchsia-300/30 rounded-full z-[9998] pointer-events-none"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
};

// ==========================================
// 2. HOA VŨ (FALLING PETALS) - Hiệu ứng cánh hoa rơi
// ==========================================
const FallingPetals = () => {
  // Tạo mảng cánh hoa tĩnh để tránh hydration error, chỉ render client
  const [petals, setPetals] = useState<
    {
      id: number;
      left: number;
      delay: number;
      duration: number;
      scale: number;
    }[]
  >([]);

  useEffect(() => {
    const newPetals = Array.from({ length: NUM_PETALS }).map((_, i) => ({
      id: i,
      left: random(0, 100),
      delay: random(0, 10),
      duration: random(10, 20),
      scale: random(0.5, 1.2),
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute -top-10 text-fuchsia-300/40"
          style={{
            left: `${petal.left}%`,
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 0],
            rotate: [0, 360],
            x: [0, random(-50, 50), 0], // Gió thổi ngang
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* SVG Cánh hoa */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ transform: `scale(${petal.scale})` }}
          >
            <path d="M12 2C12 2 14 8 20 10C14 12 12 22 12 22C12 22 10 12 4 10C10 8 12 2 12 2Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// 3. HỘ PHÁP TRẬN (CORNER RUNES) - 4 Góc
// ==========================================
const RuneArray = ({
  position,
  rotateDir = 1,
}: {
  position: string;
  rotateDir?: number;
}) => {
  return (
    <motion.div
      className={cn(
        "fixed w-64 h-64 pointer-events-none z-0 opacity-20",
        position
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.2 }}
      transition={{ duration: 1 }}
    >
      {/* Vòng tròn ngoài */}
      <motion.div
        className="absolute inset-0 border border-fuchsia-500/30 rounded-full border-dashed"
        animate={{ rotate: 360 * rotateDir }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      {/* Vòng tròn trong */}
      <motion.div
        className="absolute inset-4 border border-purple-400/20 rounded-full"
        animate={{ rotate: -360 * rotateDir }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      {/* Tam giác cổ ngữ */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 180 * rotateDir, scale: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-40 h-40 border border-fuchsia-600/10 rotate-45 transform" />
      </motion.div>
    </motion.div>
  );
};

// SpiritDock and its DockItem were removed per request to eliminate the control dock UI.

// ==========================================
// 5. HIỆU ỨNG CUỘN (SCROLL PARALLAX) - Trang trí nền
// ==========================================
const ParallaxDecor = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Vệt sáng chéo */}
      <motion.div
        style={{ y: y1, rotate: 45, opacity: 0.1 }}
        className="absolute top-1/4 -right-20 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-sm"
      />
      <motion.div
        style={{ y: y2, rotate: -45, opacity: 0.05 }}
        className="absolute bottom-1/3 -left-20 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent blur-md"
      />

      {/* Chữ lớn mờ phía sau */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif text-purple-900/5 whitespace-nowrap select-none"
      >
        GALLERY
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN EXPORT CHO CLIENT
// ==========================================
export const SpiritRealm = () => {
  // Chỉ mount trên client để tránh lỗi hydration với các hiệu ứng random
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <SpiritCursor />
      <FallingPetals />
      <ParallaxDecor />

      {/* Các Trận Pháp Góc */}
      <div className="hidden 2xl:block">
        <RuneArray position="-top-32 -left-32" rotateDir={1} />
        <RuneArray position="-bottom-32 -right-32" rotateDir={-1} />
      </div>

      {/* Lớp phủ nhiễu động (Atmosphere) */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[2] mix-blend-overlay opacity-30 bg-gradient-to-tr from-purple-900/0 via-fuchsia-900/10 to-transparent"
        animate={{ opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </>
  );
};
