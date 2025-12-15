"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- TYPES ---
interface AccessDeniedProps {
  minRole?: string;
  className?: string;
}

// --- ASSETS: SVG PATHS & ICONS ---
const Icons = {
  Lock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-full h-full"
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Chain: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 100 20"
      className={cn("w-full h-auto opacity-80", className)}
      preserveAspectRatio="none"
    >
      <path
        d="M0,10 L10,10 M10,5 L20,5 L20,15 L10,15 Z M20,10 L30,10 M30,5 L40,5 L40,15 L30,15 Z M40,10 L50,10 M50,5 L60,5 L60,15 L50,15 Z M60,10 L70,10 M70,5 L80,5 L80,15 L70,15 Z M80,10 L90,10 M90,5 L100,5 L100,15 L90,15 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  RuneCircle: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={cn("animate-spin-slow", className)}>
      <defs>
        <path
          id="circlePath"
          d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
        />
      </defs>
      <text width="500">
        <textPath
          xlinkHref="#circlePath"
          className="text-[10px] fill-current tracking-[5px] uppercase font-mono"
        >
          SEALED • FORBIDDEN • ANCIENT • POWER • RESTRICTED • VOID •
        </textPath>
      </text>
    </svg>
  ),
};

// --- SUB-COMPONENT: GOLD DUST PARTICLES (BỤI VÀNG) ---
const GoldDustField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Config: Hạt màu vàng kim
    const particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
    }[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3, // Hạt to hơn chút
        speedY: Math.random() * 0.5 + 0.2, // Rơi chậm từ dưới lên (khí thế bốc lên)
        opacity: Math.random() * 0.6,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY; // Bay lên
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        // Tạo hiệu ứng lấp lánh
        const flicker = Math.random() > 0.95 ? 0 : p.opacity;

        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size
        );
        gradient.addColorStop(0, `rgba(251, 191, 36, ${p.opacity})`); // Amber-400 core
        gradient.addColorStop(1, "rgba(245, 158, 11, 0)"); // Amber-500 fade

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
    />
  );
};

// --- SUB-COMPONENT: ANCIENT SEAL (VÒNG PHONG ẤN) ---
const AncientSeal = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
      {/* Outer Ring - Amber */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="w-[700px] h-[700px] border border-amber-500/20 rounded-full flex items-center justify-center"
      >
        <div className="absolute top-0 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
        <div className="absolute bottom-0 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
      </motion.div>

      {/* Inner Ring - Red (Danger) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[500px] h-[500px] border border-red-500/10 rounded-full flex items-center justify-center border-dashed"
      >
        <div className="absolute left-0 w-3 h-3 bg-red-600/50 rounded-full blur-sm"></div>
      </motion.div>

      {/* Center Glow */}
      <div className="absolute w-[300px] h-[300px] bg-amber-900/10 blur-[100px] rounded-full animate-pulse"></div>
    </div>
  );
};

