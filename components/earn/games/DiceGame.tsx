"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { GAME_CONFIG } from "../config/constants";
import { playSound, cn } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";

export const DiceGame = ({ onPlayCost, onReward, balance }: any) => {
  // ... Paste logic DiceGame ...
  const [selected, setSelected] = useState<"TAI" | "XIU" | null>(null);
  const [dice, setDice] = useState([1, 1, 1]);
  const [isShaking, setIsShaking] = useState(false);
  const [isBowlOpen, setIsBowlOpen] = useState(true);
  const [history, setHistory] = useState<("T" | "X")[]>([]);

  const handleShake = async () => {
    if (!selected) return alert("Vui lòng đặt cửa!");
    if (balance < GAME_CONFIG.DICE.cost) return alert("Hết tiền rồi đạo hữu!");

    onPlayCost(GAME_CONFIG.DICE.cost);
    setIsBowlOpen(false);
    setIsShaking(true);
    playSound("shake");

    setTimeout(() => {
      setIsShaking(false);
      playSound("open");

      const newDice = [
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
      ];
      setDice(newDice);
      setIsBowlOpen(true);

      const total = newDice.reduce((a, b) => a + b, 0);
      const result = total >= 11 ? "TAI" : "XIU";

      const entry: "T" | "X" = result === "TAI" ? "T" : "X";
      setHistory((prev) => [entry, ...prev].slice(0, 10));

      if (result === selected) {
        playSound("win");
        onReward(GAME_CONFIG.DICE.cost * 1.95);
        confetti({ origin: { y: 0.7 } });
      } else {
        playSound("fail");
      }
      setSelected(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex gap-2 mb-8 p-3 bg-black/60 rounded-full border border-white/5 z-10">
        {history.length === 0 && (
          <span className="text-gray-500 text-xs px-2">Chưa có lịch sử</span>
        )}
        {history.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
              h === "T"
                ? "bg-red-900 border-red-500 text-red-100"
                : "bg-gray-800 border-gray-400 text-white"
            )}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-8 z-10">
        <div className="absolute bottom-0 w-60 h-60 rounded-full bg-gradient-to-b from-gray-800 to-black border-4 border-amber-900 shadow-2xl"></div>

        <div className="relative z-10 flex gap-4 transform translate-y-4">
          {dice.map((val, i) => (
            <motion.div
              key={i}
              className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center border border-gray-300"
              animate={
                isShaking
                  ? {
                      x: [
                        0,
                        Math.random() * 20 - 10,
                        Math.random() * 20 - 10,
                        0,
                      ],
                      y: [
                        0,
                        Math.random() * 20 - 10,
                        Math.random() * 20 - 10,
                        0,
                      ],
                      rotate: [0, Math.random() * 360, Math.random() * 360],
                    }
                  : { rotate: 0, x: 0, y: 0 }
              }
              transition={{ duration: 0.1, repeat: isShaking ? Infinity : 0 }}
            >
              <span
                className={cn(
                  "text-2xl font-bold",
                  val === 1 ? "text-red-600" : "text-black"
                )}
              >
                {val}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="absolute -top-10 left-0 w-64 h-64 bg-gradient-to-br from-amber-800 to-amber-950 rounded-full border-b-8 border-amber-600 shadow-2xl z-20 flex items-center justify-center overflow-hidden"
          initial={{ y: -200, opacity: 0 }}
          animate={{
            y: isBowlOpen ? -200 : 0,
            opacity: isBowlOpen ? 0 : 1,
            x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-40 h-40 border-4 border-amber-500/30 rounded-full flex items-center justify-center">
            <span className="text-6xl text-amber-500/50">☯</span>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-6 w-full max-w-lg px-4 mb-8 z-10">
        <button
          onClick={() => setSelected("TAI")}
          className={cn(
            "flex-1 py-8 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden",
            selected === "TAI"
              ? "bg-red-900/80 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)] scale-105"
              : "bg-black/40 border-red-900/30 hover:border-red-500/50"
          )}
        >
          <span className="text-4xl font-black text-red-500">TÀI</span>
          <span className="text-xs text-red-300/50 font-mono">11 - 17</span>
        </button>

        <button
          onClick={() => setSelected("XIU")}
          className={cn(
            "flex-1 py-8 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden",
            selected === "XIU"
              ? "bg-gray-800/90 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-105"
              : "bg-black/40 border-gray-700 hover:border-white/50"
          )}
        >
          <span className="text-4xl font-black text-white">XỈU</span>
          <span className="text-xs text-gray-500 font-mono">4 - 10</span>
        </button>
      </div>

      <AncientButton
        onClick={handleShake}
        disabled={isShaking || !selected}
        className="w-64 z-10"
        variant="primary"
      >
        {isShaking ? "Đang Xóc..." : `Đặt Cược (${GAME_CONFIG.DICE.cost} 💎)`}
      </AncientButton>
    </div>
  );
};
