"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { GAME_CONFIG } from "../config/constants";
import { playSound } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";

const RUNES = ["⚡", "🔥", "❄️", "🌑", "☀️", "⚔️", "🐉", "🧿"];

export const MemoryGame = ({ onPlayCost, onReward, balance }: any) => {
  const [gameState, setGameState] = useState<
    "IDLE" | "PREVIEW" | "PLAYING" | "WON"
  >("IDLE");
  const [cards, setCards] = useState<
    { id: number; rune: string; isFlipped: boolean; isMatched: boolean }[]
  >([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);

  const startGame = () => {
    if (balance < GAME_CONFIG.MEMORY.cost) return alert("Không đủ linh thạch!");
    onPlayCost(GAME_CONFIG.MEMORY.cost);

    const deck = [...RUNES, ...RUNES]
      .sort(() => Math.random() - 0.5)
      .map((rune, i) => ({ id: i, rune, isFlipped: true, isMatched: false }));

    setCards(deck);
    setGameState("PREVIEW");
    setCountdown(3);
    setFlippedIndices([]);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCards((c) => c.map((card) => ({ ...card, isFlipped: false })));
          setGameState("PLAYING");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCardClick = (index: number) => {
    if (
      gameState !== "PLAYING" ||
      cards[index].isFlipped ||
      flippedIndices.length >= 2
    )
      return;

    playSound("flip");

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [idx1, idx2] = newFlipped;
      if (newCards[idx1].rune === newCards[idx2].rune) {
        setTimeout(() => {
          playSound("win");
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);

          if (newCards.every((c) => c.isMatched)) {
            setGameState("WON");
            const reward = GAME_CONFIG.MEMORY.cost * 3;
            onReward(reward);
            confetti({ colors: ["#FFD700", "#FFF"] });
          }
        }, 500);
      } else {
        setTimeout(() => {
          playSound("fail");
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {gameState === "IDLE" ? (
        <div className="text-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-64 bg-[#0a0a0a] border border-amber-900/50 rounded-xl flex items-center justify-center mb-8 mx-auto shadow-[0_0_50px_rgba(245,158,11,0.1)]"
          >
            <span className="text-6xl animate-pulse">📜</span>
          </motion.div>
          <h3 className="text-2xl font-bold text-amber-500 mb-2">
            Trận Pháp Cổ
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
            Bạn có 3 giây để ghi nhớ vị trí các phù chú trước khi chúng bị phong
            ấn.
          </p>
          <AncientButton onClick={startGame} size="lg" variant="gold">
            Khai Trận ({GAME_CONFIG.MEMORY.cost} 💎)
          </AncientButton>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full max-w-2xl mb-4 px-4 items-center z-10">
            <div className="text-amber-500 font-bold">
              {gameState === "PREVIEW"
                ? `GHI NHỚ: ${countdown}s`
                : gameState === "PLAYING"
                ? "ĐANG GIẢI TRẬN..."
                : "HOÀN THÀNH!"}
            </div>
            <div className="text-xs text-gray-500">
              {cards.filter((c) => c.isMatched).length / 2} / {RUNES.length} Cặp
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 bg-black/40 rounded-2xl border border-amber-900/30 backdrop-blur-sm shadow-2xl z-10">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                onClick={() => handleCardClick(idx)}
                className="relative w-16 h-24 md:w-20 md:h-28 cursor-pointer [perspective:1000px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 to-black border border-amber-800/60 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-full h-full border border-amber-900/30 m-1 rounded flex items-center justify-center opacity-30">
                    <div className="w-8 h-8 rounded-full border border-amber-500/20"></div>
                  </div>
                </div>

                <div
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-900 to-black border-2 border-amber-500 rounded-lg flex items-center justify-center text-3xl md:text-4xl shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card.rune}
                </div>
              </motion.div>
            ))}
          </div>

          {gameState === "WON" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 z-10"
            >
              <AncientButton onClick={() => setGameState("IDLE")}>
                Chơi Lại
              </AncientButton>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
