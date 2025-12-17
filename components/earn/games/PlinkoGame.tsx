"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { GAME_CONFIG } from "../config/constants";
import { playSound, cn } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";

// ==========================================
// 1. CẤU HÌNH VẬT LÝ & THÔNG SỐ (CONSTANTS)
// ==========================================
const ROWS = 16;
const PEGS_START = 3;
const PEG_COLOR = "rgba(255, 255, 255, 0.2)";
const PEG_ACTIVE_COLOR = "#fbbf24";
const BALL_RADIUS = 6;
const PEG_RADIUS = 3;
const GRAVITY = 0.25;
const FRICTION = 0.99;
const BOUNCE = 0.6;
const JITTER = 0.1;

const MULTIPLIERS = [
  { val: 110, color: "#ef4444", label: "110x" },
  { val: 41, color: "#ef4444", label: "41x" },
  { val: 10, color: "#f97316", label: "10x" },
  { val: 5, color: "#f59e0b", label: "5x" },
  { val: 3, color: "#eab308", label: "3x" },
  { val: 1.5, color: "#84cc16", label: "1.5x" },
  { val: 1, color: "#a3e635", label: "1x" },
  { val: 0.5, color: "#3b82f6", label: "0.5x" },
  { val: 0.3, color: "#6366f1", label: "0.3x" },
  { val: 0.5, color: "#3b82f6", label: "0.5x" },
  { val: 1, color: "#a3e635", label: "1x" },
  { val: 1.5, color: "#84cc16", label: "1.5x" },
  { val: 3, color: "#eab308", label: "3x" },
  { val: 5, color: "#f59e0b", label: "5x" },
  { val: 10, color: "#f97316", label: "10x" },
  { val: 41, color: "#ef4444", label: "41x" },
  { val: 110, color: "#ef4444", label: "110x" },
];

const getBucketColor = (val: number) => {
  if (val >= 10) return "bg-red-600 shadow-[0_0_15px_#dc2626] border-red-400";
  if (val >= 2)
    return "bg-amber-600 shadow-[0_0_10px_#d97706] border-amber-400";
  if (val >= 1) return "bg-lime-600 shadow-[0_0_5px_#65a30d] border-lime-400";
  return "bg-slate-700 border-slate-500 opacity-80";
};

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
type Vector = { x: number; y: number };
type BallEntity = {
  id: number;
  pos: Vector;
  vel: Vector;
  radius: number;
  color: string;
  finished: boolean;
  value: number;
};
type ParticleEntity = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};
type PegEntity = { x: number; y: number; radius: number; isHit: number };

// ==========================================
// 3. PHYSICS ENGINE (CUSTOM HOOK) - GPU OPTIMIZED
// ==========================================

