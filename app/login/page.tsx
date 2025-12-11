import Link from "next/link";
import { AuthForm } from "@/components";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-20">
      {/* Background effects - Enhanced */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full animate-rotate-slow"></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-secondary/5 rounded-full animate-rotate-slow"
          style={{ animationDirection: "reverse" }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,159,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,159,0.03)_1px,transparent_1px)] bg-size-[100px_100px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-float shadow-[0_0_10px_rgba(0,255,159,0.8)]"></div>
      <div className="absolute top-40 right-1/4 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-accent rounded-full animate-ping"></div>
      <div
        className="absolute top-1/3 right-20 w-2 h-2 bg-primary/60 rounded-full animate-float"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
        {/* Auth Form - Animated */}
        <div className="animate-fade-in-up">
          <AuthForm />
        </div>

        {/* Back to home - Animated */}
        <Link
          href="/"
          className="mt-8 text-sm text-foreground/40 hover:text-primary font-mono transition-all duration-300 flex items-center gap-2 group animate-fade-in-up opacity-0 hover:gap-3"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
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
