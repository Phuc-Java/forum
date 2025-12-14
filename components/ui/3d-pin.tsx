"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PinContainer = ({
  children,
  title,
  href,
  className,
  containerClassName,
  pinColor = "#10b981", // Mặc định màu Emerald
}: {
  children: React.ReactNode;
  title?: string;
  href?: string;
  className?: string;
  containerClassName?: string;
  pinColor?: string;
}) => {
  const [transform, setTransform] = useState(
    "translate(-50%,-50%) rotateX(0deg)"
  );

  const onMouseEnter = () => {
    setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
  };
  const onMouseLeave = () => {
    setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");
  };

  return (
    <Link
      href={href || "#"}
      className={cn(
        "relative group/pin z-50 cursor-pointer block",
        containerClassName
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          perspective: "1000px",
          transform: "rotateX(70deg) translateZ(0deg)",
        }}
        className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          style={{
            transform: transform,
          }}
          className="absolute left-1/2 p-4 top-1/2 flex justify-start items-start rounded-2xl shadow-[0_8px_16px_rgb(0_0_0/0.4)] border border-white/[0.1] group-hover/pin:border-white/[0.2] transition duration-700 overflow-hidden bg-[#050505]"
        >
          <div className={cn("relative z-50", className)}>{children}</div>
        </div>
      </div>

      {/* Gọi linh trận hiển thị */}
      <PinPerspective title={title} color={pinColor} />
    </Link>
  );
};

export const PinPerspective = ({
  title,
  color,
}: {
  title?: string;
  color: string;
}) => {
  return (
    <motion.div className="pointer-events-none w-96 h-80 flex items-center justify-center opacity-0 group-hover/pin:opacity-100 z-[60] transition duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="w-full h-full -mt-7 flex-none inset-0">
        {/* --- PHẦN TIÊU ĐỀ (HUD TITLE) --- */}
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <div
            className="relative flex space-x-2 items-center z-10 rounded-full bg-black/80 py-1.5 px-6 ring-1 backdrop-blur-md transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            style={{
              borderColor: color,
              boxShadow: `0 0 15px ${color}40`,
            }}
          >
            {/* Dot trạng thái */}
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: color }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: color }}
              ></span>
            </span>

            <span className="relative z-20 text-xs font-bold inline-block text-white tracking-widest uppercase font-mono">
              {title}
            </span>

            {/* Đường line dưới chân text */}
            <span
              className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] transition-opacity duration-500 group-hover/btn:opacity-40"
              style={{
                background: `linear-gradient(to right, transparent, ${color}, transparent)`,
              }}
            ></span>
          </div>
        </div>

        {/* --- LINH TRẬN (MAGIC CIRCLES) --- */}
        {/* Đã chỉnh tọa độ để nó nằm sát card hơn, không bị bay lơ lửng */}
        <div
          style={{
            perspective: "1000px",
            transform: "rotateX(70deg) translateZ(0)",
          }}
          className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
        >
          <>
            {/* Vòng tròn lan tỏa 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
              animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
              transition={{ duration: 6, repeat: Infinity, delay: 0 }}
              className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] border-[1px] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
              style={{
                borderColor: color,
                backgroundColor: `${color}10`, // 10 = low opacity hex
                boxShadow: `0 0 20px ${color}20`,
              }}
            ></motion.div>

            {/* Vòng tròn lan tỏa 2 (Delay) */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
              animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
              transition={{ duration: 6, repeat: Infinity, delay: 2 }}
              className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] border-[1px] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
              style={{
                borderColor: color,
                backgroundColor: `${color}10`,
                boxShadow: `0 0 20px ${color}20`,
              }}
            ></motion.div>

            {/* Vòng tròn lan tỏa 3 (Delay) */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
              animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
              transition={{ duration: 6, repeat: Infinity, delay: 4 }}
              className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] border-[1px] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
              style={{
                borderColor: color,
                backgroundColor: `${color}10`,
                boxShadow: `0 0 20px ${color}20`,
              }}
            ></motion.div>
          </>
        </div>

        {/* --- TIA SÁNG KẾT NỐI (LASER BEAM) --- */}
        <>
          {/* Tia mờ (Glow) */}
          <motion.div
            className="absolute right-1/2 bottom-1/2 translate-y-[14px] w-px h-24 group-hover/pin:h-32 blur-[4px]"
            style={{
              background: `linear-gradient(to bottom, transparent, ${color})`,
            }}
          />
          {/* Tia chính (Core) */}
          <motion.div
            className="absolute right-1/2 bottom-1/2 translate-y-[14px] w-px h-24 group-hover/pin:h-32"
            style={{
              background: `linear-gradient(to bottom, transparent, ${color})`,
            }}
          />

          {/* Điểm tiếp xúc (Contact Point) */}
          <motion.div
            className="absolute right-1/2 translate-x-[1.5px] bottom-1/2 translate-y-[14px] w-[6px] h-[6px] rounded-full z-40 blur-[4px]"
            style={{ backgroundColor: color }}
          />
          <motion.div
            className="absolute right-1/2 translate-x-[0.5px] bottom-1/2 translate-y-[14px] w-[3px] h-[3px] rounded-full z-40"
            style={{ backgroundColor: "white" }}
          />
        </>
      </div>
    </motion.div>
  );
};
