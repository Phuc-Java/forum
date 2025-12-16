import React from "react";
// Server-side Appwrite helpers (avoid shipping Appwrite client to browser)
import { getServerUser, getServerProfile } from "@/lib/appwrite/server";

// ✅ IMPORT: Overlay Trân Tàng dành riêng cho trang này (client component)
import { TreasureAccessDenied } from "./TreasureAccessDenied";

import { RoleType } from "@/lib/roles"; // Import type từ role.ts để type safe

// --- COMPONENTS GIAO DIỆN CHÍNH ---
import PortfolioUIClient from "./PortfolioUI.client";
import InteractiveDemoSection from "@/components/interactive-demo-section";

// --- CẤU HÌNH ROLE ĐƯỢC PHÉP (LEVEL >= 3) ---
const ALLOWED_ROLES: RoleType[] = ["chi_cuong_gia", "thanh_nhan", "chi_ton"];

export default async function Page() {
  // Server-side auth check using existing helpers to avoid client SDK
  const user = await getServerUser();
  let accessGranted = false;

  if (user) {
    const profile = await getServerProfile(user.$id);
    const userRole = (profile?.role as RoleType) || "no_le";
    if (ALLOWED_ROLES.includes(userRole)) accessGranted = true;
  }

  // If not allowed, render the same access-denied overlay (client component)
  if (!accessGranted) {
    return <TreasureAccessDenied minRole="Chí Cường Giả" />;
  }

  // --- 5. NỘI DUNG CHÍNH (KHI CÓ QUYỀN - GIỮ NGUYÊN) ---
  return (
    <main className="min-h-screen bg-[#050505] text-white relative selection:bg-purple-500/30">
      {/* LAYER 1: 3D Model Environment */}

      {/* LAYER 2: Main UI Overlay */}
      <section className="relative z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <PortfolioUIClient />
        </div>
      </section>

      <div className="relative z-30 bg-[#050505]">
        <InteractiveDemoSection />
      </div>

      {/* Footer Decoration */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800 text-xs text-slate-500 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></span>
          System: Secure | Access Level: 3+ | Trân Tàng Các
        </div>
      </div>
    </main>
  );
}
