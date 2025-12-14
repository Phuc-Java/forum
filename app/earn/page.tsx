import { Client, Account, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import GameGrid from "@/components/earn/GameGrid";

export default async function EarnPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-white relative overflow-x-hidden font-sans selection:bg-amber-500/30">
      {/* --- Background VFX --- */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0"></div>

      {/* Orbs lung linh */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow delay-1000"></div>

      {/* Grid nền */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0"></div>

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col">
        {/* --- HEADER (Đã chỉnh pt-32 để không bị che) --- */}
        <div className="pt-23 pb-12 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-amber-500/30 bg-black/50 text-amber-400 text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-105 transition-transform cursor-default">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Play to Earn System
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-2xl">
              THIÊN CƠ
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              LÂU
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-mono leading-relaxed">
            <span className="text-amber-500">Nhân phẩm</span> là thứ duy nhất
            ngươi cần mang vào đây.
            <br />
            Đào khoáng, quay thưởng, hay đặt cược vận mệnh?
          </p>
        </div>

        {/* --- GAME AREA --- */}
        <div className="flex-1 pb-20">
          <GameGrid />
        </div>
      </div>
    </main>
  );
}
