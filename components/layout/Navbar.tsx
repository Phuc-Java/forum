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
  const eventsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    };
  }, []);

  const openEvents = () => {
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
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b-2 border-border shadow-lg animate-fade-in">
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
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Trang Chủ
                {pathname === "/" && (
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
                Thành Viên
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
                Tài Nguyên
                {pathname?.startsWith("/resources") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <Link
              href="/forum"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/forum"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Góp Ý
                {pathname === "/forum" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <Link
              href="/shop"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/shop"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Tàng kinh Các
                {pathname === "/shop" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <Link
              href="/chat"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/chat"
                  ? "text-accent"
                  : "text-foreground/70 hover:text-accent"
              }`}
            >
              <span className="relative">
                AI
                {pathname === "/chat" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
            <div
              className="relative"
              onMouseEnter={openEvents}
              onMouseLeave={() => closeEventsWithDelay(300)}
            >
              <button
                onFocus={openEvents}
                onBlur={() => closeEventsWithDelay(300)}
                className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                  pathname?.startsWith("/events") || pathname === "/giang-sinh"
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
                aria-haspopup="true"
                aria-expanded={eventsOpen}
              >
                <span className="relative inline-flex items-center">
                  Sự Kiện
                  <span
                    className="ml-2 w-2 h-2 rounded-full bg-primary animate-glow-pulse inline-block"
                    aria-hidden="true"
                  ></span>
                  {pathname === "/giang-sinh" && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                  )}
                </span>
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden z-50 transform transition-all duration-250 ${
                  eventsOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible"
                }`}
                onMouseEnter={openEvents}
                onMouseLeave={() => closeEventsWithDelay(300)}
              >
                <Link
                  href="/giang-sinh"
                  className={`flex items-center px-5 py-3 font-mono text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-150 ${
                    pathname === "/giang-sinh" ? "text-primary" : ""
                  }`}
                >
                  <span
                    className="mr-3 w-2 h-2 rounded-full bg-primary animate-glow-pulse inline-block"
                    aria-hidden="true"
                  ></span>
                  <span>Giáng sinh</span>
                </Link>
                <Link
                  href="/events/my-crush"
                  className={`flex items-center px-5 py-3 font-mono text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-150 ${
                    pathname === "/events/my-crush" ? "text-primary" : ""
                  }`}
                >
                  <span
                    className="mr-3 w-2 h-2 rounded-full bg-primary animate-glow-pulse inline-block"
                    aria-hidden="true"
                  ></span>
                  <span>My Crush</span>
                </Link>
                <Link
                  href="/earn"
                  className={`flex items-center px-5 py-3 font-mono text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-150 ${
                    pathname === "/earn" ? "text-primary" : ""
                  }`}
                >
                  <span
                    className="mr-3 w-2 h-2 rounded-full bg-primary animate-glow-pulse inline-block"
                    aria-hidden="true"
                  ></span>
                  <span>Thiên Cơ Lâu</span>
                </Link>
                <Link
                  href="/gallery"
                  className={`flex items-center px-5 py-3 font-mono text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-150 ${
                    pathname === "/gallery" ? "text-primary" : ""
                  }`}
                >
                  <span
                    className="mr-3 w-2 h-2 rounded-full bg-primary animate-glow-pulse inline-block"
                    aria-hidden="true"
                  ></span>
                  <span>Mỹ Nhân</span>
                </Link>
              </div>
            </div>
            <Link
              href="/phim"
              className={`font-mono text-sm transition-all duration-300 relative hover:scale-105 ${
                pathname === "/phim"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              <span className="relative">
                Phim
                {pathname === "/phim" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-fade-in rounded-full"></span>
                )}
              </span>
            </Link>
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