// --- MAIN COMPONENT: TREASURE ACCESS DENIED ---
export const TreasureAccessDenied = ({
  minRole = "Chí Cường Giả",
  className,
}: AccessDeniedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Chains Animation - Lắc lư nhẹ
  const chainVariants = {
    animate: {
      y: [0, 5, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } as any,
    },
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[9999] bg-[#0c0a09] text-amber-50 overflow-hidden flex items-center justify-center perspective-1000 font-serif",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* === BACKGROUND LAYERS === */}
      {/* Dark Void Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0c0a09] to-black"></div>

      {/* Texture: Dragon Scales / Stone */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay pointer-events-none"></div>

      <GoldDustField />
      <AncientSeal />

      {/* === CHAINS (DÂY XÍCH PHONG ẤN) === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {/* Top Left Chain */}
        <motion.div
          variants={chainVariants}
          animate="animate"
          className="absolute -top-10 -left-10 w-[60%] rotate-[25deg] text-neutral-800 drop-shadow-2xl"
        >
          <Icons.Chain className="h-16" />
        </motion.div>
        {/* Bottom Right Chain */}
        <motion.div
          variants={chainVariants}
          animate="animate"
          className="absolute -bottom-10 -right-10 w-[60%] rotate-[25deg] text-neutral-800 drop-shadow-2xl"
        >
          <Icons.Chain className="h-16" />
        </motion.div>
      </div>

      {/* === MAIN CARD (ARTIFACT) === */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          rotateX: useSpring(rotateX, { stiffness: 100, damping: 20 }),
          rotateY: useSpring(rotateY, { stiffness: 100, damping: 20 }),
        }}
        className="relative z-30 w-full max-w-md"
      >
        {/* Talisman Paper (Bùa chú) Effect */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-40 bg-yellow-600 shadow-lg z-40 origin-top animate-[swing_3s_ease-in-out_infinite] flex items-center justify-center overflow-hidden border-2 border-yellow-800/50">
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-70">
            <span className="writing-vertical-rl text-2xl font-bold text-red-900 font-mono tracking-widest border-2 border-red-900/50 p-1">
              CẤM ĐỊA
            </span>
          </div>
          {/* Ripped bottom effect */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#0c0a09] clip-path-jagged"></div>
          <style jsx>{`
            .writing-vertical-rl {
              writing-mode: vertical-rl;
            }
            .clip-path-jagged {
              clip-path: polygon(
                0% 0%,
                10% 100%,
                20% 0%,
                30% 100%,
                40% 0%,
                50% 100%,
                60% 0%,
                70% 100%,
                80% 0%,
                90% 100%,
                100% 0%
              );
            }
          `}</style>
        </div>

        {/* Card Container */}
        <div className="relative bg-[#1c1917] border border-amber-500/30 rounded-lg p-1 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
          {/* Inner Border Frame */}
          <div className="border border-amber-500/10 rounded-md p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden bg-[#1c1917]/90 backdrop-blur-sm">
            {/* Corner Ornaments */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/50"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/50"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/50"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/50"></div>

            {/* LOCK ICON & RUNE */}
            <div className="relative mt-8">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full border-2 border-amber-500/30 flex items-center justify-center bg-[#292524] shadow-inner group">
                <Icons.RuneCircle className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] text-amber-500/20" />
                <div className="w-12 h-12 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                  <Icons.Lock />
                </div>
              </div>
            </div>

            {/* TEXT */}
            <div className="space-y-3 z-10">
              <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 uppercase font-mono">
                Trân Tàng Các
              </h2>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
              <p className="text-amber-200/60 text-sm leading-relaxed max-w-xs mx-auto font-sans">
                Nơi cất giữ bảo vật ngàn năm. Phàm nhân chưa đạt cảnh giới{" "}
                <span className="text-amber-400 font-bold">{minRole}</span>{" "}
                không thể chịu đựng được áp lực linh khí nơi đây.
              </p>
            </div>

            {/* LEVEL REQUIREMENT */}
            <div className="py-2 px-6 bg-red-950/30 border border-red-900/50 rounded-full flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="text-xs text-red-400 uppercase tracking-widest font-bold">
                Yêu Cầu: {minRole}
              </span>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <Link href="/" className="w-full">
                <button className="w-full py-3 px-4 rounded border border-amber-500/20 text-amber-500/60 hover:text-amber-200 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all uppercase text-xs font-bold tracking-wider">
                  Quay Về
                </button>
              </Link>
              <Link href="/login" className="w-full">
                <button className="relative w-full py-3 px-4 rounded bg-gradient-to-br from-amber-600 to-yellow-700 text-white shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all uppercase text-xs font-bold tracking-wider overflow-hidden group/btn">
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative">Tu Luyện Ngay</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FOOTER DECORATION */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-amber-500 to-transparent"></div>
        <span className="text-[10px] text-amber-500 tracking-[0.3em] uppercase">
          Forbidden • Zone
        </span>
      </div>
    </div>
  );
};
