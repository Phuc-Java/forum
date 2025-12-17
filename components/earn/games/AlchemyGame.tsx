"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import {
  motion,
  useAnimation,
  AnimatePresence,
  useMotionValue,
  useTransform,
  MotionValue,
} from "framer-motion";
import confetti from "canvas-confetti";
import { GAME_CONFIG } from "../config/constants";
import { playSound, cn } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";
import { setCauldronStatus, repairCauldronAction } from "@/lib/actions/earn";

// ==========================================
// 1. DATA & CONFIG (Giữ nguyên)
// ==========================================

const CAULDRON_PRICE = 100000;

type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "DIVINE";

interface PillTier {
  id: Rarity;
  label: string;
  color: string;
  border: string;
  bgGradient: string;
  shadow: string;
  multiplier: number;
  names: string[];
}

const PILL_DATA: Record<Rarity, PillTier> = {
  COMMON: {
    id: "COMMON",
    label: "Phàm Phẩm",
    color: "#a8a29e",
    border: "border-stone-500",
    bgGradient: "from-stone-900 to-stone-800",
    shadow: "shadow-stone-500/20",
    multiplier: 1.2,
    names: ["Tụ Khí Tán", "Hồi Huyết Hoàn", "Giải Độc Đan"],
  },
  UNCOMMON: {
    id: "UNCOMMON",
    label: "Linh Phẩm",
    color: "#4ade80",
    border: "border-green-500",
    bgGradient: "from-green-950 to-green-900",
    shadow: "shadow-green-500/40",
    multiplier: 3.0,
    names: ["Trúc Cơ Đan", "Tẩy Tủy Phấn", "Ngưng Thần Châu"],
  },
  RARE: {
    id: "RARE",
    label: "Tiên Phẩm",
    color: "#60a5fa",
    border: "border-blue-500",
    bgGradient: "from-blue-950 to-blue-900",
    shadow: "shadow-blue-500/50",
    multiplier: 8.0,
    names: ["Kết Kim Đan", "Tử Phủ Đan", "Phá Ách Đan"],
  },
  EPIC: {
    id: "EPIC",
    label: "Thánh Phẩm",
    color: "#c084fc",
    border: "border-purple-500",
    bgGradient: "from-purple-950 to-purple-900",
    shadow: "shadow-purple-500/60",
    multiplier: 20.0,
    names: ["Nguyên Anh Đan", "Hóa Thần Đan", "Vô Cực Đan"],
  },
  LEGENDARY: {
    id: "LEGENDARY",
    label: "Đế Phẩm",
    color: "#fbbf24",
    border: "border-amber-500",
    bgGradient: "from-amber-950 to-amber-900",
    shadow: "shadow-amber-500/70",
    multiplier: 100.0,
    names: ["Đại Thừa Đan", "Độ Kiếp Tiên Đan"],
  },
  DIVINE: {
    id: "DIVINE",
    label: "Thần Phẩm",
    color: "#f43f5e",
    border: "border-red-500",
    bgGradient: "from-red-950 to-red-900",
    shadow: "shadow-red-500/80",
    multiplier: 500.0,
    names: ["Hồng Mông Đạo Đan", "Bất Tử Vô Thượng Dược"],
  },
};

interface AlchemyLog {
  id: number;
  name: string;
  tier: PillTier;
  profit: number;
}

// ==========================================
// 2. VISUAL EFFECTS (GPU OPTIMIZED)
// ==========================================

const GlobalHeatEffect = memo(({ heatMv }: { heatMv: MotionValue<number> }) => {
  const opacity = useTransform(heatMv, [20, 100], [0, 0.9]);
  // Box-shadow hơi nặng, nhưng opacity handle tốt
  const boxShadow = useTransform(
    heatMv,
    [0, 100],
    [
      "inset 0 0 0px rgba(220, 38, 38, 0)",
      "inset 0 0 150px rgba(220, 38, 38, 0.8)",
    ]
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0 mix-blend-overlay will-change-[opacity,box-shadow]"
      style={{ opacity, boxShadow, backgroundColor: "rgba(20,0,0,0.2)" }}
    />
  );
});
GlobalHeatEffect.displayName = "GlobalHeatEffect";

