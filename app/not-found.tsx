import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        {/* Glitch Effect */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-bold font-mono text-primary/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl sm:text-8xl font-bold font-mono text-primary text-glow-primary animate-pulse">
              404
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-mono text-foreground mb-4">
          Không tìm thấy trang
        </h2>

        <p className="text-foreground/60 font-mono text-sm max-w-md mx-auto mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đến địa chỉ
          khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-background font-mono font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,255,159,0.6)] transition-all"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Về Trang Chủ
          </Link>
          <Link
            href="/forum"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface/50 border border-border text-foreground font-mono rounded-lg hover:border-primary/50 transition-all"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Góp Ý
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-16 flex items-center justify-center gap-2 text-xs text-foreground/30 font-mono">
          <span className="w-2 h-2 bg-primary/30 rounded-full animate-pulse"></span>
          <span>XÓM NHÀ LÁ</span>
          <span className="w-2 h-2 bg-secondary/30 rounded-full animate-pulse"></span>
        </div>
      </div>
    </main>
  );
}
