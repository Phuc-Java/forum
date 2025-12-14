import HomeAuthButtons from "@/components/ui/HomeAuthButtons";
import SplineModel from "@/components/ui/SplineModel";
import CompactGift from "@/components/home/CompactGift"; // Import component mới
import { Client, Account, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// --- SERVER SIDE LOGIC ---
async function getUserData() {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    // Nếu có API Key (Server side) thì set vào để bypass permission nếu cần
    // Nhưng để check session user thì ta cần session client từ cookies (Next.js mechanics)
    // Để đơn giản hóa trong phạm vi demo này, ta sẽ giả định client-side check ở component con
    // Tuy nhiên, để đúng chuẩn SSR, ta nên dùng `cookies()` từ `next/headers`.
    // Dưới đây là cách an toàn nhất: Trả về null và để Client Component tự lo liệu việc fetch nếu không dùng session cookie helper.

    // *Lưu ý*: Vì đạo hữu đang dùng setup cơ bản, ta sẽ để CompactGift tự fetch hoặc
    // HomeAuthButtons tự xử lý. Nhưng để tối ưu, ta sẽ fetch profile ở đây nếu có thể.

    // Tạm thời trả về null ở server component này và để Client Component xử lý
    // để tránh lỗi "cookies not found" nếu chưa setup middleware.
    return null;
  } catch (error) {
    return null;
  }
}

// Ta chuyển page thành Client Component (hoặc phần tử con) để lấy user context dễ hơn
// Nhưng yêu cầu là dùng Server Component cho page.
// Giải pháp: Ta tạo một Wrapper Client Component để check auth ngay tại chỗ cần hiển thị.

import HomeUserArea from "@/components/ui/HomeUserArea"; // Ta sẽ tạo cái này ở bước 3

export default async function HomePage() {
  return (
    <main className="h-screen overflow-hidden bg-background relative selection:bg-primary/30">
      {/* Background Effects - Fixed & Fullscreen (Giữ nguyên tuyệt đối) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,159,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(189,0,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,159,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,159,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      {/* Animated Floating Particles (Giữ nguyên) */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-float shadow-[0_0_10px_rgba(0,255,159,0.8)]"></div>
      <div className="absolute top-40 left-1/4 w-1 h-1 bg-secondary rounded-full animate-ping"></div>
      <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>

      {/* Main Content - Split Layout */}
      <div className="relative h-full flex">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 xl:w-[55%] h-full flex flex-col justify-center px-8 lg:px-16 xl:px-20 relative z-10">
          {/* Logo Badge */}
          <div className="mb-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/40 backdrop-blur-md border border-primary/30 rounded-full hover:border-primary/60 transition-all duration-300 cursor-default">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,159,0.8)]"></span>
              <span className="text-primary font-mono text-xs tracking-wider">
                ĐANG HOẠT ĐỘNG
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-mono leading-tight">
              <span
                className="inline-block animate-fade-in-up opacity-0"
                style={{
                  animationDelay: "0.1s",
                  animationFillMode: "forwards",
                }}
              >
                <span className="text-primary text-glow-primary">Xóm</span>
              </span>
              <span className="text-foreground"> </span>
              <span
                className="inline-block animate-fade-in-up opacity-0"
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
              className="flex items-center gap-3 mt-4 animate-fade-in-up opacity-0"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <span className="w-16 h-0.5 bg-gradient-to-r from-primary to-transparent animate-pulse"></span>
              <span className="text-accent font-mono text-sm tracking-[0.3em]">
                Diễn Đàn chỉ dành cho Dân Chơi
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-lg lg:text-xl text-foreground/60 font-mono max-w-lg mb-8 leading-relaxed animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Nơi hội tụ của những tâm hồn đồng điệu. Chia sẻ, kết nối và khám phá
            trong không gian bảo mật.
          </p>

          {/* --- AREA THAY ĐỔI: USER AREA / AUTH BUTTONS --- */}
          {/* Thay vì fix cứng AuthButtons, ta dùng Component thông minh này */}
          <div
            className="animate-fade-in-up opacity-0 mb-8"
            style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
          >
            <HomeUserArea />
          </div>

          {/* Feature Cards (Giữ nguyên vị trí) */}
          <div
            className="grid grid-cols-3 gap-4 max-w-lg animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            {/* Card 1 */}
            <div className="group p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/50 transition-all duration-300 hover:bg-surface/40">
              <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all">
                🔒
              </div>
              <h3 className="font-mono font-bold text-foreground text-xs mb-1 group-hover:text-primary">
                Bảo Mật
              </h3>
              <p className="text-foreground/40 text-[10px] font-mono">E2EE</p>
            </div>
            {/* Card 2 */}
            <div className="group p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-secondary/50 transition-all duration-300 hover:bg-surface/40">
              <div className="w-8 h-8 bg-secondary/10 border border-secondary/30 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all">
                🤝
              </div>
              <h3 className="font-mono font-bold text-foreground text-xs mb-1 group-hover:text-secondary">
                Cộng Đồng
              </h3>
              <p className="text-foreground/40 text-[10px] font-mono">
                Kết nối
              </p>
            </div>
            {/* Card 3 */}
            <div className="group p-4 bg-surface/20 backdrop-blur-sm border border-border/50 rounded-xl hover:border-accent/50 transition-all duration-300 hover:bg-surface/40">
              <div className="w-8 h-8 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all">
                ⚡
              </div>
              <h3 className="font-mono font-bold text-foreground text-xs mb-1 group-hover:text-accent">
                Tốc Độ
              </h3>
              <p className="text-foreground/40 text-[10px] font-mono">
                Real-time
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - 3D Model (Giữ nguyên) */}
        <div className="hidden lg:flex w-1/2 xl:w-[45%] h-full items-center justify-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative w-[90%] h-[80%] max-w-[600px] max-h-[600px] flex items-center justify-center">
            <SplineModel />
          </div>
        </div>
      </div>
    </main>
  );
}
