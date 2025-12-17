import React from "react";
import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { TreasureAccessDenied } from "../3Dtest/TreasureAccessDenied";
import Image from "next/image";
import {
  Wind,
  Flame,
  Zap,
  Sword,
  Snowflake,
  Leaf,
  Shield,
  Crown,
  Skull,
  Infinity,
  Compass,
  Scroll,
} from "lucide-react";

import SpiritScroll from "./FilmScannerSimple.client";
import PhimClient from "./PhimClient.client";
import { TIEN_HIEP_DATABASE } from "@/components/data/film-data";

// --- CẤU HÌNH CẢNH GIỚI ---
const REALMS = [
  { name: "Phàm Nhân", color: "#78716c", threshold: 0 },
  { name: "Luyện Khí", color: "#bfdbfe", threshold: 10 },
  { name: "Trúc Cơ", color: "#86efac", threshold: 25 },
  { name: "Kim Đan", color: "#fcd34d", threshold: 45 },
  { name: "Nguyên Anh", color: "#f472b6", threshold: 60 },
  { name: "Hóa Thần", color: "#c084fc", threshold: 75 },
  { name: "Luyện Hư", color: "#818cf8", threshold: 85 },
  { name: "Đại Thừa", color: "#ef4444", threshold: 95 },
  { name: "Độ Kiếp", color: "#fbbf24", threshold: 100 },
];

