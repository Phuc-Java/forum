"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Scroll, Lock, ChevronLeft, Sparkles } from "lucide-react";

// --- COMPONENT: MYSTICAL PARTICLES (LINH KHÍ) ---
const CulturalParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = 60;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
        // Cyan/Emerald mystical colors
        const colors = ["#34d399", "#10b981", "#6ee7b7", "#a7f3d0"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Pulse effect
        this.alpha += (Math.random() - 0.5) * 0.02;
        if (this.alpha < 0.1) this.alpha = 0.1;
        if (this.alpha > 0.6) this.alpha = 0.6;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    init();
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
      className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
    />
  );
};

export default function MessengerAccessDenied() {
  const [glitch, setGlitch] = useState(false);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100 + Math.random() * 200);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0f1c] overflow-hidden flex items-center justify-center font-sans text-slate-200">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#112233] via-[#050914] to-black z-0" />

      {/* Mystical Fog/Clouds - Inline SVG Noise */}
      <div className="absolute inset-0 overflow-hidden mix-blend-overlay opacity-10 pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <CulturalParticles />

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-md p-6 mx-4">
        {/* Border / Frame */}
        <div className="absolute inset-0 border border-emerald-500/20 rounded-xl bg-black/40 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]" />

        {/* Corner Decors (Runes) */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-xl" />

        <div className="relative flex flex-col items-center justify-center text-center space-y-6 pt-8 pb-8 px-4">
          {/* Animated Seal/Icon */}
          <div className="relative mb-4 group">
            {/* Outer Glow Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border border-dashed border-emerald-500/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 rounded-full border border-dotted border-emerald-400/20"
            />

            {/* Center Icon Background */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Lock className="w-10 h-10 text-emerald-500 opacity-80" />
              <Scroll className="w-10 h-10 text-emerald-400 absolute opacity-30 transform scale-110" />
            </div>

            {/* Seal Characters (Tu Tien flavor) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0a0f1c] px-2 text-xs text-emerald-500/70 border border-emerald-900/50 rounded-full tracking-widest uppercase font-serif">
              Phong Ấn
            </div>
          </div>

          {/* Title - With Glitch Effect */}
          <div className="space-y-2">
            <h1
              className={cn(
                "text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-teal-400 to-emerald-200 uppercase tracking-wide",
                glitch && "translate-x-[2px] opacity-80"
              )}
            >
              {glitch ? "₮ⱤɄ₴Ɏề₦ ÂM ₷ⱠỖł" : "Truyền Âm Bị Chặn"}
            </h1>
            <p className="text-emerald-400/60 text-sm font-medium tracking-wider uppercase">
              ⛔ Cảnh Giới Bất Túc ⛔
            </p>
          </div>

          {/* Dividing Line */}
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* Message Content */}
          <div className="space-y-4 max-w-xs mx-auto">
            <p className="text-slate-400 leading-relaxed text-sm">
              Tại hạ thần thức còn yếu, chưa thể dung nhập vào{" "}
              <span className="text-emerald-300 font-semibold">
                Mạng Lưới Thần Niệm
              </span>
              .
            </p>
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg">
              <p className="text-xs text-emerald-200/80">
                Yêu cầu cảnh giới:{" "}
                <span className="text-[#34d399] font-bold text-base ml-1">
                  Phàm Nhân
                </span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                (Hiện tại: Khách vãng lai)
              </p>
            </div>
            <p className="text-slate-500 text-xs">
              Hãy{" "}
              <span className="text-emerald-400/80 hover:text-emerald-300 cursor-pointer transition-colors">
                tu luyện thêm
              </span>{" "}
              (tương tác, bình luận) để đột phá cảnh giới.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 w-full flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="group relative px-6 py-2.5 rounded-lg bg-emerald-900/20 border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-800/20 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 w-0 bg-emerald-500/10 transition-all duration-[250ms] ease-out group-hover:w-full opacity-0 group-hover:opacity-100" />
              <ChevronLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
              <span className="text-emerald-100 font-medium text-sm relative z-10">
                Quay Về
              </span>
            </Link>

            <Link
              href="/events/my-crush"
              className="group relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-transparent shadow-lg shadow-emerald-900/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-50 group-hover:rotate-12 transition-transform" />
              <span className="text-white font-medium text-sm">
                Tìm Cơ Duyên
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="absolute bottom-8 text-center w-full px-4">
        <p className="text-[10px] text-emerald-600/30 font-serif italic max-w-lg mx-auto border-t border-emerald-900/20 pt-4">
          &quot;Đường tu tiên gian nan trắc trở, thần thức chưa thành, chớ vội
          vọng động.&quot;
        </p>
      </div>
    </div>
  );
}