const usePlinkoPhysics = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  onFinish: (multiplier: number, betValue: number) => void
) => {
  const balls = useRef<BallEntity[]>([]);
  const particles = useRef<ParticleEntity[]>([]);
  const pegs = useRef<PegEntity[]>([]);
  const reqId = useRef<number | undefined>(undefined);
  const dimensions = useRef({ w: 0, h: 0, pegGap: 0, startY: 0 });

  // OPTIMIZATION: Offscreen Canvas để cache background tĩnh (các chốt)
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);

  // Khởi tạo bàn chơi (Pegs) & Pre-render
  const initBoard = useCallback((width: number, height: number) => {
    dimensions.current.w = width;
    dimensions.current.h = height;

    // Logic tính toán vị trí Peg giữ nguyên
    const maxPegs = ROWS + PEGS_START;
    const paddingX = width * 0.08;
    const usableWidth = width - paddingX * 2;
    const pegGap = usableWidth / (maxPegs - 1);
    const totalBoardHeight = (ROWS - 1) * (pegGap * 0.866);
    const bucketSpace = Math.max(height * 0.1, 50);
    const availableHeight = height - bucketSpace;
    const startY = Math.max(
      PEG_RADIUS * 2,
      (availableHeight - totalBoardHeight) / 2
    );

    dimensions.current.pegGap = pegGap;
    dimensions.current.startY = startY;

    const newPegs: PegEntity[] = [];
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + PEGS_START;
      const rowWidth = (pegsInRow - 1) * pegGap;
      const xOffset = (width - rowWidth) / 2;
      const y = startY + row * (pegGap * 0.866);

      for (let col = 0; col < pegsInRow; col++) {
        newPegs.push({
          x: xOffset + col * pegGap,
          y: y,
          radius: PEG_RADIUS,
          isHit: 0,
        });
      }
    }
    pegs.current = newPegs;

    // --- GPU OPTIMIZATION START: Vẽ sẵn các chốt lên Canvas ảo ---
    if (!offscreenCanvas.current) {
      offscreenCanvas.current = document.createElement("canvas");
    }
    offscreenCanvas.current.width = width;
    offscreenCanvas.current.height = height;
    const offCtx = offscreenCanvas.current.getContext("2d");
    if (offCtx) {
      // Vẽ tất cả chốt ở trạng thái tĩnh (màu xám mờ)
      newPegs.forEach((peg) => {
        offCtx.beginPath();
        offCtx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        offCtx.fillStyle = PEG_COLOR;
        offCtx.fill();
        offCtx.closePath();
      });
    }
    // --- GPU OPTIMIZATION END ---
  }, []);

  const spawnBall = (betValue: number) => {
    const startX = dimensions.current.w / 2 + (Math.random() - 0.5) * 5;
    balls.current.push({
      id: Date.now() + Math.random(),
      pos: { x: startX, y: 0 },
      vel: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      color: Math.random() > 0.5 ? "#fbbf24" : "#f59e0b",
      finished: false,
      value: betValue,
    });
  };

  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count: number = 5
  ) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color,
        size: Math.random() * 2 + 1,
      });
    }
  };

  // Vòng lặp vật lý (Update & Draw)
  const update = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    const { w, h, pegGap, startY } = dimensions.current;

    // Xóa màn hình
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Static Background (Pegs) từ Offscreen Canvas
    // Đây là bước tối ưu: Thay vì vẽ 100 vòng tròn, ta chỉ copy 1 ảnh
    if (offscreenCanvas.current) {
      ctx.drawImage(offscreenCanvas.current, 0, 0);
    }

    // 2. Draw Active Pegs Overwrite (Chỉ vẽ lại những chốt đang sáng)
    pegs.current.forEach((peg) => {
      if (peg.isHit > 0) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${peg.isHit / 10})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = PEG_ACTIVE_COLOR;
        ctx.fill();
        ctx.closePath();
        peg.isHit--;
        // Reset shadow sau khi vẽ xong peg này để ko ảnh hưởng cái khác
        ctx.shadowBlur = 0;
      }
    });

    // 3. Update & Draw Balls
    balls.current.forEach((ball) => {
      if (ball.finished) return;
      ball.vel.y += GRAVITY;
      ball.vel.x *= FRICTION;
      ball.vel.y *= FRICTION;
      ball.pos.x += ball.vel.x;
      ball.pos.y += ball.vel.y;

      // Peg Collision (LOGIC GIỮ NGUYÊN)
      pegs.current.forEach((peg) => {
        const dx = ball.pos.x - peg.x;
        const dy = ball.pos.y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + peg.radius;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const dot = ball.vel.x * nx + ball.vel.y * ny;
          ball.vel.x =
            (ball.vel.x - 2 * dot * nx) * BOUNCE +
            (Math.random() - 0.5) * JITTER;
          ball.vel.y = (ball.vel.y - 2 * dot * ny) * BOUNCE;
          ball.pos.x += nx * (minDist - dist);
          ball.pos.y += ny * (minDist - dist);
          peg.isHit = 15;
          if (Math.random() > 0.8) playSound("click");
        }
      });

      // Wall Collision
      if (ball.pos.x < ball.radius) {
        ball.pos.x = ball.radius;
        ball.vel.x *= -BOUNCE;
      } else if (ball.pos.x > w - ball.radius) {
        ball.pos.x = w - ball.radius;
        ball.vel.x *= -BOUNCE;
      }

      // Check Win condition (LOGIC GIỮ NGUYÊN)
      const lastRowY = startY + (ROWS - 1) * (pegGap * 0.866);
      const finishLine = lastRowY + pegGap * 0.5;

      if (ball.pos.y > finishLine && !ball.finished) {
        ball.finished = true;
        const paddingX = w * 0.08;
        const firstPegXLastRow = (w - (ROWS + PEGS_START - 1) * pegGap) / 2;
        const relativeX = ball.pos.x - firstPegXLastRow + pegGap / 2;
        let slotIndex = Math.floor(relativeX / pegGap);

        if (slotIndex < 0) slotIndex = 0;
        if (slotIndex >= MULTIPLIERS.length) slotIndex = MULTIPLIERS.length - 1;

        const multiplier = MULTIPLIERS[slotIndex].val;
        onFinish(multiplier, ball.value);
        spawnParticles(
          ball.pos.x,
          ball.pos.y,
          MULTIPLIERS[slotIndex].color,
          20
        );
      }

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      // Bóng thì cần shadow
      ctx.shadowBlur = 10;
      ctx.shadowColor = ball.color;
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0; // Reset ngay
    });
    balls.current = balls.current.filter((b) => !b.finished);

    // 4. Particles (LOGIC GIỮ NGUYÊN)
    particles.current.forEach((p) => {
      p.life -= 0.02;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      ctx.beginPath();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    particles.current = particles.current.filter((p) => p.life > 0);

    reqId.current = requestAnimationFrame(update);
  }, [onFinish]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (canvasRef.current && width > 0 && height > 0) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          initBoard(width, height);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [initBoard, containerRef, canvasRef]);

  useEffect(() => {
    reqId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqId.current!);
  }, [update]);

  return { spawnBall };
};

// ==========================================
// 4. COMPONENT CHÍNH
// ==========================================

