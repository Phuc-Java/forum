"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LackSpiritModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  currentAmount: number;
  onGoToMine: () => void;
}

export const LackSpiritModal: React.FC<LackSpiritModalProps> = ({
  isOpen,
  onClose,
  requiredAmount,
  currentAmount,
  onGoToMine,
}) => {
  const missing = requiredAmount - currentAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. LAYER TỐI (BACKDROP) - Dùng opacity đơn giản, rất nhẹ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Background Effect - Static, GPU friendly */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-900/10 rounded-full blur-[80px]"></div>
            </div>
          </motion.div>

          {/* 2. KHUNG THÔNG BÁO (MODAL) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            // OPTIMIZATION: will-change-transform để báo trình duyệt tách layer
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none will-change-transform"
          >
            <div className="pointer-events-auto relative w-full max-w-[480px] bg-[#0a0a0a] border border-amber-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden">
              {/* --- Header: Thu gọn chiều cao (h-16) --- */}
              <div className="relative h-16 bg-gradient-to-b from-red-950/80 to-black flex items-center justify-center border-b border-red-900/30">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-red-500 uppercase tracking-widest drop-shadow-sm font-serif">
                  Linh Lực Cạn Kiệt
                </h2>
                <span className="absolute left-4 text-red-800 text-2xl opacity-50">
                  ❖
                </span>
                <span className="absolute right-4 text-red-800 text-2xl opacity-50">
                  ❖
                </span>
              </div>

              {/* --- Body: Giảm padding (p-6) --- */}
              <div className="p-6 flex flex-col items-center text-center relative">
                {/* Icon: Giảm size (w-20) & Thêm transform-gpu */}
                <div
                  className="relative mb-4 group cursor-pointer"
                  onClick={onGoToMine}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    // OPTIMIZATION: transform-gpu
                    className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center shadow-inner relative z-10 transform-gpu"
                  >
                    <span className="text-3xl filter grayscale opacity-50">
                      💎
                    </span>
                  </motion.div>
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-red-500/50 rounded-full animate-ping opacity-20"></div>
                </div>

                <p className="text-gray-400 text-base mb-1 font-medium">
                  Đạo hữu <span className="text-white font-bold">Thân Mến</span>
                  ,
                </p>
                <p className="text-gray-500 text-xs mb-5 leading-relaxed px-4">
                  Túi trữ vật không đủ linh thạch để khởi động trận pháp.
                  <br />
                  Hành trình tu tiên gian nan, xin đừng nản chí.
                </p>

                {/* Bảng so sánh: Thu gọn padding/margin */}
                <div className="w-full bg-white/5 rounded-lg p-3 border border-white/10 mb-6 grid grid-cols-2 gap-4">
                  <div className="text-center border-r border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">
                      Cần Tối Thiểu
                    </p>
                    <p className="text-lg font-mono text-amber-500 font-bold leading-none">
                      {requiredAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">
                      Hiện Có
                    </p>
                    <p className="text-lg font-mono text-red-500 font-bold leading-none">
                      {currentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-white/10 pt-2 mt-1 flex justify-between items-center px-2">
                    <span className="text-[10px] text-gray-400 uppercase">
                      Thiếu hụt
                    </span>
                    <span className="text-sm font-bold text-red-400">
                      -{missing.toLocaleString()} 💎
                    </span>
                  </div>
                </div>

                {/* --- Footer Buttons --- */}
                <div className="flex flex-col w-full gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onGoToMine();
                    }}
                    className="group relative w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 rounded-lg overflow-hidden border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform-gpu"
                  >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50"></div>
                    <span className="relative flex items-center justify-center gap-2 font-bold text-black uppercase tracking-wider text-xs">
                      <span className="text-base">⛏️</span> Đến Mỏ Linh Thạch
                    </span>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-transparent hover:bg-white/5 text-gray-500 hover:text-white rounded-lg transition-colors text-[10px] font-medium uppercase tracking-widest"
                  >
                    Ta sẽ quay lại sau
                  </button>
                </div>
              </div>

              {/* Decorative corners - Giữ nguyên */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-600"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-600"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-600"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-600"></div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
