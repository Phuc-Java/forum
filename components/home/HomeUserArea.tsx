"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/appwrite/client";

export default function HomeUserArea() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (error) {
        console.error("Khách vãng lai...");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="h-12 w-48 bg-white/5 animate-pulse rounded-xl border border-white/10"></div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap gap-4 animate-in fade-in zoom-in duration-500">
        <Link
          href="/forum"
          className="group relative px-8 py-3 bg-primary text-black font-bold font-mono rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,159,0.5)]"
        >
          <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative flex items-center gap-2">
            🚀 Vào Diễn Đàn
          </span>
        </Link>
        <Link
          href={`/profile/${user.$id}`}
          className="px-8 py-3 bg-surface/30 backdrop-blur-md border border-white/10 text-white font-mono rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all flex items-center gap-2"
        >
          <span>👤</span> Hồ Sơ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/login"
        className="group relative px-8 py-3 bg-gradient-to-r from-primary to-emerald-400 text-black font-bold font-mono rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,159,0.4)]"
      >
        <span className="relative z-10 flex items-center gap-2">
          ⚡ Đăng Nhập
        </span>
      </Link>
      <Link
        href="/register"
        className="px-8 py-3 bg-transparent border border-white/20 text-white font-mono rounded-xl hover:bg-white/5 hover:border-white/40 transition-all"
      >
        Đăng Ký
      </Link>
    </div>
  );
}
