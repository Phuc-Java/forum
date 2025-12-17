"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AncientButton } from "../ui/AncientButton";

// ==========================================
// PHẦN 1: CẤU HÌNH & DỮ LIỆU (CONSTANTS)
// ==========================================

// Màu sắc & Cấu hình từng hệ
const ELEMENTS_CONFIG = {
  0: {
    // KIM
    id: 0,
    name: "Kim",
    icon: "⚔️",
    color: "#eab308", // Yellow-500
    glow: "#fef08a", // Yellow-200
    desc: "Sắc bén, cương mãnh.",
    particleType: "SPARK",
  },
  1: {
    // MỘC
    id: 1,
    name: "Mộc",
    icon: "🌿",
    color: "#22c55e", // Green-500
    glow: "#86efac", // Green-300
    desc: "Sinh sôi, bền bỉ.",
    particleType: "LEAF",
  },
  2: {
    // THỔ
    id: 2,
    name: "Thổ",
    icon: "🏔️",
    color: "#a16207", // Yellow-800 (Brown)
    glow: "#d97706", // Amber-600
    desc: "Vững chãi, hộ thân.",
    particleType: "ROCK",
  },
  3: {
    // THỦY
    id: 3,
    name: "Thủy",
    icon: "💧",
    color: "#3b82f6", // Blue-500
    glow: "#93c5fd", // Blue-300
    desc: "Nhu hòa, khó lường.",
    particleType: "BUBBLE",
  },
  4: {
    // HỎA
    id: 4,
    name: "Hỏa",
    icon: "🔥",
    color: "#ef4444", // Red-500
    glow: "#fca5a5", // Red-300
    desc: "Bùng nổ, hủy diệt.",
    particleType: "FIRE",
  },
};

const BET_AMOUNTS = [1000, 5000, 10000, 50000, 100000];

