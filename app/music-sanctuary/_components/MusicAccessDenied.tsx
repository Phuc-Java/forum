"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  userRole: string;
  requiredRole: string;
  username?: string;
}

// GPU Optimization Styles
const GPU_STYLE: React.CSSProperties = {
  transform: "translateZ(0)",
  backfaceVisibility: "hidden",
  willChange: "transform",
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📜 TALISMAN BACKGROUND - LÁ BÙA NỀN (GPU Canvas)
// ═══════════════════════════════════════════════════════════════════════════════

// Màu sắc đa dạng cho lá bùa
interface TalismanColor {
  glow: string;
  paper: [string, string, string];
  border: string;
  borderInner: string;
  char: string;
  shadowColor: string;
  accent: string;
}

const TALISMAN_COLORS: TalismanColor[] = [
  {
    // Đỏ - Hỏa
    glow: "220, 38, 38",
    paper: ["50, 20, 20", "70, 25, 25", "50, 20, 20"],
    border: "200, 100, 80",
    borderInner: "240, 150, 100",
    char: "255, 80, 60",
    shadowColor: "rgba(255, 50, 50, 0.9)",
    accent: "220, 120, 80",
  },
  {
    // Xanh dương - Thủy
    glow: "59, 130, 246",
    paper: ["20, 30, 50", "25, 40, 70", "20, 30, 50"],
    border: "80, 140, 220",
    borderInner: "120, 180, 255",
    char: "100, 180, 255",
    shadowColor: "rgba(50, 150, 255, 0.9)",
    accent: "80, 160, 240",
  },
  {
    // Xanh lá - Mộc
    glow: "34, 197, 94",
    paper: ["20, 40, 25", "25, 55, 30", "20, 40, 25"],
    border: "80, 180, 100",
    borderInner: "120, 220, 140",
    char: "80, 220, 120",
    shadowColor: "rgba(50, 200, 100, 0.9)",
    accent: "100, 200, 120",
  },
  {
    // Vàng - Thổ
    glow: "234, 179, 8",
    paper: ["45, 35, 15", "60, 45, 20", "45, 35, 15"],
    border: "220, 180, 80",
    borderInner: "255, 210, 100",
    char: "255, 200, 50",
    shadowColor: "rgba(255, 200, 50, 0.9)",
    accent: "240, 190, 80",
  },
  {
    // Tím - Huyền
    glow: "168, 85, 247",
    paper: ["35, 20, 50", "50, 25, 70", "35, 20, 50"],
    border: "160, 100, 220",
    borderInner: "200, 140, 255",
    char: "180, 120, 255",
    shadowColor: "rgba(150, 100, 255, 0.9)",
    accent: "180, 130, 240",
  },
  {
    // Cam - Liệt Hỏa
    glow: "249, 115, 22",
    paper: ["50, 30, 15", "70, 40, 20", "50, 30, 15"],
    border: "240, 140, 60",
    borderInner: "255, 180, 100",
    char: "255, 150, 50",
    shadowColor: "rgba(255, 130, 50, 0.9)",
    accent: "250, 160, 80",
  },
  {
    // Hồng - Đào Hoa
    glow: "236, 72, 153",
    paper: ["50, 20, 35", "70, 25, 45", "50, 20, 35"],
    border: "240, 100, 160",
    borderInner: "255, 150, 200",
    char: "255, 120, 180",
    shadowColor: "rgba(255, 100, 170, 0.9)",
    accent: "250, 130, 180",
  },
  {
    // Trắng bạc - Kim
    glow: "200, 200, 220",
    paper: ["40, 40, 50", "55, 55, 65", "40, 40, 50"],
    border: "180, 180, 200",
    borderInner: "220, 220, 240",
    char: "230, 230, 250",
    shadowColor: "rgba(220, 220, 255, 0.9)",
    accent: "200, 200, 230",
  },
];

interface Talisman {
  x: number;
  y: number;
  char: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  floatOffset: number;
  floatSpeed: number;
  opacity: number;
  colorIndex: number;
  velocityX: number;
  velocityY: number;
  // Lifecycle - xuất hiện và tan biến
  life: number; // Tuổi thọ hiện tại (0 -> maxLife)
  maxLife: number; // Tuổi thọ tối đa
  fadeIn: number; // Thời gian fade in
  fadeOut: number; // Thời gian fade out
  spawned: boolean; // Đã spawn chưa
}

const TALISMAN_CHARS = [
  "封",
  "禁",
  "護",
  "靈",
  "道",
  "法",
  "陣",
  "界",
  "天",
  "地",
  "玄",
  "黃",
  "陰",
  "陽",
  "氣",
  "神",
];

const TalismanBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const talismansRef = useRef<Talisman[]>([]);
  const lastFrameRef = useRef(0);
  const visibleRef = useRef(true);
  const canvasSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const createTalisman = (delay = 0): Talisman => ({
      x: Math.random() * canvasSize.current.w,
      y: Math.random() * canvasSize.current.h,
      char: TALISMAN_CHARS[Math.floor(Math.random() * TALISMAN_CHARS.length)],
      size: 55 + Math.random() * 50,
      rotation: (Math.random() - 0.5) * 0.5,
      rotationSpeed: (Math.random() - 0.5) * 0.004,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.15 + Math.random() * 0.35,
      opacity: 0.25 + Math.random() * 0.3,
      colorIndex: Math.floor(Math.random() * TALISMAN_COLORS.length),
      velocityX: (Math.random() - 0.5) * 0.4,
      velocityY: (Math.random() - 0.5) * 0.3 - 0.15,
      life: -delay, // Delay spawn
      maxLife: 180 + Math.random() * 240, // 3-7 giây @ 60fps
      fadeIn: 30 + Math.random() * 30, // 0.5-1s fade in
      fadeOut: 40 + Math.random() * 40, // 0.7-1.3s fade out
      spawned: delay === 0,
    });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvasSize.current = { w: canvas.width, h: canvas.height };

      // Khởi tạo ban đầu với delay ngẫu nhiên
      talismansRef.current = [];
      const count = 18;
      for (let i = 0; i < count; i++) {
        talismansRef.current.push(createTalisman(i * 8)); // Stagger spawn
      }
    };

    const drawTalisman = (t: Talisman, time: number): boolean => {
      // Chưa spawn
      if (t.life < 0) {
        t.life += 1;
        return true;
      }

      t.life += 1;
      t.spawned = true;

      // Tính lifecycle opacity
      let lifecycleOpacity = 1;
      if (t.life < t.fadeIn) {
        // Fade in
        lifecycleOpacity = t.life / t.fadeIn;
      } else if (t.life > t.maxLife - t.fadeOut) {
        // Fade out
        lifecycleOpacity = (t.maxLife - t.life) / t.fadeOut;
      }

      // Hết tuổi thọ - cần respawn
      if (t.life >= t.maxLife) {
        return false;
      }

      // Di chuyển
      t.x += t.velocityX;
      t.y += t.velocityY;
      t.rotation += t.rotationSpeed;

      const color = TALISMAN_COLORS[t.colorIndex];
      const floatY = Math.sin(time * t.floatSpeed + t.floatOffset) * 15;
      const floatX = Math.cos(time * t.floatSpeed * 0.7 + t.floatOffset) * 8;
      const currentRotation =
        t.rotation + Math.sin(time * 0.5 + t.floatOffset) * 0.1;
      const pulseOpacity =
        t.opacity *
        lifecycleOpacity *
        (0.6 + Math.sin(time * 1.5 + t.floatOffset) * 0.4);

      // Skip nếu quá trong suốt
      if (pulseOpacity < 0.02) return true;

      ctx.save();
      ctx.translate(t.x + floatX, t.y + floatY);
      ctx.rotate(currentRotation);

      const w = t.size * 0.5;
      const h = t.size * 1.2;

      // Outer glow - theo màu
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, h);
      glowGradient.addColorStop(
        0,
        `rgba(${color.glow}, ${pulseOpacity * 0.5})`
      );
      glowGradient.addColorStop(1, `rgba(${color.glow}, 0)`);
      ctx.beginPath();
      ctx.arc(0, 0, h, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Talisman paper background
      const paperGradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      paperGradient.addColorStop(0, `rgba(${color.paper[0]}, ${pulseOpacity})`);
      paperGradient.addColorStop(
        0.5,
        `rgba(${color.paper[1]}, ${pulseOpacity})`
      );
      paperGradient.addColorStop(1, `rgba(${color.paper[2]}, ${pulseOpacity})`);

      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.fillStyle = paperGradient;
      ctx.fill();

      // Border - double line
      ctx.strokeStyle = `rgba(${color.border}, ${pulseOpacity * 0.9})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${color.borderInner}, ${pulseOpacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 2);
      ctx.stroke();

      // Top decoration lines
      ctx.strokeStyle = `rgba(${color.accent}, ${pulseOpacity * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w / 4, -h / 2 + 12);
      ctx.lineTo(w / 4, -h / 2 + 12);
      ctx.stroke();

      // Sacred symbol circles at top
      ctx.beginPath();
      ctx.arc(0, -h / 2 + 18, 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color.char}, ${pulseOpacity * 0.8})`;
      ctx.stroke();

      // Main character
      ctx.font = `bold ${t.size * 0.35}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Character shadow/glow
      ctx.shadowColor = color.shadowColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(${color.char}, ${pulseOpacity * 1.5})`;
      ctx.fillText(t.char, 0, 5);
      ctx.shadowBlur = 0;

      // Bottom decoration
      ctx.strokeStyle = `rgba(${color.accent}, ${pulseOpacity * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(-w / 4, h / 2 - 12);
      ctx.lineTo(w / 4, h / 2 - 12);
      ctx.stroke();

      // Corner dots
      const dotPositions = [
        [-w / 2 + 8, -h / 2 + 8],
        [w / 2 - 8, -h / 2 + 8],
        [-w / 2 + 8, h / 2 - 8],
        [w / 2 - 8, h / 2 - 8],
      ];
      ctx.fillStyle = `rgba(${color.accent}, ${pulseOpacity * 0.7})`;
      dotPositions.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      return true;
    };

    const animate = (timestamp: number) => {
      if (!visibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Frame limiting to 30fps for background (GPU optimization)
      if (timestamp - lastFrameRef.current < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameRef.current = timestamp;

      timeRef.current += 0.025;
      const time = timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update và respawn talismans
      talismansRef.current = talismansRef.current.map((t) => {
        const alive = drawTalisman(t, time);
        if (!alive) {
          // Respawn ở vị trí mới với màu mới
          return createTalisman(Math.random() * 30);
        }
        return t;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      visibleRef.current = !document.hidden;
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ ...GPU_STYLE, opacity: 0.9 }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🌙 CULTIVATION SEAL - MẶT TRĂNG (góc phải trên)
// ═══════════════════════════════════════════════════════════════════════════════

const MoonSeal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;

    const runeChars = ["道", "法", "天", "地", "陰", "陽", "氣", "靈"];

    const animate = () => {
      timeRef.current += 0.015;
      const time = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        center,
        center,
        15,
        center,
        center,
        60
      );
      glowGradient.addColorStop(
        0,
        `rgba(59, 130, 246, ${0.2 + Math.sin(time) * 0.1})`
      );
      glowGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.beginPath();
      ctx.arc(center, center, 60, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Rotating rings with runes
      for (let ring = 0; ring < 2; ring++) {
        const radius = 35 + ring * 12;
        const rotation = time * (0.3 + ring * 0.15) * (ring % 2 === 0 ? 1 : -1);

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${
          0.25 + Math.sin(time + ring) * 0.1
        })`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const runeCount = 4 + ring * 2;
        for (let i = 0; i < runeCount; i++) {
          const angle = (i / runeCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-rotation);
          ctx.font = `${9 + ring}px serif`;
          ctx.fillStyle = `rgba(147, 197, 253, ${
            0.5 + Math.sin(time * 2 + i) * 0.3
          })`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(runeChars[(i + ring * 2) % runeChars.length], 0, 0);
          ctx.restore();
        }

        ctx.restore();
      }

      // Central Yin-Yang
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(time * 0.4);

      const yinYangRadius = 18;
      ctx.beginPath();
      ctx.arc(0, 0, yinYangRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fill();
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + Math.sin(time) * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, yinYangRadius, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(
        0,
        -yinYangRadius / 2,
        yinYangRadius / 2,
        Math.PI * 1.5,
        Math.PI * 0.5,
        true
      );
      ctx.arc(
        0,
        yinYangRadius / 2,
        yinYangRadius / 2,
        Math.PI * 1.5,
        Math.PI * 0.5
      );
      ctx.fillStyle = "#1e3a5f";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, yinYangRadius, Math.PI * 1.5, Math.PI * 0.5);
      ctx.arc(
        0,
        yinYangRadius / 2,
        yinYangRadius / 2,
        Math.PI * 0.5,
        Math.PI * 1.5,
        true
      );
      ctx.arc(
        0,
        -yinYangRadius / 2,
        yinYangRadius / 2,
        Math.PI * 0.5,
        Math.PI * 1.5
      );
      ctx.fillStyle = "#3b82f6";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -yinYangRadius / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, yinYangRadius / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#1e3a5f";
      ctx.fill();

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[120px] h-[120px]"
      style={{
        ...GPU_STYLE,
        filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))",
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ☀️ SACRED BAGUA - BÁT QUÁI TRUNG TÂM (màu đỏ)
// ═══════════════════════════════════════════════════════════════════════════════

const SacredBagua: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;

    const baguaChars = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];
    const sealChars = ["封", "禁", "護", "靈", "道", "法", "陣", "界"];

    const animate = () => {
      timeRef.current += 0.008;
      const time = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      // Outer mystical glow
      const glowGradient = ctx.createRadialGradient(
        center,
        center,
        50,
        center,
        center,
        200
      );
      glowGradient.addColorStop(
        0,
        `rgba(220, 38, 38, ${0.15 + Math.sin(time) * 0.08})`
      );
      glowGradient.addColorStop(
        0.5,
        `rgba(239, 68, 68, ${0.08 + Math.sin(time * 1.5) * 0.05})`
      );
      glowGradient.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.beginPath();
      ctx.arc(center, center, 200, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Multiple rotating sacred geometry rings
      for (let ring = 0; ring < 5; ring++) {
        const radius = 60 + ring * 30;
        const rotation =
          time * (0.08 + ring * 0.03) * (ring % 2 === 0 ? 1 : -1);
        const sides = 8 + ring * 4;

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation);

        // Polygon ring
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(239, 68, 68, ${
          0.12 + ring * 0.03 + Math.sin(time + ring) * 0.05
        })`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Runes on outer rings
        if (ring >= 2 && ring <= 4) {
          const chars = ring === 2 ? baguaChars : sealChars;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-rotation);
            ctx.font = `${12 + ring * 2}px serif`;
            ctx.fillStyle = `rgba(252, 165, 165, ${
              0.4 + Math.sin(time * 2 + i) * 0.3
            })`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(chars[i % chars.length], 0, 0);
            ctx.restore();
          }
        }

        ctx.restore();
      }

      // Inner energy lines
      ctx.save();
      ctx.translate(center, center);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.15;
        const length = 100 + Math.sin(time * 2 + i) * 20;

        const gradient = ctx.createLinearGradient(
          0,
          0,
          Math.cos(angle) * length,
          Math.sin(angle) * length
        );
        gradient.addColorStop(
          0,
          `rgba(239, 68, 68, ${0.6 + Math.sin(time * 3) * 0.2})`
        );
        gradient.addColorStop(0.5, "rgba(251, 146, 60, 0.3)");
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)");

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // Central forbidden seal
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(-time * 0.2);

      // Outer seal ring
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 + Math.sin(time * 2) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner seal ring
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.5 + Math.cos(time * 2) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center forbidden character
      ctx.rotate(time * 0.4);
      ctx.font = "bold 40px serif";
      ctx.fillStyle = `rgba(239, 68, 68, ${0.8 + Math.sin(time * 3) * 0.2})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("禁", 0, 0);

      ctx.restore();

      // Floating spirit particles
      for (let i = 0; i < 20; i++) {
        const t = time + i * 0.5;
        const angle = (i / 20) * Math.PI * 2 + t * 0.2;
        const radius = 80 + (i % 4) * 25 + Math.sin(t * 2) * 10;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const particleSize = 1.5 + (i % 3);

        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 165, 165, ${0.3 + Math.sin(t * 3) * 0.2})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[400px] h-[400px]"
      style={{
        ...GPU_STYLE,
        filter: "drop-shadow(0 0 40px rgba(239, 68, 68, 0.3))",
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎋 FLOATING TALISMANS - PHÙ LỤC BAY
// ═══════════════════════════════════════════════════════════════════════════════

const TALISMAN_POSITIONS = [
  { char: "封", x: 5, y: 20, delay: 0 },
  { char: "禁", x: 90, y: 15, delay: 0.5 },
  { char: "護", x: 8, y: 70, delay: 1 },
  { char: "靈", x: 88, y: 75, delay: 1.5 },
  { char: "道", x: 15, y: 45, delay: 2 },
  { char: "法", x: 82, y: 50, delay: 2.5 },
];

const FloatingTalisman: React.FC<{
  char: string;
  x: number;
  y: number;
  delay: number;
}> = ({ char, x, y, delay }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0.4, 0.6, 0],
      scale: [0.8, 1, 0.95, 1, 0.8],
      y: [0, -15, -5, -20, -40],
      rotate: [0, 5, -5, 3, 0],
    }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="px-2 py-3 rounded border border-red-500/30 bg-red-900/10">
      <span
        className="text-xl font-bold text-red-400/70"
        style={{ textShadow: "0 0 8px rgba(239,68,68,0.5)" }}
      >
        {char}
      </span>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 🌌 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function MusicAccessDenied({ username }: Props) {
  return (
    <div
      className="relative h-screen w-full bg-slate-950 text-white overflow-hidden"
      style={GPU_STYLE}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-red-950/10 to-slate-950" />

      {/* Talisman Background - GPU Canvas */}
      <TalismanBackground />

      {/* Extra floating talismans with motion */}
      {TALISMAN_POSITIONS.slice(0, 4).map((t, i) => (
        <FloatingTalisman
          key={i}
          char={t.char}
          x={t.x}
          y={t.y}
          delay={t.delay}
        />
      ))}

      {/* Moon Seal - góc phải trên */}
      <motion.div
        className="absolute top-20 right-8 z-20"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <MoonSeal />
        <p className="text-center text-[10px] text-blue-400/50 mt-1">
          Nguyệt Luân
        </p>
      </motion.div>

      {/* Central Bagua */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <SacredBagua />
        </motion.div>
      </div>

      {/* Main Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {/* Title */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-400 mb-2">
            ⚔️ KẾT GIỚI CẤM ĐỊA ⚔️
          </h1>
          <p className="text-red-300/60 text-sm tracking-widest">
            LINH ÂM ĐÀI • THÁNH ĐỊA CẤM NHẬP
          </p>
        </motion.div>

        {/* Requirement Text */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-lg text-red-200/80 mb-2">
            Chỉ <span className="text-violet-400 font-bold">Chí Cường Giả</span>{" "}
            trở lên
          </p>
          <p className="text-sm text-red-300/50">
            mới được bước vào lắng nghe Linh Âm
          </p>
        </motion.div>

        {/* User Status */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <p className="text-xs text-slate-500 mb-1">Đạo hữu</p>
          <p className="text-base text-slate-300">
            {username || "Vô Danh Thị"}
          </p>
          <p className="text-xs text-red-400/60 mt-1">
            Tu vi chưa đủ • Cần đột phá
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          className="mt-10 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Link href="/earn">
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-lg font-medium text-sm shadow-lg shadow-red-500/30 border border-red-500/30"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(239,68,68,0.5)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              ⚔️ Tu Luyện Đột Phá Cảnh Giới
            </motion.button>
          </Link>

          <div className="flex justify-center gap-4 mt-4">
            <Link href="/">
              <motion.span
                className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                🏠 Về Tông Môn
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(2,6,23,0.6) 70%, rgba(2,6,23,0.95) 100%)",
        }}
      />

      {/* Bottom decoration text */}
      <motion.p
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        道法自然 • 順天而行 • 逆天改命
      </motion.p>
    </div>
  );
}
