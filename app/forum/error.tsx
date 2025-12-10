"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ForumError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Forum error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold font-mono text-foreground mb-2">
          Đã xảy ra lỗi
        </h1>
        <p className="text-foreground/60 font-mono text-sm mb-6">
          Không thể tải được trang diễn đàn. Vui lòng thử lại sau.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary font-mono hover:bg-primary/30 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-surface/50 border border-border rounded-lg text-foreground/70 font-mono hover:bg-surface/70 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-foreground/40 font-mono cursor-pointer">
              Chi tiết lỗi (dev only)
            </summary>
            <pre className="mt-2 p-4 bg-surface/30 rounded-lg text-xs text-danger overflow-auto max-h-48">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
