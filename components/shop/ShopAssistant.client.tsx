"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ShopAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111]/90 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-xl w-64 shadow-2xl mb-2"
        >
          <div className="text-xs text-emerald-400 font-bold mb-2 uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Tiểu Nhị AI
          </div>
          <p className="text-gray-400 text-xs mb-3 font-mono">
            Đạo hữu cần tìm pháp bảo gì? Ta có thể tư vấn giá cả thị trường.
          </p>
          <input
            type="text"
            placeholder="Hỏi gì đó..."
            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
          />
        </motion.div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform group"
      >
        {open ? "✕" : <span className="group-hover:animate-spin">🤖</span>}
      </button>
    </div>
  );
}
