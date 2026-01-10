"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getCurrentUser,
  logout,
  syncSessionCookie,
} from "@/lib/appwrite/client";
import { getProfileByUserId, type Profile } from "@/lib/actions/profile";
import NotificationBell from "@/components/ui/NotificationBell";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { getRoleInfo, isAdmin } from "@/lib/roles";

interface User {
  $id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [perksOpen, setPerksOpen] = useState(false);
  const eventsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perksTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check auth on mount and route change
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // Load profile if user exists
      if (currentUser) {
        const userProfile = await getProfileByUserId(currentUser.$id);
        setProfile(userProfile);

        // Sync session cookie for server-side auth
        // This ensures server can recognize the user for SSR pages
        await syncSessionCookie();
      } else {
        setProfile(null);
      }

      setLoading(false);
    };
    checkAuth();
  }, [pathname]);

  // Auto logout when ALL browser tabs/windows are closed
  // Uses BroadcastChannel to coordinate between tabs
  useEffect(() => {
    if (!user) return;

    // Track this tab
    const tabId = Math.random().toString(36).substring(7);
    const STORAGE_KEY = "forum_active_tabs";

    // Register this tab
    const registerTab = () => {
      const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!tabs.includes(tabId)) {
        tabs.push(tabId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
      }
    };

    // Unregister this tab
    const unregisterTab = () => {
      const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const newTabs = tabs.filter((id: string) => id !== tabId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTabs));

      // If this was the last tab, logout
      if (newTabs.length === 0) {
        navigator.sendBeacon("/api/logout");
      }
    };

    registerTab();

    // Handle tab close
    window.addEventListener("beforeunload", unregisterTab);

    // Handle tab becoming visible again (user returned)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        registerTab();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", unregisterTab);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  // Cleanup events timer on unmount
  useEffect(() => {
    return () => {
      if (eventsTimer.current) clearTimeout(eventsTimer.current as any);
      if (perksTimer.current) clearTimeout(perksTimer.current as any);
    };
  }, []);

  const openEvents = () => {
    // If perks menu is open or waiting to close, cancel that and close it immediately
    if (perksTimer.current) {
      clearTimeout(perksTimer.current as any);
      perksTimer.current = null;
    }
    if (perksOpen) setPerksOpen(false);

    if (eventsTimer.current) {
      clearTimeout(eventsTimer.current as any);
      eventsTimer.current = null;
    }
    setEventsOpen(true);
  };

  const closeEventsWithDelay = (delay = 300) => {
    if (eventsTimer.current) clearTimeout(eventsTimer.current as any);
    eventsTimer.current = setTimeout(() => {
      setEventsOpen(false);
      eventsTimer.current = null;
    }, delay);
  };

  const openPerks = () => {
    // If events menu is open or waiting to close, cancel that and close it immediately
    if (eventsTimer.current) {
      clearTimeout(eventsTimer.current as any);
      eventsTimer.current = null;
    }
    if (eventsOpen) setEventsOpen(false);

    if (perksTimer.current) {
      clearTimeout(perksTimer.current as any);
      perksTimer.current = null;
    }
    setPerksOpen(true);
  };

  const closePerksWithDelay = (delay = 300) => {
    if (perksTimer.current) clearTimeout(perksTimer.current as any);
    perksTimer.current = setTimeout(() => {
      setPerksOpen(false);
      perksTimer.current = null;
    }, delay);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setProfile(null);
    router.push("/login");
    router.refresh();
  };

  const getAvatarSrc = () => {
    if (profile?.avatarUrl) {
      return `/avatars/${profile.avatarUrl}`;
    }
    return "/avatars/default.jpg";
  };

  return (
    <nav className="sticky top-0 z-9999 bg-surface/80 backdrop-blur-lg border-b-2 border-border shadow-lg animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-lg animate-glow-pulse"></div>
              <svg
                className="w-6 h-6 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-primary text-glow-primary group-hover:animate-glow-pulse">
                  Xóm
                </span>
                <span className="text-secondary text-glow-secondary group-hover:animate-glow-pulse">
                  {" "}
                  Nhà Lá
                </span>
              </h1>
              <p className="text-[10px] text-accent font-mono tracking-widest opacity-60">
                Diễn đàn khét tiếng nhất hành tinh
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Tiên Phủ
                {pathname === "/" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <Link
              href="/intro"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname?.startsWith("/intro")
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Sơ Môn Đồ
                {pathname?.startsWith("/intro") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <Link
              href="/members"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/members"
                  ? "text-secondary"
                  : "text-foreground/70 hover:text-secondary"
              }`}
            >
              <span className="relative">
                Chúng Tu
                {pathname === "/members" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <Link
              href="/resources"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname?.startsWith("/resources")
                  ? "text-accent"
                  : "text-foreground/70 hover:text-accent"
              }`}
            >
              <span className="relative">
                Bảo Khố
                {pathname?.startsWith("/resources") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            {/* Đặc quyền - moved next to Resources */}
            <div
              className="relative"
              onMouseEnter={openPerks}
              onMouseLeave={() => closePerksWithDelay(300)}
            >
              <button
                onFocus={openPerks}
                onBlur={() => closePerksWithDelay(300)}
                className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                  pathname?.startsWith("/shop") ||
                  pathname === "/chat" ||
                  pathname === "/messenger" ||
                  pathname?.startsWith("/music-sanctuary")
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
                aria-haspopup="true"
                aria-expanded={perksOpen}
              >
                <span className="relative inline-flex items-center gap-2">
                  <span className="text-lg">🎖️</span>
                  <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent font-bold animate-pulse">
                    Phúc Lợi
                  </span>
                  <span className="absolute -top-1 -right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  {(pathname?.startsWith("/shop") ||
                    pathname === "/chat" ||
                    pathname === "/messenger" ||
                    pathname?.startsWith("/music-sanctuary")) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                  )}
                </span>
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-64 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-2 border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.3)] overflow-hidden z-50 transform transition-all duration-300 ${
                  perksOpen
                    ? "opacity-100 translate-y-0 visible scale-100"
                    : "opacity-0 -translate-y-4 invisible scale-95"
                }`}
                style={{
                  boxShadow:
                    "0 0 60px rgba(217,119,6,0.4), 0 0 100px rgba(217,119,6,0.2), inset 0 0 80px rgba(217,119,6,0.05)",
                }}
                onMouseEnter={openPerks}
                onMouseLeave={() => closePerksWithDelay(300)}
              >
                {/* Decorative top border with gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                {/* Ancient patterns overlay */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.2),transparent_50%)] pointer-events-none"></div>

                <div className="relative p-2">
                  <Link
                    href="/shop"
                    className={`flex items-center px-4 py-3.5 font-mono text-sm rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      pathname === "/shop"
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 shadow-lg shadow-amber-500/20"
                        : "text-slate-300 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 hover:text-amber-200"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span
                      className="mr-3 text-xl relative z-10"
                      aria-hidden="true"
                    >
                      📚
                    </span>
                    <span className="relative z-10 font-semibold">
                      Tàng Kinh Các
                    </span>
                    <span className="ml-auto text-amber-400/50 transition-all group-hover:text-amber-300 group-hover:translate-x-1 relative z-10">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/chat"
                    className={`flex items-center px-4 py-3.5 font-mono text-sm rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      pathname === "/chat"
                        ? "bg-gradient-to-r from-purple-600/25 to-violet-600/25 text-purple-200 shadow-lg shadow-purple-500/30"
                        : "text-slate-300 hover:bg-gradient-to-r hover:from-purple-600/15 hover:to-violet-600/15 hover:text-purple-100"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span
                      className="mr-3 text-xl relative z-10"
                      aria-hidden="true"
                    >
                      🤖
                    </span>
                    <span className="relative z-10 font-semibold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                      Đấng Toàn Năng
                    </span>
                    <span className="ml-auto text-purple-400/60 transition-all group-hover:text-purple-300 group-hover:translate-x-1 relative z-10">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/messenger"
                    className={`flex items-center px-4 py-3.5 font-mono text-sm rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      pathname === "/messenger"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20"
                        : "text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:text-cyan-200"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span
                      className="mr-3 text-xl relative z-10"
                      aria-hidden="true"
                    >
                      ☁️
                    </span>
                    <span className="relative z-10 font-semibold">
                      Thông Linh Các
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 relative z-10">
                      <span className="text-[9px] px-2 py-1 bg-cyan-500/30 text-cyan-300 rounded-full font-bold border border-cyan-400/40 shadow-sm shadow-cyan-500/20">
                        MỚI
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/music-sanctuary"
                    className={`flex items-center px-4 py-3.5 font-mono text-sm rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      pathname?.startsWith("/music-sanctuary")
                        ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-300 shadow-lg shadow-rose-500/20"
                        : "text-slate-300 hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-pink-500/10 hover:text-rose-200"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400/0 via-rose-400/5 to-rose-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span
                      className="mr-3 text-xl relative z-10"
                      aria-hidden="true"
                    >
                      🎵
                    </span>
                    <span className="relative z-10 font-semibold">
                      Linh Âm Đài
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 relative z-10">
                      <span className="text-[9px] px-2 py-1 bg-rose-500/30 text-rose-300 rounded-full font-bold border border-rose-400/40 shadow-sm shadow-rose-500/20">
                        MỚI
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/3Dtest"
                    className={`flex items-center px-4 py-3.5 font-mono text-sm rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      pathname?.startsWith("/3Dtest")
                        ? "bg-gradient-to-r from-indigo-500/20 to-blue-600/20 text-indigo-300 shadow-lg shadow-indigo-500/20"
                        : "text-slate-300 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-blue-600/10 hover:text-indigo-200"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/5 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span
                      className="mr-3 text-xl relative z-10"
                      aria-hidden="true"
                    >
                      🏺
                    </span>
                    <span className="relative z-10 font-semibold">
                      Trân Tàng
                    </span>
                    <span className="ml-auto text-indigo-400/50 transition-all group-hover:text-indigo-300 group-hover:translate-x-1 relative z-10">
                      →
                    </span>
                  </Link>

                  {/* Divider with glow */}
                  <div className="my-2 px-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent shadow-[0_0_8px_rgba(217,119,6,0.3)]"></div>
                  </div>

                  {/* Supreme Item - Thiên Cơ Các */}
                  <Link
                    href="/thien-co-cac"
                    className={`flex items-center px-4 py-4 font-mono text-sm rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      pathname?.startsWith("/thien-co-cac")
                        ? "bg-gradient-to-r from-amber-600/30 via-yellow-500/25 to-amber-600/30 shadow-2xl shadow-amber-500/40"
                        : "bg-gradient-to-r from-amber-600/15 via-yellow-500/10 to-amber-600/15 hover:from-amber-600/25 hover:via-yellow-500/20 hover:to-amber-600/25"
                    }`}
                    style={{
                      boxShadow: pathname?.startsWith("/thien-co-cac")
                        ? "0 0 30px rgba(217,119,6,0.5), 0 0 60px rgba(217,119,6,0.3), inset 0 0 30px rgba(217,119,6,0.1)"
                        : "0 0 15px rgba(217,119,6,0.2), inset 0 0 20px rgba(217,119,6,0.05)",
                    }}
                  >
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-xl border-2 border-amber-400/40 group-hover:border-amber-400/60 transition-all duration-300"></div>

                    {/* Sweeping light effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-300/0 via-amber-200/20 to-amber-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <span
                      className="mr-3 text-2xl relative z-10 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]"
                      aria-hidden="true"
                    >
                      ⚜️
                    </span>
                    <span className="relative z-10 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent font-bold text-base drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]">
                      Thiên Cơ Các
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 relative z-10">
                      <span className="text-[8px] px-2 py-1 bg-gradient-to-r from-amber-500/50 via-yellow-400/50 to-amber-500/50 text-amber-100 rounded-full font-black border-2 border-amber-300/60 shadow-lg shadow-amber-500/40 tracking-wider">
                        CHÍ TÔN
                      </span>
                    </span>
                  </Link>
                </div>

                {/* Decorative bottom border with gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
            </div>
            <Link
              href="/forum"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/forum"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Cáo Tri
                {pathname === "/forum" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>

            {/* Bí Cảnh - UI lột xác */}
            <div
              className="relative group/parent"
              onMouseEnter={openEvents}
              onMouseLeave={() => closeEventsWithDelay(300)}
            >
              <button
                onFocus={openEvents}
                onBlur={() => closeEventsWithDelay(300)}
                className={`font-mono text-sm transition-all duration-300 relative py-2 flex items-center group ${
                  pathname?.startsWith("/events") ||
                  pathname === "/giang-sinh" ||
                  pathname === "/future"
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
                aria-haspopup="true"
                aria-expanded={eventsOpen}
              >
                <span className="relative inline-flex items-center gap-2">
                  <span className="tracking-widest">BÍ CẢNH</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
                  </span>
                </span>
              </button>

              {/* Dropdown Menu - Phong cách Glassmorphism */}
              <div
                className={`absolute left-0 top-full mt-3 w-64 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 transition-all duration-300 origin-top-left ${
                  eventsOpen
                    ? "opacity-100 scale-100 translate-y-0 visible"
                    : "opacity-0 scale-95 -translate-y-4 invisible"
                }`}
                onMouseEnter={openEvents}
                onMouseLeave={() => closeEventsWithDelay(300)}
              >
                {/* Thanh quét sáng trên cùng */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="p-2 flex flex-col gap-1">
                  {[
                    { href: "/giang-sinh", label: "Đông Chí Hội", emoji: "❄️" },
                    {
                      href: "/events/my-crush",
                      label: "My Crush",
                      emoji: "💕",
                    },
                    { href: "/earn", label: "Thiên Cơ Lâu", emoji: "🎋" },
                    { href: "/gallery", label: "Mỹ Nhân", emoji: "🌸" },
                    { href: "/phim", label: "Vạn Tượng Đài", emoji: "⛩️" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group/item flex items-center px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <span className="mr-3 text-base group-hover/item:scale-125 transition-transform">
                        {item.emoji}
                      </span>
                      <span className="font-mono text-[13px] tracking-wider font-medium">
                        {item.label}
                      </span>
                      <span className="ml-auto opacity-0 -translate-x-2 transition-all duration-300 group-hover/item:opacity-100 group-hover/item:translate-x-0 text-primary">
                        →
                      </span>
                    </Link>
                  ))}

                  {/* Divider */}
                  <div className="my-1.5 px-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* CHILL WITH ME - NỔI BẬT NHẤT */}
                  <Link
                    href="/future"
                    className={`group/chill relative flex items-center px-4 py-4 rounded-xl transition-all duration-500 border ${
                      pathname === "/future"
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        : "bg-cyan-500/5 border-transparent hover:border-cyan-500/20 text-white/80 hover:text-cyan-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                      {/* Dot phát sáng */}
                      <div className="relative flex-shrink-0 flex h-2.5 w-2.5">
                        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                      </div>

                      {/* Text - Thêm whitespace-nowrap để chống tràn */}
                      <span className="font-bold font-mono text-[13px] tracking-[0.1em] uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] whitespace-nowrap overflow-hidden">
                        Chill with me
                      </span>
                    </div>

                    {/* NEW BADGE - Thu nhỏ lại một chút để cân bằng */}
                    <div className="ml-2 relative z-10 flex-shrink-0">
                      <span className="relative flex items-center justify-center">
                        <span className="absolute inset-0 bg-cyan-500/20 rounded-full animate-pulse"></span>
                        <span className="text-[8px] font-black italic tracking-tighter text-cyan-400 border border-cyan-500/50 rounded-full px-2 py-0.5 bg-black/60 shadow-[0_0_10px_rgba(34,211,238,0.3)] whitespace-nowrap">
                          NEW_LOG
                        </span>
                      </span>
                    </div>

                    {/* Hiệu ứng tia sáng quét ngang */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover/chill:animate-[sheen_2s_infinite] transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full border border-border animate-pulse">
                <span className="w-2 h-2 rounded-full bg-accent animate-glow-pulse"></span>
                <span className="text-xs font-mono text-foreground/60">
                  ĐANG TẢI...
                </span>
              </div>
            ) : user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell userId={user.$id} />

                {/* User Info with Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(!showDropdown);
                    }}
                    className="hidden sm:flex items-center gap-3 px-4 py-2 bg-background/50 rounded-lg border border-border hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,255,159,0.2)] transition-all duration-300 btn-press"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/50 hover:scale-105 transition-transform duration-300">
                      <Image
                        src={getAvatarSrc()}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-mono font-bold ${
                            getRoleInfo(profile?.role).color
                          } ${getRoleInfo(profile?.role).textGlow}`}
                        >
                          {profile?.displayName || user.name || "Ẩn Danh"}
                        </span>
                        <RoleBadge
                          role={profile?.role}
                          size="sm"
                          showName={false}
                        />
                      </div>
                      <span className="text-xs font-mono text-primary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-glow-pulse"></span>
                        TRỰC TUYẾN
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-foreground/50 transition-transform duration-300 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in-scale">
                      <div className="p-3 border-b border-border bg-background/50">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-mono text-sm font-bold truncate ${
                              getRoleInfo(profile?.role).color
                            }`}
                          >
                            {profile?.displayName || user.name}
                          </p>
                          <RoleBadge role={profile?.role} size="sm" />
                        </div>
                        <p className="font-mono text-xs text-foreground/50 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href={`/profile/${user.$id}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-foreground/80 hover:bg-primary/10 hover:text-primary hover:pl-6 transition-all duration-300"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-mono text-sm">Xem Profile</span>
                        </Link>
                        {/* Hide edit profile for guest (no_le) */}
                        {profile?.role !== "no_le" && (
                          <Link
                            href="/profile/edit"
                            className="flex items-center gap-3 px-4 py-2.5 text-foreground/80 hover:bg-primary/10 hover:text-primary hover:pl-6 transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span className="font-mono text-sm">
                              Chỉnh sửa Profile
                            </span>
                          </Link>
                        )}

                        {/* Admin Link - Only show for admin roles */}
                        {isAdmin(profile?.role) && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 hover:pl-6 transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                              />
                            </svg>
                            <span className="font-mono text-sm">
                              🔥 Quản trị
                            </span>
                          </Link>
                        )}
                      </div>
                      <div className="py-2 border-t border-border">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 w-full text-danger/80 hover:bg-danger/10 hover:text-danger transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="font-mono text-sm">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Avatar (without dropdown) */}
                <Link
                  href={`/profile/${user.$id}`}
                  className="sm:hidden w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50"
                >
                  <Image
                    src={getAvatarSrc()}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </>
            ) : (
              <>
                {/* Offline Status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full border border-border">
                  <span className="w-2 h-2 rounded-full bg-foreground/30"></span>
                  <span className="text-xs font-mono text-foreground/60">
                    NGOẠI TUYẾN
                  </span>
                </div>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/50 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,159,0.3)]"
                >
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="font-mono text-sm text-primary font-bold uppercase">
                    Đăng Nhập
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
