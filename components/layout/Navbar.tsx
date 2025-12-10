"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, logout } from "@/lib/appwrite/client";
import { getProfileByUserId, type Profile } from "@/lib/actions/profile";

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
      } else {
        setProfile(null);
      }

      setLoading(false);
    };
    checkAuth();
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

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
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b-2 border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse"></div>
              <svg
                className="w-6 h-6 text-primary relative z-10"
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
                <span className="text-primary text-glow-primary">Xóm</span>
                <span className="text-secondary text-glow-secondary">
                  {" "}
                  Nhà Lá
                </span>
              </h1>
              <p className="text-[10px] text-accent font-mono tracking-widest opacity-60">
                BẢO MẬT • AN TOÀN • KẾT NỐI
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`font-mono text-sm transition-colors ${
                pathname === "/"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              Trang Chủ
            </Link>
            <Link
              href="/forum"
              className={`font-mono text-sm transition-colors ${
                pathname === "/forum"
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              Góp Ý
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full border border-border">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                <span className="text-xs font-mono text-foreground/60">
                  ĐANG TẢI...
                </span>
              </div>
            ) : user ? (
              <>
                {/* User Info with Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(!showDropdown);
                    }}
                    className="hidden sm:flex items-center gap-3 px-4 py-2 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/50">
                      <Image
                        src={getAvatarSrc()}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-mono text-foreground font-bold">
                        {profile?.displayName || user.name || "Ẩn Danh"}
                      </span>
                      <span className="text-xs font-mono text-primary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        TRỰC TUYẾN
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-foreground/50 transition-transform ${
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50">
                      <div className="p-3 border-b border-border bg-background/50">
                        <p className="font-mono text-sm font-bold text-foreground truncate">
                          {profile?.displayName || user.name}
                        </p>
                        <p className="font-mono text-xs text-foreground/50 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href={`/profile/${user.$id}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
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
                        <Link
                          href="/profile/edit"
                          className="flex items-center gap-3 px-4 py-2.5 text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
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
