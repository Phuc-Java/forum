"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Hoặc đường dẫn utils của bạn
import { Lock, AlertTriangle, ShieldAlert, Key } from "lucide-react";

// --- TYPES ---
interface AccessDeniedProps {
  currentRole?: string; // Vai trò hiện tại (ví dụ: Phàm Nhân)
  className?: string;
}

// --- ASSETS: SVG PATHS & ICONS (VẼ TAY ĐỂ TỐI ƯU) ---
const Artifacts = {
  // Dây xích thần thánh
  DivineChain: ({
    className,
    delay = 0,
  }: {
    className?: string;
    delay?: number;
  }) => (
    <motion.svg
      viewBox="0 0 100 20"
      className={cn("w-full h-auto opacity-90 drop-shadow-2xl", className)}
      preserveAspectRatio="none"
      initial={{ y: -5 }}
      animate={{ y: 5 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <defs>
        <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#44403c" />
          <stop offset="50%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#44403c" />
        </linearGradient>
      </defs>
      <path
        d="M0,10 L5,10 C5,10 5,5 10,5 L15,5 C20,5 20,15 15,15 L10,15 C5,15 5,10 5,10 M15,10 L20,10 C20,10 20,5 25,5 L30,5 C35,5 35,15 30,15 L25,15 C20,15 20,10 20,10 M30,10 L35,10 C35,10 35,5 40,5 L45,5 C50,5 50,15 45,15 L40,15 C35,15 35,10 35,10 M45,10 L50,10 C50,10 50,5 55,5 L60,5 C65,5 65,15 60,15 L55,15 C50,15 50,10 50,10 M60,10 L65,10 C65,10 65,5 70,5 L75,5 C80,5 80,15 75,15 L70,15 C65,15 65,10 65,10 M75,10 L80,10 C80,10 80,5 85,5 L90,5 C95,5 95,15 90,15 L85,15 C80,15 80,10 80,10"
        fill="none"
        stroke="url(#chainGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))"
      />
    </motion.svg>
  ),
  // Vòng tròn ma pháp
  RuneCircle: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 200 200"
      className={cn("animate-[spin_20s_linear_infinite]", className)}
    >
      <defs>
        <path
          id="circlePathOuter"
          d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
        />
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="1"
        strokeDasharray="5,5"
        opacity="0.5"
      />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <text width="500">
        <textPath
          xlinkHref="#circlePathOuter"
          className="text-[8px] fill-[#fcd34d] tracking-[8px] uppercase font-serif"
          startOffset="0%"
        >
          THIÊN ĐẠO • VÔ CỰC • CẤM ĐỊA • PHONG ẤN •
        </textPath>
      </text>
    </svg>
  ),
};

// --- SUB-COMPONENT: LINH KHÍ KIM SẮC (CANVAS PARTICLES) ---
const GoldDustField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      pulse: number;
    }[] = [];

    // Tăng mật độ hạt để tạo cảm giác áp lực
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.8 + 0.1, // Bay lên chậm
        speedX: (Math.random() - 0.5) * 0.5, // Lắc lư ngang
        opacity: Math.random() * 0.5,
        pulse: Math.random() * 0.02,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += p.pulse;

        // Hiệu ứng nhấp nháy
        if (p.opacity > 0.8 || p.opacity < 0.1) p.pulse = -p.pulse;

        // Reset khi bay khỏi màn hình
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 3
        );
        gradient.addColorStop(0, `rgba(251, 191, 36, ${p.opacity})`); // Amber-400
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
    />
  );
};

