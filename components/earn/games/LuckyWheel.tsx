"use client";
import React, { useState, useRef, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";
import { GAME_CONFIG } from "../config/constants";
import { playSound } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";

export const LuckyWheel = ({ onPlayCost, onReward, balance }: any) => {
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
  const rotationRef = useRef<number>(0);
  const MIN_SPIN_ROUNDS = 10;

  const computeOffsetForIndex = (winningIndex: number) => {
    const segmentCenter =
      winningIndex * degreesPerSegment + degreesPerSegment / 2;
    let alignAngle = 270 - segmentCenter;
    alignAngle = ((alignAngle % 360) + 360) % 360;
    const base = MIN_SPIN_ROUNDS * 360 + alignAngle;
    return base + (Math.random() * 8 - 4);
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    if (balance < GAME_CONFIG.WHEEL.cost) return alert("Không đủ linh thạch!");

    onPlayCost(GAME_CONFIG.WHEEL.cost);
    setIsSpinning(true);
    playSound("spin");

    const chosenIndex = chooseWinner();
    const offset = computeOffsetForIndex(chosenIndex);
    const finalAngle = rotationRef.current + offset;

    await controls.start({
      rotate: finalAngle,
      transition: { duration: 5.5, ease: [0.12, 0.8, 0.35, 1] },
    });

    rotationRef.current = finalAngle;
    const landedAngle = ((rotationRef.current % 360) + 360) % 360;
    const angleAtTop = (((270 - landedAngle) % 360) + 360) % 360;
    const landedIndex =
      Math.floor(angleAtTop / degreesPerSegment) % numSegments;
    const landedSegment = segments[landedIndex];

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

  // --- OPTIMIZATION START: Đưa logic vẽ ra khỏi render chính ---
  // Memoize SVG để React không tính toán lại path mỗi khi re-render (ví dụ khi state isSpinning đổi)
  const wheelSVG = useMemo(() => {
    const polarToCartesian = (
      cx: number,
      cy: number,
      r: number,
      angleDeg: number
    ) => {
      const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
      return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
      };
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
      <svg viewBox="0 0 400 400" className="w-full h-full rounded-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="hubGradient" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#fff2d1" />
            <stop offset="100%" stopColor="#b36b00" />
          </radialGradient>
        </defs>
        <g transform="translate(200,200)">
          <circle r="190" fill="#3b220c" stroke="#8b4513" strokeWidth="6" />
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
          <circle
            r="56"
            fill="url(#hubGradient)"
            stroke="#f6e1b3"
            strokeWidth="3"
          />
        </g>
      </svg>
    );
  }, [segments, degreesPerSegment]);
  // --- OPTIMIZATION END ---

  return (
    <div className="flex flex-col items-center justify-center h-full relative z-10">
      <h3 className="text-4xl font-extrabold text-amber-400 mb-6 tracking-widest drop-shadow-md">
        THIÊN VẬN BÀN
      </h3>
      <div className="relative flex flex-col items-center">
        <div
          aria-hidden
          className="absolute -top-6 z-30 text-red-500 text-5xl drop-shadow-lg"
        >
          ▼
        </div>
        <motion.div
          ref={wheelRef}
          animate={controls}
          initial={{ rotate: 0 }}
          // OPTIMIZATION: Thêm will-change-transform và transform-gpu
          // will-change: transform -> Báo trình duyệt rasterize thành bitmap để GPU quay
          // transform-gpu -> Kích hoạt hardware acceleration
          className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-b from-black/80 to-black/90 flex items-center justify-center shadow-[0_0_120px_rgba(0,0,0,0.8)] will-change-transform transform-gpu"
          style={{ rotate: 0 }}
        >
          {wheelSVG}

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
