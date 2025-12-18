import HomeAuthButtons from "@/components/ui/HomeAuthButtons";
import SplineModel from "@/components/ui/SplineModel";
import CompactGift from "@/components/home/CompactGift";
import HomeUserArea from "@/components/ui/HomeUserArea";
import MobileNav from "@/components/ui/MobileNav";

export default async function HomePage() {
  return (
    <main className="h-screen w-full overflow-hidden bg-background relative selection:bg-primary/30 transform-gpu">
      {/* 1. BACKGROUND LAYERS (Giữ nguyên tuyệt đối) */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu will-change-transform">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,159,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(189,0,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,159,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,159,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      {/* Thay đổi: pt-20 để cách Navbar trên vừa đủ, justify-start để nội dung nằm ở trên trên mobile */}
      <div className="relative z-20 h-full flex flex-col lg:flex-row items-center justify-start lg:justify-center px-6 lg:px-20 pt-20 lg:pt-0 transform-gpu overflow-y-auto lg:overflow-hidden">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 xl:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Badge Status */}
          <div className="mb-4 animate-fade-in-up flex justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface/40 backdrop-blur-md border border-primary/30 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,159,0.8)]"></span>
              <span className="text-primary font-mono text-[9px] lg:text-xs tracking-wider uppercase font-bold">
                HỆ THỐNG ĐANG HOẠT ĐỘNG
              </span>
            </div>
          </div>

          {/* Titles */}
          <div className="mb-6 space-y-2">
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black font-mono leading-[0.9] tracking-tighter">
              <span
                className="inline-block animate-fade-in-up opacity-0"
                style={{
                  animationDelay: "0.1s",
                  animationFillMode: "forwards",
                }}
              >
                <span className="text-primary text-glow-primary">Xóm</span>
              </span>
              <br className="lg:hidden" />
              <span
                className="inline-block animate-fade-in-up opacity-0 lg:ml-4"
                style={{
                  animationDelay: "0.2s",
                  animationFillMode: "forwards",
                }}
              >
                <span className="text-secondary text-glow-secondary">
                  Nhà Lá
                </span>
              </span>
            </h1>
            <div
              className="flex items-center justify-center lg:justify-start gap-3 mt-4 animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <div className="hidden sm:block w-12 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              <span className="text-accent font-mono text-[10px] lg:text-sm tracking-[0.4em] uppercase font-bold">
                DIỄN ĐÀN DÂN CHƠI
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-[12px] sm:text-sm lg:text-lg text-foreground/60 font-mono max-w-[280px] sm:max-w-lg mb-8 leading-relaxed animate-fade-in-up opacity-0 mx-auto lg:mx-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Nơi hội tụ những tâm hồn đồng điệu. Chia sẻ, kết nối và khám phá
            trong không gian bảo mật.
          </p>

          {/* USER AREA */}
          <div
            className="animate-fade-in-up opacity-0 mb-8 w-full max-w-md mx-auto lg:mx-0 z-30 transform-gpu"
            style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
          >
            <HomeUserArea />
          </div>

          {/* FEATURE CARDS - Chỉ hiện khi màn hình >= 1000px */}
          <div
            className="hidden min-[1000px]:grid grid-cols-3 gap-4 max-w-lg animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            {[
              { label: "BẢO MẬT", icon: "🔒", color: "text-primary" },
              { label: "CỘNG ĐỒNG", icon: "🤝", color: "text-secondary" },
              { label: "TỐC ĐỘ", icon: "⚡", color: "text-accent" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 transition-all group"
              >
                <div className="text-lg mb-1 group-hover:scale-110 transition-transform text-center">
                  {item.icon}
                </div>
                <div
                  className={`text-[10px] font-bold uppercase ${item.color} font-mono text-center`}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE (Robot) - Chỉ hiện khi màn hình Desktop (lg: 1024px) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] h-full items-center justify-center relative overflow-hidden z-10 transform-gpu">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative w-[90%] h-[80%] max-w-[600px] max-h-[600px] flex items-center justify-center">
            <SplineModel />
          </div>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION (Z-9999) 
          Sử dụng lg:hidden để hiện ở cả Mobile và Tablet (< 1024px)
      */}

      <MobileNav />
    </main>
  );
}
