"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AncientButton } from "../ui/AncientButton";

// ==========================================
// CẤU HÌNH & AVATAR
// ==========================================

// Tông Chủ thay link ảnh avatar vào đây.
// Ảnh 4K, 8K, hay ảnh dọc đều sẽ tự động thu nhỏ vừa khít khung.
const AVATAR_URL = "/250px-Paimon_(YS-MU).webp";

const GAME_CONSTANTS = {
  MIN_BET: 1000,
  MAX_BET: 1000000000,
  GROWTH_RATE: 0.00008,
  MAX_MULTIPLIER: 5000,
};

const TIER_COLORS = {
  1: "#a8a29e", // Phàm
  2: "#3b82f6", // Trúc Cơ
  5: "#8b5cf6", // Kim Đan
  10: "#eab308", // Nguyên Anh
  20: "#f97316", // Hóa Thần
  50: "#ef4444", // Đại Thừa
  100: "#ec4899", // Độ Kiếp
  500: "#ffffff", // Phi Thăng
};

const getTierColor = (mult: number) => {
  if (mult >= 500) return TIER_COLORS[500];
  if (mult >= 100) return TIER_COLORS[100];
  if (mult >= 50) return TIER_COLORS[50];
  if (mult >= 20) return TIER_COLORS[20];
  if (mult >= 10) return TIER_COLORS[10];
  if (mult >= 5) return TIER_COLORS[5];
  if (mult >= 2) return TIER_COLORS[2];
  return TIER_COLORS[1];
};

// ==========================================
// VISUAL ENGINE (CANVAS SYSTEM PROMAX)
// ==========================================

class VisualEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  particles: any[] = [];
  lightnings: any[] = [];
  shockwaves: any[] = [];
  clouds: any[] = [];

  shakeIntensity: number = 0;
  flashIntensity: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.initClouds();
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  initClouds() {
    for (let i = 0; i < 20; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 100 + Math.random() * 200,
        speed: 0.2 + Math.random() * 0.5,
        opacity: 0.05 + Math.random() * 0.05,
      });
    }
  }

  spawnLightning(intensity: number, targetX: number, targetY: number) {
    const startX = Math.random() * this.width;
    const segments = [];
    let currX = startX;
    let currY = 0;
    const steps = 15;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const nextX =
        startX +
        (targetX - startX) * t +
        (Math.random() - 0.5) * (200 * (1 - t));
      const nextY = targetY * t + (Math.random() - 0.5) * 50;
      segments.push({ x: currX, y: currY, nextX, nextY });
      currX = nextX;
      currY = nextY;
    }

    const color = getTierColor(intensity);

    this.lightnings.push({
      segments,
      life: 10,
      width: 3 + Math.min(intensity / 10, 5),
      color: color,
      glow: true,
    });

    this.shakeIntensity = 5 + Math.min(intensity / 5, 15);
    this.flashIntensity = 0.3;
    this.spawnShockwave(targetX, targetY, color);

    for (let k = 0; k < 10; k++) {
      this.particles.push({
        x: targetX,
        y: targetY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        color: color,
        size: 2,
      });
    }
  }

  spawnShockwave(x: number, y: number, color: string) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      opacity: 1,
      color,
    });
  }

  render(multiplier: number, isCrashed: boolean) {
    this.ctx.fillStyle = "#050505";
    this.ctx.fillRect(0, 0, this.width, this.height);

    let shakeX = 0,
      shakeY = 0;
    if (this.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;
    }

    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    this.clouds.forEach((c) => {
      c.y += c.speed;
      if (c.y > this.height + c.radius) c.y = -c.radius;

      const grad = this.ctx.createRadialGradient(
        c.x,
        c.y,
        0,
        c.x,
        c.y,
        c.radius
      );
      grad.addColorStop(0, `rgba(255,255,255,${c.opacity})`);
      grad.addColorStop(1, "transparent");
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    const centerX = this.width / 2;
    const centerY = this.height - 150;
    const currentColor = isCrashed ? "#ef4444" : getTierColor(multiplier);

    if (!isCrashed) {
      const time = Date.now() / 1000;
      this.ctx.strokeStyle = currentColor;
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = currentColor;

      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath();
        const r = 60 + i * 20 + Math.sin(time * (i + 1)) * 5;
        this.ctx.ellipse(
          centerX,
          centerY,
          r,
          r * 0.4,
          time * (i % 2 === 0 ? 1 : -1),
          0,
          Math.PI * 2
        );
        this.ctx.globalAlpha = 0.3 + Math.sin(time * 5) * 0.2;
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1;
      this.ctx.shadowBlur = 0;

      if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 200;
        this.particles.push({
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          vx: -Math.cos(angle) * 8,
          vy: -Math.sin(angle) * 8,
          life: 25,
          color: currentColor,
          size: 2,
          type: "inward",
        });
      }
    }

    if (!isCrashed && Math.random() < 0.02 + multiplier / 300) {
      this.spawnLightning(multiplier, centerX, centerY);
    }

    this.ctx.lineCap = "round";
    for (let i = this.lightnings.length - 1; i >= 0; i--) {
      const l = this.lightnings[i];
      this.ctx.strokeStyle = l.color;
      this.ctx.lineWidth = l.width;
      this.ctx.shadowBlur = 30;
      this.ctx.shadowColor = l.color;
      this.ctx.globalAlpha = l.life / 10;

      this.ctx.beginPath();
      l.segments.forEach((seg: any, idx: number) => {
        if (idx === 0) this.ctx.moveTo(seg.x, seg.y);
        else this.ctx.lineTo(seg.x, seg.y);
      });
      this.ctx.stroke();

      l.life--;
      if (l.life <= 0) this.lightnings.splice(i, 1);
    }
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      this.ctx.strokeStyle = s.color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.4, 0, 0, Math.PI * 2);
      this.ctx.globalAlpha = s.opacity;
      this.ctx.stroke();

      s.radius += 5;
      s.opacity -= 0.05;
      if (s.opacity <= 0) this.shockwaves.splice(i, 1);
    }
    this.ctx.globalAlpha = 1;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / 30;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.ctx.restore();

    if (this.flashIntensity > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.flashIntensity -= 0.05;
    }

    if (isCrashed) {
      this.ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 100 + Math.random() * 20, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}

