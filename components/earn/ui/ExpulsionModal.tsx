"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpulsionModalProps {
  isOpen: boolean;
  onConfirm: () => void; // Hàm này sẽ đá người chơi về LOBBY
}

export const ExpulsionModal: React.FC<ExpulsionModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  const [countdown, setCountdown] = useState(5);

  // Logic đếm ngược để tự động đá
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(5); // Reset đếm ngược
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onConfirm(); // Hết giờ -> Tự động đá
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden">
          {/* 1. LAYER NỀN ĐỎ BÁO ĐỘNG (Rung lắc mạnh) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/90 backdrop-blur-md"
          >
            {/* Hiệu ứng sấm sét/nứt vỡ nền */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)] animate-pulse"></div>
          </motion.div>

          {/* 2. XÍCH SẮT KHÓA MÀN HÌNH (Trang trí) */}
          {/* Xích trái trên */}
          <motion.div
            initial={{ x: -200, y: -200, rotate: -45 }}
            animate={{ x: 0, y: 0, rotate: -45 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="absolute top-0 left-0 w-96 h-12 bg-black border-y-4 border-gray-700 shadow-2xl z-0 opacity-60"
          >
            <div className="w-full h-full flex items-center justify-around">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-4 bg-gray-600 rounded-full border border-gray-400"
                ></div>
              ))}
            </div>
          </motion.div>
          {/* Xích phải dưới */}
          <motion.div
            initial={{ x: 200, y: 200, rotate: -45 }}
            animate={{ x: 0, y: 0, rotate: -45 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              delay: 0.1,
            }}
            className="absolute bottom-0 right-0 w-96 h-12 bg-black border-y-4 border-gray-700 shadow-2xl z-0 opacity-60"
          >
            <div className="w-full h-full flex items-center justify-around">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-4 bg-gray-600 rounded-full border border-gray-400"
                ></div>
              ))}
            </div>
          </motion.div>

          {/* 3. MODAL CHÍNH (Rung lắc cảnh báo) */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: [-5, 5, -5, 5, 0], // Rung lắc
            }}
            transition={{ duration: 0.4 }}
            className="relative z-50 w-full max-w-lg mx-4"
          >
            {/* Vòng tròn ma pháp xoay nền sau */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-red-500/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_red]"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_red]"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_red]"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_red]"></div>
            </div>

            <div className="bg-[#050000] border-2 border-red-600 rounded-sm p-1 shadow-[0_0_100px_rgba(220,38,38,0.5)] relative overflow-hidden">
              {/* Góc trang trí */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>

              <div className="bg-gradient-to-b from-red-950/50 to-black p-8 text-center relative z-10">
                {/* ICON STOP */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-900 animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-10 h-10 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-red-500 uppercase tracking-[0.2em] mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] font-serif">
                  Trục Xuất
                </h2>
                <h3 className="text-white text-sm uppercase tracking-widest opacity-70 mb-6">
                  Forceful Expulsion
                </h3>

                <div className="space-y-4 mb-8">
                  <p className="text-gray-300 font-medium">
                    Phát hiện đạo hữu{" "}
                    <span className="text-red-500 font-bold">
                      không đủ linh thạch
                    </span>{" "}
                    để tiếp tục cuộc chơi.
                  </p>
                  <p className="text-gray-400 text-sm italic">
                    "Quy tắc sòng bạc: Tiền trao cháo múc. Không tiền xin mời ra
                    ngoài hóng gió!"
                  </p>
                </div>

                {/* COUNTDOWN TIMER CIRCLE */}
                <div className="relative w-full py-4 flex flex-col items-center justify-center">
                  <div className="text-sm text-red-400 mb-2 uppercase tracking-widest font-bold animate-pulse">
                    Tự động rời bàn sau
                  </div>
                  <div className="text-6xl font-mono font-bold text-white relative">
                    {countdown}
                    <span className="text-lg absolute top-0 -right-4 text-red-600">
                      s
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <button
                  onClick={onConfirm}
                  className="w-full mt-6 py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest border border-red-500 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Rời Đi Trong Danh Dự{" "}
                    <span className="text-xl group-hover:translate-x-2 transition-transform">
                      ➔
                    </span>
                  </span>
                  {/* Hover effect swipe */}
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