const InfernoEffect = memo(
  ({
    heatMv,
    isActive,
  }: {
    heatMv: MotionValue<number>;
    isActive: boolean;
  }) => {
    // GPU OPTIMIZATION: Dùng scaleY thay vì height
    const scaleY = useTransform(heatMv, [0, 100], [0.1, 1.2]);
    const opacity = useTransform(heatMv, [0, 100], [0.3, 1]);

    return (
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-full pointer-events-none">
        <motion.div
          className="absolute bottom-0 w-full h-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-200 blur-md rounded-t-full will-change-transform origin-bottom"
          style={{ scaleY, opacity: isActive ? opacity : 0.2 }}
        />
        {isActive &&
          Array.from({ length: 12 }).map((_, i) => <Particle key={i} />)}
      </div>
    );
  }
);
InfernoEffect.displayName = "InfernoEffect";

const Particle = () => (
  <motion.div
    className="absolute bottom-0 w-1.5 h-1.5 rounded-full blur-[1px] will-change-transform"
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: -150 - Math.random() * 100,
      x: (Math.random() - 0.5) * 80,
      opacity: [1, 1, 0],
      scale: [1, 0],
    }}
    transition={{
      duration: 0.6 + Math.random(),
      repeat: Infinity,
      ease: "easeOut",
      delay: Math.random() * 0.5,
    }}
    style={{
      backgroundColor: Math.random() > 0.5 ? "#fef08a" : "#f97316",
      left: "50%",
    }}
  />
);

