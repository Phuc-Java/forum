import React from "react";
import { INTRO_DATA } from "../data";
// Import 2 file con vừa tách
import SoulPlate from "./SoulPlate";
import SystemTablet from "./SystemTablet";

// Wrapper cho Client Logic (State Active Role)
// Vì cần State để biết role nào đang active, ta phải tạo một cái Wrapper nhỏ xíu
// để bao bọc danh sách SoulPlate.
import RoleListWrapper from "./RoleListWrapper"; // <-- Tạo thêm 1 file nhỏ này nữa

export default function RoleHierarchy() {
  return (
    <section
      id="roles"
      className="relative w-full min-h-screen bg-[#020202] py-32 overflow-hidden border-t border-white/5"
    >
      {/* GLOBAL ATMOSPHERE - SVG Tĩnh (Server Rendered) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-purple-900/5 blur-[100px] rounded-full mix-blend-screen" />
        {/* Particles thay bằng CSS thuần để chạy trên server/static */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* HEADER (Server Rendered HTML - Cực nhanh) */}
        <div className="text-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10vw] md:text-[150px] font-talisman text-white/[0.03] select-none pointer-events-none whitespace-nowrap blur-sm">
            VẠN CỔ LƯU DANH
          </div>
          <span className="text-yellow-600 tracking-[0.5em] text-xs uppercase font-bold mb-4 block">
            ✧ Hệ Thống Phân Cấp ✧
          </span>
          <h2 className="text-5xl md:text-7xl font-black font-dao text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 mb-6 drop-shadow-2xl">
            Bảng Vàng Tông Môn
          </h2>
          <div className="w-full max-w-md mx-auto h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-2" />
          <div className="w-full max-w-xs mx-auto h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        </div>

        {/* BODY: RoleListWrapper (Client) sẽ render các SoulPlate */}
        <RoleListWrapper roles={INTRO_DATA.roles} />

        {/* FOOTER: SYSTEMS (Server Rendered hoàn toàn) */}
        <div className="relative pt-20">
          <div className="flex items-center justify-between mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <div className="px-8 text-center">
              <h3 className="text-3xl font-dao text-white uppercase tracking-widest flex items-center justify-center gap-4">
                <span className="text-yellow-600 text-xl">❖</span> Thiên Địa Quy
                Tắc <span className="text-yellow-600 text-xl">❖</span>
              </h3>
              <p className="text-[10px] text-gray-500 mt-2 font-mono">
                CORE SYSTEM ARCHITECTURE
              </p>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* SystemTablet là Server Component -> HTML tĩnh */}
            {INTRO_DATA.systems.map((sys, idx) => (
              <SystemTablet key={idx} sys={sys} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
