"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 GPU OPTIMIZATION - TỐI ƯU HÓA GPU
// ═══════════════════════════════════════════════════════════════════════════════

const GPU_STYLE: React.CSSProperties = {
  transform: "translate3d(0, 0, 0)",
  backfaceVisibility: "hidden",
  willChange: "transform",
  WebkitFontSmoothing: "antialiased",
  perspective: 1000,
  transformStyle: "preserve-3d",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ MASTER CANVAS - TOÀN BỘ HIỆU ỨNG TRONG 1 CANVAS DUY NHẤT
// ═══════════════════════════════════════════════════════════════════════════════

interface InkSplash {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  alpha: number;
  speed: number;
  life: number;
}

interface SwordSlash {
  angle: number;
  length: number;
  alpha: number;
  life: number;
  maxLife: number;
  delay: number;
  innerR: number;
  color: string;
}

interface CalligraphyStroke {
  points: { x: number; y: number }[];
  alpha: number;
  life: number;
  maxLife: number;
  delay: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  hue: number;
}

const MasterCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const visibleRef = useRef(true);

  // Pre-allocated arrays for GPU efficiency
  const inkSplashesRef = useRef<InkSplash[]>([]);
  const swordSlashesRef = useRef<SwordSlash[]>([]);
  const calligraphyRef = useRef<CalligraphyStroke[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const initEffects = useCallback((w: number, h: number) => {
    const cx = w / 2,
      cy = h / 2;

    // Ink splashes - mực loang
    inkSplashesRef.current = [];
    for (let i = 0; i < 6; i++) {
      inkSplashesRef.current.push({
        x: cx + (Math.random() - 0.5) * w * 0.6,
        y: cy + (Math.random() - 0.5) * h * 0.4,
        size: 0,
        maxSize: 80 + Math.random() * 120,
        alpha: 0.08 + Math.random() * 0.06,
        speed: 0.8 + Math.random() * 0.6,
        life: Math.random() * 200,
      });
    }

    // Sword slashes - kiếm khí
    swordSlashesRef.current = [];
    for (let i = 0; i < 16; i++) {
      swordSlashesRef.current.push({
        angle: (i / 16) * Math.PI * 2,
        length: 100 + Math.random() * 80,
        alpha: 0,
        life: 0,
        maxLife: 120 + Math.random() * 60,
        delay: i * 15 + Math.random() * 30,
        innerR: 50 + Math.random() * 20,
        color: `hsla(${35 + Math.random() * 25}, 70%, 60%,`,
      });
    }

    // Calligraphy strokes - nét bút
    calligraphyRef.current = [];
    const strokeData = [
      [
        { x: -120, y: -80 },
        { x: 120, y: -80 },
      ],
      [
        { x: -100, y: 0 },
        { x: 100, y: 0 },
      ],
      [
        { x: -80, y: 80 },
        { x: 80, y: 80 },
      ],
      [
        { x: -60, y: -100 },
        { x: -60, y: 100 },
      ],
      [
        { x: 60, y: -100 },
        { x: 60, y: 100 },
      ],
      [
        { x: -100, y: -100 },
        { x: 100, y: 100 },
      ],
      [
        { x: 100, y: -100 },
        { x: -100, y: 100 },
      ],
    ];

    strokeData.forEach((points, i) => {
      calligraphyRef.current.push({
        points: points.map((p) => ({ x: cx + p.x, y: cy + p.y })),
        alpha: 0,
        life: 0,
        maxLife: 180 + Math.random() * 60,
        delay: i * 40 + 100,
      });
    });

    // Particles - linh khí
    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 150;
      particlesRef.current.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.2,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.4,
        life: Math.random() * 300,
        hue: 30 + Math.random() * 30,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let w = 0,
      h = 0,
      cx = 0,
      cy = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cx = w / 2;
      cy = h / 2;
      initEffects(w, h);
    };

    const drawInkSplash = (ink: InkSplash) => {
      ink.life += 1;
      if (ink.size < ink.maxSize) {
        ink.size += ink.speed;
      } else {
        ink.alpha *= 0.995;
        if (ink.alpha < 0.01) {
          ink.x = cx + (Math.random() - 0.5) * w * 0.6;
          ink.y = cy + (Math.random() - 0.5) * h * 0.4;
          ink.size = 0;
          ink.alpha = 0.08 + Math.random() * 0.06;
          ink.maxSize = 80 + Math.random() * 120;
        }
      }
      if (ink.size < 1) return;

      const gradient = ctx.createRadialGradient(
        ink.x,
        ink.y,
        0,
        ink.x,
        ink.y,
        ink.size
      );
      gradient.addColorStop(0, `rgba(20, 15, 10, ${ink.alpha})`);
      gradient.addColorStop(0.5, `rgba(30, 25, 18, ${ink.alpha * 0.6})`);
      gradient.addColorStop(1, "rgba(40, 30, 20, 0)");

      ctx.beginPath();
      ctx.arc(ink.x, ink.y, ink.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawSwordSlash = (
      slash: SwordSlash,
      time: number,
      globalTime: number
    ) => {
      if (globalTime < slash.delay) return;
      slash.life += 1;
      const cyclePos = slash.life / slash.maxLife;

      if (cyclePos >= 1) {
        slash.life = 0;
        slash.delay = globalTime + Math.random() * 200;
        return;
      }

      let alpha = 0;
      if (cyclePos < 0.2) alpha = cyclePos / 0.2;
      else if (cyclePos < 0.6) alpha = 1;
      else alpha = 1 - (cyclePos - 0.6) / 0.4;

      const currentAngle = slash.angle + time * 0.02;
      const progress = Math.min(cyclePos * 2, 1);

      const x1 = cx + Math.cos(currentAngle) * slash.innerR;
      const y1 = cy + Math.sin(currentAngle) * slash.innerR;
      const x2 =
        cx + Math.cos(currentAngle) * (slash.innerR + slash.length * progress);
      const y2 =
        cy + Math.sin(currentAngle) * (slash.innerR + slash.length * progress);

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `${slash.color}0)`);
      gradient.addColorStop(0.3, `${slash.color}${alpha * 0.8})`);
      gradient.addColorStop(0.8, `${slash.color}${alpha * 0.6})`);
      gradient.addColorStop(1, `${slash.color}0)`);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      if (progress > 0.5) {
        ctx.beginPath();
        ctx.arc(x2, y2, 3 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `${slash.color}${alpha * 0.6})`;
        ctx.fill();
      }
    };

    const drawCalligraphyStroke = (
      stroke: CalligraphyStroke,
      globalTime: number
    ) => {
      if (globalTime < stroke.delay) return;
      stroke.life += 1;
      const cyclePos = stroke.life / stroke.maxLife;

      if (cyclePos >= 1) {
        stroke.life = 0;
        stroke.delay = globalTime + 200 + Math.random() * 300;
        return;
      }

      let alpha = 0;
      if (cyclePos < 0.15) alpha = cyclePos / 0.15;
      else if (cyclePos < 0.5) alpha = 1;
      else alpha = 1 - (cyclePos - 0.5) / 0.5;

      const progress = Math.min(cyclePos * 3, 1);
      const { points } = stroke;
      if (points.length < 2) return;

      const p1 = points[0];
      const p2 = points[1];
      const currentX = p1.x + (p2.x - p1.x) * progress;
      const currentY = p1.y + (p2.y - p1.y) * progress;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(currentX, currentY);
      ctx.strokeStyle = `rgba(180, 140, 80, ${alpha * 0.3})`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 180, 100, ${alpha * 0.5})`;
      ctx.fill();
    };

    const drawParticle = (p: Particle, time: number) => {
      p.life += 1;
      p.x += p.vx + Math.sin(time * 0.05 + p.life * 0.02) * 0.3;
      p.y += p.vy;

      const pulse = 0.7 + Math.sin(time * 0.1 + p.life * 0.05) * 0.3;

      if (p.y < cy - h * 0.4 || p.alpha < 0.05) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 150;
        p.x = cx + Math.cos(angle) * dist;
        p.y = cy + Math.sin(angle) * dist;
        p.alpha = 0.2 + Math.random() * 0.4;
        p.life = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 60%, 65%, ${p.alpha * pulse})`;
      ctx.fill();
    };

    const drawCentralSeal = (time: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Outer energy rings with gradient
      for (let i = 0; i < 5; i++) {
        const r = 40 + i * 15;
        const rotation = time * 0.04 * (i % 2 === 0 ? 1 : -1);
        const pulse = 0.7 + Math.sin(time * 0.05 + i) * 0.3;

        ctx.save();
        ctx.rotate(rotation);

        // Glowing ring
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(0, 0, r - 5, 0, 0, r + 5);
        gradient.addColorStop(
          0,
          `rgba(255, 215, 100, ${(0.15 - i * 0.02) * pulse})`
        );
        gradient.addColorStop(
          0.5,
          `rgba(255, 230, 120, ${(0.25 - i * 0.03) * pulse})`
        );
        gradient.addColorStop(
          1,
          `rgba(180, 150, 100, ${(0.1 - i * 0.015) * pulse})`
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 - i * 0.2;
        ctx.shadowColor = `rgba(255, 220, 100, ${0.4 * pulse})`;
        ctx.shadowBlur = 8 + i * 2;
        ctx.stroke();

        // Energy dots on ring
        if (i % 2 === 0) {
          for (let j = 0; j < 8; j++) {
            const dotAngle = (j / 8) * Math.PI * 2;
            const dotX = Math.cos(dotAngle) * r;
            const dotY = Math.sin(dotAngle) * r;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 230, 130, ${0.6 * pulse})`;
            ctx.shadowBlur = 10;
            ctx.fill();
          }
        }

        ctx.restore();
      }

      ctx.shadowBlur = 0;

      // Rotating Bagua symbols with enhanced glow
      const bagua = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];
      ctx.save();
      ctx.rotate(time * 0.025);
      bagua.forEach((sym, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 55 + Math.sin(time * 0.1 + i) * 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-time * 0.025);

        const brightness = 0.5 + Math.sin(time * 0.12 + i * 0.5) * 0.4;

        // Glow background
        ctx.shadowColor = `rgba(255, 220, 100, ${brightness * 0.8})`;
        ctx.shadowBlur = 15;
        ctx.font = "14px serif";
        ctx.fillStyle = `rgba(255, ${200 + brightness * 40}, ${
          120 + brightness * 30
        }, ${brightness})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sym, 0, 0);
        ctx.restore();
      });
      ctx.restore();

      // Center "道" character with multi-layer glow
      ctx.save();
      ctx.rotate(time * 0.015);

      // Outer glow layers
      for (let layer = 3; layer > 0; layer--) {
        ctx.font = "bold 32px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255, 220, 100, 0.8)";
        ctx.shadowBlur = 25 * layer;
        ctx.globalAlpha = 0.3 / layer;
        ctx.fillStyle = `rgba(255, 230, 130, ${0.9})`;
        ctx.fillText("道", 0, 0);
      }

      // Main character
      ctx.globalAlpha = 1;
      ctx.font = "bold 32px serif";
      ctx.shadowColor = "rgba(255, 220, 100, 1)";
      ctx.shadowBlur = 20;
      const mainPulse = 0.85 + Math.sin(time * 0.08) * 0.15;
      ctx.fillStyle = `rgba(255, ${230 + mainPulse * 25}, ${
        140 + mainPulse * 20
      }, 1)`;
      ctx.fillText("道", 0, 0);

      // Inner bright core
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(255, 250, 200, ${0.6 + mainPulse * 0.4})`;
      ctx.fillText("道", 0, 0);

      ctx.restore();

      // Center energy core
      const corePulse = 0.6 + Math.sin(time * 0.1) * 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, 6 + corePulse * 2, 0, Math.PI * 2);
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
      coreGradient.addColorStop(0, `rgba(255, 255, 230, ${0.8 * corePulse})`);
      coreGradient.addColorStop(0.5, `rgba(255, 220, 150, ${0.5 * corePulse})`);
      coreGradient.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = coreGradient;
      ctx.shadowColor = "rgba(255, 230, 150, 0.9)";
      ctx.shadowBlur = 20;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const animate = (timestamp: number) => {
      if (!visibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (timestamp - lastFrameRef.current < 16.67) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameRef.current = timestamp;
      timeRef.current += 1;
      const time = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      inkSplashesRef.current.forEach((ink) => drawInkSplash(ink));
      swordSlashesRef.current.forEach((slash) =>
        drawSwordSlash(slash, time, time)
      );
      calligraphyRef.current.forEach((stroke) =>
        drawCalligraphyStroke(stroke, time)
      );
      particlesRef.current.forEach((p) => drawParticle(p, time));
      drawCentralSeal(time);

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
  }, [initEffects]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={GPU_STYLE}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// � FALLING CHINESE CHARACTERS - CHỮ HÁN RƠI
// ═══════════════════════════════════════════════════════════════════════════════

const CHINESE_CHARS = [
  "道",
  "德",
  "仁",
  "義",
  "禮",
  "智",
  "信",
  "忠",
  "孝",
  "悌",
  "天",
  "地",
  "玄",
  "黃",
  "宇",
  "宙",
  "洪",
  "荒",
  "日",
  "月",
  "盈",
  "昃",
  "辰",
  "宿",
  "列",
  "張",
  "寒",
  "來",
  "暑",
  "往",
  "秋",
  "收",
  "冬",
  "藏",
  "閏",
  "餘",
  "成",
  "歲",
  "律",
  "呂",
  "雲",
  "騰",
  "致",
  "雨",
  "露",
  "結",
  "為",
  "霜",
  "金",
  "生",
  "麗",
  "水",
  "玉",
  "出",
  "崑",
  "岡",
  "劍",
  "號",
  "巨",
  "闕",
  "珠",
  "稱",
  "夜",
  "光",
  "果",
  "珍",
  "李",
  "柰",
  "菜",
  "重",
  "芥",
  "薑",
  "海",
  "鹹",
  "河",
  "淡",
  "鱗",
  "潛",
  "羽",
  "翔",
  "龍",
  "師",
  "火",
  "帝",
  "鳥",
  "官",
  "人",
  "皇",
  "始",
  "制",
  "文",
  "字",
  "乃",
  "服",
  "衣",
  "裳",
  "推",
  "位",
  "讓",
  "國",
];

interface FallingChar {
  id: number;
  char: string;
  x: number;
  initialY: number;
  delay: number;
  duration: number;
  blinkDuration: number;
  size: number;
}

const FallingCharacters: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const charsRef = useRef<FallingChar[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    const resize = () => {
      canvas.width = 160;
      canvas.height = window.innerHeight;
    };
    resize();

    // Initialize characters
    const columns = 5;
    const charsPerColumn = 10;
    charsRef.current = [];

    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < charsPerColumn; row++) {
        charsRef.current.push({
          id: col * charsPerColumn + row,
          char: CHINESE_CHARS[Math.floor(Math.random() * CHINESE_CHARS.length)],
          x: 8 + col * 26,
          initialY: -50 - row * 80 - Math.random() * 100,
          delay: row * 0.8 + Math.random() * 2,
          duration: 12 + Math.random() * 8,
          blinkDuration: 1.5 + Math.random() * 2,
          size: 18 + Math.random() * 8,
        });
      }
    }

    let startTime = Date.now();

    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      charsRef.current.forEach((c) => {
        const elapsed = currentTime - c.delay;
        if (elapsed < 0) return;

        // Calculate position
        const progress = (elapsed % c.duration) / c.duration;
        const y = c.initialY + progress * (canvas.height + 200 - c.initialY);

        // Calculate blink
        const blinkProgress = (currentTime % c.blinkDuration) / c.blinkDuration;
        const blinkPhase = Math.sin(blinkProgress * Math.PI * 2);

        // Color based on blink
        const brightness = 215 + blinkPhase * 25;
        const alpha = 0.7 + blinkPhase * 0.3;

        ctx.save();
        ctx.font = `${c.size}px serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Glow effect
        ctx.shadowColor = `rgba(255, ${200 + blinkPhase * 40}, ${
          100 + blinkPhase * 30
        }, ${0.8 + blinkPhase * 0.2})`;
        ctx.shadowBlur = 15 + blinkPhase * 20;
        ctx.fillStyle = `rgba(255, ${brightness}, ${
          120 + blinkPhase * 40
        }, ${alpha})`;

        ctx.fillText(c.char, c.x, y);

        // Extra glow layer
        ctx.shadowBlur = 30 + blinkPhase * 40;
        ctx.globalAlpha = 0.5;
        ctx.fillText(c.char, c.x, y);

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [side]);

  return (
    <div
      className={`absolute top-0 h-full pointer-events-none hidden lg:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ ...GPU_STYLE, zIndex: 5, width: 160 }}
    >
      <canvas
        ref={canvasRef}
        style={{
          ...GPU_STYLE,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// �🏔️ SIDE DECORATIONS - TRANG TRÍ 2 BÊN
// ═══════════════════════════════════════════════════════════════════════════════

const LeftDecoration: React.FC = () => {
  const symbols = ["乾", "坤", "震", "巽", "坎", "離", "艮", "兌"];

  return (
    <div
      className="absolute left-0 top-0 h-full w-32 md:w-48 pointer-events-none z-10 hidden lg:flex flex-col justify-center items-center gap-6"
      style={GPU_STYLE}
    >
      {/* Vertical Line */}
      <motion.div
        className="absolute left-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-amber-700/30 to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* Trigram Symbols */}
      <div className="flex flex-col gap-8 ml-8">
        {symbols.slice(0, 4).map((sym, i) => (
          <motion.div
            key={i}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 + i * 0.2 }}
          >
            <motion.span
              className="text-xl font-serif text-amber-600/30"
              animate={{
                textShadow: [
                  "0 0 5px rgba(200,150,50,0.2)",
                  "0 0 15px rgba(200,150,50,0.4)",
                  "0 0 5px rgba(200,150,50,0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            >
              {sym}
            </motion.span>
            <div className="absolute left-6 top-1/2 w-8 h-px bg-gradient-to-r from-amber-600/20 to-transparent" />
          </motion.div>
        ))}
      </div>

      {/* Floating Orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-l-${i}`}
          className="absolute w-2 h-2 rounded-full bg-amber-500/20"
          style={{ left: 40 + i * 15, top: `${30 + i * 20}%` }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}

      {/* Ancient Scroll Pattern */}
      <motion.div
        className="absolute bottom-20 left-4 w-16 h-32 border border-amber-800/20 rounded-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <div className="absolute inset-2 border border-amber-700/10 rounded-sm" />
        <motion.div
          className="absolute inset-4 flex flex-col gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-px bg-amber-600/15"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const RightDecoration: React.FC = () => {
  const elements = ["金", "木", "水", "火", "土"];

  return (
    <div
      className="absolute right-0 top-0 h-full w-32 md:w-48 pointer-events-none z-10 hidden lg:flex flex-col justify-center items-center gap-6"
      style={GPU_STYLE}
    >
      {/* Vertical Line */}
      <motion.div
        className="absolute right-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-amber-700/30 to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* Five Elements */}
      <div className="flex flex-col gap-10 mr-8">
        {elements.map((elem, i) => (
          <motion.div
            key={i}
            className="relative flex items-center justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 + i * 0.2 }}
          >
            <div className="absolute right-6 top-1/2 w-8 h-px bg-gradient-to-l from-amber-600/20 to-transparent" />
            <motion.span
              className="text-xl font-serif text-amber-600/30"
              animate={{
                textShadow: [
                  "0 0 5px rgba(200,150,50,0.2)",
                  "0 0 15px rgba(200,150,50,0.4)",
                  "0 0 5px rgba(200,150,50,0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.6 }}
            >
              {elem}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Floating Orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-r-${i}`}
          className="absolute w-2 h-2 rounded-full bg-amber-500/20"
          style={{ right: 40 + i * 15, top: `${25 + i * 22}%` }}
          animate={{
            y: [10, -10, 10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 4.5 + i, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}

      {/* Compass/Bagua decoration */}
      <motion.div
        className="absolute top-20 right-4"
        initial={{ opacity: 0, rotate: -45 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 1.5, delay: 1.8 }}
      >
        <div className="w-16 h-16 rounded-full border border-amber-800/25 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-amber-700/20 flex items-center justify-center">
            <motion.span
              className="text-lg text-amber-600/30 font-serif"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              ☯
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Mountain Silhouette */}
      <motion.svg
        className="absolute bottom-16 right-2 w-24 h-20 text-amber-800/10"
        viewBox="0 0 100 60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
      >
        <path
          d="M0 60 L25 20 L40 35 L60 10 L80 30 L100 60 Z"
          fill="currentColor"
        />
        <path
          d="M10 60 L35 30 L50 45 L70 20 L90 50 L95 60 Z"
          fill="currentColor"
          opacity="0.5"
        />
      </motion.svg>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🏯 MAIN CLIENT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ThienCoCacClient() {
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden text-white"
      style={{
        ...GPU_STYLE,
        background:
          "linear-gradient(180deg, #0a0d14 0%, #0d1018 40%, #08090d 100%)",
      }}
    >
      {/* Master Canvas */}
      <MasterCanvas />

      {/* Falling Chinese Characters */}
      <FallingCharacters side="left" />
      <FallingCharacters side="right" />

      {/* Side Decorations */}
      <LeftDecoration />
      <RightDecoration />

      {/* Content Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {/* Top Badge */}
        <motion.div
          className="absolute top-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-900/20 border border-amber-700/30 rounded-full backdrop-blur-sm">
            <span className="text-amber-500/70 text-xs">🔒</span>
            <span className="text-amber-400/60 text-[10px] font-mono tracking-widest">
              至尊專屬
            </span>
            <span className="text-amber-500/70 text-xs">🔒</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <h1
            className="text-6xl md:text-8xl font-black tracking-wider"
            style={{
              fontFamily: "serif",
              background:
                "linear-gradient(180deg, #c9a55a 0%, #8b6914 50%, #4a3810 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            天機閣
          </h1>
          <motion.h2
            className="text-xl md:text-2xl font-bold tracking-[0.4em] text-amber-300/50 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            THIÊN CƠ CÁC
          </motion.h2>
          <motion.p
            className="text-xs text-amber-200/25 tracking-[0.3em] mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            玄之又玄 • 衆妙之門
          </motion.p>
        </motion.div>

        {/* Forbidden Message */}
        <motion.div
          className="text-center max-w-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.span
            className="text-4xl block mb-3"
            animate={{
              filter: [
                "drop-shadow(0 0 10px rgba(200,160,80,0.3))",
                "drop-shadow(0 0 25px rgba(200,160,80,0.5))",
                "drop-shadow(0 0 10px rgba(200,160,80,0.3))",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            ⚔️
          </motion.span>

          <h3 className="text-lg font-bold text-amber-300/70 mb-3 tracking-widest">
            禁地封印
          </h3>

          <p className="text-amber-100/40 text-xs leading-relaxed mb-4">
            Thiên Cơ Các tàng chứa{" "}
            <span className="text-amber-400/70">bí mật tối thượng</span> của
            thiên đạo. Chỉ{" "}
            <span className="text-amber-300/80 font-bold">Chí Tôn</span> mới
            được tiến nhập.
          </p>

          <div className="flex flex-col items-center gap-1 text-[11px]">
            <span className="text-red-400/60">✗ Tu vi hiện tại không đủ</span>
            <span className="text-amber-400/60">
              ⚔ Yêu cầu:{" "}
              <span className="font-bold text-amber-300/70">Chí Tôn</span>
            </span>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.p
          className="text-amber-200/15 text-[10px] italic mt-6 tracking-wide max-w-sm text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          天機不可洩露，道法順乎自然
        </motion.p>

        {/* Button */}
        <motion.div
          className="mt-8 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <Link href="/earn">
            <motion.button
              className="relative px-8 py-3 bg-gradient-to-r from-amber-800/70 via-amber-700/70 to-amber-800/70 rounded-lg text-amber-100 text-sm font-medium border border-amber-600/30 overflow-hidden"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative flex items-center gap-2">
                <span>⚔️</span>
                <span>Tu Luyện Đột Phá</span>
              </span>
            </motion.button>
          </Link>

          <Link href="/" className="block mt-3 text-center">
            <span className="text-[10px] text-amber-500/30 hover:text-amber-400/50 transition-colors">
              🏛️ Về Tông Môn
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 20%, rgba(8,9,13,0.6) 60%, rgba(8,9,13,0.95) 100%)",
        }}
      />

      {/* Bottom Seal */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <div className="w-12 h-12 rounded-full border border-amber-800/30 flex items-center justify-center bg-amber-950/20">
          <span className="text-lg text-amber-700/40 font-serif">道</span>
        </div>
      </motion.div>
    </div>
  );
}
