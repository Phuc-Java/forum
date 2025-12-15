"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- TYPES ---
interface AccessDeniedProps {
  minRole?: string;
  className?: string;
}

// --- ASSETS: SVG ICONS ---
const Icons = {
  Disconnect: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18"
        className="opacity-50"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.121-17.679"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12a3 3 0 11-3-3"
      />
    </svg>
  ),
  Signal: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="2"
        y="10"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        className="animate-[pulse_1s_ease-in-out_infinite]"
      />
      <rect
        x="6"
        y="7"
        width="2"
        height="10"
        rx="1"
        fill="currentColor"
        className="animate-[pulse_1.2s_ease-in-out_infinite_0.1s]"
      />
      <rect
        x="10"
        y="4"
        width="2"
        height="16"
        rx="1"
        fill="currentColor"
        className="animate-[pulse_1.4s_ease-in-out_infinite_0.2s]"
      />
      <rect
        x="14"
        y="7"
        width="2"
        height="10"
        rx="1"
        fill="currentColor"
        className="animate-[pulse_1.2s_ease-in-out_infinite_0.3s]"
      />
      <rect
        x="18"
        y="10"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        className="animate-[pulse_1s_ease-in-out_infinite_0.4s]"
      />
    </svg>
  ),
};

// --- SUB-COMPONENT: NEURAL NETWORK (MẠNG LƯỚI THẦN KINH) ---
const NeuralNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Nodes representing thoughts
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    const maxNodes = 60;
    const connectionDistance = 150;

    for (let i = 0; i < maxNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = 1 - dist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.2})`; // Emerald color
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.5)";
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
      className="absolute inset-0 z-0 pointer-events-none opacity-40"
    />
  );
};

// --- SUB-COMPONENT: AUDIO WAVEFORM (SÓNG ÂM) ---
const AudioWave = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [10, Math.random() * 40 + 10, 10],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
          className="w-1 bg-emerald-400 rounded-full"
        />
      ))}
    </div>
  );
};

// --- MAIN COMPONENT: CHAT ACCESS DENIED ---
export const ChatAccessDenied = ({
  minRole = "Thành Nhân",
  className,
}: AccessDeniedProps) => {
  // Parallax
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

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-[#001010] text-emerald-50 overflow-hidden flex items-center justify-center perspective-1000 font-mono",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* === BACKGROUND === */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-[#001515] to-[#000505]"></div>

      {/* Data Rain / Matrix Hint */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

      <NeuralNetwork />

      {/* === MAIN CARD === */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
        style={{
          rotateX: useSpring(rotateX, { stiffness: 200, damping: 20 }),
          rotateY: useSpring(rotateY, { stiffness: 200, damping: 20 }),
        }}
        className="relative z-30 w-full max-w-[480px] p-4"
      >
        {/* Holographic Frame */}
        <div className="relative bg-[#022c22]/60 backdrop-blur-md border border-emerald-500/30 rounded-lg p-1 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden group">
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#34d399] animate-[scan_3s_linear_infinite] opacity-50"></div>
          <style jsx>{`
            @keyframes scan {
              0% {
                top: 0%;
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                top: 100%;
                opacity: 0;
              }
            }
          `}</style>

          <div className="bg-[#011c16]/90 rounded-md p-8 md:p-10 flex flex-col items-center text-center space-y-6 relative border border-emerald-500/10">
            {/* Header Status */}
            <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-emerald-500/60 uppercase mb-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              Connection_Lost :: Error_403
            </div>

            {/* Main Icon (Signal Lost) */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[ping_2s_linear_infinite]"></div>
              <div className="absolute inset-4 border border-emerald-500/40 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="w-12 h-12 text-emerald-500/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                <Icons.Disconnect />
              </div>
            </div>

            {/* Audio Viz */}
            <AudioWave />

            {/* Text Content */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-emerald-200">
                THẦN THỨC BỊ CHẶN
              </h2>
              <p className="text-emerald-400/60 text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                Tín hiệu tâm linh không thể kết nối. Đạo hữu cần đạt cảnh giới{" "}
                <span className="text-white font-bold border-b border-white/20 pb-0.5">
                  {minRole}
                </span>{" "}
                để đàm đạo với Tiên Nhân.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full pt-4">
              <Link href="/" className="w-full">
                <button className="w-full py-3 px-4 rounded bg-[#064e3b]/30 border border-emerald-500/20 hover:bg-[#064e3b]/50 text-emerald-300 text-xs font-bold tracking-wider transition-colors">
                  NGẮT KẾT NỐI
                </button>
              </Link>
              <Link href="/login" className="w-full">
                <button className="relative w-full py-3 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] group/btn">
                  <span className="flex items-center justify-center gap-2">
                    <Icons.Signal className="w-4 h-4" />
                    NÂNG TU VI
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer System Log */}
      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-emerald-900/40 flex flex-col gap-1 select-none pointer-events-none">
        <div>{`> SYSTEM: ESTABLISHING NEURAL LINK... [FAILED]`}</div>
        <div>{`> ERROR: SPIRIT_FORCE_INSUFFICIENT`}</div>
        <div>{`> TARGET: DIVINE_REALM (ACCESS DENIED)`}</div>
      </div>
    </div>
  );
};