// --- 1. CULTIVATION BAR (Static HTML, Logic handle by PhimClient) ---
function CultivationBar() {
  return (
    <div
      data-phim-cultivation
      className="fixed top-1/2 right-4 -translate-y-1/2 h-[50vh] w-16 flex flex-col items-center z-50 hidden xl:flex select-none"
    >
      <div className="absolute inset-0 w-[1px] bg-gradient-to-b from-transparent via-stone-700 to-transparent left-1/2 -translate-x-1/2" />

      <div className="absolute top-[-60px] right-0 flex flex-col items-end w-48">
        <span className="text-[9px] text-stone-500 uppercase tracking-widest mb-1">
          Cảnh Giới Hiện Tại
        </span>

        <div className="relative px-4 py-2 bg-black/80 border border-stone-800 rounded-l-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <span
            data-phim-current-name
            className="text-xl font-black font-serif uppercase"
            style={{ color: REALMS[0].color }}
          >
            {REALMS[0].name}
          </span>
          <div className="absolute right-0 top-full h-[1px] w-full bg-gradient-to-l from-transparent to-stone-500 mt-1" />
          <div
            data-phim-current-pct
            className="text-[10px] text-stone-400 mt-1 text-right font-mono"
          >
            0.0% Thiên Đạo
          </div>
        </div>
      </div>

      <div className="relative w-full h-full">
        {REALMS.map((r, i) => (
          <div
            key={i}
            data-phim-realm
            data-threshold={r.threshold}
            data-color={r.color}
            data-name={r.name}
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border transition-all duration-500 flex items-center justify-center group"
            style={{ bottom: `${r.threshold}%`, borderColor: "#333" }}
          >
            <div className="w-1 h-1 rounded-full bg-transparent" />
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-stone-400 whitespace-nowrap px-2 py-1 bg-black border border-stone-800">
              {r.name}
            </span>
          </div>
        ))}

        {/* Thanh này sẽ được PhimClient điều khiển bằng scaleY cho mượt */}
        <div
          data-phim-fill
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-t from-stone-900 via-amber-500 to-white shadow-[0_0_15px_#fbbf24] transition-transform duration-100 ease-linear rounded-full origin-bottom will-change-transform"
          style={{ height: "100%", transform: "scaleY(0)" }}
        />
      </div>
    </div>
  );
}

// --- 3. PAGE MAIN ---
export default async function VanTuongDaiHoanMy() {
  // Server-side role check to avoid flashing client-side overlays
  const ALLOWED_ROLES = ["chi_cuong_gia", "thanh_nhan", "chi_ton"];

  try {
    const user = await getServerUser();

    if (user && user.$id) {
      const profile = await getServerProfile(user.$id);
      const role = (profile?.role || "pham_nhan").toString();
      if (!ALLOWED_ROLES.includes(role)) {
        return <TreasureAccessDenied minRole="Chí Cường Giả" />;
      }
    } else {
      // Not logged in => show access denied overlay
      return <TreasureAccessDenied minRole="Chí Cường Giả" />;
    }
  } catch (e) {
    // On error, default to denying access (safe fallback)
    console.warn("phim page server check failed", e);
    return <TreasureAccessDenied minRole="Chí Cường Giả" />;
  }
  const categories = [
    { name: "Tất Cả", icon: <Infinity size={14} />, color: "text-stone-200" },
    { name: "Hỏa", icon: <Flame size={14} />, color: "text-red-500" },
    { name: "Lôi", icon: <Zap size={14} />, color: "text-purple-400" },
    { name: "Băng", icon: <Snowflake size={14} />, color: "text-cyan-300" },
    { name: "Kiếm", icon: <Sword size={14} />, color: "text-amber-200" },
    { name: "Ám", icon: <Skull size={14} />, color: "text-stone-500" },
    { name: "Mộc", icon: <Leaf size={14} />, color: "text-emerald-500" },
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e5e5e5] font-serif overflow-x-hidden selection:bg-[#b45309]/40 selection:text-[#ffd700]">
      {/* Client Logic (Cursor, Scroll Logic) */}
      <PhimClient />

      <CultivationBar />

      {/* === GLOBAL BACKGROUND LAYERS (OPTIMIZED GPU) === */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />

        {/* Tinh vân xoay chậm - will-change-transform để tách layer */}
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(20,20,30,1)_0%,rgba(0,0,0,0)_70%)] opacity-60 animate-pulse-slow will-change-[opacity]" />

        {/* Vòng Bát Quái Xoay - OPTIMIZATION: Thêm transform-gpu và will-change */}
        <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] border border-white/5 rounded-full flex items-center justify-center opacity-5 animate-[spin_120s_linear_infinite] transform-gpu will-change-transform">
          <div className="w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,215,0,0.05)_180deg,transparent_360deg)]" />
        </div>
      </div>

      {/* === 1. HERO SECTION: CỔNG TRỜI === */}
      <header className="relative w-full h-[90vh] flex flex-col items-center justify-center overflow-hidden z-10">
        {/* Parallax Background - GPU Hint */}
        <div
          className="absolute inset-0 bg-[url('/film/unnamed (1).jpg')] bg-cover bg-center transition-transform duration-100 ease-linear transform-gpu will-change-transform"
          style={{ transform: `translateY(0px) scale(1)`, opacity: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#050505]" />

        {/* Hero Content */}
        <div className="relative z-20 text-center transition-all duration-1000 opacity-100 translate-y-0">
          <div className="mb-8 animate-float will-change-transform">
            <Crown
              size={64}
              className="text-[#ffd700] mx-auto drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]"
            />
          </div>

          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-4 leading-none">
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-[#ffd700] to-[#92400e] drop-shadow-sm">
              VẠN TƯỢNG
            </span>
            <span className="block text-4xl md:text-6xl text-stone-400 font-thin tracking-[0.5em] mt-4 border-t border-stone-700/50 pt-6">
              THIÊN CƠ ĐÀI
            </span>
          </h1>

          <p className="text-stone-400 font-mono text-xs md:text-sm mt-8 tracking-widest uppercase">
            Đạo sinh nhất, nhất sinh nhị, nhị sinh tam, tam sinh vạn vật
          </p>

          <div className="mt-12">
            <button
              data-scroll-to="next"
              className="group relative px-12 py-4 bg-transparent border border-[#ffd700]/30 text-[#ffd700] hover:bg-[#ffd700]/10 transition-all duration-500 overflow-hidden transform-gpu"
            >
              <span className="relative z-10 flex items-center gap-3 font-bold tracking-[0.2em]">
                NHẬP ĐẠO{" "}
                <Compass className="group-hover:rotate-180 transition-transform duration-700" />
              </span>
              {/* Shine Effect - GPU Optimized */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine will-change-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* === 2. SECTION: VẠN CỔ HỌA QUYỀN === */}
      <section className="relative z-20 w-full py-16 bg-[#080808] border-b border-stone-800">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent" />
        <div className="text-center mb-8">
          <h3 className="text-2xl font-serif text-[#ffd700] tracking-[0.2em] flex items-center justify-center gap-4">
            <span className="w-12 h-[1px] bg-stone-700" />
            ❖ VẠN CỔ HỌA QUYỀN ❖
            <span className="w-12 h-[1px] bg-stone-700" />
          </h3>
          <p className="text-xs text-stone-500 mt-2 font-mono">
            Bảo vật trấn phái - Chỉ dành cho đệ tử chân truyền
          </p>
        </div>
        <div className="w-full relative">
          <SpiritScroll />
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#080808] to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#080808] to-transparent pointer-events-none z-10" />
        </div>
      </section>

      {/* === 3. STICKY FILTER NAV === */}
      <nav
        data-phim-nav
        className="sticky top-0 z-40 w-full border-b border-stone-800 bg-[#050505] transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto no-scrollbar flex justify-center">
          <div className="flex items-center gap-4">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                data-filter={cat.name}
                className={`relative px-5 py-2 group transition-all duration-300 border ${
                  idx === 0
                    ? "border-[#ffd700] bg-[#ffd700]/5 text-[#ffd700]"
                    : "border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300"
                }`}
                style={{
                  clipPath:
                    "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)",
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <span className={idx === 0 ? "animate-pulse" : ""}>
                    {cat.icon}
                  </span>
                  {cat.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* === 4. MAIN LIBRARY (TÀNG KINH CÁC) === */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-24 min-h-screen">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-12 w-1 bg-[#ffd700]" />
          <div>
            <h2 className="text-4xl font-bold text-[#e5e5e5] uppercase tracking-wider">
              Ảnh Cung
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Nơi lưu trữ{" "}
              <span data-phim-count>{TIEN_HIEP_DATABASE.length}</span> bộ tuyệt
              học vô thượng
            </p>
          </div>
        </div>

        {/* GRID CARDS */}
        <div
          data-phim-grid
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
        >
          {TIEN_HIEP_DATABASE.map((item, index) => (
            <div
              key={item.id}
              data-element={item.element}
              // OPTIMIZATION: will-change-transform để báo trình duyệt về animation 3D sắp tới
              className="group relative w-full h-[480px] mx-auto cursor-pointer perspective-1000 opacity-100 translate-y-0 will-change-transform"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* Card Container với 3D hover - GPU Optimized */}
              <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:[transform:rotateX(5deg)_rotateY(5deg)_translateY(-10px)] [transform-style:preserve-3d] transform-gpu">
                {/* 1. CARD BACKGROUND (Mặt sau) */}
                <div className="absolute inset-0 bg-[#0f0f0f] border border-stone-800 rounded-lg overflow-hidden shadow-xl group-hover:border-[#ffd700]/40 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500">
                  {/* Ảnh nền - OPTIMIZATION: Added sizes prop */}
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 transform-gpu"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
                  <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />
                </div>

                {/* 2. CARD CONTENT (Thông tin nổi lên) */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 [transform:translateZ(30px)]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#ffd700]/10 border border-[#ffd700]/30 text-[#ffd700] rounded uppercase">
                      {item.realm}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold text-white font-serif mb-2 group-hover:text-[#ffd700] transition-colors line-clamp-1"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <div className="w-12 h-[1px] bg-stone-600 mb-3 group-hover:w-full group-hover:bg-[#ffd700] transition-all duration-500" />
                  <p className="text-xs text-stone-400 line-clamp-2 italic opacity-80 group-hover:opacity-100 group-hover:text-white transition-opacity">
                    {item.description}
                  </p>
                </div>

                {/* 3. POP-OUT CHARACTER (Nhân vật thoát ảnh) */}
                <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none z-30 [transform-style:preserve-3d] overflow-visible">
                  <div className="relative w-full h-full">
                    {/* Character - OPTIMIZATION: will-change + transform-gpu */}
                    {/* Dùng img thẻ thường ở đây nếu muốn control tốt hơn về style inline, hoặc Next Image với sizes */}
                    <img
                      src={item.characterImage}
                      alt="Character"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 max-w-[150%] max-h-[120%] object-contain filter brightness-75 contrast-125 [transform:translateZ(50px)_translateY(20px)_scale(0.9)] group-hover:[transform:translateZ(80px)_translateY(-15px)_scale(1.05)] group-hover:brightness-110 group-hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out will-change-transform transform-gpu"
                    />
                    {/* Hào quang dưới chân */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-8 bg-[#ffd700]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform-gpu" />
                  </div>
                </div>

                {/* 4. BADGE TÔNG MÔN */}
                <div className="absolute top-3 right-3 z-40 [transform:translateZ(40px)]">
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-stone-600 backdrop-blur flex items-center justify-center group-hover:border-[#ffd700] group-hover:bg-[#ffd700]/10 transition-colors">
                    <span className="text-[#ffd700] font-bold text-sm">
                      {item.sect.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {TIEN_HIEP_DATABASE.length === 0 && (
          <div className="w-full h-64 border border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-stone-500">
            <Scroll size={40} className="mb-4 opacity-50" />
            <p>Không tìm thấy cổ tịch phù hợp với linh căn của đạo hữu</p>
          </div>
        )}
      </main>

      {/* === 5. CHÂN TRANG === */}
      <footer className="relative mt-32 border-t border-stone-800 bg-[#020202] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[#ffd700] font-serif text-2xl mb-4">
              XÓM NHÀ LÁ
            </h4>
            <p className="text-stone-500 text-sm leading-relaxed max-w-md">
              Nơi hội tụ của các bậc đại năng ẩn cư. Chia sẻ bí kíp, luận bàn
              đạo pháp, hướng tới cảnh giới Vô Thượng Đại Đạo.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">
              Liên Kết
            </h5>
            <ul className="space-y-2 text-stone-500 text-sm">
              <li className="hover:text-[#ffd700] cursor-pointer">
                Về Tông Môn
              </li>
              <li className="hover:text-[#ffd700] cursor-pointer">
                Bảng Xếp Hạng
              </li>
              <li className="hover:text-[#ffd700] cursor-pointer">Cống Hiến</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">
              Pháp Khí
            </h5>
            <div className="flex gap-4 text-stone-500">
              <div className="w-10 h-10 border border-stone-800 rounded flex items-center justify-center hover:border-[#ffd700] hover:text-[#ffd700] cursor-pointer transition-colors">
                <Wind size={18} />
              </div>
              <div className="w-10 h-10 border border-stone-800 rounded flex items-center justify-center hover:border-[#ffd700] hover:text-[#ffd700] cursor-pointer transition-colors">
                <Shield size={18} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-stone-900 pt-8 text-center text-stone-600 text-xs font-mono">
          © 2025 XOM NHA LA SECT. Designed by Nguyen Tuan Phuc.
        </div>
      </footer>
    </div>
  );
}