// --- MAIN COMPONENT: CẤM ĐỊA PHONG ẤN ---
export default function TreasureOverlay({
  currentRole = "Phàm Nhân",
}: AccessDeniedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Logic (Hiệu ứng chiều sâu khi di chuột)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]); // Xoay mạnh hơn
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#050505] text-amber-50 overflow-hidden flex items-center justify-center perspective-1000 font-serif select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* === BACKGROUND LAYERS (HƯ KHÔNG) === */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1c1917] via-[#000000] to-[#000000]"></div>

      {/* Texture vảy rồng cổ đại */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay pointer-events-none"></div>

      {/* Khói đen cuộn (CSS Animation) */}
      <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/gist/rsms/7c8309c0641158937989/raw/smoke.png')] opacity-10 animate-[spin_60s_linear_infinite] scale-150 mix-blend-color-dodge"></div>

      {/* Hạt linh khí vàng */}
      <GoldDustField />

      {/* === CHAINS (XÍCH KHÓA THIÊN) === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {/* Góc trên trái */}
        <motion.div
          style={{
            x: useTransform(x, [-0.5, 0.5], [-20, 20]),
            y: useTransform(y, [-0.5, 0.5], [-20, 20]),
          }}
          className="absolute -top-10 -left-20 w-[80vw] rotate-[35deg] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        >
          <Artifacts.DivineChain />
        </motion.div>
        {/* Góc dưới phải */}
        <motion.div
          style={{
            x: useTransform(x, [-0.5, 0.5], [20, -20]),
            y: useTransform(y, [-0.5, 0.5], [20, -20]),
          }}
          className="absolute -bottom-10 -right-20 w-[80vw] rotate-[215deg] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        >
          <Artifacts.DivineChain delay={1.5} />
        </motion.div>
      </div>

      {/* === MAIN SEAL CARD (BẢNG PHONG ẤN) === */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 50 }}
        style={{
          rotateX: useSpring(rotateX, { stiffness: 100, damping: 20 }),
          rotateY: useSpring(rotateY, { stiffness: 100, damping: 20 }),
        }}
        className="relative z-30 w-full max-w-[500px] p-6"
      >
        {/* --- TALISMAN (LÁ BÙA TRẤN YỂM) --- */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-28 h-48 z-50 origin-top animate-[swing_4s_ease-in-out_infinite]">
          <div className="w-full h-full bg-[#eab308] relative shadow-xl border-x-2 border-[#854d0e] flex flex-col items-center pt-4 overflow-hidden">
            {/* Chữ bùa chú */}
            <div className="writing-vertical-rl text-3xl font-black text-[#451a03] font-mono tracking-[0.5em] opacity-80 border-2 border-[#451a03] p-1">
              敕令封印
            </div>
            {/* Vết rách dưới đáy */}
            <div
              className="absolute bottom-0 left-0 w-full h-6 bg-[#050505]"
              style={{
                clipPath:
                  "polygon(0% 100%, 10% 0%, 20% 100%, 30% 0%, 40% 100%, 50% 0%, 60% 100%, 70% 0%, 80% 100%, 90% 0%, 100% 100%)",
              }}
            ></div>
            {/* Texture giấy */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-40 mix-blend-multiply"></div>
          </div>
        </div>

        {/* --- CARD BODY --- */}
        <div className="relative bg-[#1c1917] border border-[#f59e0b]/30 rounded-xl p-2 shadow-[0_0_100px_rgba(245,158,11,0.2)]">
          {/* Inner Frame */}
          <div className="relative border border-[#f59e0b]/10 rounded-lg bg-[#0c0a09]/95 backdrop-blur-xl p-10 flex flex-col items-center text-center overflow-hidden">
            {/* 4 Góc Hoa Văn */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#f59e0b]/60 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#f59e0b]/60 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#f59e0b]/60 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#f59e0b]/60 rounded-br-xl"></div>

            {/* Lock Icon Animation */}
            <div className="relative mt-6 mb-8 group cursor-not-allowed">
              <div className="absolute inset-0 bg-[#f59e0b]/20 blur-[40px] rounded-full animate-pulse"></div>
              <div className="relative w-32 h-32">
                <Artifacts.RuneCircle className="absolute inset-0 text-[#f59e0b]/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldAlert className="w-12 h-12 text-[#f59e0b] drop-shadow-[0_0_15px_#f59e0b]" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 z-10">
              <h2 className="text-4xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-[#fde68a] to-[#d97706] uppercase font-serif drop-shadow-md">
                Cấm Địa Tông Môn
              </h2>
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent mx-auto"></div>
              <p className="text-[#a8a29e] text-sm leading-relaxed max-w-sm mx-auto font-sans italic">
                Nơi đây lưu trữ bí mật thiên cổ. Phàm nhân khí huyết chưa đủ,
                mạo phạm sẽ bị thiên lôi đánh tan hồn phách.
              </p>
            </div>

            {/* Role Requirement */}
            <div className="mt-8 py-3 px-8 bg-[#451a03]/40 border border-[#78350f] rounded-full flex items-center gap-4 shadow-inner">
              <div className="flex flex-col items-end border-r border-[#78350f] pr-4">
                <span className="text-[10px] text-[#a8a29e] uppercase tracking-wider">
                  Cảnh Giới
                </span>
                <span className="text-xs text-[#f59e0b] font-bold">
                  {currentRole}
                </span>
              </div>
              <div className="flex flex-col items-start pl-2">
                <span className="text-[10px] text-[#a8a29e] uppercase tracking-wider">
                  Yêu Cầu
                </span>
                <div className="flex gap-1 text-xs font-bold text-red-400 animate-pulse">
                  <span>Chí Cường</span> • <span>Thánh Nhân</span> •{" "}
                  <span>Chí Tôn</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-6 w-full mt-10">
              <Link href="/" className="group w-full">
                <button className="w-full py-4 rounded border border-[#a8a29e]/20 text-[#a8a29e] hover:text-[#f59e0b] hover:border-[#f59e0b]/50 transition-all uppercase text-[10px] font-bold tracking-[0.2em] relative overflow-hidden">
                  <span className="relative z-10">Quay Đầu Là Bờ</span>
                  <div className="absolute inset-0 bg-[#f59e0b]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </Link>
              <Link href="/login" className="group w-full">
                <button className="w-full py-4 rounded bg-[#f59e0b] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:brightness-110 transition-all uppercase text-[10px] font-black tracking-[0.2em] relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Đột Phá <Key size={14} />
                  </span>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-[150%] group-hover:animate-[shine_1s_infinite]"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Text */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-30 pointer-events-none">
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#f59e0b] to-transparent"></div>
        <span className="text-[10px] text-[#f59e0b] tracking-[0.5em] uppercase font-mono">
          Forbidden • Zone • Detected
        </span>
      </div>
    </div>
  );
}
