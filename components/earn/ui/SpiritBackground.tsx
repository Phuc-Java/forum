"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../config/utils";

export const SpiritBackground = () => {
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
    // Logic tính toán vị trí giữ nguyên 100%
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
      {/* Radial Gradient tĩnh - Không cần GPU */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,0),#000)] z-10"></div>

      {/* Noise Layer - OPTIMIZATION: will-change opacity */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        // Báo cho trình duyệt biết thuộc tính sắp thay đổi để tối ưu
        style={{ willChange: "opacity" }}
        // transform-gpu để ép layer này render bằng GPU
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 transform-gpu"
      />

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
            // OPTIMIZATION: Particles thay đổi cả vị trí và độ mờ
            style={{ willChange: "transform, opacity" }}
            className={cn(
              // Thêm transform-gpu để mượt mà hơn trên mobile/tablet
              "absolute rounded-full blur-[2px] transform-gpu",
              i % 3 === 0 ? "w-1 h-1 bg-amber-500" : "w-2 h-2 bg-emerald-900/40"
            )}
          />
        ))}
    </div>
  );
};