// ==========================================
// PHẦN 2: ENGINE VẬT LÝ HẠT (PHYSICS ENGINE)
// ==========================================

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: string;
  rotation: number;
  rotSpeed: number;
  opacity: number;

  constructor(
    x: number,
    y: number,
    type: string,
    color: string,
    velocityScale: number = 1
  ) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.life = 60 + Math.random() * 40;
    this.maxLife = this.life;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
    this.opacity = 1;

    switch (type) {
      case "FIRE":
        this.vx = (Math.random() - 0.5) * 3 * velocityScale;
        this.vy = -(Math.random() * 5 + 2) * velocityScale;
        this.size = Math.random() * 6 + 2;
        break;
      case "BUBBLE":
        this.vx = (Math.random() - 0.5) * 2 * velocityScale;
        this.vy = -(Math.random() * 3 + 1) * velocityScale;
        this.size = Math.random() * 5 + 1;
        break;
      case "LEAF":
        this.vx = (Math.random() - 0.5) * 4 * velocityScale;
        this.vy = (Math.random() * 2 - 1) * velocityScale;
        this.size = Math.random() * 5 + 3;
        this.rotSpeed = (Math.random() - 0.5) * 0.5;
        break;
      case "SPARK":
        this.vx = (Math.random() - 0.5) * 10 * velocityScale;
        this.vy = (Math.random() - 0.5) * 10 * velocityScale;
        this.life = 20 + Math.random() * 20;
        this.size = Math.random() * 3 + 1;
        break;
      case "ROCK":
        this.vx = (Math.random() - 0.5) * 5 * velocityScale;
        this.vy = Math.random() * -5 * velocityScale;
        this.size = Math.random() * 8 + 4;
        this.life = 80 + Math.random() * 40;
        break;
      default:
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 2;
    }
  }

  update(gravity: number = 0.1) {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.rotation += this.rotSpeed;

    if (this.type === "ROCK") {
      this.vy += 0.3;
    } else if (this.type === "FIRE") {
      this.size *= 0.95;
      this.vy *= 0.98;
    } else if (this.type === "LEAF") {
      this.x += Math.sin(this.life / 10);
      this.vy += 0.02;
    } else if (this.type === "SPARK") {
      this.vx *= 0.9;
      this.vy *= 0.9;
    }

    this.opacity = this.life / this.maxLife;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    if (this.type === "FIRE") {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "SPARK") {
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size / 2, 0);
      ctx.lineTo(0, this.size);
      ctx.lineTo(-this.size / 2, 0);
      ctx.fill();
    } else if (this.type === "LEAF") {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "BUBBLE") {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

class VisualEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  particles: Particle[] = [];
  energyBalls: any[] = [];
  shockwaves: any[] = [];

  bgParticles: Particle[] = [];
  bgOpacity: number = 0;
  targetBgColor: string = "#050505";

  shakeIntensity: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  setAtmosphere(elementId: number | null) {
    if (elementId === null) {
      this.targetBgColor = "#050505";
      this.bgOpacity = 0;
      return;
    }

    const config = ELEMENTS_CONFIG[elementId as keyof typeof ELEMENTS_CONFIG];
    this.targetBgColor = config.color;
    this.bgOpacity = 0.2;

    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;

      let pType = config.particleType;
      let pColor = config.glow;
      let speedScale = 0.5;

      if (config.id === 2) {
        pType = "ROCK";
        speedScale = 0.2;
      } else if (config.id === 3) {
        pType = "BUBBLE";
      }

      const p = new Particle(x, y, pType, pColor, speedScale);
      p.life = 100 + Math.random() * 100;
      p.opacity = 0.3;
      this.bgParticles.push(p);
    }
  }

  spawnAura(x: number, y: number, elementId: number) {
    const config = ELEMENTS_CONFIG[elementId as keyof typeof ELEMENTS_CONFIG];
    const count = 3;
    for (let i = 0; i < count; i++) {
      const p = new Particle(
        x + (Math.random() - 0.5) * 100,
        y + (Math.random() - 0.5) * 100,
        config.particleType,
        config.glow,
        0.5
      );
      p.vy = -Math.abs(p.vy);
      this.particles.push(p);
    }
  }

  spawnClash(x: number, y: number, winnerId: number, loserId: number) {
    const winConfig = ELEMENTS_CONFIG[winnerId as keyof typeof ELEMENTS_CONFIG];
    const loseConfig = ELEMENTS_CONFIG[loserId as keyof typeof ELEMENTS_CONFIG];

    for (let i = 0; i < 100; i++) {
      this.particles.push(
        new Particle(x, y, winConfig.particleType, winConfig.color, 3)
      );
    }
    for (let i = 0; i < 50; i++) {
      this.particles.push(
        new Particle(x, y, loseConfig.particleType, loseConfig.color, 2)
      );
    }

    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 300,
      color: winConfig.glow,
      opacity: 1,
    });

    this.shakeIntensity = 20;
  }

  spawnDraw(x: number, y: number) {
    for (let i = 0; i < 80; i++) {
      this.particles.push(new Particle(x, y, "SPARK", "#ffffff", 2));
    }
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 200,
      color: "#ffffff",
      opacity: 0.8,
    });
    this.shakeIntensity = 10;
  }

  render(
    playerChoice: number | null,
    aiChoice: number | null,
    isFighting: boolean,
    phase: number
  ) {
    this.ctx.fillStyle = "#050505";
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (this.bgOpacity > 0 && playerChoice !== null) {
      this.ctx.fillStyle = this.targetBgColor;
      this.ctx.globalAlpha = this.bgOpacity * 0.5;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalAlpha = 1;
    }

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

    for (let i = this.bgParticles.length - 1; i >= 0; i--) {
      const p = this.bgParticles[i];
      p.update();
      p.draw(this.ctx);
      if (p.life <= 0) this.bgParticles.splice(i, 1);
    }

    if (isFighting && playerChoice !== null) {
      this.setAtmosphere(playerChoice);
    } else {
      if (this.bgParticles.length > 0 && Math.random() < 0.1)
        this.bgParticles.pop();
      this.setAtmosphere(null);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(this.ctx);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = s.color;
      this.ctx.lineWidth = 5;
      this.ctx.globalAlpha = s.opacity;
      this.ctx.stroke();
      s.radius += 10;
      s.opacity *= 0.9;
      if (s.opacity < 0.01) this.shockwaves.splice(i, 1);
      this.ctx.globalAlpha = 1;
    }

    if (isFighting && playerChoice !== null) {
      if (Math.random() < 0.8) {
        this.spawnAura(this.width * 0.2, this.height * 0.5, playerChoice);
        if (aiChoice !== null)
          this.spawnAura(this.width * 0.8, this.height * 0.5, aiChoice);
        else {
          const p = new Particle(
            this.width * 0.8 + (Math.random() - 0.5) * 50,
            this.height * 0.5 + (Math.random() - 0.5) * 50,
            "SPARK",
            "#333",
            0.5
          );
          this.particles.push(p);
        }
      }
    }

    this.ctx.restore();
  }
}

