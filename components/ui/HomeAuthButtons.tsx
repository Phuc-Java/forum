"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/appwrite/client";

interface User {
  $id: string;
  name: string;
  email: string;
}

export default function HomeAuthButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4 mb-10">
        <Link
          href="/forum"
          className="group relative px-8 py-4 bg-primary text-background font-mono font-bold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(0,255,159,0.5)] hover:scale-105"
        >
          <span className="absolute inset-0 bg-linear-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></span>
          <span className="relative flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            Góp Ý
          </span>
        </Link>
        {/* Loading placeholder for second button */}
        <div className="px-8 py-4 border-2 border-secondary/30 rounded-lg animate-pulse">
          <div className="w-24 h-6 bg-secondary/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 mb-10">
      <Link
        href="/forum"
        className="group relative px-8 py-4 bg-primary text-background font-mono font-bold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(0,255,159,0.5)] hover:scale-105"
      >
        <span className="absolute inset-0 bg-linear-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></span>
        <span className="relative flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Góp Ý
        </span>
      </Link>

      {!user ? (
        <Link
          href="/login"
          className="px-8 py-4 border-2 border-secondary/50 text-secondary font-mono font-bold rounded-lg transition-all hover:bg-secondary/10 hover:border-secondary hover:shadow-[0_0_30px_rgba(189,0,255,0.3)] hover:scale-105"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            Đăng Nhập
          </span>
        </Link>
      ) : (
        <Link
          href={`/profile/${user.$id}`}
          className="px-8 py-4 border-2 border-secondary/50 text-secondary font-mono font-bold rounded-lg transition-all hover:bg-secondary/10 hover:border-secondary hover:shadow-[0_0_30px_rgba(189,0,255,0.3)] hover:scale-105"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            Xem Profile
          </span>
        </Link>
      )}
    </div>
  );
}
