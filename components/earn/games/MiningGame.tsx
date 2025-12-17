"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";
import { playSound, cn } from "../config/utils";

export const MiningGame = ({
  onReward,
}: {
  onReward: (amount: number) => void;
}) => {
  // ... (Paste logic MiningGame ở đây) ...
  // [Code MiningGame cũ không thay đổi logic]
  // Nhớ return JSX như cũ
  const [rockHp, setRockHp] = useState(100);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: number; x: number; y: number; val: string; isCrit: boolean }[]
  >([]);
  const rockRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const timer = setInterval(() => {
      setRockHp((prev) => Math.min(prev + 1, 100));
      setCombo((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMine = async (e: React.MouseEvent) => {
    e.preventDefault();

    const isCrit = Math.random() < 0.15;
    const baseDmg = 5 + Math.floor(level * 0.5);
    const damage = isCrit ? baseDmg * 3 : baseDmg;

    playSound(isCrit ? "crit" : "crack");
    if (navigator.vibrate) navigator.vibrate(isCrit ? 50 : 10);

    controls.start({
      x: [0, -5, 5, -5, 5, 0],
      rotate: [0, -2, 2, -1, 1, 0],
      transition: { duration: 0.1 },
    });

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() - 0.5) * 60;
    const y = e.clientY - rect.top + (Math.random() - 0.5) * 60;
    const newText = { id: Date.now(), x, y, val: `-${damage}`, isCrit };

    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(
      () => setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id)),
      1000
    );

    setCombo((c) => c + 1);
    let newHp = rockHp - damage;

    if (newHp <= 0) {
      playSound("win");
      const reward = Math.floor(Math.random() * 30) + 10 * level;
      onReward(reward);
      setLevel((l) => l + 1);
      newHp = 100;
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10B981", "#F59E0B"],
        zIndex: 9999,
      });
    }
    setRockHp(newHp);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative select-none">
      <div className="absolute top-4 w-full flex justify-between px-10 items-end z-20">
        <div className="text-left">
          <h3 className="text-3xl font-black text-emerald-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            Linh Mạch
          </h3>
          <div className="text-xs text-emerald-600 font-mono">
            Tầng thứ {level}
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={combo}
            initial={{ scale: 1.5, color: "#fff" }}
            animate={{ scale: 1, color: "#F59E0B" }}
            className="text-5xl font-black italic drop-shadow-lg"
          >
            x{combo}
          </motion.div>
          <div className="text-[10px] text-amber-700 uppercase">
            Combo Liên Kích
          </div>
        </div>
      </div>

      <div className="w-full max-w-md h-5 bg-black/80 border border-emerald-900/50 rounded-full mb-12 relative overflow-hidden shadow-inner mt-24">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
          initial={{ width: "100%" }}
          animate={{ width: `${rockHp}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference z-10">
          {rockHp > 0 ? `${rockHp}% Cấu Trúc` : "PHÁ VỠ!!!"}
        </div>
      </div>

      <div className="relative group cursor-pointer" onClick={handleMine}>
        <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full scale-150 group-hover:bg-emerald-500/30 transition-all duration-500"></div>

        <motion.div
          ref={rockRef}
          animate={controls}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-72 h-72 z-10"
        >
          <div className="w-full h-full bg-[#0f1f1a] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] border-[6px] border-emerald-900/80 shadow-[inset_10px_10px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.1)] flex items-center justify-center overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_0_80px_rgba(16,185,129,0.5)] group-hover:border-emerald-500/50">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>

            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                rockHp < 80 ? "opacity-100" : "opacity-0"
              )}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                fill="none"
                stroke="rgba(16,185,129,0.5)"
                strokeWidth="2"
              >
                <path
                  d="M100 100 L140 60 M100 100 L60 140 M100 100 L150 120"
                  strokeDasharray="100"
                  strokeDashoffset={rockHp * 2}
                />
              </svg>
            </div>

            <div className="text-8xl filter drop-shadow-2xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300 animate-pulse">
              {rockHp > 60 ? "🪨" : rockHp > 20 ? "💠" : "✨"}
            </div>
          </div>

          <AnimatePresence>
            {floatingTexts.map((text) => (
              <motion.div
                key={text.id}
                initial={{ opacity: 1, y: text.y, x: text.x, scale: 0.5 }}
                animate={{
                  opacity: 0,
                  y: text.y - 150,
                  scale: text.isCrit ? 2.5 : 1.2,
                  rotate: text.isCrit ? Math.random() * 20 - 10 : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "absolute pointer-events-none font-black z-50 whitespace-nowrap select-none",
                  text.isCrit
                    ? "text-red-500 text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-serif border-text"
                    : "text-white text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono"
                )}
              >
                {text.isCrit ? "BẠO KÍCH!" : text.val}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-12 text-center z-10">
        <p className="text-emerald-500/60 font-mono text-xs uppercase tracking-widest animate-pulse">
          [Nhấn chuột liên tục để phá vỡ phong ấn]
        </p>
      </div>
    </div>
  );
};
