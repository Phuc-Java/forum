"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Users,
  Archive,
  MessageSquare,
  X,
  User,
  ShoppingCart,
  Bot,
  LayoutGrid,
  ChevronRight,
  Boxes,
  Ghost,
  Gift,
  LogOut,
  Bell,
  Heart,
  Zap,
  Camera,
  Sparkles,
  Shield,
  Hexagon,
  Terminal,
  ScanFace,
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/appwrite/client";
import { getProfileByUserId, type Profile } from "@/lib/actions/profile";
import Image from "next/image";

// --- DỮ LIỆU LINK (GIỮ NGUYÊN) ---
// Bạn có thể thay link ảnh 'img' bằng ảnh của bạn nếu muốn
const navigation = {
  main: [
    {
      name: "Tiên Phủ",
      href: "/",
      icon: Home,
      color: "text-cyan-400",
      glow: "shadow-cyan-400/50",
      img: "/navbarBT/unnamed (2).jpg",
    },
    {
      name: "Sơ Môn Đồ",
      href: "/intro",
      icon: BookOpen,
      color: "text-fuchsia-400",
      glow: "shadow-fuchsia-400/50",
      img: "/navbarBT/unnamed.jpg",
    },
    {
      name: "Chúng Tu",
      href: "/members",
      icon: Users,
      color: "text-violet-400",
      glow: "shadow-violet-400/50",
      img: "/navbarBT/unnamed (3).jpg",
    },
    {
      name: "Bảo Khố",
      href: "/resources",
      icon: Archive,
      color: "text-emerald-400",
      glow: "shadow-emerald-400/50",
      img: "/navbarBT/unnamed (1).jpg",
    },
  ],
  perks: {
    title: "PHÚC LỢI MÔN PHÁI",
    items: [
      {
        name: "Tàng Kinh Các",
        href: "/shop",
        icon: ShoppingCart,
        desc: "Chợ vật phẩm & Linh thạch",
        color: "text-amber-400",
      },
      {
        name: "Đấng Toàn Năng",
        href: "/chat",
        icon: Bot,
        desc: "AI Trợ lý tối cao",
        color: "text-blue-400",
      },
      {
        name: "Trân Tàng 3D",
        href: "/3Dtest",
        icon: Boxes,
        desc: "Kho báu vật phẩm 3D",
        color: "text-rose-400",
      },
    ],
  },
  events: {
    title: "BÍ CẢNH & THỬ THÁCH",
    items: [
      {
        name: "Đông Chí Hội",
        href: "/giang-sinh",
        icon: Gift,
        color: "text-red-400",
      },
      {
        name: "My Crush",
        href: "/events/my-crush",
        icon: Heart,
        color: "text-pink-500",
      },
      {
        name: "Thiên Cơ Lâu",
        href: "/earn",
        icon: Zap,
        color: "text-yellow-400",
      },
      {
        name: "Mỹ Nhân",
        href: "/gallery",
        icon: Ghost,
        color: "text-purple-400",
      },
      {
        name: "Vạn Tượng Đài",
        href: "/phim",
        icon: Camera,
        color: "text-sky-400",
      },
    ],
  },
};

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const p = await getProfileByUserId(currentUser.$id);
          setProfile(p);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initAuth();
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  // Khóa scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* --- 1. THE CYBER DOCK (ĐẠI PHẪU THUẬT PHẦN NÀY) --- */}
      {/* Z-Index 9999: Đè lên tất cả widget khác */}
      <div className="fixed bottom-20 left-0 right-0 z-[9999] px-4 flex justify-center pointer-events-none">
        {/* Container chính của Dock */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="pointer-events-auto relative"
        >
          {/* Lớp nền mờ + Border phát sáng */}
          <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-2xl rounded-full border border-violet-500/40 shadow-[0_10px_30px_-5px_rgba(124,58,237,0.6)]"></div>

          {/* Nội dung Dock: Dạng viên thuốc, không chữ */}
          <div className="relative flex items-center justify-between px-4 w-[320px] h-[68px]">
            {/* Icon Trái */}
            <DockItem href="/" icon={Home} active={pathname === "/"} />
            <DockItem
              href="/shop"
              icon={Archive}
              active={pathname === "/shop"}
            />

            {/* THE ORB BUTTON (Nút giữa nổi hẳn lên) */}
            <div className="relative -top-6 mx-2">
              {/* Aura phát sáng dưới nút */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-violet-600 blur-xl opacity-60 rounded-full animate-pulse"></div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-center w-16 h-16 rounded-full border-[4px] border-[#09090b] shadow-2xl transition-all duration-500 ${
                  isOpen
                    ? "bg-white text-black rotate-180 scale-90"
                    : "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 text-white hover:scale-105 active:scale-95"
                }`}
              >
                {isOpen ? (
                  <X size={28} strokeWidth={3} />
                ) : (
                  <LayoutGrid size={26} strokeWidth={2.5} />
                )}
              </button>
            </div>

            {/* Icon Phải */}
            <DockItem
              href="/forum"
              icon={MessageSquare}
              active={pathname === "/forum"}
            />
            <DockItem
              href={user ? `/profile/${user.$id}` : "/login"}
              icon={User}
              active={pathname.includes("/profile")}
            />
          </div>
        </motion.div>
      </div>

      {/* --- 2. THE NEXUS OVERLAY (GIỮ NGUYÊN BẢN ĐẸP V4) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="fixed inset-0 z-[9990] bg-[#020617] flex flex-col overflow-hidden transform-gpu"
          >
            {/* Background Art */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-30%] w-[100%] h-[60%] bg-violet-800/20 rounded-full blur-[150px] animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-30%] w-[100%] h-[60%] bg-fuchsia-800/15 rounded-full blur-[150px] animate-pulse delay-1000"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 pt-14 pb-6 px-6 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="relative w-14 h-14 p-[2px] rounded-2xl bg-[#09090b] overflow-hidden">
                    <div className="w-full h-full rounded-[14px] relative overflow-hidden">
                      <Image
                        src={
                          profile?.avatarUrl
                            ? `/avatars/${profile.avatarUrl}`
                            : "/avatars/default.jpg"
                        }
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black text-white tracking-tight font-mono">
                    {profile?.displayName || user?.name || "KHÁCH VÃNG LAI"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1 uppercase tracking-wider">
                      <Shield size={10} /> {profile?.role || "GUEST"}
                    </span>
                    {user && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>{" "}
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                <Bell size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-40 pt-6 no-scrollbar space-y-10">
              <section>
                <SectionTitle
                  title="TRUNG TÂM ĐIỀU HÀNH"
                  icon={ScanFace}
                  color="text-cyan-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  {navigation.main.map((item, idx) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative group overflow-hidden p-5 rounded-[2rem] border border-white/10 ${
                        idx === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                      } flex flex-col justify-between transition-all duration-500 hover:border-violet-500/50 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)] bg-[#09090b]`}
                    >
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={item.img}
                          alt={item.name}
                          fill
                          className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent mix-blend-multiply"></div>
                      </div>
                      <div className="relative z-10 flex justify-between items-start">
                        <div
                          className={`p-3.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 ${item.color}`}
                        >
                          <item.icon size={idx === 0 ? 26 : 22} />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <span
                          className={`block font-black text-white font-mono leading-tight drop-shadow-lg ${
                            idx === 0 ? "text-xl" : "text-base"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle
                  title="KHO TÀNG & TIỆN ÍCH"
                  icon={Sparkles}
                  color="text-fuchsia-400"
                />
                <div className="space-y-3">
                  {navigation.perks.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-5 p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-violet-500/20 transition-all group relative overflow-hidden"
                    >
                      <div
                        className={`p-3 rounded-2xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}
                      >
                        <item.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[15px] font-bold text-gray-100 group-hover:text-white transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-white/20 group-hover:text-violet-400 transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle
                  title="THỬ THÁCH & SỰ KIỆN"
                  icon={Hexagon}
                  color="text-violet-400"
                />
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar snap-x">
                  {navigation.events.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="snap-center flex-shrink-0 w-32 p-4 rounded-[2rem] bg-gradient-to-b from-[#1a1a2e]/80 to-[#0d0d12]/80 border border-white/10 flex flex-col items-center gap-3 relative overflow-hidden group"
                    >
                      <div
                        className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${item.color.replace(
                          "text-",
                          "via-"
                        )}/70 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`}
                      ></div>
                      <div
                        className={`p-3.5 rounded-full bg-black/50 ${item.color} mt-1`}
                      >
                        <item.icon size={22} />
                      </div>
                      <span className="text-[11px] font-bold text-center text-gray-300 font-mono line-clamp-1 w-full group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <Link
                href="/forum"
                className="block relative overflow-hidden rounded-[2.5rem] border border-violet-500/20 group"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535242208474-9a940062636e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-violet-900/60 to-fuchsia-900/40 mix-blend-multiply"></div>
                <div className="relative p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl text-violet-300 border border-violet-500/30">
                      <MessageSquare size={26} />
                    </div>
                    <div>
                      <span className="block font-black text-white text-xl tracking-tight font-mono">
                        CÁO TRI FORUM
                      </span>
                      <span className="text-[11px] text-violet-200/80 font-mono uppercase tracking-widest">
                        Kết nối cộng đồng
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 animate-pulse">
                    <Terminal size={18} />
                  </div>
                </div>
              </Link>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent z-20 flex justify-between items-end pointer-events-none">
              <div className="pointer-events-auto">
                <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase mb-1 flex items-center gap-1">
                  <Zap size={10} /> System Status
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 font-mono tracking-wider">
                    OPERATIONAL
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-400/90 text-[10px] font-bold border border-red-500/20 active:bg-red-500/20 transition-all uppercase font-mono tracking-wider"
              >
                <LogOut size={14} /> Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- REDESIGNED DOCK COMPONENT (CHỈ CÓ ICON) ---
function DockItem({ href, icon: Icon, active }: any) {
  return (
    <Link
      href={href}
      className="relative group flex items-center justify-center w-14 h-14"
    >
      {/* Icon nền phát sáng khi active */}
      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          active ? "bg-violet-600/20 blur-md" : "opacity-0"
        }`}
      ></div>

      <div
        className={`relative p-3 rounded-2xl transition-all duration-300 ${
          active
            ? "text-white bg-violet-600 shadow-lg scale-110"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        }`}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      </div>

      {/* Chấm nhỏ báo hiệu active */}
      {active && (
        <span className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan]"></span>
      )}
    </Link>
  );
}

function SectionTitle({ title, icon: Icon, color }: any) {
  return (
    <div className="flex items-end gap-2 mb-4 px-1">
      <Icon
        size={16}
        className={color}
        style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
      />
      <h3
        className={`text-[11px] font-black font-mono uppercase tracking-[0.25em] leading-none ${color.replace(
          "text-",
          "text-opacity-90 "
        )}`}
      >
        {title}
      </h3>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2 rounded-full mb-0.5"></div>
    </div>
  );
}
