"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { spinWheel, mineSpiritStone, openMysteryBox } from "@/lib/actions/earn";
import confetti from "canvas-confetti";
import Link from "next/link"; // Cần import Link

// --- UTILS (Giữ nguyên) ---
const playSound = (
  type: "click" | "win" | "spin" | "crack" | "error" | "alert"
) => {
  // const audio = new Audio(`/sounds/${type}.mp3`);
  // audio.play().catch(() => {});
};

const triggerConfetti = (tier: string) => {
  const colors =
    tier === "legendary"
      ? ["#FFD700", "#FFA500", "#FFFFFF"]
      : ["#10B981", "#34D399"];
  const particleCount = tier === "legendary" ? 200 : 80;

  confetti({
    particleCount,
    spread: 120,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });
};

// ==========================================
// 👇 UI MỚI: NÚT QUAY LẠI (PORTAL BUTTON) 👇
// ==========================================
const BackToLobbyBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute top-0 left-0 z-30 group flex items-center gap-3 pl-2 pr-6 py-2 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-r-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden"
  >
    {/* Hiệu ứng quét sáng */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform text-gray-400 group-hover:text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    </div>
    <div className="flex flex-col items-start">
      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest group-hover:text-gray-300 transition-colors">
        Thoát
      </span>
      <span className="text-sm font-bold text-white leading-none group-hover:text-amber-400 transition-colors">
        RỜI SẢNH
      </span>
    </div>
  </button>
);

// ==========================================
// 👇 UI MỚI: CẢNH BÁO HẾT TIỀN (NO MONEY) 👇
// ==========================================
const NoMoneyConsole = ({
  onClose,
  onGoToMine,
}: {
  onClose: () => void;
  onGoToMine: () => void;
}) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
    {/* Backdrop đỏ cảnh báo */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-red-950/80 backdrop-blur-md"
      onClick={onClose}
    />

    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
      className="relative w-full max-w-md bg-[#0f0505] border-2 border-red-600/50 rounded-3xl p-8 shadow-[0_0_100px_rgba(220,38,38,0.4)] overflow-hidden text-center"
    >
      {/* Scanlines Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

      <div className="relative z-10">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-7xl mb-4 grayscale opacity-80"
        >
          💸
        </motion.div>

        <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2 glitch-text">
          NGÂN KHỐ CẠN KIỆT!
        </h2>

        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl mb-6">
          <p className="text-red-200 text-sm font-mono">
            Đạo hữu không đủ Linh Thạch để thực hiện giao dịch này.
            <br />
            Vui lòng bổ sung linh lực.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onGoToMine}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 group animate-pulse"
          >
            <span>⛏️</span>
            <span>ĐI ĐÀO MỎ NGAY (Miễn phí)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest hover:bg-white/5 rounded-lg transition-colors"
          >
            [ Đóng Cảnh Báo ]
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// ==========================================
// 👇 UI MỚI: MODAL YÊU CẦU ĐĂNG NHẬP 👇
// ==========================================
const LoginConsole = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 font-sans">
    {/* Backdrop mờ tối */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    />

    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 50 }}
      className="relative w-full max-w-md bg-[#050505] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_80px_rgba(6,182,212,0.15)] overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon Khóa */}
        <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <span className="text-4xl animate-pulse">🔒</span>
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          YÊU CẦU ĐỊNH DANH
        </h2>

        <div className="h-1 w-12 bg-cyan-500 rounded-full mb-6"></div>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs">
          Khu vực <span className="text-cyan-400 font-bold">Thiên Cơ Lâu</span>{" "}
          chứa nhiều bí mật thiên địa, chỉ dành cho các tu sĩ đã nhập môn.
          <br />
          <br />
          Vui lòng đăng nhập để thử vận may.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/login" className="w-full">
            <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
              <span>🔑</span>
              <span>ĐĂNG NHẬP NGAY</span>
            </button>
          </Link>

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
          >
            Quay lại xem chơi
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// ... [GIỮ NGUYÊN LuckyWheel, MiningGame, MysteryBox] ...
// (Để tiết kiệm dung lượng hiển thị, tôi ẩn phần code cũ đã viết ở trên,
// Đạo hữu hãy giữ nguyên 3 component LuckyWheel, MiningGame, MysteryBox ở file cũ nhé)

