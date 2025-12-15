"use client";

import React, { memo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimation,
} from "framer-motion";
import { cn } from "@/lib/utils";

// --- TYPES & CONSTANTS ---
const INK_BLOTS = [
  "M10,10 Q30,50 10,90 Q-10,50 10,10",
  "M50,10 Q80,40 50,70 Q20,40 50,10",
  "M20,20 Q60,20 80,60 Q40,90 10,50",
];

// --- ASSETS: SVG ICONS (Style Thủy Mặc) ---
const Icons = {
  BrushStroke: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 200 20"
      className={cn("w-full h-full opacity-80", className)}
      preserveAspectRatio="none"
    >
      <path
        d="M0,10 Q50,0 100,10 T200,10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>
  ),
  YinYang: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2"
        fill="currentColor"
      />
      <circle cx="50" cy="25" r="6" fill="#000" />
      <circle cx="50" cy="75" r="6" fill="currentColor" />
    </svg>
  ),
  Padlock: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M12 2a5 5 0 00-5 5v3H6a3 3 0 00-3 3v8a3 3 0 003 3h12a3 3 0 003-3v-8a3 3 0 00-3-3h-1V7a5 5 0 00-5-5zm-3 5a3 3 0 016 0v3H9V7zm3 10a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// --- COMPONENT: TALISMAN STRIP (LÁ BÙA PHONG ẤN) ---
const TalismanStrip = ({
  text,
  rotate = 0,
  delay = 0,
  className,
}: {
  text: string;
  rotate?: number;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "120%", opacity: 1 }}
      transition={{ duration: 1, delay: delay, ease: "circOut" }}
      className={cn(
        "absolute top-[-10%] w-16 md:w-20 bg-[#e5e5e5] border-x-2 border-neutral-300 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col items-center py-8 overflow-hidden",
        className
      )}
      style={{
        left: "50%",
        x: "-50%",
        rotate: rotate,
        transformOrigin: "top center",
      }}
    >
      {/* Paper Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 mix-blend-multiply"></div>

      {/* Top Symbol */}
      <div className="w-10 h-10 border-4 border-black rounded-full mb-4 flex items-center justify-center font-serif font-bold text-xl relative z-10">
        敕
      </div>

      {/* Rune Text */}
      <div className="flex-1 flex flex-col items-center gap-4 writing-vertical-rl text-2xl md:text-3xl font-black font-serif tracking-[0.5em] text-black drop-shadow-md relative z-10">
        {text.split("").map((char, i) => (
          <span key={i} className="transform rotate-0">
            {char}
          </span>
        ))}
      </div>

      {/* Bottom Pattern */}
      <div className="mt-4 text-black text-4xl opacity-80 relative z-10">☲</div>

      {/* Bottom Paper Tear */}
      <div
        className="absolute bottom-0 left-0 right-0 h-6 bg-transparent"
        style={{
          background:
            "linear-gradient(45deg, transparent 33.333%, #000 33.333%, #000 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #000 33.333%, #000 66.667%, transparent 66.667%)",
          backgroundSize: "20px 40px",
          backgroundPosition: "0 100%",
          filter: "invert(1)", // Make it jagged
        }}
      ></div>
    </motion.div>
  );
};

