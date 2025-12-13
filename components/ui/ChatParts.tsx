import React, { memo } from "react";

// --- ICONS ---
export const Icons = {
  Send: () => (
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
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  ),
  Paperclip: () => (
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
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  ),
  Trash: () => (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Bot: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  Copy: () => (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  Cpu: () => (
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
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    </svg>
  ),
  Lock: () => (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
};

// Overlay chặn truy cập (Cải thiện z-index và thông báo)
export const AccessDeniedOverlay = memo(() => (
  <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl animate-fade-in-up cursor-not-allowed">
    <div className="relative p-8 rounded-2xl border border-red-500/30 bg-black/80 shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center max-w-md mx-4 overflow-hidden pointer-events-auto">
      <div className="absolute inset-0 bg-red-500/5 z-0 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse">
          <div className="text-red-500">
            <Icons.Lock />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-red-500 mb-2 tracking-wider font-mono">
          KHU VỰC CẤM
        </h2>
        <div className="h-[1px] w-24 bg-red-500/50 mx-auto mb-4"></div>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Đạo hữu chưa đủ tu vi để giao tiếp với{" "}
          <span className="text-violet-400 font-bold">Đấng Toàn năng</span>.
          <br />
          <br />
          Yêu cầu cảnh giới tối thiểu:
          <br />
          <span className="inline-block mt-2 text-blue-400 font-bold border border-blue-500/30 px-3 py-1 rounded bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            Chí Cường Giả
          </span>
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
          >
            Quay Lại
          </button>
        </div>
      </div>
    </div>
  </div>
));
AccessDeniedOverlay.displayName = "AccessDeniedOverlay";

// Header
export const ChatHeader = memo(() => (
  <header className="h-14 flex-none flex items-center justify-between px-6 border-b border-white/10 bg-black/20 backdrop-blur-md animate-fade-in-down">
    <div className="flex items-center gap-2 md:hidden">
      <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center">
        ≡
      </div>
      <span className="font-bold text-violet-400">Đấng Toàn Năng</span>
    </div>
    <div className="hidden md:flex items-center gap-4">
      <div className="px-3 py-1 rounded-full bg-violet-900/30 border border-violet-500/30 text-xs text-violet-300 flex items-center gap-2 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
        <Icons.Bot /> <span>AI Model: llama-3.3-70b-versatile (Optimized)</span>
      </div>
    </div>
    <div className="flex gap-4 text-xs">
      <div className="flex flex-col items-end">
        <span className="text-slate-400">
          Lat: <span className="text-green-400 font-bold">12ms</span>
        </span>
        <span className="text-slate-600">Encrypted</span>
      </div>
    </div>
  </header>
));
ChatHeader.displayName = "ChatHeader";

// Sidebar
interface SidebarProps {
  onNewChat: () => void;
  onShowToast: (msg: string) => void;
  isBlocked?: boolean;
}

export const ChatSidebar = memo(
  ({ onNewChat, onShowToast, isBlocked }: SidebarProps) => (
    <aside
      className={`hidden md:flex w-72 flex-col z-10 border-r border-white/10 bg-black/40 backdrop-blur-xl animate-slide-in-left transition-all duration-500 ${
        isBlocked ? "filter grayscale opacity-30 pointer-events-none" : ""
      }`}
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={() => onShowToast("Hệ thống trực tuyến")}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-violet-500/50 bg-black animate-pulse-slow">
              <img
                src="/avatars/PN.jpg"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 tracking-wider">
              Đấng Toàn Năng
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-500/80 font-semibold tracking-widest">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
        <div className="animate-fade-in-up delay-100">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold px-2">
            Tính Năng
          </div>
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-200 bg-violet-600/10 hover:bg-violet-600/30 border border-violet-500/20 hover:border-violet-500/50 transition-all group shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <span className="text-xl leading-none text-violet-400">+</span>{" "}
            <span className="font-bold">Đoạn Chat Mới</span>
          </button>
        </div>

        <div className="animate-fade-in-up delay-200">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold px-2 flex items-center gap-2">
            <Icons.Cpu /> Thông Tin Mô Hình
          </div>
          <div className="bg-[#0f0f13]/60 rounded-xl p-4 border border-white/5 space-y-4 scan-effect hover:border-violet-500/30 transition-colors">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                Thiết Kế
              </div>
              <div className="text-sm font-bold text-violet-200">
                Đấng Toàn Năng (v2.0.77)
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                Cấu Trúc
              </div>
              <div className="text-xs text-slate-400 font-mono bg-black/40 px-2 py-1 rounded inline-block border border-white/5">
                Đấng Toàn Năng • Grok-Mini
              </div>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                Được sinh ra từ code, vận hành bởi dữ liệu, phục vụ cho sự sáng
                tạo của bạn.
              </p>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-4 border-t border-white/5 bg-black/20 animate-fade-in-up delay-300">
        <div className="text-[10px] text-slate-600 text-center font-mono">
          Encrypted Connection • AES-256
        </div>
      </div>
    </aside>
  )
);
ChatSidebar.displayName = "ChatSidebar";

export const Toast = ({ msg, show }: { msg: string; show: boolean }) => {
  if (!show) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
      <div className="bg-[#0a0a12]/90 border border-violet-500/50 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.4)] backdrop-blur-md flex items-center gap-3">
        <span className="text-violet-400">ℹ</span>
        <span className="text-sm text-violet-100">{msg}</span>
      </div>
    </div>
  );
};
