import HomeAuthButtons from "@/components/ui/HomeAuthButtons";
import SplineModel from "@/components/ui/SplineModel";

export default function HomePage() {
  return (
    <main className="h-screen overflow-hidden bg-background relative">
      {/* Background Effects - Fixed & Fullscreen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,159,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(189,0,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,159,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,159,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      {/* Floating Particles */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,159,0.8)]"></div>
      <div className="absolute top-40 left-1/4 w-1 h-1 bg-secondary rounded-full animate-ping"></div>
      <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-primary/60 rounded-full animate-bounce"></div>

      {/* Main Content - Split Layout */}
      <div className="relative h-full flex">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 xl:w-[55%] h-full flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          {/* Logo Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/40 backdrop-blur-md border border-primary/30 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary font-mono text-xs tracking-wider">
                ĐANG HOẠT ĐỘNG
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-mono leading-tight">
              <span className="text-primary text-glow-primary">Xóm</span>
              <span className="text-foreground"> </span>
              <span className="text-secondary text-glow-secondary">Nhà Lá</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="w-16 h-0.5 bg-linear-to-r from-primary to-transparent"></span>
              <span className="text-accent font-mono text-sm tracking-[0.3em]">
                CỘNG ĐỒNG SỐ
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg lg:text-xl text-foreground/60 font-mono max-w-lg mb-8 leading-relaxed">
            Nơi hội tụ của những tâm hồn đồng điệu. Chia sẻ, kết nối và khám phá
            trong không gian số bảo mật.
          </p>

          {/* CTA Buttons - Client Component for auth check */}
          <HomeAuthButtons />

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="group p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 transition-all hover:bg-surface/40">
              <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center mb-3 group-hover:shadow-[0_0_15px_rgba(0,255,159,0.3)] transition-all">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-mono font-bold text-foreground text-sm mb-1">
                Bảo Mật
              </h3>
              <p className="text-foreground/40 text-xs font-mono">End-to-end</p>
            </div>

            <div className="group p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-secondary/50 transition-all hover:bg-surface/40">
              <div className="w-10 h-10 bg-secondary/10 border border-secondary/30 rounded-lg flex items-center justify-center mb-3 group-hover:shadow-[0_0_15px_rgba(189,0,255,0.3)] transition-all">
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-mono font-bold text-foreground text-sm mb-1">
                Cộng Đồng
              </h3>
              <p className="text-foreground/40 text-xs font-mono">Kết nối</p>
            </div>

            <div className="group p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-accent/50 transition-all hover:bg-surface/40">
              <div className="w-10 h-10 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-center mb-3 group-hover:shadow-[0_0_15px_rgba(255,0,128,0.3)] transition-all">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-mono font-bold text-foreground text-sm mb-1">
                Nhanh
              </h3>
              <p className="text-foreground/40 text-xs font-mono">Real-time</p>
            </div>
          </div>

          {/* Bottom Tech Stack */}
          <div className="mt-10 flex items-center gap-4">
            <span className="text-foreground/30 font-mono text-xs">
              Powered by
            </span>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-surface/30 border border-border/30 rounded text-foreground/50 font-mono text-xs">
                Next.js
              </span>
              <span className="px-3 py-1 bg-surface/30 border border-border/30 rounded text-foreground/50 font-mono text-xs">
                Appwrite
              </span>
              <span className="px-3 py-1 bg-surface/30 border border-border/30 rounded text-foreground/50 font-mono text-xs">
                TailwindCSS
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - 3D Model Space */}
        <div className="hidden lg:flex w-1/2 xl:w-[45%] h-full items-center justify-center relative overflow-hidden">
          {/* Background Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-secondary/8 rounded-full blur-2xl"></div>

          {/* 3D Model Container - Centered and sized appropriately */}
          <div className="relative w-[90%] h-[80%] max-w-[600px] max-h-[600px] flex items-center justify-center">
            <SplineModel />
          </div>

          {/* Floating Elements - repositioned */}
          <div className="absolute top-[15%] right-[15%] w-3 h-3 bg-primary rounded-full animate-bounce shadow-[0_0_15px_rgba(0,255,159,0.6)]"></div>
          <div className="absolute bottom-[25%] right-[20%] w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(189,0,255,0.6)]"></div>
          <div className="absolute top-[40%] right-[8%] w-2 h-2 bg-accent rounded-full animate-ping"></div>
          <div className="absolute bottom-[15%] left-[10%] w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
    </main>
  );
}
