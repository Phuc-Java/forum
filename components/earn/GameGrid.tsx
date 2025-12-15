"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  PanInfo,
  Variants,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
// Giữ lại import cũ để đảm bảo không lỗi
import { spinWheel, mineSpiritStone, openMysteryBox } from "@/lib/actions/earn";
import confetti from "canvas-confetti";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ==========================================
// 1. UTILITIES & CONFIGURATION
// ==========================================

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Giả lập âm thanh
const playSound = (
  type:
    | "click"
    | "win"
    | "spin"
    | "crack"
    | "flip"
    | "fail"
    | "crit"
    | "shake"
    | "open"
) => {
  // const audio = new Audio(`/sounds/${type}.mp3`); audio.play().catch(() => {});
};

// Cấu hình Game
const GAME_CONFIG = {
  WHEEL: {
    id: "WHEEL",
    name: "Thiên Vận Bàn",
    desc: "Vòng quay định mệnh, nghịch thiên cải mệnh.",
    cost: 500,
    icon: "☸️",
  },
  MINING: {
    id: "MINING",
    name: "Linh Mạch Cổ",
    desc: "Khai thác linh thạch từ lõi trái đất.",
    cost: 0,
    icon: "⛏️",
  },
  MEMORY: {
    id: "MEMORY",
    name: "Phù Chú Trận",
    desc: "Phá giải phong ấn trí nhớ.",
    cost: 2000,
    icon: "📜",
  },
  DICE: {
    id: "DICE",
    name: "Bát Quái Đổ",
    desc: "Cược lớn thắng lớn, nhất chín nhì bù.",
    cost: 1000,
    icon: "🎲",
  },
  BEASTS: {
    id: "BEASTS",
    name: "Ngự Thú Sư",
    desc: "Triệu hồi thần thú thượng cổ.",
    cost: 1500,
    icon: "🐉",
  },
};

type GameMode = keyof typeof GAME_CONFIG | "LOBBY";

// ==========================================
// 2. VISUAL COMPONENTS (UI KITS)
// ==========================================

// Nút bấm phong cách Tu Tiên (Nâng cấp visual)
const AncientButton = ({
  onClick,
  disabled,
  children,
  className,
  variant = "primary",
  size = "md",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border-amber-600/50 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]",
    gold: "bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-700 border-yellow-300 text-black font-black shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:brightness-110",
    danger:
      "bg-gradient-to-r from-red-900 via-red-800 to-red-950 border-red-500 text-red-50 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-red-600/50",
    ghost:
      "bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-12 py-5 text-xl tracking-[0.2em]",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95, y: 0 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-sm font-serif font-bold uppercase tracking-widest border transition-all overflow-hidden group select-none",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 grayscale cursor-not-allowed",
        className
      )}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-700 ease-in-out pointer-events-none"></div>

      {/* Góc trang trí */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40 group-hover:border-white/80 transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40 group-hover:border-white/80 transition-colors"></div>

      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
};

// Hiệu ứng nền Linh Khí (Particles Background) - Nâng cấp
const SpiritBackground = () => {
  const [particles, setParticles] = useState<
    | {
        x: number;
        y: number;
        scale: number;
        animX: number;
        animY: number;
        duration: number;
        delay: number;
      }[]
    | null
  >(null);

  useEffect(() => {
    const arr = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      scale: Math.random() * 0.5 + 0.5,
      animY: Math.random() * -200,
      animX: (Math.random() - 0.5) * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sương mù */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,0),#000)] z-10"></div>
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"
      />

      {/* Linh khí bay - tạo trên client trong useEffect để tránh gọi Math.random() khi render */}
      {particles &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: p.x, y: p.y, scale: p.scale }}
            animate={{
              opacity: [0, 0.4, 0],
              y: [null, p.animY],
              x: [null, p.animX],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
            className={cn(
              "absolute rounded-full blur-[2px]",
              i % 3 === 0 ? "w-1 h-1 bg-amber-500" : "w-2 h-2 bg-emerald-900/40"
            )}
          />
        ))}
    </div>
  );
};

