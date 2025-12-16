import type { Metadata } from "next";

// Import Styles & Data
import "./intro.css";
import { INTRO_DATA } from "./data";

// Import Components (Client Components đã tách)
import HeroGate from "./components/HeroSection";
import RoleHierarchy from "./components/RoleHierarchy";
import PlacesShowcase from "./components/PlacesShowcase";
import CultivationSword from "./components/CultivationSword";
import SpiritAudio from "./components/SpiritAudio";
import FooterDao from "./components/FooterDao";
// Fonts are provided globally via app/layout.tsx (Be Vietnam Pro, Playfair Display, Xanh Mono)

// --- METADATA (Tối ưu SEO) ---
export const metadata: Metadata = {
  title: "Giới Thiệu Tông Môn | Xóm Nhà Lá",
  description:
    "Cổng thông tin chính thức của Xóm Nhà Lá - Nơi quy tụ anh tài IT.",
};

export default function IntroPage() {
  return (
    <main
      className={
        "dao-container relative w-full min-h-screen bg-[#020202] text-white selection:bg-yellow-500 selection:text-black overflow-x-hidden font-sans"
      }
    >
      {/* 1. LAYER GLOBAL NOISE */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 2. CÁC CLIENT COMPONENT (Tải lười/Hydrate sau) */}
      <CultivationSword />
      <SpiritAudio />

      {/* 3. NÚT VỀ TRANG CHỦ (Link tĩnh - Server Rendered OK) */}
      <nav className="fixed top-6 left-6 z-50">
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded border border-white/10 bg-black/20 backdrop-blur hover:bg-white hover:text-black transition-all group"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-xs font-bold tracking-widest uppercase">
            Quay Về
          </span>
        </a>
      </nav>

      {/* 4. CẤU TRÚC TRANG CHÍNH */}

      {/* SECTION 1: CỔNG PHONG ẤN */}
      <div id="hero">
        <HeroGate />
      </div>

      {/* SECTION 2: BIA ĐÁ GHI DANH */}
      <div id="roles" className="relative z-10">
        <RoleHierarchy />
      </div>

      {/* SEPARATOR */}
      <div className="relative h-24 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-black" />
        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-900 to-transparent" />
      </div>

      {/* SECTION 3: CẤM ĐỊA */}
      <div id="places" className="relative z-20">
        <PlacesShowcase />
      </div>

      {/* SECTION 4: FOOTER */}
      <FooterDao />
    </main>
  );
}
