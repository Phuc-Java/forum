"use client";

import { useState, useEffect } from "react";
import { Product } from "../../lib/actions/shop";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PinContainer } from "@/components/ui/3d-pin"; // Giữ nguyên component 3d-pin cũ của bạn
import { getTheme } from "@/lib/shop-theme";
import ThreeDCarousel from "@/components/ui/3d-carousel";
import ExpandingCards from "@/components/ui/expanding-cards";
import EnhancedCarousel from "@/components/ui/enhanced-carousel";
import Link from "next/link";

// --- SUB-COMPONENT: HERO SECTION ---
const ShopHero = () => (
  <div className="relative w-full h-[450px] mb-20 rounded-[2rem] overflow-hidden group border border-emerald-500/20 shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)]">
    {/* Dynamic Background */}
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-[3s] ease-out"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"></div>

    {/* Decorative Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear_gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>

    <div className="absolute bottom-0 left-0 p-8 md:p-16 z-10 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-3 px-4 py-2 mb-6 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.2)]"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Hệ Thống Giao Dịch Vạn Giới
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl leading-[0.9]"
      >
        TÀNG KINH <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
          CÁC
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-gray-400 text-lg font-mono border-l-4 border-emerald-500 pl-6 bg-black/40 py-4 backdrop-blur-sm rounded-r-xl max-w-2xl"
      >
        Nơi hội tụ kỳ trân dị bảo, bí tịch lập trình, VPS, và các loại pháp bảo
        công nghệ cao. <br />
        <span className="text-emerald-400 font-bold">
          Giao dịch ẩn danh - Bảo mật tuyệt đối.
        </span>
      </motion.p>
    </div>
  </div>
);

// --- SUB-COMPONENT: SKELETON LOADING ---
const ProductSkeleton = () => (
  <div className="h-[28rem] w-full rounded-[2rem] bg-[#0a0a0a] border border-white/5 overflow-hidden relative animate-pulse">
    <div className="h-48 bg-white/5 w-full"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-white/10 rounded w-3/4"></div>
      <div className="h-4 bg-white/5 rounded w-1/2"></div>
      <div className="h-20 bg-white/5 rounded w-full mt-4"></div>
      <div className="flex justify-between items-center mt-6">
        <div className="h-8 w-8 rounded-full bg-white/10"></div>
        <div className="h-8 w-24 rounded bg-white/10"></div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function ShopInterface({
  initialProducts,
  canSell = false,
  userRole = "pham_nhan",
  onOpenSidebar,
}: {
  initialProducts: Product[];
  currentUserId?: string | null;
  canSell?: boolean;
  userRole?: string;
  onOpenSidebar?: () => void;
}) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Fake loading effect when filter
  const theme = getTheme(userRole);

  // Fake loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  const getImageUrl = (jsonString: string) => {
    try {
      const urls = JSON.parse(jsonString);
      return Array.isArray(urls) && urls.length > 0
        ? urls[0]
        : "/placeholder.jpg";
    } catch {
      return "/placeholder.jpg";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " 💎";
  };

  const filtered = initialProducts.filter((p) => {
    const matchCat = filter === "all" ? true : p.category === filter;
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = [
    { id: "all", label: "Tất Cả", icon: "💠" },
    { id: "tech", label: "Pháp Bảo (Tech)", icon: "🔮" },
    { id: "study", label: "Bí Tịch (Docs)", icon: "📜" },
    { id: "service", label: "Dịch Vụ", icon: "🛠️" },
    { id: "account", label: "Linh Thạch (Acc)", icon: "💎" },
  ];

  return (
    <div className="w-full relative min-h-screen pb-32">
      <ShopHero />

      {/* --- FILTER BAR (Floating Glass) --- */}
      <div className="sticky top-24 z-30 w-full mb-16 px-4 pointer-events-none">
        {/* Pointer-events-none ở container ngoài để click xuyên qua nếu cần, 
            nhưng child elements phải set pointer-events-auto */}
        <div className="max-w-7xl mx-auto bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row gap-4 items-center justify-between transition-all hover:border-emerald-500/30 pointer-events-auto relative overflow-hidden">
          {/* --- CATEGORIES TABS (FIXED SCROLL) --- */}
          <div className="relative w-full lg:w-auto flex-1 overflow-hidden group/tabs">
            {/* Gradient Fade Left (Chỉ hiện khi scroll - ta làm mờ mặc định để đẹp) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>

            {/* Container Scroll */}
            <div className="flex gap-2 overflow-x-auto p-1 w-full no-scrollbar mask-image-fade-sides scroll-smooth">
              {categories.map((cat) => {
                const isActive = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`relative flex-shrink-0 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 group ${
                      isActive
                        ? "text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tab-active"
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${theme.gradient}`}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 text-lg group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Gradient Fade Right */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
          </div>

          {/* Search & Sell (Giữ nguyên, chỉ chỉnh lại z-index nếu cần) */}
          <div className="flex gap-3 w-full lg:w-auto items-center p-1 flex-shrink-0">
            {/* ... (Code Search & Button cũ giữ nguyên) ... */}
            <div className="relative w-full lg:w-80 group">
              <input
                type="text"
                placeholder="Truy tìm bảo vật..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 rounded-xl px-5 py-3 pl-12 text-sm text-white outline-none transition-all focus:bg-black focus:border-emerald-500/50 font-mono shadow-inner"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors text-lg">
                🔍
              </span>
            </div>

            {canSell && (
              <button
                onClick={onOpenSidebar}
                className={`flex-shrink-0 px-8 py-3 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all bg-gradient-to-r ${theme.gradient} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                <span className="text-lg relative z-10">⚡</span>
                <span className="hidden sm:inline relative z-10">Đăng Bán</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- GRID DISPLAY --- */}
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-20 gap-x-12 justify-items-center">
            {[1, 2, 3].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 opacity-70"
          >
            <div className="text-9xl mb-6 animate-float grayscale opacity-50">
              🕸️
            </div>
            <p className="font-mono text-gray-400 text-xl tracking-widest uppercase">
              Tàng Kinh Các chưa có vật phẩm này.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-28 gap-x-12 justify-items-center"
          >
            <AnimatePresence>
              {filtered.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={item.$id}
                  className="h-[32rem] w-full flex items-center justify-center relative z-0 hover:z-30 group"
                >
                  <PinContainer
                    title="Xem Chi Tiết"
                    href={`/shop/${item.$id}`}
                    containerClassName="w-full h-full"
                    pinColor={theme.pinColor}
                  >
                    <div className="flex basis-full flex-col p-0 tracking-tight text-slate-100/50 sm:basis-1/2 w-[24rem] h-[26rem] bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden group-hover/pin:border-emerald-500/50 transition-all duration-500 relative shadow-2xl">
                      {/* Holographic Header */}
                      <div className="p-6 pb-2 z-20 relative bg-gradient-to-b from-black/95 via-black/80 to-transparent">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <h3 className="max-w-[200px] font-bold text-xl text-white line-clamp-1 group-hover/pin:text-emerald-400 transition-colors drop-shadow-md">
                              {item.name}
                            </h3>
                            <span className="text-[10px] text-gray-500 font-mono">
                              ID: {item.$id.substring(0, 6)}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg border text-[10px] uppercase font-bold tracking-wider bg-black/60 backdrop-blur-md shadow-lg ${theme.border} ${theme.primary}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <div
                          className={`text-3xl font-mono font-black bg-clip-text text-transparent bg-gradient-to-r ${theme.gradient} mb-1 drop-shadow-lg`}
                        >
                          {formatCurrency(item.price)}
                        </div>
                      </div>

                      {/* Full Image */}
                      <div className="absolute inset-0 top-0 bottom-0 w-full z-10 group-hover/pin:scale-110 transition-transform duration-700 ease-in-out">
                        <Image
                          src={getImageUrl(item.images)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
                      </div>

                      {/* Footer Info */}
                      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 w-full pr-10">
                        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                          👤
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                            Chủ sở hữu
                          </span>
                          <span className="text-sm font-bold text-white shadow-black drop-shadow-lg truncate max-w-[150px]">
                            {item.sellerName}
                          </span>
                        </div>

                        {/* Status Dot */}
                        <div className="ml-auto mr-4 flex flex-col items-end">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        </div>
                      </div>
                    </div>
                  </PinContainer>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <div className="relative mt-24 py-12 w-full overflow-hidden border-t border-white/5 bg-black/40">
        {/* --- Background Cyber Grid (Mới) --- */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none"></div>

        {/* Glow tím nhẹ ở giữa */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        {/* --- Header Gọn Gàng --- */}
        <div className="relative z-10 text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
              <div className="h-[1px] w-8 bg-purple-500"></div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em]">
                Showcase
              </span>
              <div className="h-[1px] w-8 bg-purple-500"></div>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-xl">
              CỰC PHẨM{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                NHÂN GIAN
              </span>
            </h2>
          </motion.div>
        </div>

        {/* --- Khung Chứa 3D (Đã thu nhỏ chiều cao) --- */}
        <div className="relative z-10 w-full max-w-6xl mx-auto h-[350px] md:h-[450px] flex items-center justify-center -mt-4">
          {/* Scale nhẹ để vừa vặn hơn */}
          <div className="scale-90 md:scale-100 w-full h-full">
            <ThreeDCarousel />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1400px] px-12 mx-auto flex flex-col items-center">
        {/* Header 2 */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-2">
            TOP TIER BEAUTIES
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            TUYỆT SẮC <span className="text-purple-400">GIAI NHÂN</span>
          </h2>
        </div>

        {/* Component Expanding Cards (Căn giữa) */}
        <div className="w-full flex justify-center">
          <ExpandingCards />
        </div>
      </div>
      <div className="w-full max-w-[1400px] px-4 mx-auto flex flex-col items-center">
        {/* Header cho phần mới */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-2">
            MOTION COLLECTION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            HOA TRONG <span className="text-purple-400">GƯƠNG</span>
          </h2>
        </div>

        {/* Component Mới */}
        <div className="w-full">
          <EnhancedCarousel />
        </div>
      </div>
      {/* --- Footer Decoration --- */}
      <div className="pb-8 text-center w-full opacity-30">
        <p className="text-[9px] font-mono text-purple-300 tracking-[0.3em]">
          XOM NHA LA • GALLERY • v2.0
        </p>
      </div>
    </div>
  );
}
