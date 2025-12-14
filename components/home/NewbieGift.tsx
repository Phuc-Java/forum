"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { claimNewbieGift } from "@/lib/actions/user";
import { useRouter } from "next/navigation";

export default function NewbieGift({
  profile,
  currentUserId,
}: {
  profile: any;
  currentUserId: string;
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(profile?.hasClaimedGift || false);
  const [balance, setBalance] = useState(profile?.currency || 0);
  const router = useRouter();

  const handleClaim = async () => {
    if (!currentUserId) {
      alert("Vui lòng đăng nhập để nhập môn!");
      return;
    }
    setIsClaiming(true);
    const res = await claimNewbieGift(currentUserId);

    if (res.success) {
      setBalance(res.newBalance);
      setClaimed(true);
      // Hiệu ứng ăn mừng (Alert tạm, có thể làm confetti sau)
      alert(
        `🎉 Chúc mừng! Đạo hữu nhận được ${res.reward} Linh Thạch nhập môn!`
      );
      router.refresh();
    } else {
      alert(res.error);
    }
    setIsClaiming(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
      {/* --- THẺ 1: VÍ TIỀN (HIỂN THỊ SỐ DƯ) --- */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[#111]/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-black rounded-full border border-emerald-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_#10b981]">
            💎
          </div>
          <div>
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
              Túi Càn Khôn
            </h3>
            <p className="text-gray-500 text-xs">Tài sản hiện có</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
            {balance.toLocaleString()}
          </span>
          <span className="text-emerald-500 font-bold">Linh Thạch</span>
        </div>
      </motion.div>

      {/* --- THẺ 2: QUÀ TÂN THỦ (CLAIM) --- */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`relative rounded-3xl p-6 border transition-all duration-500 overflow-hidden
                ${
                  claimed
                    ? "bg-[#0a0a0a] border-white/10 grayscale opacity-80"
                    : "bg-gradient-to-br from-purple-900/40 to-black border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]"
                }`}
      >
        {!claimed && (
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        )}

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className={`font-black text-xl uppercase tracking-wider mb-1 ${
                  claimed ? "text-gray-500" : "text-purple-300"
                }`}
              >
                {claimed ? "Đã Nhập Môn" : "Quà Nhập Môn"}
              </h3>
              <p className="text-gray-400 text-xs max-w-[200px]">
                {claimed
                  ? "Đạo hữu đã nhận phần thưởng này rồi."
                  : "Phần thưởng Linh Thạch dựa trên Cảnh Giới (Role) hiện tại."}
              </p>
            </div>
            <div className="text-4xl">🎁</div>
          </div>

          {!claimed ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              {isClaiming ? (
                <span className="animate-pulse">Đang mở rương...</span>
              ) : (
                <>
                  <span>Nhận Ngay</span>
                  <span className="group-hover:-translate-y-1 transition-transform">
                    ✨
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="mt-6 w-full py-3 bg-white/5 border border-white/10 text-gray-500 font-bold rounded-xl text-center cursor-not-allowed">
              ✓ Đã Nhận
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
