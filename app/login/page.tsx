import Link from "next/link";
import { AuthForm } from "@/components";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,159,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,159,0.03)_1px,transparent_1px)] bg-size-[100px_100px]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
        {/* Auth Form */}
        <AuthForm />

        {/* Back to home */}
        <Link
          href="/"
          className="mt-8 text-sm text-foreground/40 hover:text-primary font-mono transition-colors flex items-center gap-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
