"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/appwrite/client";
import Link from "next/link";
import dynamic from "next/dynamic";

const FunFactBox = dynamic(
  () => import("@/components").then((mod) => mod.FunFactBox),
  { ssr: false }
);

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "checking" | "logging-out" | "done" | "not-logged-in"
  >("checking");

  useEffect(() => {
    const doLogout = async () => {
      try {
        // Check if logged in
        const user = await getCurrentUser();
        if (!user) {
          setStatus("not-logged-in");
          return;
        }

        setStatus("logging-out");
        await logout();
        setStatus("done");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 2000);
      } catch (error) {
        console.error("Logout error:", error);
        setStatus("done");
      }
    };

    doLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-8 px-4">
        <div className="flex-1">
          <div className="bg-surface/50 backdrop-blur-lg border-2 border-border rounded-xl p-8 max-w-md w-full text-center mx-auto">
            {status === "checking" && (
              <>
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-foreground font-mono">Đang kiểm tra...</p>
              </>
            )}

            {status === "logging-out" && (
              <>
                <div className="animate-spin w-12 h-12 border-4 border-danger border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-foreground font-mono">Đang đăng xuất...</p>
              </>
            )}

            {status === "done" && (
              <>
                <div className="text-5xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-primary font-mono mb-2">
                  Đăng Xuất Thành Công!
                </h2>
                <p className="text-foreground/60 font-mono text-sm mb-4">
                  Đang chuyển hướng về trang đăng nhập...
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-mono font-bold rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Đăng Nhập Lại
                </Link>
              </>
            )}

            {status === "not-logged-in" && (
              <>
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-accent font-mono mb-2">
                  Chưa Đăng Nhập
                </h2>
                <p className="text-foreground/60 font-mono text-sm mb-4">
                  Bạn chưa đăng nhập vào hệ thống.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-mono font-bold rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Đăng Nhập
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-80 lg:w-96 self-start">
          <FunFactBox />
        </div>
      </div>
    </div>
  );
}