// ==========================================
// REACT COMPONENT
// ==========================================

interface Props {
  onPlayCost: (amount: number) => void;
  onReward: (amount: number) => void;
  balance: number;
}

export const AscensionGame: React.FC<Props> = ({
  onPlayCost,
  onReward,
  balance,
}) => {
  const [betAmount, setBetAmount] = useState(10000);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<
    "IDLE" | "RUNNING" | "CRASHED" | "SUCCESS"
  >("IDLE");
  const [history, setHistory] = useState<number[]>([]);
  const [profit, setProfit] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VisualEngine | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const engine = new VisualEngine(canvas);
      engine.ctx.scale(dpr, dpr);
      engine.resize(rect.width, rect.height);
      engineRef.current = engine;

      const animate = () => {
        const stateEl = document.getElementById("hidden-game-state");
        const multEl = document.getElementById("hidden-mult-val");

        const isCrashed = stateEl?.innerText === "CRASHED";
        const mult = parseFloat(multEl?.innerText || "1");

        engine.render(mult, isCrashed);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const updateGame = useCallback(() => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;

    const newMult = Math.pow(Math.E, GAME_CONSTANTS.GROWTH_RATE * elapsed);

    setMultiplier(newMult);

    const multEl = document.getElementById("hidden-mult-val");
    if (multEl) multEl.innerText = newMult.toFixed(2);

    if (newMult >= crashPointRef.current) {
      handleCrash(crashPointRef.current);
    } else {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, []);

  const startGame = () => {
    if (balance < betAmount) return;
    onPlayCost(betAmount);
    setGameState("RUNNING");
    setMultiplier(1.0);
    setProfit(0);

    const r = crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);
    let crash = 0.96 / (1 - r);
    if (crash < 1.0) crash = 1.0;
    if (crash > GAME_CONSTANTS.MAX_MULTIPLIER)
      crash = GAME_CONSTANTS.MAX_MULTIPLIER;

    crashPointRef.current = crash;
    startTimeRef.current = Date.now();

    if (engineRef.current) {
      engineRef.current.particles = [];
      engineRef.current.lightnings = [];
      engineRef.current.shockwaves = [];
    }

    const stateEl = document.getElementById("hidden-game-state");
    if (stateEl) stateEl.innerText = "RUNNING";

    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleCrash = (val: number) => {
    setGameState("CRASHED");
    setMultiplier(val);
    setHistory((prev) => [val, ...prev].slice(0, 10));

    const stateEl = document.getElementById("hidden-game-state");
    if (stateEl) stateEl.innerText = "CRASHED";

    if (engineRef.current)
      engineRef.current.spawnShockwave(
        engineRef.current.width / 2,
        engineRef.current.height - 150,
        "#ef4444"
      );
  };

  const handleCashOut = () => {
    if (gameState !== "RUNNING") return;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const win = Math.floor(betAmount * multiplier);
    setProfit(win);
    onReward(win);
    setGameState("SUCCESS");
    setHistory((prev) => [multiplier, ...prev].slice(0, 10));

    const stateEl = document.getElementById("hidden-game-state");
    if (stateEl) stateEl.innerText = "SUCCESS";
  };

  const currentColor = getTierColor(multiplier);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto min-h-[600px] text-white select-none">
      <div className="hidden">
        <span id="hidden-mult-val">1.00</span>
        <span id="hidden-game-state">IDLE</span>
      </div>

      {/* --- GAME AREA --- */}
      <div className="flex-1 relative bg-[#0a0a0a] border-2 border-amber-900/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col group">
        {/* Decorative Borders */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-white/10 rounded-tl-3xl pointer-events-none z-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-white/10 rounded-br-3xl pointer-events-none z-20"></div>

        {/* HUD Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
          <motion.div
            className="relative z-20 text-center"
            // FIX LAG: Key helps React identify animation restart vs update
            key={`hud-${gameState}`}
            animate={
              gameState === "RUNNING"
                ? {
                    scale: [1, 1.01 + multiplier / 500, 1],
                    x: multiplier > 10 ? [-1, 1, -1, 1, 0] : 0,
                  }
                : {}
            }
            transition={{ duration: 0.1 }}
          >
            <div
              className="text-8xl md:text-9xl font-black font-mono tracking-tighter"
              style={{
                color: gameState === "CRASHED" ? "#6b7280" : currentColor,
                textShadow:
                  gameState === "RUNNING"
                    ? `0 0 ${Math.min(20 + multiplier, 50)}px ${currentColor}`
                    : "none",
              }}
            >
              {multiplier.toFixed(2)}x
            </div>

            <AnimatePresence>
              {gameState === "RUNNING" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-amber-400 text-2xl font-bold font-mono mt-2 bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm border border-amber-500/30"
                >
                  {Math.floor(betAmount * multiplier).toLocaleString()} LT
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {gameState === "CRASHED" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-[65%] bg-red-900/80 border border-red-500 text-red-200 px-8 py-3 rounded-xl backdrop-blur-md shadow-[0_0_30px_red]"
              >
                <h2 className="text-2xl font-bold uppercase tracking-widest">
                  Độ Kiếp Thất Bại
                </h2>
                <p className="text-sm font-mono text-center mt-1">
                  Dừng tại {multiplier.toFixed(2)}x
                </p>
              </motion.div>
            )}
            {gameState === "SUCCESS" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-[65%] bg-green-900/80 border border-green-500 text-green-200 px-8 py-3 rounded-xl backdrop-blur-md shadow-[0_0_30px_green]"
              >
                <h2 className="text-2xl font-bold uppercase tracking-widest">
                  Đắc Đạo Thành Công
                </h2>
                <p className="text-xl font-mono text-center mt-1 font-bold text-white">
                  +{profit.toLocaleString()} LT
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0 block"
        />

        {/* =========================================================
            AVATAR CHARACTER (SỬA LẠI THEO YÊU CẦU CỦA BẠN)
            - Dùng thẻ img để load ảnh avatar
            - object-cover: Cắt ảnh vừa khung, không méo, bất chấp 4K
            - Key={gameState}: Khắc phục lỗi giật animation khi Replay
           ========================================================= */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 w-24 h-24 pointer-events-none">
          <motion.div
            // QUAN TRỌNG: Key giúp reset animation mượt mà khi đổi trạng thái game
            key={`avatar-${gameState}`}
            className="w-full h-full relative"
            animate={
              gameState === "RUNNING"
                ? {
                    y: [0, -10, 0],
                    filter: [
                      `drop-shadow(0 0 10px ${currentColor})`,
                      `drop-shadow(0 0 40px ${currentColor})`,
                    ],
                  }
                : gameState === "CRASHED"
                ? { rotate: 90, y: 50, opacity: 0.5 }
                : {}
            }
            transition={{
              duration: gameState === "RUNNING" ? 0.5 : 0.5,
              repeat: gameState === "RUNNING" ? Infinity : 0,
            }}
          >
            {/* Container cho Avatar: Bo tròn, overflow hidden để cắt ảnh thừa */}
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/50 shadow-2xl bg-black">
              <img
                src={AVATAR_URL}
                alt="Cultivator"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hiệu ứng hào quang khi đang chạy */}
            {gameState === "RUNNING" && (
              <div className="absolute inset-0 rounded-full border-2 border-white/80 animate-ping opacity-50"></div>
            )}
          </motion.div>
        </div>

        {/* Live History Bar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2 max-w-[400px] overflow-hidden justify-end">
          <AnimatePresence initial={false}>
            {history.map((h, i) => (
              <motion.div
                key={`${i}-${h}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`px-3 py-1 rounded text-xs font-mono font-bold border backdrop-blur-md shadow-lg
                        ${
                          h >= 10
                            ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-amber-500/20"
                            : h >= 2
                            ? "bg-green-500/20 border-green-500 text-green-400 shadow-green-500/20"
                            : "bg-gray-800/80 border-gray-600 text-gray-400"
                        }
                    `}
              >
                {h.toFixed(2)}x
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-gray-400">
              <span>Linh Thạch Cược</span>
              <span className="text-amber-500 flex items-center gap-1">
                💎 {balance.toLocaleString()}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameState === "RUNNING"}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-xl font-mono font-bold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                <button
                  onClick={() => setBetAmount(Math.floor(betAmount / 2))}
                  disabled={gameState === "RUNNING"}
                  className="px-3 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-400 font-bold"
                >
                  ½
                </button>
                <button
                  onClick={() => setBetAmount(betAmount * 2)}
                  disabled={gameState === "RUNNING"}
                  className="px-3 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-400 font-bold"
                >
                  2x
                </button>
                <button
                  onClick={() => setBetAmount(balance)}
                  disabled={gameState === "RUNNING"}
                  className="px-3 bg-white/5 hover:bg-white/10 rounded text-xs text-amber-500 font-bold"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1000, 10000, 100000, 1000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  disabled={gameState === "RUNNING"}
                  className="py-2 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-lg text-xs font-mono text-gray-400"
                >
                  {amt >= 1000 ? amt / 1000 + "k" : amt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            {gameState === "RUNNING" ? (
              <button
                onClick={handleCashOut}
                className="w-full py-5 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all transform active:scale-95 border border-green-400/50"
              >
                <div className="flex flex-col items-center leading-none gap-1">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-90">
                    Thu Hoạch Ngay
                  </span>
                  <span className="text-3xl font-black font-mono">
                    {(betAmount * multiplier).toLocaleString()}
                  </span>
                </div>
              </button>
            ) : (
              <AncientButton
                onClick={startGame}
                disabled={
                  balance < betAmount ||
                  (gameState === "CRASHED" && multiplier === 0)
                }
                className="w-full py-6 text-xl shadow-[0_0_30px_rgba(245,158,11,0.15)]"
              >
                {gameState === "CRASHED"
                  ? "Hồi Sức & Thử Lại"
                  : "Bắt Đầu Độ Kiếp"}
              </AncientButton>
            )}
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[300px]">
          <h3 className="text-gray-500 font-bold uppercase text-xs mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Nhật Ký Trực Tiếp
          </h3>
          <div className="space-y-2">
            {history.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-4">
                Chưa có dữ liệu độ kiếp...
              </p>
            )}
            {history.map((h, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-2 rounded bg-white/5 border border-white/5"
              >
                <span className="text-gray-400">
                  Độ kiếp #{history.length - i}
                </span>
                <span
                  className={`font-mono font-bold ${
                    h >= 2 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {h.toFixed(2)}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