const LuckyWheel = ({ onPlay, isProcessing }: any) => {
  const controls = useAnimation();
  const [rotation, setRotation] = useState(0);

  const handleSpin = async () => {
    if (isProcessing) return;
    playSound("spin");
    const spinDuration = 4;
    const randomOffset = Math.random() * 360;
    const targetRotation = rotation + 1800 + randomOffset;
    controls.start({
      rotate: targetRotation,
      transition: { duration: spinDuration, ease: [0.1, 0, 0.2, 1] },
    });
    setRotation(targetRotation);
    onPlay();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-72 h-72 mb-10 group">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-lg">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500"></div>
        </div>
        <motion.div
          animate={controls}
          className="w-full h-full rounded-full border-[8px] border-amber-500/50 bg-[#1a1a1a] relative overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.3)]"
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `conic-gradient(from 0deg, #f59e0b 0deg 45deg, #000 45deg 90deg, #10b981 90deg 135deg, #000 135deg 180deg, #ef4444 180deg 225deg, #000 225deg 270deg, #8b5cf6 270deg 315deg, #000 315deg 360deg)`,
            }}
          ></div>
          <div className="absolute inset-8 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/10 z-10 shadow-inner">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
              🎡
            </span>
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-amber-500/20 blur-[60px] -z-10 rounded-full"></div>
      </div>
      <button
        onClick={handleSpin}
        disabled={isProcessing}
        className="relative px-12 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden border border-amber-400/30"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
        <span className="relative z-10 flex items-center gap-2 uppercase tracking-wide">
          {isProcessing ? "Đang quay..." : "Quay Thưởng (500 💎)"}
        </span>
      </button>
    </div>
  );
};

