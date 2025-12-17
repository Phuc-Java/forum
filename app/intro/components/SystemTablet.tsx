import React from "react";
import { ISystemFeature } from "../data";

export default function SystemTablet({
  sys,
  index,
}: {
  sys: ISystemFeature;
  index: number;
}) {
  return (
    <div className="group relative h-48 bg-[#080808] border border-white/5 overflow-hidden transition-all duration-500 hover:border-yellow-600/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] transform-gpu">
      {/* Background (Static) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

      {/* OPTIMIZED ANIMATION: Dùng translate thay vì top */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-500 shadow-[0_0_10px_#eab308] opacity-0 group-hover:opacity-100 group-hover:animate-scan-down will-change-transform" />

      <div className="absolute -top-4 -right-4 text-8xl font-black text-white/[0.02] group-hover:text-yellow-500/[0.05] transition-colors font-talisman select-none pointer-events-none">
        0{index + 1}
      </div>

      <div className="relative z-10 h-full p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-colors">
              <span className="text-xs font-mono text-gray-400 group-hover:text-yellow-500">
                S{index + 1}
              </span>
            </div>
            <h4 className="text-lg font-bold font-dao text-white group-hover:text-gold-gradient transition-all">
              {sys.title}
            </h4>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-white/10 pl-3 group-hover:border-yellow-500/50 transition-colors">
            {sys.desc}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-yellow-700 bg-yellow-900/10 px-2 py-1 rounded border border-yellow-900/20">
            {sys.techStack}
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-yellow-500 transition-colors" />
            <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-yellow-500 transition-colors delay-75" />
            <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-yellow-500 transition-colors delay-150" />
          </div>
        </div>
      </div>

      {/* Sửa lại keyframes dùng translate */}
      <style>{`
        @keyframes scan-down { 
            0% { transform: translateY(0); opacity: 0; } 
            10% { opacity: 1; } 
            90% { opacity: 1; } 
            100% { transform: translateY(200px); opacity: 0; } 
        }
        .group:hover .group-hover\\:animate-scan-down { animation: scan-down 2s linear infinite; }
      `}</style>
    </div>
  );
}
