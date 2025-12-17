"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";
import { GAME_CONFIG } from "../config/constants";
import { playSound, cn } from "../config/utils";
import { AncientButton } from "../ui/AncientButton";

const BEASTS = ["🐉", "🦄", "🐅", "🦅", "🐢", "🐍"];

export const BeastGame = ({ onPlayCost, onReward, balance }: any) => {
  const [selectedBeast, setSelectedBeast] = useState<number | null>(null);
  // State này chỉ dùng để lưu kết quả CUỐI CÙNG (để React biết), không dùng để animation
  const [resultBeasts, setResultBeasts] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const controls = useAnimation();

  // DIRECT DOM REFS: Dùng để thao tác thẳng vào HTML mà không qua React Render
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval nếu unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSummon = async () => {
    if (isRolling) return;
    if (selectedBeast === null) return alert("Vui lòng chọn Ngự Thú!");
    if (balance < GAME_CONFIG.BEASTS.cost) return alert("Không đủ linh thạch!");

    onPlayCost(GAME_CONFIG.BEASTS.cost);
    setIsRolling(true);
    playSound("spin");

    // Reset hiển thị về trạng thái bắt đầu (nếu cần)
    // Nhưng vì ta dùng Ref đè lên nên không cần reset state ngay lập tức

    // Animation rung lắc (GPU handled via transform)
    controls.start({
      rotate: [0, -5, 5, -5, 5, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, ease: "easeInOut" },
    });

    // --- LOGIC ANIMATION MỚI (KHÔNG RE-RENDER) ---
    // Chạy loop thay đổi innerText trực tiếp
    intervalRef.current = setInterval(() => {
      slotRefs.current.forEach((slot) => {
        if (slot) {
          // Random biểu tượng trực tiếp vào DOM
          slot.innerText = BEASTS[Math.floor(Math.random() * BEASTS.length)];

          // Hiệu ứng scale nhẹ bằng style trực tiếp (GPU friendly)
          slot.style.transform = `scale(${0.9 + Math.random() * 0.2})`;
        }
      });
    }, 80); // Tốc độ nhanh hơn chút cho mượt (80ms)

    // Kết thúc sau 2.5s
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      // 1. Tính kết quả logic
      const finalResult = [
        Math.floor(Math.random() * BEASTS.length),
        Math.floor(Math.random() * BEASTS.length),
        Math.floor(Math.random() * BEASTS.length),
      ];

      // 2. Update UI lần cuối bằng DOM để khớp logic ngay lập tức
      slotRefs.current.forEach((slot, index) => {
        if (slot) {
          slot.innerText = BEASTS[finalResult[index]];
          slot.style.transform = "scale(1)"; // Reset scale
        }
      });

      // 3. Update React State để đồng bộ (chỉ render lại 1 lần ở đây)
      setResultBeasts(finalResult);
      setIsRolling(false);

      // 4. Xử lý thắng thua
      const matches = finalResult.filter((r) => r === selectedBeast).length;
      if (matches > 0) {
        const rewardAmount = GAME_CONFIG.BEASTS.cost * (matches + 1);
        playSound("win");
        onReward(rewardAmount);
        confetti({ particleCount: 80, colors: ["#FFD700", "#DC2626"] });
      } else {
        playSound("fail");
      }
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h3 className="text-3xl font-black text-amber-500 uppercase tracking-widest drop-shadow-md z-10 mb-8">
        Ngự Thú Tranh Hùng
      </h3>

      {/* Grid chọn thú */}
      <div className="grid grid-cols-3 gap-4 mb-10 w-96 p-4 bg-black/40 rounded-xl border border-amber-900/30">
        {BEASTS.map((beast, i) => (
          <motion.div
            key={i}
            // GPU Optimization: will-change-transform giúp browser chuẩn bị layer
            style={{ willChange: "transform" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isRolling && setSelectedBeast(i)}
            className={cn(
              "w-24 h-24 rounded-lg flex items-center justify-center text-4xl cursor-pointer border-2 transition-all shadow-lg select-none",
              selectedBeast === i
                ? "bg-amber-900/70 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                : "bg-black/40 border-gray-800 hover:border-amber-500/30",
              isRolling && "opacity-50 cursor-not-allowed"
            )}
          >
            {beast}
          </motion.div>
        ))}
      </div>

      {/* Khu vực kết quả */}
      <motion.div
        animate={controls}
        // GPU Optimization: will-change-transform cho container rung lắc
        style={{ willChange: "transform" }}
        className="flex gap-4 p-6 bg-red-950/40 rounded-xl border border-red-900/50 shadow-inner mb-8"
      >
        {/* Render 3 ô kết quả */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            // Gán ref để thao tác DOM trực tiếp
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            className={cn(
              "w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl shadow-xl border-4 border-gray-300 transition-transform duration-100",
              // Nếu chưa có kết quả và ko quay -> hiện dấu ?
              resultBeasts.length === 0 &&
                !isRolling &&
                "text-red-500 bg-black/50 border-red-900 text-xl"
            )}
          >
            {/* Logic hiển thị ban đầu: Nếu đang quay hoặc đã có kết quả thì hiện thú (hoặc thú random từ JS), nếu ko thì hiện ? */}
            {resultBeasts.length > 0 || isRolling ? (
              // Nếu đang quay, nội dung này sẽ bị JS ghi đè liên tục, React ko quan tâm
              BEASTS[resultBeasts[i] || 0]
            ) : (
              <span className="animate-pulse">?</span>
            )}
          </div>
        ))}
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
