"use client";
import { motion } from "framer-motion";
import { cn } from "../config/utils";

export const AncientButton = ({
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
      // Framer Motion tự động dùng transform cho scale/y, nên rất mượt
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
      {/* Noise Texture: Giữ nguyên vì là static */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* SHINE EFFECT: Đã tối ưu GPU */}
      {/* Thay đổi từ 'left' sang 'translate-x' để tránh Reflow (tính lại bố cục) */}
      {/* transform-gpu: Kích hoạt Hardware Acceleration cho layer này */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none transform-gpu"></div>

      {/* Corner Borders: Giữ nguyên */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40 group-hover:border-white/80 transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40 group-hover:border-white/80 transition-colors"></div>

      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
};
