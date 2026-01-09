// app/music-sanctuary/_components/WelcomeScreen.tsx
// Beautiful, immersive welcome screen with stunning animations

"use client";

import React, { useEffect, useRef, useState, memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Headphones,
  Waves,
  Disc3,
  Play,
  Volume2,
  Sparkles,
} from "lucide-react";

interface WelcomeScreenProps {
  trackCount: number;
  onStart: () => void;
}

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

const AnimatedBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ["#10b981", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      time += 0.005;

      // Clear with fade
      ctx.fillStyle = "rgba(5, 5, 15, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = "rgba(16, 185, 129, 0.03)";
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.globalAlpha = (1 - dist / 150) * 0.15;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // Draw and update particles
      particles.forEach((p) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 3
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, `${p.color}44`);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha =
          p.alpha * (0.5 + Math.sin(time * 2 + p.x * 0.01) * 0.5);
        ctx.fill();
      });

      // Draw aurora waves
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.6);

        for (let x = 0; x <= canvas.width; x += 10) {
          const y =
            canvas.height * 0.6 +
            Math.sin(x * 0.003 + time + i) * 50 +
            Math.sin(x * 0.007 + time * 1.5 + i) * 30;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(
          0,
          canvas.height * 0.5,
          0,
          canvas.height
        );
        gradient.addColorStop(0, colors[i % colors.length]);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
});

AnimatedBackground.displayName = "AnimatedBackground";

// ============================================================================
// FLOATING ICONS
// ============================================================================

const FloatingIcons = memo(() => {
  const icons = useMemo(
    () => [
      { Icon: Music, x: 10, y: 20, delay: 0 },
      { Icon: Headphones, x: 85, y: 15, delay: 0.5 },
      { Icon: Waves, x: 15, y: 75, delay: 1 },
      { Icon: Disc3, x: 80, y: 70, delay: 1.5 },
      { Icon: Sparkles, x: 50, y: 10, delay: 2 },
      { Icon: Volume2, x: 90, y: 45, delay: 2.5 },
    ],
    []
  );

  return (
    <>
      {icons.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/10"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4 + i,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={32 + i * 8} />
        </motion.div>
      ))}
    </>
  );
});

FloatingIcons.displayName = "FloatingIcons";

// ============================================================================
// AUDIO VISUALIZER PREVIEW
// ============================================================================

const VisualizerPreview = memo(() => {
  const bars = 24;

  // Pre-generate random values for stable renders
  const barData = useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => ({
        height: 20 + (Math.sin(i * 1.5) * 0.5 + 0.5) * 40,
        duration: 0.8 + (i % 5) * 0.08,
      })),
    []
  );

  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {barData.map((bar, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-cyan-400"
          initial={{ height: 8 }}
          animate={{
            height: [8, bar.height, 8],
          }}
          transition={{
            duration: bar.duration,
            delay: i * 0.05,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

VisualizerPreview.displayName = "VisualizerPreview";

// ============================================================================
// MAIN WELCOME SCREEN
// ============================================================================

const WelcomeScreen = memo(({ trackCount, onStart }: WelcomeScreenProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#05050f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
    >
      {/* Animated background */}
      <AnimatedBackground />

      {/* Floating icons */}
      <FloatingIcons />

      {/* Gradient orbs that follow mouse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: mousePos.x * 100 - 50,
          y: mousePos.y * 100 - 50,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: mousePos.x * -80 + 40,
          y: mousePos.y * -80 + 40,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center px-8 max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {/* Logo with glow */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {/* Outer rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-cyan-500/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          />

          {/* Main disc */}
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-500 flex items-center justify-center shadow-2xl"
            style={{
              boxShadow:
                "0 0 60px rgba(16, 185, 129, 0.4), 0 0 120px rgba(16, 185, 129, 0.2)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Disc3 className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          className="text-6xl md:text-7xl font-bold mb-4 tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, #fff 0%, #10b981 50%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Music Sanctuary
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-white/50 mb-8 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Không gian âm nhạc đỉnh cao
        </motion.p>

        {/* Visualizer preview */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <VisualizerPreview />
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={onStart}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative px-12 py-5 rounded-full overflow-hidden font-semibold text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Button background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"
            animate={{
              backgroundPosition: isHovered
                ? ["0% 50%", "100% 50%", "0% 50%"]
                : "0% 50%",
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["200% 0", "-200% 0"],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Button content */}
          <span className="relative z-10 flex items-center gap-3 text-white">
            <motion.span
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Play className="w-5 h-5" fill="white" />
            </motion.span>
            Khám Phá Ngay
          </span>
        </motion.button>

        {/* Track count */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-6 text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span>{trackCount} bài hát</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            <span>Chất lượng cao</span>
          </div>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          className="mt-6 text-white/20 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Nhấn{" "}
          <kbd className="px-2 py-1 rounded bg-white/10 text-white/40 mx-1">
            Space
          </kbd>{" "}
          để bắt đầu
        </motion.p>
      </motion.div>
    </motion.div>
  );
});

WelcomeScreen.displayName = "WelcomeScreen";

export default WelcomeScreen;