const HeatGauge = memo(
  ({
    heatMv,
    target,
  }: {
    heatMv: MotionValue<number>;
    target: { start: number; end: number };
  }) => {
    const color = useTransform(
      heatMv,
      [0, 30, 60, 85, 100],
      ["#3b82f6", "#60a5fa", "#facc15", "#f97316", "#ef4444"]
    );

    // GPU OPTIMIZATION: Tính toán scaleY thay vì thay đổi height style
    const scaleY = useTransform(heatMv, [0, 100], [0, 1]);

    return (
      <div className="relative w-10 h-64 bg-[#1c1917] border-2 border-stone-700 rounded-full overflow-hidden shadow-inner transform-gpu">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#ffffff10,#ffffff10_1px,transparent_1px,transparent_10px)]" />
        {/* Target Zone - Giữ nguyên vì là static layout */}
        <div
          className="absolute w-full bg-green-500/30 border-y border-green-400 z-10 flex items-center justify-end pr-1"
          style={{
            bottom: `${target.start}%`,
            height: `${target.end - target.start}%`,
          }}
        >
          <div className="text-[8px] font-bold text-green-400 bg-black/50 px-1 rounded leading-none">
            ĐAN
          </div>
        </div>
        <div className="absolute top-0 w-full h-[10%] bg-red-900/40 border-b border-red-500/50 z-0" />

        {/* THANH NHIỆT ĐỘ - GPU OPTIMIZED */}
        <motion.div
          className="absolute bottom-0 w-full h-full rounded-b-full will-change-transform origin-bottom"
          style={{
            scaleY: scaleY, // Dùng scaleY thay vì height
            backgroundColor: color,
          }}
        >
          <div className="absolute top-0 w-full h-1 bg-white/80 blur-[1px] rounded-full scale-y-[0.01]" />
        </motion.div>
      </div>
    );
  }
);
HeatGauge.displayName = "HeatGauge";

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export const AlchemyGame = ({
  onPlayCost,
  onReward,
  balance,
  initialBroken,
  userId,
  onRepairSuccess,
}: any) => {
  // STATE
  const [gameState, setGameState] = useState<
    "IDLE" | "BREWING" | "RESULT" | "BROKEN"
  >(initialBroken ? "BROKEN" : "IDLE");
  const [isHeating, setIsHeating] = useState(false);
  const [targetZone, setTargetZone] = useState({ start: 60, end: 80 });
  const [resultData, setResultData] = useState<{
    type: "SUCCESS" | "EXPLODE" | "FAIL";
    pill?: any;
    message: string;
  } | null>(null);
  const [logs, setLogs] = useState<AlchemyLog[]>([]);

  // REFS & MOTION
  const heatMv = useMotionValue(0);
  const heatRef = useRef(0);
  const isHoldingRef = useRef(false);
  const reqRef = useRef<number | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const cauldronControls = useAnimation();
  const screenControls = useAnimation();

  // GPU OPTIMIZATION: Transform Scale cho Aura thay vì Width/Height
  const auraScale = useTransform(heatMv, [0, 100], [1, 1.8]);
  const auraColor = useTransform(
    heatMv,
    [0, 100],
    ["rgba(59, 130, 246, 0.1)", "rgba(220, 38, 38, 0.4)"]
  );

  // --- GAME LOOP ---
  const updateLoop = () => {
    if (gameState !== "BREWING") return;

    let currentHeat = heatRef.current;
    const isHolding = isHoldingRef.current;

    if (isHolding) {
      const boost = currentHeat > 70 ? 0.7 : currentHeat > 40 ? 0.5 : 0.35;
      currentHeat += boost;
    } else {
      if (currentHeat > 0) currentHeat -= 0.25;
    }

    if (currentHeat < 0) currentHeat = 0;

    heatRef.current = currentHeat;
    heatMv.set(currentHeat);

    // DIRECT DOM MANIPULATION (Tốt)
    if (textRef.current)
      textRef.current.innerText = `${Math.floor(currentHeat)}°C`;

    if (currentHeat >= 100) {
      handleFinish(100);
      return;
    }

    if (currentHeat > 85 || (isHolding && currentHeat > 60)) {
      const intensity = (currentHeat - 50) / 10;
      cauldronControls.set({
        x: (Math.random() - 0.5) * intensity,
        y: (Math.random() - 0.5) * intensity,
        rotate: (Math.random() - 0.5) * (intensity / 2),
      });
      if (currentHeat > 90)
        screenControls.set({ x: (Math.random() - 0.5) * 4 });
    } else {
      cauldronControls.set({ x: 0, y: 0, rotate: 0 });
      screenControls.set({ x: 0 });
    }

    reqRef.current = requestAnimationFrame(updateLoop);
  };

  useEffect(() => {
    if (gameState === "BREWING")
      reqRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState]);

  // --- ACTIONS ---

  const startGame = () => {
    if (balance < GAME_CONFIG.ALCHEMY.cost) return alert("Thiếu linh thạch!");
    onPlayCost(GAME_CONFIG.ALCHEMY.cost);

    setGameState("BREWING");
    heatMv.set(0);
    heatRef.current = 0;
    isHoldingRef.current = false;
    setIsHeating(false);
    setResultData(null);

    const size = Math.floor(Math.random() * (15 - 8) + 8);
    const start = Math.floor(Math.random() * (85 - 30) + 30);
    setTargetZone({ start, end: start + size });

    playSound("spin");
  };

  const repairCauldron = async () => {
    const res = await repairCauldronAction(userId, CAULDRON_PRICE);
    if (res.success) {
      const newBalance =
        typeof (res as any).newBalance === "number"
          ? (res as any).newBalance
          : null;
      const diff = newBalance !== null ? balance - newBalance : 0;
      if (diff > 0) onPlayCost(diff);
      playSound("click");
      setGameState("IDLE");
      setResultData(null);
      cauldronControls.set({ opacity: 1, scale: 1 });
      if (onRepairSuccess) onRepairSuccess();
    } else {
      alert("Lỗi kết nối Thiên Đình! Không thể sửa lò.");
    }
  };

  const startHeating = () => {
    if (gameState !== "BREWING") return;
    isHoldingRef.current = true;
    setIsHeating(true);
    playSound("spin");
  };

  const stopHeating = () => {
    if (gameState !== "BREWING") return;
    isHoldingRef.current = false;
    setIsHeating(false);
  };

  const handleFinish = (forcedHeat?: number) => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);

    const finalHeat = forcedHeat !== undefined ? forcedHeat : heatRef.current;
    setIsHeating(false);
    isHoldingRef.current = false;

    if (finalHeat >= 100) {
      playSound("crack");
      setGameState("BROKEN");
      setResultData({
        type: "EXPLODE",
        message: "Hỏa lực quá mạnh, lò đã nổ tung thành tro bụi!",
      });

      setCauldronStatus(userId, true);

      cauldronControls.start({
        scale: [1, 1.5, 0],
        opacity: [1, 1, 0],
        rotate: [0, 10, -10, 20],
        transition: { duration: 0.6 },
      });
      screenControls.start({
        x: [0, -20, 20, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    } else if (finalHeat >= targetZone.start && finalHeat <= targetZone.end) {
      setGameState("RESULT");
      playSound("win");

      const center = (targetZone.start + targetZone.end) / 2;
      const accuracy =
        1 -
        Math.abs(finalHeat - center) /
          ((targetZone.end - targetZone.start) / 2);

      let rarity: Rarity = "COMMON";
      if (accuracy > 0.92) rarity = "DIVINE";
      else if (accuracy > 0.8) rarity = "LEGENDARY";
      else if (accuracy > 0.6) rarity = "EPIC";
      else if (accuracy > 0.4) rarity = "RARE";
      else if (accuracy > 0.2) rarity = "UNCOMMON";

      const tier = PILL_DATA[rarity];
      const name = tier.names[Math.floor(Math.random() * tier.names.length)];
      const reward = Math.floor(GAME_CONFIG.ALCHEMY.cost * tier.multiplier);

      onReward(reward);
      setResultData({
        type: "SUCCESS",
        pill: { name, ...tier },
        message: "Luyện thành công!",
      });
      setLogs((prev) =>
        [{ id: Date.now(), name, tier, profit: reward }, ...prev].slice(0, 6)
      );
      confetti({
        particleCount: 120,
        spread: 80,
        colors: [tier.color, "#fff"],
        origin: { y: 0.6 },
      });
    } else {
      setGameState("RESULT");
      playSound("fail");
      setResultData({
        type: "FAIL",
        message: "Hỏa hầu chưa tới, dược liệu hóa tro.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative bg-[#0c0a09] overflow-hidden p-4">
      {/* GLOBAL EFFECTS */}
      <GlobalHeatEffect heatMv={heatMv} />
      <motion.div
        animate={screenControls}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay pointer-events-none" />

      {/* HISTORY LOGS */}
      <div className="absolute top-4 right-4 z-30 w-56 flex flex-col gap-2 pointer-events-none hidden md:flex">
        {logs.length > 0 && (
          <div className="text-[10px] text-right font-bold text-stone-500 uppercase mb-1">
            Lịch sử luyện đan
          </div>
        )}
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex justify-between items-center px-3 py-2 rounded-lg border backdrop-blur-md shadow-lg",
                `bg-gradient-to-br ${log.tier.bgGradient}`,
                "border-white/10"
              )}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white leading-none">
                  {log.name}
                </span>
                <span
                  className="text-[9px] uppercase mt-1"
                  style={{ color: log.tier.color }}
                >
                  {log.tier.label}
                </span>
              </div>
              <span className="text-amber-400 font-mono text-xs font-bold">
                +{log.profit}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER */}
      <div className="text-center z-10 mb-6 shrink-0 relative">
        <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-t from-amber-600 to-yellow-400 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)] font-serif">
          VẠN CỔ ĐAN LÒ
        </h3>
        <p className="text-xs text-amber-300/60 font-mono mt-2 tracking-[0.2em] uppercase">
          {gameState === "BREWING" ? (
            <span className="text-amber-100 font-bold bg-black/50 px-2 py-1 rounded">
              NHIỆT ĐỘ: <span ref={textRef}>0°C</span>
            </span>
          ) : (
            "Nghịch thiên cải mệnh"
          )}
        </p>
      </div>

      {/* GAME AREA */}
      <div className="flex-1 w-full flex items-center justify-center gap-10 md:gap-16 relative min-h-0">
        {/* CAULDRON */}
        <div className="relative">
          {/* Aura: GPU OPTIMIZED (dùng scale thay vì width/height) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] will-change-transform"
            style={{
              width: 250, // Fix cứng kích thước
              height: 250, // Fix cứng kích thước
              scale: auraScale, // Animation bằng scale
              backgroundColor: auraColor,
            }}
          />

          <motion.div
            animate={cauldronControls}
            className="relative w-64 h-72 z-20 will-change-transform"
          >
            {/* Nắp Lò */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-stone-900 rounded-t-full border-t-[6px] border-amber-800 z-30 shadow-2xl flex items-end justify-center pb-2">
              <div className="w-12 h-12 bg-amber-700/80 rounded-full border-2 border-amber-500 shadow-[0_0_20px_#f59e0b_inset]" />
            </div>
            {/* Thân Lò */}
            <div className="absolute top-16 left-0 w-full h-52 bg-gradient-to-b from-stone-800 to-black rounded-[3.5rem] border-x-4 border-b-8 border-amber-900 shadow-inner flex items-center justify-center overflow-hidden">
              <div
                className={cn(
                  "w-40 h-40 rounded-full border-[6px] transition-all duration-100 relative overflow-hidden flex items-center justify-center bg-black",
                  isHeating
                    ? "border-amber-500 shadow-[0_0_40px_#f59e0b]"
                    : "border-stone-700"
                )}
              >
                <InfernoEffect
                  heatMv={heatMv}
                  isActive={gameState === "BREWING" && isHeating}
                />
                <AnimatePresence>
                  {resultData?.type === "SUCCESS" && resultData.pill && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1.3, rotate: 0 }}
                      className="relative z-30 drop-shadow-[0_0_30px_white]"
                    >
                      <span
                        className="text-7xl"
                        style={{ color: resultData.pill.color }}
                      >
                        💊
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* Chân Lò */}
            <div className="absolute -bottom-4 left-4 w-12 h-24 bg-stone-900 -rotate-12 border-l-4 border-stone-800 rounded-b-3xl -z-10" />
            <div className="absolute -bottom-4 right-4 w-12 h-24 bg-stone-900 rotate-12 border-r-4 border-stone-800 rounded-b-3xl -z-10" />
          </motion.div>
        </div>

        {/* HEAT GAUGE */}
        <div className="relative h-80 z-20">
          <HeatGauge heatMv={heatMv} target={targetZone} />
        </div>
      </div>

      {/* --- RESULT & PENALTY POPUP --- */}
      <AnimatePresence>
        {resultData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-8 rounded-3xl border-4 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,1)] text-center min-w-[360px]",
              resultData.type === "SUCCESS"
                ? `bg-gradient-to-br ${resultData.pill.bgGradient} ${resultData.pill.border}`
                : resultData.type === "EXPLODE"
                ? "bg-gradient-to-br from-red-950 to-black border-red-600 shadow-[0_0_50px_#ef4444]"
                : "bg-[#292524] border-stone-600 shadow-2xl"
            )}
          >
            <h4
              className={cn(
                "text-3xl font-black uppercase mb-2 font-serif tracking-widest drop-shadow-md",
                resultData.type === "SUCCESS"
                  ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
                  : resultData.type === "EXPLODE"
                  ? "text-red-500 animate-pulse"
                  : "text-stone-400"
              )}
              style={{
                color:
                  resultData.type === "SUCCESS"
                    ? resultData.pill.color
                    : undefined,
              }}
            >
              {resultData.type === "SUCCESS"
                ? resultData.pill.name
                : resultData.type === "EXPLODE"
                ? "LÒ ĐÃ NỔ!"
                : "PHẾ ĐAN"}
            </h4>

            {/* SUCCESS DETAILS */}
            {resultData.type === "SUCCESS" && resultData.pill && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="bg-black/50 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Phẩm Chất
                  </span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full border shadow-[0_0_15px_inset]"
                    style={{
                      color: resultData.pill.color,
                      borderColor: resultData.pill.color,
                      backgroundColor: `${resultData.pill.color}10`,
                      boxShadow: `0 0 18px ${resultData.pill.color}`,
                    }}
                  >
                    {resultData.pill.label}
                  </span>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">
                    Giá Trị
                  </span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    x{resultData.pill.multiplier}
                  </span>
                </div>
              </div>
            )}

            {/* EXPLODE DETAILS */}
            {resultData.type === "EXPLODE" && (
              <div className="mt-4 bg-red-900/30 p-4 rounded-xl border border-red-500/30">
                <p className="text-red-200 text-sm mb-2 font-bold uppercase">
                  ⚠️ Cảnh Báo Nguy Hiểm
                </p>
                <p className="text-white/80 text-xs mb-3">
                  Lò luyện đã bị phá hủy hoàn toàn. Cần mua lò mới để tiếp tục.
                </p>
                <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                  <span className="text-xs text-gray-400">Phí sửa chữa:</span>
                  <span className="text-red-500 font-mono font-bold">
                    -{CAULDRON_PRICE.toLocaleString()} 💎
                  </span>
                </div>
              </div>
            )}

            {/* FAIL DETAILS */}
            {resultData.type === "FAIL" && (
              <div className="mt-4 flex flex-col items-center">
                <div className="text-4xl mb-2 opacity-50">🌫️</div>
                <p className="text-stone-400 text-xs font-mono italic border-t border-stone-600/50 pt-2 w-full">
                  "{resultData.message}"
                </p>
                <div className="mt-3 text-[10px] text-stone-600 uppercase tracking-widest">
                  Linh lực tiêu tán
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTROL BUTTONS */}
      <div className="z-30 mt-6 mb-4 shrink-0 w-full max-w-md h-24 flex items-center justify-center">
        {gameState === "BROKEN" ? (
          <AncientButton
            onClick={repairCauldron}
            size="lg"
            variant="danger"
            className="w-full h-16 text-xl shadow-[0_0_30px_#ef4444]"
          >
            🛠️ MUA LÒ MỚI ({CAULDRON_PRICE.toLocaleString()})
          </AncientButton>
        ) : gameState === "IDLE" || gameState === "RESULT" ? (
          <AncientButton
            onClick={startGame}
            size="lg"
            variant="gold"
            className="w-full h-16 text-xl shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:shadow-[0_0_50px_rgba(251,191,36,0.8)] transition-all"
          >
            {gameState === "IDLE"
              ? `KHAI LÒ (${GAME_CONFIG.ALCHEMY.cost} 💎)`
              : "LUYỆN TIẾP"}
          </AncientButton>
        ) : (
          <div className="flex gap-4 w-full h-full items-center">
            {/* Nút Nung */}
            <button
              onMouseDown={startHeating}
              onMouseUp={stopHeating}
              onMouseLeave={stopHeating}
              onTouchStart={startHeating}
              onTouchEnd={stopHeating}
              className={cn(
                "flex-1 h-20 rounded-2xl border-4 flex flex-col items-center justify-center transition-all active:scale-95 group relative overflow-hidden shadow-2xl",
                isHeating
                  ? "bg-gradient-to-t from-red-900 to-orange-700 border-orange-500 shadow-[0_0_40px_#f97316]"
                  : "bg-[#292524] border-[#57534e] hover:border-orange-400"
              )}
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              <span className="text-3xl mb-1 filter drop-shadow-md">
                {isHeating ? "🔥" : "🌡️"}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isHeating ? "text-white animate-pulse" : "text-gray-400"
                )}
              >
                GIỮ ĐỂ NUNG
              </span>
            </button>

            {/* Nút Chốt */}
            <button
              onClick={() => handleFinish()}
              className="w-32 h-20 rounded-2xl bg-gradient-to-b from-green-800 to-green-950 border-4 border-green-600 flex flex-col items-center justify-center transition-all hover:bg-green-700 active:scale-95 shadow-[0_0_20px_#22c55e_inset] hover:shadow-[0_0_30px_#22c55e]"
            >
              <span className="text-3xl mb-1 filter drop-shadow-md">✨</span>
              <span className="text-[10px] font-bold text-green-200 uppercase tracking-widest">
                CHỐT
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