// ==========================================
// PHẦN 3: LOGIC GAME (REACT COMPONENT)
// ==========================================

interface Props {
  onPlayCost: (amount: number) => void;
  onReward: (amount: number) => void;
  balance: number;
}

export const ElementalGame: React.FC<Props> = ({
  onPlayCost,
  onReward,
  balance,
}) => {
  const [bet, setBet] = useState(1000);
  const [playerChoice, setPlayerChoice] = useState<number | null>(null);
  const [aiChoice, setAiChoice] = useState<number | null>(null);
  const [result, setResult] = useState<"WIN" | "LOSE" | "DRAW" | null>(null);
  const [gameState, setGameState] = useState<
    "IDLE" | "CHARGING" | "CLASH" | "RESULT"
  >("IDLE");
  const [history, setHistory] = useState<{ p: number; a: number; r: string }[]>(
    []
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VisualEngine | null>(null);
  const requestRef = useRef<number | undefined>(undefined);

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
        if (engineRef.current) {
          engineRef.current.render(null, null, false, 0);
        }
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    engine.render = (p, a, f, ph) => {
      engine.ctx.fillStyle = "#050505";
      engine.ctx.fillRect(0, 0, engine.width, engine.height);

      if (engine.bgOpacity > 0 && playerChoice !== null) {
        engine.ctx.fillStyle = engine.targetBgColor;
        engine.ctx.globalAlpha = engine.bgOpacity * 0.5;
        engine.ctx.fillRect(0, 0, engine.width, engine.height);
        engine.ctx.globalAlpha = 1;
      }

      let shakeX = 0,
        shakeY = 0;
      if (engine.shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * engine.shakeIntensity;
        shakeY = (Math.random() - 0.5) * engine.shakeIntensity;
        engine.shakeIntensity *= 0.9;
      }
      engine.ctx.save();
      engine.ctx.translate(shakeX, shakeY);

      for (let i = engine.bgParticles.length - 1; i >= 0; i--) {
        const p = engine.bgParticles[i];
        p.update();
        p.draw(engine.ctx);
        if (p.life <= 0) engine.bgParticles.splice(i, 1);
      }

      if (gameState === "CHARGING" && playerChoice !== null) {
        engine.setAtmosphere(playerChoice);
      } else {
        if (engine.bgParticles.length > 0 && Math.random() < 0.1)
          engine.bgParticles.pop();
        engine.setAtmosphere(null);
      }

      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const pt = engine.particles[i];
        pt.update();
        pt.draw(engine.ctx);
        if (pt.life <= 0) engine.particles.splice(i, 1);
      }

      for (let i = engine.shockwaves.length - 1; i >= 0; i--) {
        const s = engine.shockwaves[i];
        engine.ctx.beginPath();
        engine.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        engine.ctx.strokeStyle = s.color;
        engine.ctx.lineWidth = 5;
        engine.ctx.globalAlpha = s.opacity;
        engine.ctx.stroke();
        s.radius += 15;
        s.opacity *= 0.85;
        if (s.opacity < 0.01) engine.shockwaves.splice(i, 1);
        engine.ctx.globalAlpha = 1;
      }

      if (gameState === "CHARGING" && playerChoice !== null) {
        if (Math.random() < 0.8) {
          engine.spawnAura(
            engine.width * 0.2,
            engine.height * 0.5,
            playerChoice
          );
          if (aiChoice !== null)
            engine.spawnAura(engine.width * 0.8, engine.height * 0.5, aiChoice);
          else {
            const p = new Particle(
              engine.width * 0.8,
              engine.height * 0.5,
              "SPARK",
              "#333",
              0.5
            );
            engine.particles.push(p);
          }
        }
      }

      engine.ctx.restore();
    };
  }, [gameState, playerChoice, aiChoice]);

  const handleBattle = (choiceId: number) => {
    if (balance < bet || gameState !== "IDLE") return;

    onPlayCost(bet);
    setPlayerChoice(choiceId);
    setAiChoice(null);
    setResult(null);
    setGameState("CHARGING");

    const ai = Math.floor(Math.random() * 5);

    setTimeout(() => {
      setAiChoice(ai);
      setGameState("CLASH");

      if (engineRef.current) {
        const engine = engineRef.current;
        const w = engine.width / (window.devicePixelRatio || 1);
        const h = engine.height / (window.devicePixelRatio || 1);

        let res: "WIN" | "LOSE" | "DRAW" = "DRAW";
        if (choiceId === ai) res = "DRAW";
        // Logic khắc chế: (a+1)%5 === b => a thắng b
        else if ((choiceId + 1) % 5 === ai) res = "WIN";
        else res = "LOSE";

        setResult(res);

        const centerX = w / 2;
        const centerY = h / 2;

        setTimeout(() => {
          if (res === "WIN") {
            engine.spawnClash(centerX, centerY, choiceId, ai);
            onReward(bet * 2);
          } else if (res === "LOSE") {
            engine.spawnClash(centerX, centerY, ai, choiceId);
          } else {
            engine.spawnDraw(centerX, centerY);
            onReward(bet);
          }
          setGameState("RESULT");
          setHistory((prev) =>
            [{ p: choiceId, a: ai, r: res }, ...prev].slice(0, 5)
          );

          setTimeout(() => {
            setGameState("IDLE");
            setPlayerChoice(null);
            setAiChoice(null);
            setResult(null);
            if (engineRef.current) engineRef.current.setAtmosphere(null);
          }, 3000);
        }, 1500);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto p-4 gap-6 select-none relative min-h-[700px]">
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden border-2 border-amber-500/20 bg-[#050505] shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <div className="relative z-10 text-center space-y-2 mt-4">
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 uppercase tracking-[0.2em] drop-shadow-sm">
          Ngũ Hành Trận
        </h2>
        {/* Xóa dòng chữ nhỏ cũ đi vì đã có bảng đẹp ở dưới */}
      </div>

      {/* --- BATTLE ARENA --- */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-between px-4 md:px-16 perspective-1000">
        {/* PLAYER SIDE */}
        <div className="flex flex-col items-center gap-4 w-1/3">
          <motion.div
            className="relative"
            animate={
              gameState === "CHARGING"
                ? { x: [0, -10, 0, 10, 0] }
                : gameState === "CLASH"
                ? { x: 200, opacity: 0, scale: 0.5 }
                : { x: 0, opacity: 1, scale: 1 }
            }
            transition={
              gameState === "CHARGING"
                ? { repeat: Infinity, duration: 0.2 }
                : { duration: 1.2, ease: "anticipate" }
            }
          >
            <div
              className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group
                  ${
                    playerChoice !== null
                      ? ELEMENTS_CONFIG[
                          playerChoice as keyof typeof ELEMENTS_CONFIG
                        ].color.replace("text", "border")
                      : "border-gray-700"
                  }
                `}
              style={{
                borderColor:
                  playerChoice !== null
                    ? ELEMENTS_CONFIG[
                        playerChoice as keyof typeof ELEMENTS_CONFIG
                      ].color
                    : "#374151",
              }}
            >
              {playerChoice !== null ? (
                <>
                  <div className="text-6xl md:text-8xl drop-shadow-2xl z-10 animate-pulse">
                    {
                      ELEMENTS_CONFIG[
                        playerChoice as keyof typeof ELEMENTS_CONFIG
                      ].icon
                    }
                  </div>
                  <div
                    className="absolute inset-0 opacity-20 bg-gradient-to-t from-current to-transparent"
                    style={{
                      color:
                        ELEMENTS_CONFIG[
                          playerChoice as keyof typeof ELEMENTS_CONFIG
                        ].color,
                    }}
                  ></div>
                </>
              ) : (
                <span className="text-6xl opacity-20">?</span>
              )}
            </div>

            <div className="mt-4 text-center">
              <div className="text-amber-500 font-bold uppercase tracking-widest text-sm">
                Đạo Hữu
              </div>
              {playerChoice !== null && (
                <div
                  className="font-bold text-xl"
                  style={{
                    color:
                      ELEMENTS_CONFIG[
                        playerChoice as keyof typeof ELEMENTS_CONFIG
                      ].color,
                  }}
                >
                  {
                    ELEMENTS_CONFIG[
                      playerChoice as keyof typeof ELEMENTS_CONFIG
                    ].name
                  }
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* VS / RESULT CENTER */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-full flex justify-center">
          <AnimatePresence mode="wait">
            {gameState === "IDLE" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="text-gray-600 text-6xl font-black opacity-20"
              >
                VS
              </motion.div>
            )}
            {gameState === "CHARGING" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.5 }}
                className="text-white font-bold text-4xl drop-shadow-[0_0_20px_white] animate-pulse"
              >
                QUYẾT ĐẤU
              </motion.div>
            )}
            {gameState === "RESULT" && result && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1.5, rotate: 0 }}
                className={`px-8 py-4 rounded-2xl border-4 shadow-2xl backdrop-blur-xl text-center
                             ${
                               result === "WIN"
                                 ? "bg-green-900/80 border-green-400 text-green-100 shadow-green-500/50"
                                 : result === "LOSE"
                                 ? "bg-red-900/80 border-red-500 text-red-100 shadow-red-500/50"
                                 : "bg-gray-800/80 border-white/50 text-white"
                             }
                          `}
              >
                <div className="text-4xl font-black uppercase italic tracking-tighter">
                  {result === "WIN"
                    ? "ĐẮC THẮNG!"
                    : result === "LOSE"
                    ? "BẠI TRẬN!"
                    : "HÒA CỤC"}
                </div>
                {result === "WIN" && (
                  <div className="text-sm font-mono mt-1 text-green-300">
                    +{bet.toLocaleString()} LT
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI SIDE */}
        <div className="flex flex-col items-center gap-4 w-1/3">
          <motion.div
            className="relative"
            animate={
              gameState === "CHARGING"
                ? { x: [0, 10, 0, -10, 0] }
                : gameState === "CLASH"
                ? { x: -200, opacity: 0, scale: 0.5 }
                : { x: 0, opacity: 1, scale: 1 }
            }
            transition={
              gameState === "CHARGING"
                ? { repeat: Infinity, duration: 0.2 }
                : { duration: 1.2, ease: "anticipate" }
            }
          >
            <div
              className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden
                     ${
                       aiChoice !== null
                         ? ELEMENTS_CONFIG[
                             aiChoice as keyof typeof ELEMENTS_CONFIG
                           ].color.replace("text", "border")
                         : "border-gray-700"
                     }
                `}
              style={{
                borderColor:
                  aiChoice !== null
                    ? ELEMENTS_CONFIG[aiChoice as keyof typeof ELEMENTS_CONFIG]
                        .color
                    : "#374151",
              }}
            >
              {aiChoice !== null ? (
                <>
                  <div className="text-6xl md:text-8xl drop-shadow-2xl z-10 animate-pulse">
                    {
                      ELEMENTS_CONFIG[aiChoice as keyof typeof ELEMENTS_CONFIG]
                        .icon
                    }
                  </div>
                  <div
                    className="absolute inset-0 opacity-20 bg-gradient-to-t from-current to-transparent"
                    style={{
                      color:
                        ELEMENTS_CONFIG[
                          aiChoice as keyof typeof ELEMENTS_CONFIG
                        ].color,
                    }}
                  ></div>
                </>
              ) : (
                <div className="text-6xl opacity-50 animate-pulse">?</div>
              )}
            </div>

            <div className="mt-4 text-center">
              <div className="text-red-500 font-bold uppercase tracking-widest text-sm">
                Tâm Ma
              </div>
              {aiChoice !== null && (
                <div
                  className="font-bold text-xl"
                  style={{
                    color:
                      ELEMENTS_CONFIG[aiChoice as keyof typeof ELEMENTS_CONFIG]
                        .color,
                  }}
                >
                  {
                    ELEMENTS_CONFIG[aiChoice as keyof typeof ELEMENTS_CONFIG]
                      .name
                  }
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTROLS LAYER --- */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
        {/* Betting */}
        <div className="flex items-center justify-center gap-4 bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/10 w-fit mx-auto">
          <span className="text-gray-400 font-bold uppercase text-xs pl-4">
            Cược:
          </span>
          <button
            onClick={() => setBet(Math.max(100, bet - 100))}
            disabled={gameState !== "IDLE"}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            -
          </button>
          <span className="text-amber-400 font-mono font-bold text-xl min-w-[80px] text-center">
            {bet.toLocaleString()}
          </span>
          <button
            onClick={() => setBet(bet + 100)}
            disabled={gameState !== "IDLE"}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            +
          </button>
        </div>

        {/* Element Selection */}
        <div className="grid grid-cols-5 gap-3 md:gap-4">
          {Object.values(ELEMENTS_CONFIG).map((el) => (
            <motion.button
              key={el.id}
              whileHover={{ y: -10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={gameState !== "IDLE" || balance < bet}
              onClick={() => handleBattle(el.id)}
              className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border bg-[#0a0a0a] transition-all duration-300
                          ${
                            gameState !== "IDLE"
                              ? "opacity-50 grayscale cursor-not-allowed"
                              : "cursor-pointer hover:shadow-2xl"
                          }
                      `}
              style={{
                borderColor: `${el.color}30`,
                boxShadow: `0 0 0 0 ${el.color}00`,
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"
                style={{ color: el.color }}
              ></div>
              <div className="text-4xl md:text-5xl mb-2 transform group-hover:scale-110 transition-transform drop-shadow-md">
                {el.icon}
              </div>
              <div
                className="font-bold text-xs md:text-sm uppercase tracking-wider"
                style={{ color: el.glow }}
              >
                {el.name}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Bets */}
        <div className="flex justify-center gap-2">
          {BET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setBet(amt)}
              disabled={gameState !== "IDLE"}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-500 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
              {amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* History Bar */}
        <div className="flex justify-center gap-2 h-8">
          <AnimatePresence>
            {history.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border text-lg bg-black/50 shadow-lg
                              ${
                                h.r === "WIN"
                                  ? "border-green-500 text-green-500"
                                  : h.r === "LOSE"
                                  ? "border-red-500 text-red-500"
                                  : "border-gray-500 text-gray-500"
                              }
                          `}
                title={`Bạn: ${
                  ELEMENTS_CONFIG[h.p as keyof typeof ELEMENTS_CONFIG].name
                } vs AI: ${
                  ELEMENTS_CONFIG[h.a as keyof typeof ELEMENTS_CONFIG].name
                }`}
              >
                {h.r === "WIN" ? "W" : h.r === "LOSE" ? "L" : "D"}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- BẢNG QUY LUẬT TƯƠNG KHẮC (MỚI THÊM) --- */}
      <div className="relative z-10 w-full max-w-4xl mt-8">
        <div className="bg-[#0a0a0a]/90 border border-amber-900/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

          <h3 className="text-center text-amber-500 font-bold uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
            <span className="text-xl">📜</span> Bảng Quy Luật Tương Khắc
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((id) => {
              const el = ELEMENTS_CONFIG[id as keyof typeof ELEMENTS_CONFIG];
              // Logic: (id + 1) % 5 là hệ mà id khắc chế
              const targetId = (id + 1) % 5;
              const target =
                ELEMENTS_CONFIG[targetId as keyof typeof ELEMENTS_CONFIG];

              return (
                <div
                  key={id}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors group"
                >
                  {/* Winner */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{el.icon}</span>
                    <span
                      className="font-bold text-sm"
                      style={{ color: el.color }}
                    >
                      {el.name}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="text-xs font-mono text-gray-500 flex flex-col items-center">
                    <span className="text-amber-600 font-bold">KHẮC</span>
                    <span className="transform rotate-90 md:rotate-0">▼</span>
                  </div>

                  {/* Loser */}
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">
                      {target.icon}
                    </span>
                    <span className="font-bold text-xs text-gray-400 group-hover:text-white transition-colors">
                      {target.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-500 text-xs italic mt-4">
            Tương sinh tương khắc, vòng tròn bất tận. Kẻ nắm rõ quy luật sẽ làm
            chủ thiên hạ.
          </p>
        </div>
      </div>
    </div>
  );
};
