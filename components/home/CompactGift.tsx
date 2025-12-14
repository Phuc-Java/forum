"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { claimNewbieGift } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompactGift({
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
    setIsClaiming(true);
    const res = await claimNewbieGift(currentUserId);
    if (res.success) {
      setBalance(res.newBalance);
      setClaimed(true);
      router.refresh();
    } else {
      alert(res.error);
    }
    setIsClaiming(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* --- PHẦN HIỂN THỊ SỐ DƯ (Luôn hiện khi login) --- */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface/30 backdrop-blur-md border border-primary/30 rounded-xl shadow-[0_0_15px_rgba(0,255,159,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-lg border border-primary/50">
            💎
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/60 font-mono uppercase tracking-wider">
              Tài sản
            </span>
            <span className="text-xl font-bold text-primary font-mono leading-none">
              {balance.toLocaleString()}
            </span>
          </div>
        </div>
        <Link
          href="/shop"
          className="text-xs text-secondary hover:text-white underline underline-offset-2 font-mono"
        >
          Vào Chợ →
        </Link>
      </div>

      {/* --- PHẦN NHẬN QUÀ (Chỉ hiện nếu chưa nhận) --- */}
      {!claimed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="relative w-full flex items-center justify-between px-6 py-4 bg-black rounded-xl leading-none"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <span className="text-left">
                <span className="block text-gray-200 font-bold">
                  Nhận Quà Nhập Môn
                </span>
                <span className="block text-xs text-purple-400 font-mono mt-1">
                  +1,000 ~ 5,000 Linh Thạch
                </span>
              </span>
            </span>
            <span className="text-white group-hover:translate-x-1 transition-transform">
              {isClaiming ? "⏳" : "Nhận Ngay →"}
            </span>
          </button>
        </motion.div>
      ) : (
        /* Nếu đã nhận quà rồi thì hiện nút vào Profile/Shop bình thường */
        <div className="flex gap-3">
          <Link
            href="/shop"
            className="flex-1 py-3 text-center bg-primary/20 border border-primary/50 text-primary font-bold rounded-xl hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(0,255,159,0.2)]"
          >
            🛍️ Mua Sắm
          </Link>
          <Link
            href="/profile"
            className="flex-1 py-3 text-center bg-surface/20 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all"
          >
            👤 Hồ Sơ
          </Link>
        </div>
      )}
    </div>
  );
}
