"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Định nghĩa cấu trúc tin nhắn
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function ShopAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tin nhắn mặc định
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Tại hạ là Tiểu Nhị AI 🤖. Đạo hữu cần tìm pháp bảo, bí tịch hay dịch vụ gì tại Tàng Kinh Các?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 1. User gửi tin
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 2. Giả lập AI đang suy nghĩ (Delay)
    setTimeout(() => {
      const aiResponses = [
        "Vấn đề này cần tra cứu Thiên Đạo (Database)... Đạo hữu chờ chút!",
        "Pháp bảo này hiện đang rất hot, đạo hữu có muốn xem qua danh mục 'Công Nghệ' không?",
        "Chức năng kết nối API đang được bảo trì. Vui lòng tự tìm kiếm trên thanh công cụ nhé!",
        "Tại hạ tu vi còn thấp, chưa hiểu ý đạo hữu. Hãy thử lại!",
      ];
      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-4 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.9,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[350px] h-[500px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden relative"
          >
            {/* --- HEADER --- */}
            <div className="p-4 bg-gradient-to-r from-emerald-900/40 to-black border-b border-emerald-500/20 flex items-center justify-between relative overflow-hidden">
              {/* Hiệu ứng quét sáng header */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white text-lg shadow-lg border border-white/10">
                    🤖
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    TIỂU NHỊ AI
                  </h3>
                  <p className="text-emerald-400/70 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Trực tuyến
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors relative z-10"
              >
                ✕
              </button>
            </div>

            {/* --- BODY (MESSAGES) --- */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative"
            >
              {/* Nền Grid mờ ảo */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear_gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } relative z-10`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-xs mr-2 mt-auto mb-1 flex-shrink-0">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed backdrop-blur-md ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-none shadow-[0_5px_15px_rgba(16,185,129,0.2)] border border-emerald-500/20"
                        : "bg-[#1a1a1a]/80 border border-white/10 text-gray-200 rounded-bl-none shadow-lg"
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[9px] mt-1 opacity-50 ${
                        msg.sender === "user"
                          ? "text-emerald-100 text-right"
                          : "text-gray-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start relative z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-xs mr-2 mt-auto mb-1">
                    🤖
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center h-[40px]">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
            </div>

            {/* --- FOOTER (INPUT) --- */}
            <div className="p-3 bg-[#050505] border-t border-emerald-500/20 relative z-20">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập yêu cầu (VD: Tìm VPS giá rẻ)..."
                  className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-gray-600 focus:bg-[#151515]"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                  </svg>
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">
                  Powered by{" "}
                  <span className="text-emerald-500/50">XomNhaLa Core</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NÚT BẤM (FLOATING ACTION BUTTON) --- */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all relative group z-[100] border border-white/20 ${
          isOpen
            ? "bg-[#111] rotate-90"
            : "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700"
        }`}
      >
        {/* Hiệu ứng sóng lan tỏa (Ping) */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full border border-emerald-400 opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
            <span className="absolute inset-0 rounded-full border border-emerald-400 opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] delay-300"></span>
          </>
        )}

        {isOpen ? (
          <span className="text-gray-400">✕</span>
        ) : (
          <span className="group-hover:animate-wiggle drop-shadow-md">🤖</span>
        )}

        {/* Badge thông báo đỏ */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border border-[#050505] text-[10px] text-white items-center justify-center font-bold">
              1
            </span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
