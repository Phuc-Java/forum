import { Client, Account, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import GameGrid from "@/components/earn/GameGrid";

export default async function EarnPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-white relative overflow-x-hidden font-sans selection:bg-red-500/30">
      {/* --- Background VFX: Huyết Nguyệt --- */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      {/* Red Fog */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-900/20 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-950/30 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Grid Floor */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear_gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-0 [perspective:1000px] [transform:rotateX(60deg)] origin-top"></div>

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col">
        {/* --- HEADER --- */}
        <div className="pt-14 pb-12 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-red-500/30 bg-black/80 text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-105 transition-transform cursor-default group">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping group-hover:bg-red-400"></span>
            Huyết Nguyệt Đổ Trường
          </div>

          {/* Title Text */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none relative group cursor-default">
            <span className="absolute -inset-1 blur-2xl bg-red-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl relative z-10">
              THIÊN CƠ
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] relative z-10">
              LÂU
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-serif italic leading-relaxed">
            Thiên đạo vô tình, nhưng{" "}
            <span className="text-red-500 font-bold not-italic">Vận May</span>{" "}
            thì hữu ý.
            <br />
            Một bước lên tiên, hay vạn kiếp bất phục?
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
