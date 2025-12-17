"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence, useAnimation, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import { GAME_CONFIG } from "../config/constants";
import { playSound, cn } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";

// ==========================================
// 1. DATA & CONFIG
// ==========================================
const CARDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const SUITS = [
  { symbol: "♠", color: "black" },
  { symbol: "♥", color: "red" },
  { symbol: "♣", color: "black" },
  { symbol: "♦", color: "red" },
];

const getCardLabel = (val: number) => {
  if (val <= 10) return val;
  if (val === 11) return "J";
  if (val === 12) return "Q";
  if (val === 13) return "K";
  if (val === 14) return "A";
  return val;
};

// ==========================================
// 2. COMPONENT: 3D CARD (OPTIMIZED GPU)
// ==========================================
// OPTIMIZATION: Dùng memo để card không bị re-render khi parent state (tiền, streak) đổi
const Card3D = memo(
  ({
    card,
    isFlipped,
    status = "NORMAL",
    label,
  }: {
    card: { val: number; suit: any } | null;
    isFlipped: boolean;
    status?: "NORMAL" | "WIN" | "LOSE";
    label?: string;
  }) => {
    const variants: Variants = {
      hidden: { rotateY: 180, scale: 1, z: 0 },
      visible: { rotateY: 0, scale: 1, z: 0 },
      win: {
        rotateY: 0,
        scale: 1.1,
        z: 20,
        transition: { type: "spring", stiffness: 300 },
      },
      lose: { rotateY: 0, scale: 0.9, opacity: 0.6, filter: "grayscale(100%)" },
    };

    const currentState = isFlipped
      ? "hidden"
      : status === "WIN"
      ? "win"
      : status === "LOSE"
      ? "lose"
      : "visible";

    return (
      <div className="relative w-36 h-56 sm:w-44 sm:h-64 perspective-1000 group">
        {/* Label */}
        {label && (
          <div className="absolute -top-8 left-0 w-full text-center">
            <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full border border-red-900/30">
              {label}
            </span>
          </div>
        )}

        {/* Card Container */}
        <motion.div
          variants={variants}
          initial="hidden"
          animate={currentState}
          transition={{ duration: 0.6, ease: "backOut" }}
          // OPTIMIZATION: will-change để browser chuẩn bị layer GPU riêng cho transform
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          className="w-full h-full relative preserve-3d shadow-2xl"
        >
          {/* === MẶT SAU (LƯNG BÀI) === */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl backface-hidden overflow-hidden border-2 border-red-900/50 shadow-inner bg-[#0a0505]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Họa tiết lưng bài - Static Layer */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />
            <div className="absolute inset-2 border border-red-800/30 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-t from-red-900 to-black rounded-full flex items-center justify-center border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <span className="text-4xl animate-pulse">👹</span>
              </div>
            </div>
          </div>

          {/* === MẶT TRƯỚC === */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full rounded-xl backface-hidden bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col justify-between p-3 overflow-hidden shadow-xl border-4",
              status === "WIN"
                ? "border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.6)]"
                : status === "LOSE"
                ? "border-gray-600 grayscale"
                : "border-white"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            {card && (
              <>
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arches.png')]" />

                {/* Góc Trái Trên */}
                <div className="flex flex-col items-center self-start leading-none z-10">
                  <span
                    className={cn(
                      "text-2xl font-black font-serif",
                      card.suit.color === "red" ? "text-red-600" : "text-black"
                    )}
                  >
                    {getCardLabel(card.val)}
                  </span>
                  <span
                    className={cn(
                      "text-xl",
                      card.suit.color === "red" ? "text-red-600" : "text-black"
                    )}
                  >
                    {card.suit.symbol}
                  </span>
                </div>

                {/* Giữa (Suit Lớn) */}
                <div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-md",
                    card.suit.color === "red" ? "text-red-600" : "text-black"
                  )}
                >
                  {card.suit.symbol}
                </div>

                {/* Góc Phải Dưới (Xoay ngược) */}
                <div className="flex flex-col items-center self-end leading-none transform rotate-180 z-10">
                  <span
                    className={cn(
                      "text-2xl font-black font-serif",
                      card.suit.color === "red" ? "text-red-600" : "text-black"
                    )}
                  >
                    {getCardLabel(card.val)}
                  </span>
                  <span
                    className={cn(
                      "text-xl",
                      card.suit.color === "red" ? "text-red-600" : "text-black"
                    )}
                  >
                    {card.suit.symbol}
                  </span>
                </div>
              </>
            )}

            {/* Hiệu ứng bóng (Glare) - Pure CSS hover, GPU handled */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none will-change-[opacity]" />
          </div>
        </motion.div>
      </div>
    );
  },
  // Custom comparison function for memo (Optional but good for strictness)
  (prev, next) => {
    return (
      prev.isFlipped === next.isFlipped &&
      prev.status === next.status &&
      prev.card?.val === next.card?.val &&
      prev.card?.suit.symbol === next.card?.suit.symbol
    );
  }
);
// Display name for debugging
Card3D.displayName = "Card3D";

// ==========================================
// 3. MAIN GAME LOGIC
// ==========================================
export const CardDuelGame = ({ onPlayCost, onReward, balance }: any) => {
  const [currentCard, setCurrentCard] = useState<{
    val: number;
    suit: any;
  } | null>(null);
  const [nextCard, setNextCard] = useState<{ val: number; suit: any } | null>(
    null
  );

  const [gameState, setGameState] = useState<
    "IDLE" | "PLAYING" | "PROCESSING" | "GAMEOVER"
  >("IDLE");
  const [streak, setStreak] = useState(0);
  const [betAmount, setBetAmount] = useState(GAME_CONFIG.CARD.cost);
  const [result, setResult] = useState<"WIN" | "LOSE" | null>(null);

  // Animation Controls
  const controls = useAnimation();

  // --- LOGIC GIỮ NGUYÊN ---
  const handleReset = useCallback(() => {
    setNextCard(null);
    setResult(null);
    setGameState("IDLE");
  }, []);

  const handleDeal = useCallback(() => {
    if (balance < betAmount) {
      return alert("Đạo hữu không đủ linh thạch!");
    }
    onPlayCost(betAmount);
    setStreak(0);
    setResult(null);
    setNextCard(null);
    setGameState("PLAYING");

    const val = CARDS[Math.floor(Math.random() * CARDS.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    setCurrentCard({ val, suit });
    playSound("spin");
  }, [balance, betAmount, onPlayCost]);

  const handleGuess = useCallback(
    (guess: "HIGHER" | "LOWER") => {
      if (gameState !== "PLAYING" || !currentCard) return;

      let newVal = CARDS[Math.floor(Math.random() * CARDS.length)];
      const newSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
      while (newVal === currentCard.val)
        newVal = CARDS[Math.floor(Math.random() * CARDS.length)];

      const nextCardObj = { val: newVal, suit: newSuit };
      setNextCard(nextCardObj);
      setGameState("PROCESSING");
      playSound("flip");

      const isHigher = newVal > currentCard.val;
      const isWin =
        (guess === "HIGHER" && isHigher) || (guess === "LOWER" && !isHigher);

      setTimeout(() => {
        if (isWin) {
          processWin(nextCardObj);
        } else {
          processLose();
        }
      }, 600);
    },
    [gameState, currentCard]
  );

  const processWin = (winningCard: any) => {
    playSound("win");
    setResult("WIN");

    // Fix: access streak from state setter to ensure latest value
    setStreak((currentStreak) => {
      const multiplier = 1.5 + currentStreak * 0.1;
      const reward = Math.floor(betAmount * multiplier);
      onReward(reward);
      return currentStreak + 1;
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#fbbf24"],
    });

    setTimeout(() => {
      setResult(null);
      setCurrentCard(winningCard);
      setNextCard(null);
      setGameState("PLAYING");
    }, 1200);
  };

  const processLose = () => {
    playSound("fail");
    setResult("LOSE");

    // OPTIMIZATION: Animation x is cheaper than left/margin
    controls.start({
      x: [0, -20, 20, -10, 10, 0],
      transition: { duration: 0.4 },
    });

    setGameState("GAMEOVER");
  };

  const changeBet = (factor: number) => {
    if (gameState === "IDLE")
      setBetAmount(Math.max(100, Math.floor(betAmount * factor)));
  };

  return (
    <div className="flex flex-col items-center h-full w-full bg-[#0f0202] relative overflow-hidden p-4">
      {/* Background Decor - OPTIMIZATION: pointer-events-none & transform-gpu */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 mix-blend-overlay pointer-events-none transform-gpu" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none transform-gpu" />

      {/* --- HEADER --- */}
      <div className="w-full flex justify-between items-start z-20 shrink-0 mb-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-red-600 uppercase tracking-widest drop-shadow-[0_2px_5px_rgba(220,38,38,0.8)]">
            Huyết Nguyệt
          </h3>
          <p className="text-xs text-red-400/60 font-mono">
            High-Low • Cược: {betAmount}
          </p>
        </div>
        <div className="text-right">
          {/* OPTIMIZATION: Chỉ animate scale/opacity, layout ko đổi */}
          <motion.div
            key={streak}
            initial={{ scale: 1.5, color: "#fff" }}
            animate={{ scale: 1, color: "#ef4444" }}
            className="text-5xl font-black italic drop-shadow-[0_0_15px_#ef4444] will-change-transform"
          >
            x{streak}
          </motion.div>
          <div className="text-[10px] text-red-300 uppercase tracking-[0.3em]">
            Combo
          </div>
        </div>
      </div>

      {/* --- GAME AREA --- */}
      <motion.div
        animate={controls}
        // OPTIMIZATION: will-change transform cho container rung lắc
        className="flex-1 w-full flex flex-col items-center justify-center relative min-h-0 will-change-transform"
      >
        {/* RESULT NOTIFICATION (Floating) */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              // OPTIMIZATION: will-change để GPU xử lý layer nổi này
              style={{ willChange: "transform, opacity" }}
              className={cn(
                "absolute z-50 px-10 py-4 rounded-xl font-black text-4xl uppercase tracking-widest shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 backdrop-blur-xl rotate-[-5deg]",
                result === "WIN"
                  ? "bg-green-600 border-green-300 text-white shadow-green-500/50"
                  : "bg-red-600 border-red-300 text-white shadow-red-500/50"
              )}
            >
              {result === "WIN" ? "THẮNG LỚN!" : "THẤT BẠI!"}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-6 md:gap-12 relative z-10">
          {/* CURRENT CARD */}
          <div className="relative">
            <Card3D
              card={currentCard}
              isFlipped={!currentCard}
              label="Hiện Tại"
              status={result === "LOSE" ? "LOSE" : "NORMAL"}
            />
          </div>

          {/* VS ICON */}
          <div className="flex flex-col items-center gap-2 z-20">
            {/* OPTIMIZATION: transform-gpu cho hiệu ứng pulse */}
            <div className="w-14 h-14 bg-gradient-to-br from-red-700 to-red-950 rounded-full flex items-center justify-center border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse transform-gpu">
              <span className="text-xl font-black text-yellow-100 italic">
                VS
              </span>
            </div>
          </div>

          {/* NEXT CARD */}
          <div className="relative">
            <Card3D
              card={nextCard}
              isFlipped={!nextCard}
              label="Tiếp Theo"
              status={result === "WIN" ? "WIN" : "NORMAL"}
            />
          </div>
        </div>

        {/* GAME STATE MESSAGE */}
        <div className="h-10 mt-8">
          <AnimatePresence mode="wait">
            {gameState === "PLAYING" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-yellow-500 uppercase tracking-widest bg-black/40 px-6 py-2 rounded-full border border-yellow-500/30 will-change-[transform,opacity]"
              >
                Chọn Cao hay Thấp?
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- CONTROL PANEL --- */}
      <div className="w-full max-w-[600px] shrink-0 z-20 mt-4 mb-2">
        <div className="bg-[#1a0505]/90 backdrop-blur-md border border-red-900/50 p-4 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          {/* Bet Controls */}
          <div
            className={cn(
              "flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5 transition-all duration-300",
              gameState !== "IDLE" ? "hidden" : ""
            )}
          >
            <div className="flex items-center gap-3 pl-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
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
                  className="bg-transparent border-none outline-none text-white font-mono font-bold w-24 text-lg"
                />
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => changeBet(0.5)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400 border border-white/5"
              >
                ½
              </button>
              <button
                onClick={() => changeBet(2)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400 border border-white/5"
              >
                2x
              </button>
              <button
                onClick={() => setBetAmount(10000)}
                className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 rounded text-[10px] text-red-400 border border-red-900/50 font-bold"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-4 h-16">
            {gameState === "IDLE" ? (
              <AncientButton
                onClick={handleDeal}
                size="lg"
                variant="danger"
                className="w-full h-full text-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] border-red-500/50 hover:bg-red-900"
              >
                CHIA BÀI
              </AncientButton>
            ) : gameState === "GAMEOVER" ? (
              <AncientButton
                onClick={handleReset}
                size="lg"
                variant="ghost"
                className="w-full h-full text-xl border-white/20 hover:bg-white/10"
              >
                CHƠI LẠI
              </AncientButton>
            ) : (
              <>
                <button
                  onClick={() => handleGuess("LOWER")}
                  disabled={gameState === "PROCESSING"}
                  className="flex-1 bg-gradient-to-b from-blue-900 to-blue-950 border border-blue-500/50 rounded-xl flex flex-col items-center justify-center hover:brightness-125 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group shadow-lg"
                >
                  <span className="text-3xl font-black text-blue-400 group-hover:text-blue-200 mb-1">
                    ↓
                  </span>
                  <span className="text-xs font-bold text-blue-100 group-hover:text-white uppercase tracking-widest">
                    THẤP
                  </span>
                </button>

                <button
                  onClick={() => handleGuess("HIGHER")}
                  disabled={gameState === "PROCESSING"}
                  className="flex-1 bg-gradient-to-b from-red-900 to-red-950 border border-red-500/50 rounded-xl flex flex-col items-center justify-center hover:brightness-125 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group shadow-lg"
                >
                  <span className="text-3xl font-black text-red-400 group-hover:text-red-200 mb-1">
                    ↑
                  </span>
                  <span className="text-xs font-bold text-red-100 group-hover:text-white uppercase tracking-widest">
                    CAO
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