// ==========================================
// 3. MINING GAME: LINH MẠCH (CLICKER)
// ==========================================

const MiningGame = ({ onReward }: { onReward: (amount: number) => void }) => {
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

// ==========================================
// 4. MEMORY GAME: PHÙ CHÚ (PREVIEW MODE)
// ==========================================

const RUNES = ["⚡", "🔥", "❄️", "🌑", "☀️", "⚔️", "🐉", "🧿"];
const MemoryGame = ({ onPlayCost, onReward, balance }: any) => {
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

// ==========================================
// 5. DICE GAME: BÁT QUÁI (3D SHAKE)
// ==========================================

const DiceGame = ({ onPlayCost, onReward, balance }: any) => {
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

// ==========================================
// 7. WHEEL GAME: THIÊN VẬN BÀN
// ==========================================

const LuckyWheel = ({ onPlayCost, onReward, balance }: any) => {
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const segments = [
    { label: "X0.5", multiplier: 0.5, color: "#7b0f0f" },
    { label: "X2", multiplier: 2, color: "#f59e0b" },
    { label: "X0", multiplier: 0, color: "#4b5563" },
    { label: "X5", multiplier: 5, color: "#d72626" },
    { label: "X0.5", multiplier: 0.5, color: "#7b0f0f" },
    { label: "X10", multiplier: 10, color: "#ffdf5d" },
    { label: "X0", multiplier: 0, color: "#374151" },
    { label: "X3", multiplier: 3, color: "#f59e0b" },
  ];

  const numSegments = segments.length;
  const degreesPerSegment = 360 / numSegments;

  const chooseWinner = () => Math.floor(Math.random() * numSegments);

  // helper to compute offset so selected segment lands at top pointer
  // We'll keep rotations cumulative to ensure every spin animates.
  const rotationRef = useRef<number>(0);
  const MIN_SPIN_ROUNDS = 10; // ensure at least 10 full rotations per spin

  const computeOffsetForIndex = (winningIndex: number) => {
    const segmentCenter =
      winningIndex * degreesPerSegment + degreesPerSegment / 2;
    // We want (segmentCenter + rotation) % 360 === 270 (top pointer at -90deg)
    // => rotation = 270 - segmentCenter (mod 360)
    let alignAngle = 270 - segmentCenter;
    alignAngle = ((alignAngle % 360) + 360) % 360; // normalize
    const base = MIN_SPIN_ROUNDS * 360 + alignAngle;
    return base + (Math.random() * 8 - 4); // small jitter
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    if (balance < GAME_CONFIG.WHEEL.cost) return alert("Không đủ linh thạch!");

    onPlayCost(GAME_CONFIG.WHEEL.cost);
    setIsSpinning(true);
    playSound("spin");

    const chosenIndex = chooseWinner();

    // compute an offset relative to current rotation so it always increases
    const offset = computeOffsetForIndex(chosenIndex);
    const finalAngle = rotationRef.current + offset;

    await controls.start({
      rotate: finalAngle,
      transition: { duration: 5.5, ease: [0.12, 0.8, 0.35, 1] },
    });

    // save cumulative rotation so next spin continues from here
    rotationRef.current = finalAngle;

    // determine actual landed index from final rotation (avoid mismatch between chosen and visual)
    const landedAngle = ((rotationRef.current % 360) + 360) % 360; // [0,360)
    // angleAtTop is the angle on wheel that currently sits at top (270 deg reference)
    const angleAtTop = (((270 - landedAngle) % 360) + 360) % 360;
    const landedIndex =
      Math.floor(angleAtTop / degreesPerSegment) % numSegments;
    const landedSegment = segments[landedIndex];

    // announce result based on landedSegment
    setTimeout(() => {
      setIsSpinning(false);
      const rewardAmount = Math.round(
        GAME_CONFIG.WHEEL.cost * landedSegment.multiplier
      );
      if (landedSegment.multiplier > 0) {
        playSound("win");
        onReward(rewardAmount);
        confetti({
          particleCount: 120,
          spread: 90,
          colors: ["#FFD700", "#DC2626", "#F59E0B"],
        });
      } else {
        playSound("fail");
      }
    }, 300);
  };

  // SVG wedge helper
  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleDeg: number
  ) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full relative z-10">
      <h3 className="text-4xl font-extrabold text-amber-400 mb-6 tracking-widest drop-shadow-md">
        THIÊN VẬN BÀN
      </h3>

      <div className="relative flex flex-col items-center">
        {/* pointer */}
        <div
          aria-hidden
          className="absolute -top-6 z-30 text-red-500 text-5xl drop-shadow-lg"
        >
          ▼
        </div>

        {/* wheel */}
        <motion.div
          ref={wheelRef}
          animate={controls}
          initial={{ rotate: 0 }}
          className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-b from-black/80 to-black/90 flex items-center justify-center shadow-[0_0_120px_rgba(0,0,0,0.8)]"
          style={{ rotate: 0 }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full rounded-full">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g transform="translate(200,200)">
              {/* rim */}
              <circle r="190" fill="#3b220c" stroke="#8b4513" strokeWidth="6" />
              {/* segments */}
              {segments.map((seg, i) => {
                const start = i * degreesPerSegment - 90;
                const end = start + degreesPerSegment;
                const path = describeArc(0, 0, 170, start, end);
                const midAngle = start + degreesPerSegment / 2;
                const labelPos = polarToCartesian(0, 0, 120, midAngle);
                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill={seg.color}
                      stroke="#3a2a1a"
                      strokeWidth="1"
                      filter="url(#glow)"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="#111"
                      fontWeight={700}
                      fontSize={18}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none" }}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}

              {/* center hub */}
              <g>
                <circle
                  r="56"
                  fill="url(#hubGradient)"
                  stroke="#f6e1b3"
                  strokeWidth="3"
                />
              </g>
            </g>
            <defs>
              <radialGradient id="hubGradient" cx="50%" cy="30%">
                <stop offset="0%" stopColor="#fff2d1" />
                <stop offset="100%" stopColor="#b36b00" />
              </radialGradient>
            </defs>
          </svg>

          {/* center button overlay */}
          <div className="absolute z-20 pointer-events-none flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center border-2 border-amber-200 shadow-lg text-3xl">
              🎰
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          <AncientButton
            onClick={handleSpin}
            disabled={isSpinning}
            size="lg"
            variant="gold"
          >
            {isSpinning
              ? "Đang Quay..."
              : `Quay Số (${GAME_CONFIG.WHEEL.cost} 💎)`}
          </AncientButton>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. BEAST GAME: NGỰ THÚ SƯ
// ==========================================

const BeastGame = ({ onPlayCost, onReward, balance }: any) => {
  const BEASTS = ["🐉", "🦄", "🐅", "🦅", "🐢", "🐍"];
  const [selectedBeast, setSelectedBeast] = useState<number | null>(null);
  const [resultBeasts, setResultBeasts] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const controls = useAnimation();

  const handleSummon = async () => {
    if (isRolling) return;
    if (selectedBeast === null) return alert("Vui lòng chọn Ngự Thú!");
    if (balance < GAME_CONFIG.BEASTS.cost) return alert("Không đủ linh thạch!");

    onPlayCost(GAME_CONFIG.BEASTS.cost);
    setIsRolling(true);
    playSound("spin");

    // 1. Animation Rung
    controls.start({
      rotate: [0, -5, 5, -5, 5, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, ease: "easeInOut" },
    });

    // 2. Mock Rolling Dice (Bầu Cua style)
    const interval = setInterval(() => {
      setResultBeasts([
        Math.floor(Math.random() * BEASTS.length),
        Math.floor(Math.random() * BEASTS.length),
        Math.floor(Math.random() * BEASTS.length),
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsRolling(false);

      // 3. Final Result
      const finalResult = [
        Math.floor(Math.random() * BEASTS.length),
        Math.floor(Math.random() * BEASTS.length),
        Math.floor(Math.random() * BEASTS.length),
      ];
      setResultBeasts(finalResult);

      // 4. Calculate Payout
      const matches = finalResult.filter((r) => r === selectedBeast).length;
      let rewardAmount = 0;
      if (matches > 0) {
        rewardAmount = GAME_CONFIG.BEASTS.cost * (matches + 1); // 1 match x2, 2 match x3, 3 match x4
        playSound("win");
        onReward(rewardAmount);
        confetti({ particleCount: 80, colors: ["#FFD700", "#DC2626"] });
      } else {
        playSound("fail");
      }
    }, 2500); // 2.5s roll
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h3 className="text-3xl font-black text-amber-500 uppercase tracking-widest drop-shadow-md z-10 mb-8">
        Ngự Thú Tranh Hùng
      </h3>

      {/* Grid Lựa Chọn */}
      <div className="grid grid-cols-3 gap-4 mb-10 w-96 p-4 bg-black/40 rounded-xl border border-amber-900/30">
        {BEASTS.map((beast, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBeast(i)}
            className={cn(
              "w-24 h-24 rounded-lg flex items-center justify-center text-4xl cursor-pointer border-2 transition-all shadow-lg",
              selectedBeast === i
                ? "bg-amber-900/70 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                : "bg-black/40 border-gray-800 hover:border-amber-500/30"
            )}
          >
            {beast}
          </motion.div>
        ))}
      </div>

      {/* Kết quả Quay */}
      <motion.div
        animate={controls}
        className="flex gap-4 p-6 bg-red-950/40 rounded-xl border border-red-900/50 shadow-inner mb-8"
      >
        {resultBeasts.length === 0 ? (
          <div className="w-16 h-16 bg-black/50 border border-red-900 rounded flex items-center justify-center text-xl text-red-500 animate-pulse">
            ?
          </div>
        ) : (
          resultBeasts.map((index, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, rotate: isRolling ? 0 : 360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl shadow-xl border-4 border-gray-300"
            >
              {BEASTS[index]}
            </motion.div>
          ))
        )}
      </motion.div>

      <AncientButton
        onClick={handleSummon}
        disabled={isRolling || selectedBeast === null}
        size="lg"
        variant="danger"
        className="w-64"
      >
        {isRolling
          ? "Triệu Hồi..."
          : `Triệu Hồi (${GAME_CONFIG.BEASTS.cost} 💎)`}
      </AncientButton>
    </div>
  );
};

// ==========================================
// 6. MAIN LOBBY & NAVIGATION
// ==========================================

export default function GameGrid() {
  const [balance, setBalance] = useState(0);
  const [activeMode, setActiveMode] = useState<GameMode>("LOBBY");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const account = new Account(client);
        const databases = new Databases(client);

        const user = await account.get();
        setUserId(user.$id);

        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", user.$id)]
        );
        if (profileRes.documents.length > 0) {
          setBalance(Number(profileRes.documents[0].currency) || 0);
        } else {
          setBalance(10000); // Demo mode
        }
      } catch (e) {
        console.error("Appwrite connect fail (Demo Mode)", e);
        setBalance(10000);
      }
    };
    init();
  }, []);

  // -- APPWRITE SYNC LOGIC --
  const syncBalanceToAppwrite = useCallback(
    async (newBalance: number) => {
      if (!userId) return;

      // Giả lập kết nối Appwrite để giữ nguyên logic
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const databases = new Databases(client);

        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", userId)]
        );

        if (profileRes.documents.length > 0) {
          const profileDocId = profileRes.documents[0].$id;

          // **********************************************
          // !!! ĐÂY LÀ CHỖ CẬP NHẬT THẬT VỀ APPWRITE !!!
          // **********************************************
          // await databases.updateDocument(
          //     APPWRITE_CONFIG.databaseId,
          //     "profiles",
          //     profileDocId,
          //     { currency: newBalance }
          // );
          console.log(
            `[APPWRITE MOCK]: Synced balance for ${userId}: ${newBalance}`
          );
        } else {
          console.error(
            "[APPWRITE MOCK]: Profile document not found for user."
          );
        }
      } catch (error) {
        console.error("[APPWRITE MOCK]: Sync failed:", error);
      }
    },
    [userId]
  );

  const handleCost = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const newVal = prev - amount;
        if (newVal >= 0) {
          // Chỉ sync nếu số dư không âm (tránh bug)
          syncBalanceToAppwrite(newVal);
        }
        return newVal;
      });
    },
    [syncBalanceToAppwrite]
  );

  const handleReward = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const newVal = prev + amount;
        syncBalanceToAppwrite(newVal);
        return newVal;
      });
    },
    [syncBalanceToAppwrite]
  );

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 md:p-8 font-sans text-white relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <SpiritBackground />
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent)] pointer-events-none z-0"></div>

      {/* HEADER HUD - VỊ TRÍ MỚI (reduced top spacing) */}
      <div className="fixed top-20 left-0 right-0 z-50 p-2 md:p-3 flex justify-between items-start pointer-events-none">
        {/* Balance Display */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-full pl-2 pr-6 py-2 flex items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-inner">
            <span className="text-xl">💎</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
              Linh Thạch
            </span>
            <span className="text-lg font-mono font-bold text-white leading-none">
              {balance.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Back Button */}
        {activeMode !== "LOBBY" && (
          <div className="pointer-events-auto">
            <AncientButton
              onClick={() => setActiveMode("LOBBY")}
              size="sm"
              variant="ghost"
            >
              ↩ Rời Bàn
            </AncientButton>
          </div>
        )}
      </div>

      {/* CONTENT AREA - reduced top margin to bring content up (mt-12) */}
      <div className="mt-12 relative z-10">
        <AnimatePresence mode="wait">
          {/* 1. LOBBY VIEW */}
          {activeMode === "LOBBY" ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {Object.values(GAME_CONFIG).map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => setActiveMode(game.id as GameMode)}
                  className="group relative h-72 cursor-pointer rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/30 opacity-60"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 drop-shadow-2xl">
                      {game.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-widest">
                      {game.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-300 line-clamp-2 px-4 font-serif">
                      {game.desc}
                    </p>
                    <div className="mt-6 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-500/80 group-hover:bg-amber-500/10 group-hover:border-amber-500/30">
                      {game.cost > 0 ? `Cược: ${game.cost}` : "Miễn Phí"}
                    </div>
                  </div>

                  {/* Hover Light Sweep */}
                  <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/5 to-transparent rotate-45 group-hover:translate-x-[50%] group-hover:translate-y-[50%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* 2. GAME VIEW CONTAINER */
            <motion.div
              key="game-arena"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative w-full min-h-[700px] bg-[#080808] border border-amber-900/30 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              {/* Decorative Frame */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-amber-800/50 rounded-tl-[2rem] pointer-events-none z-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-amber-800/50 rounded-br-[2rem] pointer-events-none z-20"></div>
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-amber-800/50 rounded-tr-[2rem] pointer-events-none z-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-amber-800/50 rounded-bl-[2rem] pointer-events-none z-20"></div>

              {/* Game Renderer */}
              <div className="flex-1 md:p-4 flex items-center justify-center relative z-10">
                {activeMode === "MINING" && (
                  <MiningGame onReward={handleReward} />
                )}
                {activeMode === "MEMORY" && (
                  <MemoryGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "DICE" && (
                  <DiceGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}

                {/* THIÊN VẬN BÀN */}
                {activeMode === "WHEEL" && (
                  <LuckyWheel
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}

                {/* NGỰ THÚ SƯ */}
                {activeMode === "BEASTS" && (
                  <BeastGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