export const PlinkoGame = ({ onPlayCost, onReward, balance }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [betAmount, setBetAmount] = useState(GAME_CONFIG.PLINKO.cost);
  const [history, setHistory] = useState<{ val: number; id: number }[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const autoInterval = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const handleBallFinish = useCallback(
    (multiplier: number, betValue: number) => {
      const winAmount = Math.floor(betValue * multiplier);
      if (winAmount > 0) onReward(winAmount);
      setHistory((prev) =>
        [{ val: multiplier, id: Date.now() }, ...prev].slice(0, 5)
      );
      if (multiplier >= 10) {
        playSound("win");
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4 },
        });
      } else if (multiplier < 1) {
        playSound("fail");
      } else {
        playSound("click");
      }
    },
    [onReward, controls]
  );

  const { spawnBall } = usePlinkoPhysics(
    canvasRef,
    containerRef,
    handleBallFinish
  );

  const drop = () => {
    if (balance < betAmount) {
      setAutoMode(false);
      return alert("Đạo hữu không đủ linh thạch!");
    }
    onPlayCost(betAmount);
    spawnBall(betAmount);
    playSound("spin");
  };

  useEffect(() => {
    if (autoMode) {
      autoInterval.current = setInterval(() => {
        drop();
      }, 800);
    } else {
      if (autoInterval.current) clearInterval(autoInterval.current);
    }
    return () => {
      if (autoInterval.current) clearInterval(autoInterval.current);
    };
  }, [autoMode, balance, betAmount]);

  const changeBet = (factor: number) => {
    setBetAmount(Math.max(100, Math.floor(betAmount * factor)));
  };

  return (
    <div className="flex flex-col items-center h-screen max-h-screen w-full bg-[#0f0518] overflow-hidden p-4 gap-2 relative">
      {/* 1. HEADER INFO */}
      <div className="w-full flex justify-between items-center z-20 pointer-events-none shrink-0 pb-2">
        <div className="flex flex-col">
          <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 uppercase tracking-widest drop-shadow-md">
            THIÊN THẠCH TRẬN
          </h3>
          <p className="text-[10px] text-purple-400/60 font-mono">
            Physics Core v2.1 (GPU Boosted)
          </p>
        </div>

        {/* History Log */}
        <div className="flex gap-1">
          <AnimatePresence>
            {history.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: 20, scale: 0 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                // OPTIMIZATION: will-change cho DOM element động
                className={cn(
                  "min-w-[32px] h-8 flex items-center justify-center rounded-md font-bold text-xs border shadow-lg will-change-transform",
                  getBucketColor(h.val)
                )}
              >
                {h.val}x
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. GAME BOARD */}
      <motion.div
        ref={containerRef}
        animate={controls}
        // OPTIMIZATION: transform-gpu để kích hoạt Hardware Acceleration cho container rung lắc
        className="relative flex-1 w-full max-w-[600px] bg-[#1a0b2e] border-[1px] border-purple-500/20 rounded-t-[3rem] rounded-b-3xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5),0_0_80px_rgba(147,51,234,0.15)] overflow-hidden min-h-[300px] transform-gpu"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 w-full h-full"
        />

        {/* Multiplier Buckets */}
        <div className="absolute bottom-1 left-2 right-2 flex justify-between gap-[2px] h-8 z-20 pointer-events-none">
          {MULTIPLIERS.map((mul, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 flex items-center justify-center rounded-sm text-[8px] sm:text-[9px] font-bold text-white transition-all shadow-md border-t opacity-90",
                getBucketColor(mul.val)
              )}
            >
              {mul.val}x
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. CONTROL PANEL */}
      <div className="w-full max-w-[600px] z-20 shrink-0 mt-1">
        <div className="bg-[#130722]/90 backdrop-blur-md border border-purple-500/30 p-3 rounded-xl shadow-2xl flex flex-col gap-3">
          {/* Bet Controls */}
          <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                Cược
              </span>
              <div className="flex items-center gap-1">
                <span className="text-amber-500 text-sm">💎</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) =>
                    setBetAmount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="bg-transparent border-none outline-none text-white font-mono font-bold w-20 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => changeBet(0.5)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400"
              >
                ½
              </button>
              <button
                onClick={() => changeBet(2)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400"
              >
                2x
              </button>
              <button
                onClick={() => setBetAmount(10000)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-amber-500 font-bold"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <AncientButton
              onClick={drop}
              disabled={autoMode}
              className="flex-1 h-12 text-base"
              variant="primary"
            >
              THẢ BÓNG
            </AncientButton>

            <AncientButton
              onClick={() => setAutoMode(!autoMode)}
              className={cn(
                "w-28 h-12 flex flex-col leading-none justify-center",
                autoMode
                  ? "border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  : ""
              )}
              variant="ghost"
            >
              <span className="text-sm font-bold">
                {autoMode ? "DỪNG" : "AUTO"}
              </span>
            </AncientButton>
          </div>
        </div>
      </div>
    </div>
  );
};
