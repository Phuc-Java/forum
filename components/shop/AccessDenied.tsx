import React, { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export const AccessDeniedOverlay = memo(
  ({ minRole = "Phàm Nhân" }: { minRole?: string }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black font-mono overflow-hidden">
      {/* Background Noise & Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear_gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]"></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 p-1 rounded-2xl bg-gradient-to-b from-red-500/50 to-transparent w-full max-w-lg mx-4"
      >
        <div className="bg-[#0a0505] rounded-xl border border-red-500/30 p-8 text-center shadow-[0_0_100px_rgba(220,38,38,0.3)] backdrop-blur-xl relative overflow-hidden">
          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(220,38,38,1)] animate-[scan_3s_linear_infinite]"></div>

          <div className="w-24 h-24 mx-auto bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-500 animate-pulse relative">
            <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping"></div>
            <svg
              className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 mb-2 tracking-tighter uppercase glitch-text">
            ACCESS DENIED
          </h2>
          <div className="text-red-500/60 text-xs tracking-[0.3em] mb-6">
            RESTRICTED AREA 51
          </div>

          <p className="text-gray-400 text-sm mb-8 leading-relaxed border-t border-b border-red-900/30 py-4">
            Phát hiện xâm nhập trái phép. Khu vực{" "}
            <span className="text-red-400 font-bold">Chợ Đen</span> yêu cầu cấp
            bậc tối thiểu:
            <br />
            <span className="inline-block mt-3 px-4 py-1 bg-red-500/10 border border-red-500/50 rounded text-red-400 font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              [{minRole}]
            </span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm font-bold uppercase tracking-wide"
            >
              Quay Về
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 group"
            >
              <span>Đăng Nhập</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
);
AccessDeniedOverlay.displayName = "AccessDeniedOverlay";