// --- COMPONENT: INK BACKGROUND (MÀN ĐÊM MỰC TÀU) ---
const InkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const drops: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }[] = [];

    // Tạo mưa mực đen (Black Rain)
    for (let i = 0; i < 150; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 5 + 2,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.fillStyle = "#050505"; // Deep black bg
      ctx.fillRect(0, 0, width, height);

      // Draw drops
      ctx.fillStyle = "#ffffff";
      drops.forEach((d) => {
        d.y += d.speed;
        if (d.y > height) d.y = 0;

        ctx.globalAlpha = d.opacity * 0.2; // Rất mờ
        ctx.beginPath();
        ctx.rect(d.x, d.y, 1, d.size * 5); // Dài như nét bút
        ctx.fill();
      });

      ctx.globalAlpha = 1;
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
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

// --- MAIN COMPONENT ---
export const AccessDeniedOverlay = memo(
  ({ minRole = "Phàm Nhân" }: { minRole?: string }) => {
    // Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] font-serif overflow-hidden perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        {/* === 1. BACKGROUND LAYERS === */}
        <InkBackground />

        {/* Fog/Smoke Image Overlay */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

        {/* Floating Kanji (Trắng mờ) */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none select-none">
          {["禁", "止", "入", "內"].map((char, i) => (
            <motion.div
              key={i}
              className="absolute text-neutral-800/20 font-black text-[20vw] leading-none"
              style={{
                top: "50%",
                left: `${25 * i}%`,
                y: "-50%",
                rotate: Math.random() * 20 - 10,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5 + i, repeat: Infinity }}
            >
              {char}
            </motion.div>
          ))}
        </div>

        {/* === 2. SEALING TALISMANS (BÙA CHÚ PHONG ẤN) === */}
        {/* Left Strip */}
        <TalismanStrip
          text="THIÊN ĐỊA VÔ CỰC"
          rotate={-25}
          delay={0.2}
          className="left-[40%] md:left-[45%]"
        />
        {/* Right Strip */}
        <TalismanStrip
          text="CÀN KHÔN GIỚI PHÁP"
          rotate={25}
          delay={0.4}
          className="left-[60%] md:left-[55%]"
        />

        {/* === 3. MAIN CARD (ĐEN TRẮNG) === */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            rotateX: useSpring(rotateX, { stiffness: 100, damping: 20 }),
            rotateY: useSpring(rotateY, { stiffness: 100, damping: 20 }),
          }}
          className="relative z-30 w-full max-w-[500px] p-6"
        >
          {/* Container Border White */}
          <div className="relative bg-[#0a0a0a] border border-neutral-800 outline outline-1 outline-neutral-900/50 rounded-sm shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden">
            {/* Inner Frame */}
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-neutral-800 pointer-events-none"></div>
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neutral-500"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-neutral-500"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-neutral-500"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neutral-500"></div>

            <div className="p-10 flex flex-col items-center text-center space-y-8 relative z-10">
              {/* Yin Yang Rotating */}
              <div className="relative mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-24 h-24 text-neutral-200 opacity-90"
                >
                  <Icons.YinYang className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                </motion.div>
                {/* Glow behind */}
                <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full"></div>
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 text-neutral-500">
                  <div className="h-[1px] w-12 bg-neutral-700"></div>
                  <span className="text-[10px] tracking-[0.4em] uppercase">
                    Forbidden Area
                  </span>
                  <div className="h-[1px] w-12 bg-neutral-700"></div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase font-serif drop-shadow-lg">
                  Tàng Kinh Các
                </h2>

                <p className="text-neutral-400 text-sm leading-relaxed font-light italic max-w-xs mx-auto">
                  "Vạn pháp quy tông, tâm bất tịnh, chớ động chân kinh."
                </p>
              </div>

              {/* Status Box */}
              <div className="w-full py-4 border-y border-dashed border-neutral-800 bg-neutral-900/50">
                <p className="text-xs text-neutral-500 mb-2 uppercase tracking-widest">
                  Cảnh Giới Yêu Cầu
                </p>
                <div className="text-xl font-bold text-white tracking-wider flex items-center justify-center gap-2">
                  <Icons.Padlock className="w-4 h-4 text-neutral-400" />[
                  {minRole}]
                </div>
              </div>

              {/* Buttons (Black & White Style) */}
              <div className="grid grid-cols-2 gap-4 w-full pt-2">
                <Link href="/" className="w-full">
                  <button className="w-full py-3 px-4 rounded-sm border border-neutral-700 text-neutral-400 hover:text-white hover:border-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest font-mono">
                    Quay Về
                  </button>
                </Link>
                <Link href="/login" className="w-full">
                  <button className="relative w-full py-3 px-4 rounded-sm bg-white text-black hover:bg-neutral-200 transition-all text-xs font-bold uppercase tracking-widest overflow-hidden group/btn font-mono shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Nhập Môn
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Text */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50 select-none">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <span className="text-[10px] text-neutral-500 tracking-[0.5em] uppercase font-mono">
            Archive • Sealed
          </span>
        </div>
      </div>
    );
  }
);

AccessDeniedOverlay.displayName = "AccessDeniedOverlay";
