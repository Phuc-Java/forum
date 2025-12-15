"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

// --- IMPORT UI COMPONENTS ---
import {
  ChatSidebar,
  ChatHeader,
  Toast,
  Icons,
  // AccessDeniedOverlay, // Đã bỏ overlay cũ
} from "../../components/ui/ChatParts";

// --- IMPORT OVERLAY MỚI (THẦN THỨC BỊ CHẶN) ---
import { ChatAccessDenied } from "./ChatAccessDenied";

// --- APPWRITE CLIENT SDK IMPORTS ---
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// --- CẤU HÌNH ROLE ĐƯỢC PHÉP ---
const ALLOWED_ROLES = ["chi_cuong_gia", "thanh_nhan", "chi_ton"];

// --- UTILS ---
const Typewriter = React.memo(
  ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
    const [display, setDisplay] = useState("");
    useEffect(() => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplay((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
        }
      }, 10);
      return () => clearInterval(timer);
    }, [text, onComplete]);
    return <span>{display}</span>;
  }
);
Typewriter.displayName = "Typewriter";

export default function ChatPage() {
  // --- 1. LOGIC CHECK QUYỀN TRỰC TIẾP TẠI PAGE (CLIENT-SIDE) ---
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true); // Loading trạng thái check quyền

  useEffect(() => {
    const verifyUserPermission = async () => {
      try {
        // 1. Khởi tạo Appwrite Client ngay tại đây
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);

        const account = new Account(client);
        const databases = new Databases(client);

        // 2. Lấy User đang đăng nhập
        const user = await account.get();

        if (!user) {
          throw new Error("Chưa đăng nhập");
        }

        // 3. Query vào bảng Profiles để lấy Role
        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.profiles,
          [Query.equal("userId", user.$id)]
        );

        if (profileRes.documents.length > 0) {
          const profile = profileRes.documents[0];
          const userRole = profile.role || "no_le"; // Lấy cột 'role'

          console.log("User Role:", userRole); // Debug xem role là gì

          // 4. So sánh Role
          if (ALLOWED_ROLES.includes(userRole)) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } else {
          // Có user account nhưng chưa có profile -> Chặn
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Lỗi xác thực quyền:", error);
        setHasAccess(false); // Có lỗi => Chặn
      } finally {
        setChecking(false); // Tắt màn hình loading
      }
    };

    verifyUserPermission();
  }, []);

  // Fix lỗi setChecking không được định nghĩa ở trên (do sửa code gốc)
  const setChecking = (val: boolean) => setIsChecking(val);

  // --- 2. STATE GIAO DIỆN CHAT ---
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string; isTyping?: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const showToast = useCallback((msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  }, []);

  const handleCopy = useCallback(
    (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Đã sao chép!");
    },
    [showToast]
  );

  const handleNewChat = useCallback(() => {
    if (!hasAccess) return;
    if (messages.length > 0) {
      setMessages([]);
      setPastedImages([]);
      showToast("Đã reset phiên làm việc.");
    }
  }, [messages.length, showToast, hasAccess]);

  const removeImage = useCallback(
    (idx: number) =>
      setPastedImages((prev) => prev.filter((_, i) => i !== idx)),
    []
  );

  const scrollToBottom = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!hasAccess) return;
      const items = e.clipboardData?.items;
      if (items)
        for (let i = 0; i < items.length; i++)
          if (items[i].type?.startsWith("image/")) {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () =>
                setPastedImages((s) => [...s, reader.result as string]);
              reader.readAsDataURL(file);
            }
          }
    },
    [hasAccess]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasAccess) return;
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () =>
          setPastedImages((s) => [...s, reader.result as string]);
        reader.readAsDataURL(file);
      }
    },
    [hasAccess]
  );

  const handleSubmit = async (e?: React.FormEvent, txt?: string) => {
    if (e) e.preventDefault();
    if (!hasAccess) return; // Chặn Submit

    const content = txt || input.trim();
    if (!content && pastedImages.length === 0) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: content || "[Image]",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: content, images: pastedImages },
        ],
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Lỗi kết nối");

      const aiContent = data.message?.content || JSON.stringify(data);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiContent,
          isTyping: true,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Hệ thống gặp sự cố: ${err.message}`,
          isTyping: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      setPastedImages([]);
    }
  };

  // --- RENDER ---

  // 1. Màn hình Loading khi đang kiểm tra role
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-violet-400 font-mono text-xs tracking-widest animate-pulse">
          Kiểm Tra Tu Vi, Tiểu Tử Chớ Nên Nóng Vội...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed top-[64px] left-0 right-0 bottom-0 bg-[#050505] text-slate-200 font-mono z-40 flex overflow-hidden">
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        @keyframes scan-line {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        .scan-effect {
          position: relative;
          overflow: hidden;
        }
        .scan-effect::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(139, 92, 246, 0.2),
            transparent
          );
          transform: translateX(-100%);
          animation: scan-line 3s infinite linear;
        }
        .delay-100 {
          animation-delay: 100ms;
          opacity: 0;
        }
        .delay-200 {
          animation-delay: 200ms;
          opacity: 0;
        }
        .delay-300 {
          animation-delay: 300ms;
          opacity: 0;
        }
        .delay-400 {
          animation-delay: 400ms;
          opacity: 0;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>

      {/* --- HIỂN THỊ OVERLAY NẾU KHÔNG CÓ QUYỀN (SỬ DỤNG COMPONENT MỚI) --- */}
      {!hasAccess && <ChatAccessDenied minRole="Chí Cường Giả" />}

      <Toast msg={toast.msg} show={toast.show} />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-900/05 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]"></div>
      </div>

      <ChatSidebar
        onNewChat={handleNewChat}
        onShowToast={showToast}
        isBlocked={!hasAccess}
      />

      <main
        className={`flex-1 flex flex-col z-10 relative bg-gradient-to-b from-transparent to-black/30 ${
          !hasAccess ? "filter blur-sm pointer-events-none opacity-50" : ""
        }`}
      >
        <ChatHeader />

        <div
          ref={scrollRef}
          id="chat-scroll"
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-violet-500/20 to-transparent border border-violet-500/30 flex items-center justify-center relative animate-fade-in-up delay-100">
                <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-[ping_3s_linear_infinite]"></div>
                <div className="animate-pulse-slow">
                  <Icons.Bot />
                </div>
              </div>
              <div className="animate-fade-in-up delay-200">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-wider">
                  Phàm Nhân
                </h2>
                <p className="text-slate-400 max-w-md mx-auto text-sm">
                  Có Gì Nói Nhanh Đi, Bổn Thần Đang rãnh!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg animate-fade-in-up delay-300">
                {[
                  "Viết code Python scan port",
                  "Giải thích thuyết lượng tử",
                  "Tạo caption Facebook ngầu",
                  "Debug lỗi React hook",
                ].map((hint, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(undefined, hint)}
                    className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-violet-600/20 hover:border-violet-500/50 text-sm text-slate-300 transition-all text-left group"
                  >
                    <span className="text-violet-500/50 group-hover:text-violet-400 mr-2 transition-colors">
                      →
                    </span>{" "}
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id || idx}
                className={`flex w-full ${
                  isUser ? "justify-end" : "justify-start"
                } group animate-fade-in-up`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[75%] flex gap-4 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 border shadow-lg ${
                      isUser
                        ? "bg-violet-900 border-violet-500 text-violet-200"
                        : "bg-emerald-900/50 border-emerald-500/50 text-emerald-300"
                    }`}
                  >
                    {isUser ? "U" : <Icons.Bot />}
                  </div>
                  <div
                    className={`relative px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm border group/bubble ${
                      isUser
                        ? "bg-violet-600/20 border-violet-500/30 text-violet-100 rounded-tr-sm"
                        : "bg-[#0a0a12]/80 border-white/10 text-slate-200 rounded-tl-sm shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                    }`}
                  >
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="absolute -top-3 right-2 p-1.5 bg-black border border-white/20 rounded-full text-slate-400 opacity-0 group-hover/bubble:opacity-100 transition-opacity hover:text-white hover:border-violet-500"
                      title="Copy"
                    >
                      {copiedId === m.id ? <Icons.Check /> : <Icons.Copy />}
                    </button>
                    <div className="whitespace-pre-wrap font-sans md:font-mono">
                      {!isUser && m.isTyping && idx === messages.length - 1 ? (
                        <Typewriter text={m.content} />
                      ) : (
                        m.content
                      )}
                    </div>
                    <div
                      className={`text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isUser ? "text-violet-300" : "text-slate-500"
                      }`}
                    >
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start w-full animate-pulse">
              <div className="flex gap-4 max-w-[75%]">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
                  <Icons.Bot />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-[#0a0a12]/80 border border-white/10 rounded-tl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-none p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20 animate-fade-in-up delay-400">
          <div className="max-w-4xl mx-auto">
            {pastedImages.length > 0 && (
              <div className="flex gap-3 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                {pastedImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative group flex-shrink-0 animate-fade-in-up"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                      <img
                        src={src}
                        alt="paste"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group rounded-2xl bg-white/5 border border-white/10 focus-within:border-violet-500/50 focus-within:bg-black/40 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 backdrop-blur-md">
              <form
                onSubmit={(e) => handleSubmit(e)}
                className="flex items-center gap-2 p-2 pr-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-violet-300 transition-colors rounded-xl hover:bg-white/5"
                  title="Đính kèm ảnh"
                  disabled={!hasAccess}
                >
                  <Icons.Paperclip />
                </button>
                <input
                  value={input}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  disabled={isLoading || !hasAccess}
                  placeholder={
                    !hasAccess
                      ? "Bạn không đủ quyền hạn..."
                      : "Nhập tin nhắn..."
                  }
                  className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-600 px-2 py-3 font-mono disabled:cursor-not-allowed"
                  autoComplete="off"
                  autoFocus
                />
                <div className="relative">
                  <React.Fragment>
                    <button
                      type="submit"
                      disabled={isLoading || !hasAccess}
                      className={`px-4 py-3 rounded-xl border-none text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all active:scale-95 flex items-center justify-center ${
                        isLoading || !hasAccess
                          ? "bg-gray-600 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                      }`}
                    >
                      {isLoading ? (
                        <span className="animate-spin text-xl">⟳</span>
                      ) : (
                        <Icons.Send />
                      )}
                    </button>
                  </React.Fragment>
                </div>
              </form>
              <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] text-slate-600">
                <span className="text-green-500/50">●</span> AI có thể mắc lỗi.
                Hãy kiểm tra thông tin quan trọng.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