const MiningGame = ({ onPlay, isProcessing }: any) => {
  const [clickEffect, setClickEffect] = useState<
    { id: number; x: number; y: number; val: string }[]
  >([]);
  const handleClick = (e: React.MouseEvent) => {
    if (isProcessing) return;
    playSound("crack");
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newEffect = { id: Date.now(), x, y, val: "+??" };
    setClickEffect((prev) => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffect((prev) => prev.filter((item) => item.id !== newEffect.id));
    }, 1000);
    onPlay();
  };
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative group">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: [0, -5, 5, 0] }}
          onClick={handleClick}
          disabled={isProcessing}
          className="w-64 h-64 bg-[#151515] rounded-[2.5rem] border-4 border-emerald-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-500 active:border-emerald-400 group"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-transparent to-black"></div>
          <span className="text-[8rem] relative z-10 select-none drop-shadow-2xl group-active:translate-y-2 transition-transform duration-75 filter group-hover:brightness-125">
            ⛏️
          </span>
          <AnimatePresence>
            {clickEffect.map((effect) => (
              <motion.span
                key={effect.id}
                initial={{ opacity: 1, y: effect.y, x: effect.x, scale: 0.5 }}
                animate={{
                  opacity: 0,
                  y: effect.y - 150,
                  scale: 1.5,
                  rotate: Math.random() * 20 - 10,
                }}
                exit={{ opacity: 0 }}
                className="absolute text-emerald-300 font-black font-mono text-3xl z-20 pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              >
                {effect.val}
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.button>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-active:opacity-100 transition-opacity duration-100"></div>
      </div>
      <div className="mt-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
          Mỏ Linh Thạch
        </h3>
        <div className="inline-block bg-emerald-900/30 px-4 py-2 rounded-xl border border-emerald-500/20 backdrop-blur-md">
          <p className="text-emerald-400 font-mono text-sm font-bold">
            Thu nhập: 7 - 10 💎 / Click
          </p>
        </div>
        <p className="text-gray-500 text-xs mt-3 italic opacity-60">
          *Có 1% cơ hội bạo kích x10 sản lượng
        </p>
      </div>
    </div>
  );
};

const MysteryBox = ({ onPlay, isProcessing }: any) => {
  const [isShaking, setIsShaking] = useState(false);
  const handleOpen = () => {
    if (isProcessing) return;
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 1000);
    onPlay();
  };
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative mb-12">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/30 blur-[100px] rounded-full transition-all duration-500 ${
            isShaking ? "scale-150 bg-purple-500/50" : "scale-100"
          }`}
        ></div>
        <motion.div
          animate={
            isShaking
              ? {
                  x: [-5, 5, -5, 5, 0],
                  rotate: [-5, 5, -5, 5, 0],
                  scale: [1, 1.1, 1],
                }
              : { y: [0, -15, 0] }
          }
          transition={
            isShaking
              ? { duration: 0.3, repeat: 5 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          onClick={handleOpen}
          className="cursor-pointer text-[160px] relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] select-none hover:scale-110 transition-transform duration-300 filter hover:brightness-110"
        >
          📦
        </motion.div>
      </div>
      <div className="space-y-6 w-full max-w-sm">
        <button
          onClick={handleOpen}
          disabled={isProcessing}
          className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl font-black text-white shadow-lg hover:shadow-purple-500/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-lg uppercase tracking-wider"
        >
          {isProcessing ? "Đang giải ấn..." : "Mở Rương (5,000 💎)"}
        </button>
        <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center backdrop-blur-md">
          <p className="text-purple-300 text-xs font-bold mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
            Phần thưởng tiềm năng
          </p>
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="flex flex-col">
              <span className="text-gray-500">Trash</span>
              <span>1k</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-400">Rare</span>
              <span>6k</span>
            </div>
            <div className="flex flex-col">
              <span className="text-purple-400">Epic</span>
              <span>20k</span>
            </div>
            <div className="flex flex-col">
              <span className="text-yellow-400 font-bold">Legend</span>
              <span>100k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN GRID ---
export default function GameGrid() {
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    show: boolean;
    msg: string;
    reward: number;
    type: string;
  } | null>(null);

  // State quản lý UI
  const [showNoMoney, setShowNoMoney] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // <--- STATE MỚI: Login Console

  useEffect(() => {
    const init = async () => {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const account = new Account(client);
        const databases = new Databases(client);
        const user = await account.get();
        setUserId(user.$id);

        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", user.$id)]
        );
        if (profileRes.documents.length > 0)
          setBalance(profileRes.documents[0].currency || 0);
      } catch {}
    };
    init();
  }, []);

  const handleResult = (res: any) => {
    setTimeout(() => {
      if (res.success) {
        setBalance(res.newBalance);
        const type =
          res.tier || res.type || (res.reward > 5000 ? "legendary" : "common");
        setResult({
          show: true,
          msg: res.resultText || "NHẬN ĐƯỢC",
          reward: res.reward,
          type,
        });

        if (res.reward > 1000) playSound("win");
        if (type === "legendary" || type === "epic") triggerConfetti(type);
      } else {
        alert(res.error);
      }
      setIsProcessing(false);
    }, 500);
  };

  const playGame = async (gameType: string) => {
    // CHECK ĐĂNG NHẬP (Logic mới)
    if (!userId) {
      playSound("alert");
      setShowLogin(true); // <--- KÍCH HOẠT LOGIN CONSOLE
      return;
    }

    // CHECK TIỀN
    let cost = 0;
    if (gameType === "wheel") cost = 500;
    if (gameType === "box") cost = 5000;

    if (balance < cost) {
      playSound("error");
      setShowNoMoney(true);
      return;
    }

    setIsProcessing(true);
    let res;
    if (gameType === "wheel") res = await spinWheel(userId);
    else if (gameType === "mining") res = await mineSpiritStone(userId);
    else if (gameType === "box") res = await openMysteryBox(userId);

    handleResult(res);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* --- HUD: SỐ DƯ --- */}
      <div className="fixed top-24 right-6 z-50 animate-fade-in-left">
        <div className="bg-black/80 backdrop-blur-xl border border-amber-500/30 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center gap-4 hover:border-amber-500/60 transition-all hover:scale-105 cursor-default group">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-amber-400 transition-colors">
              Tài sản
            </span>
            <span className="text-2xl font-black text-white font-mono leading-none">
              {balance.toLocaleString()}{" "}
              <span className="text-amber-400 text-lg">💎</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-lg border-2 border-black">
            💰
          </div>
        </div>
      </div>

      {/* --- MODAL: KHÔNG ĐỦ TIỀN --- */}
      <AnimatePresence>
        {showNoMoney && (
          <NoMoneyConsole
            onClose={() => setShowNoMoney(false)}
            onGoToMine={() => {
              setShowNoMoney(false);
              setActiveGame("mining");
            }}
          />
        )}
      </AnimatePresence>

      {/* --- MODAL: YÊU CẦU ĐĂNG NHẬP (MỚI) --- */}
      <AnimatePresence>
        {showLogin && <LoginConsole onClose={() => setShowLogin(false)} />}
      </AnimatePresence>

      {/* --- MODAL: KẾT QUẢ --- */}
      <AnimatePresence>
        {result && result.show && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`relative bg-[#111] border-2 rounded-[2.5rem] p-12 text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden max-w-sm w-full
                            ${
                              result.type === "legendary"
                                ? "border-yellow-500 shadow-yellow-500/40"
                                : result.type === "epic"
                                ? "border-purple-500 shadow-purple-500/40"
                                : result.type === "rare"
                                ? "border-blue-500 shadow-blue-500/40"
                                : "border-gray-600 shadow-gray-600/40"
                            }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute inset-0 opacity-10 bg-gradient-to-b ${
                  result.type === "legendary"
                    ? "from-yellow-500"
                    : "from-gray-500"
                } to-transparent pointer-events-none`}
              ></div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-7xl mb-6"
                >
                  {result.type === "legendary"
                    ? "👑"
                    : result.type === "epic"
                    ? "🟣"
                    : result.type === "rare"
                    ? "🔵"
                    : "⚪"}
                </motion.div>

                <h2 className="text-3xl font-black text-white uppercase italic mb-4 tracking-wide">
                  {result.msg}
                </h2>

                <div className="bg-black/50 rounded-2xl p-4 mb-8 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1 font-mono uppercase">
                    Phần thưởng
                  </div>
                  <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
                    +{result.reward.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full py-4 bg-white text-black font-black uppercase rounded-xl hover:scale-105 transition-transform hover:bg-gray-200"
                >
                  Thu Nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GAME ARENA --- */}
      <AnimatePresence mode="wait">
        {!activeGame ? (
          // LOBBY VIEW
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                id: "wheel",
                title: "Vòng Quay",
                icon: "🎡",
                color: "border-amber-500/30",
                desc: "Cược 500 - Trúng 30k",
                bg: "hover:bg-amber-900/20 hover:border-amber-500",
                shadow: "hover:shadow-amber-500/20",
              },
              {
                id: "mining",
                title: "Đào Mỏ",
                icon: "⛏️",
                color: "border-emerald-500/30",
                desc: "Miễn phí (7-10/click)",
                bg: "hover:bg-emerald-900/20 hover:border-emerald-500",
                shadow: "hover:shadow-emerald-500/20",
              },
              {
                id: "box",
                title: "Rương Thần",
                icon: "📦",
                color: "border-purple-500/30",
                desc: "Cược 5k - Trúng 100k",
                bg: "hover:bg-purple-900/20 hover:border-purple-500",
                shadow: "hover:shadow-purple-500/20",
              },
            ].map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setActiveGame(game.id)}
                className={`cursor-pointer bg-[#0a0a0a] border-2 ${game.color} rounded-[2.5rem] p-8 relative overflow-hidden group transition-all duration-300 ${game.bg} ${game.shadow} shadow-lg h-[400px] flex flex-col justify-between`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[60px] group-hover:bg-white/10 transition-colors"></div>

                <div className="relative z-10 flex flex-col h-full items-center text-center justify-center">
                  <div className="text-8xl mb-8 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] filter grayscale group-hover:grayscale-0">
                    {game.icon}
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-wide">
                      {game.title}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm bg-black/60 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm group-hover:text-white transition-colors">
                      {game.desc}
                    </p>
                  </div>

                  <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b-2 border-white pb-1">
                      Chơi Ngay
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // ACTIVE GAME VIEW
          <motion.div
            key="active-game"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-5xl mx-auto"
          >
            {/* 👇 SỬ DỤNG NÚT QUAY LẠI MỚI 👇 */}
            <BackToLobbyBtn onClick={() => setActiveGame(null)} />

            <div className="bg-[#050505]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 min-h-[600px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              {/* Background Game */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

              {activeGame === "wheel" && (
                <LuckyWheel
                  onPlay={() => playGame("wheel")}
                  isProcessing={isProcessing}
                />
              )}
              {activeGame === "mining" && (
                <MiningGame
                  onPlay={() => playGame("mining")}
                  isProcessing={isProcessing}
                />
              )}
              {activeGame === "box" && (
                <MysteryBox
                  onPlay={() => playGame("box")}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
