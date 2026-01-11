"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// ==========================================
// 1. DATA RESOURCE (DỮ LIỆU GIẢ LẬP)
// ==========================================

const SWORD_SYSTEM_LOGS = [
  // Giai đoạn 1: Khởi động (0-2s)
  "> [SYSTEM] KERNEL_PANIC_BYPASS... SUCCESS",
  "> [BOOT] Mounting 'Heavenly_Dao_Drive' (Type: SPIRIT_SSD)",
  "> [MEM] Allocating 128TB for Sword Intent storage...",
  "> [NET] Connecting to Akasha Records...",
  "> [AUTH] Verifying user soul signature... MATCH FOUND.",

  // Giai đoạn 2: Nạp dữ liệu (2-4s)
  "> [LOAD] Injecting 'Van_Kiem_Quy_Tong.exe'...",
  "> [WARN] High energy flux detected in Sector 9!",
  "> [OPT] Compressing 36,000 sword spirits into RAM...",
  "> [CALC] Solving differential equations of Karma...",
  "> [GPU] Overclocking Spiritual Core to 5.0 GHz...",

  // Giai đoạn 3: Xử lý (4-6s)
  "> [SYNC] Synchronizing brainwaves with Blade Network...",
  "> [FIREWALL] 'Heaven's Will' intrusion attempt blocked.",
  "> [MATRIX] Generating 3D Sword Array coordinates...",
  "> [RENDER] Pre-baking lighting for Divine Aura...",
  "> [AI] Training Sword Spirit Model (Epoch 999)...",

  // Giai đoạn 4: Hoàn tất (6-7s)
  "> [CHECK] Integrity: 100%. Spirit: STABLE.",
  "> [FINAL] Disengaging safety locks...",
  "> [CMD] EXECUTE: SWORD_FORMATION_V1.0",
  "> [READY] SYSTEM GREEN. WELCOME, CULTIVATOR.",
];

const HEX_CHARS = "0123456789ABCDEF";

// ==========================================
// 2. SUB-COMPONENTS (CÁC THÀNH PHẦN CON)
// ==========================================

// 2.1. Hex Dump Column (Cột mã Hex chạy bên trái/phải)
const HexColumn = ({
  speed = 50,
  active,
}: {
  speed?: number;
  active: boolean;
}) => {
  const [hex, setHex] = useState("");

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      let str = "";
      for (let i = 0; i < 20; i++) {
        str += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)] + " ";
        if (Math.random() > 0.8) str += "\n";
      }
      setHex(str);
    }, speed);
    return () => clearInterval(interval);
  }, [speed, active]);

  return (
    <div className="font-mono text-[10px] text-green-900/60 whitespace-pre-wrap overflow-hidden select-none leading-3 h-full w-16 opacity-50 hidden md:block">
      {hex}
    </div>
  );
};

// 2.2. Status Bar Row (Thanh trạng thái nhỏ)
const StatusRow = ({
  label,
  value,
  color = "bg-green-500",
}: {
  label: string;
  value: number;
  color?: string;
}) => (
  <div className="flex items-center justify-between text-xs font-mono mb-1">
    <span className="text-green-700">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-green-900/30 rounded-full overflow-hidden">
        <motion.div
          className={clsx("h-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-green-400 w-8 text-right">
        {Math.round(value)}%
      </span>
    </div>
  </div>
);

// 2.3. Radar / Grid Animation (Trang trí góc)
const RadarGrid = () => (
  <div className="relative w-24 h-24 border border-green-800/50 rounded-full overflow-hidden flex items-center justify-center bg-black/40">
    <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_#000_1px),_linear-gradient(90deg,transparent_1px,_#000_1px)] bg-[size:10px_10px] [background-position:center] opacity-30"></div>
    <div className="absolute w-full h-[1px] bg-green-500/30 top-1/2 -translate-y-1/2"></div>
    <div className="absolute h-full w-[1px] bg-green-500/30 left-1/2 -translate-x-1/2"></div>
    <motion.div
      className="w-full h-1/2 bg-gradient-to-t from-green-500/20 to-transparent absolute top-1/2 origin-top"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// ==========================================
// 3. MAIN COMPONENT (COMPONENT CHÍNH)
// ==========================================

interface SwordTerminalLoaderProps {
  onFinished: () => void;
}

export default function SwordTerminalLoader({
  onFinished,
}: SwordTerminalLoaderProps) {
  // --- STATE ---
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Thời gian load tổng cộng (ms)
  const TOTAL_DURATION = 7000;

  // --- LOGIC LOOP ---
  useEffect(() => {
    const startTime = Date.now();
    let animationFrameId: number;

    const update = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const rawProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);

      setProgress(rawProgress);

      // Logic đẩy logs dựa trên % tiến độ thay vì thời gian cứng
      // Tổng logs = SWORD_SYSTEM_LOGS.length
      // Index hiện tại = (rawProgress / 100) * totalLogs
      const totalLogs = SWORD_SYSTEM_LOGS.length;
      const visibleLogCount = Math.floor((rawProgress / 100) * totalLogs);

      // Chỉ set nếu có thay đổi để tránh re-render thừa
      if (visibleLogCount > logs.length) {
        setLogs(SWORD_SYSTEM_LOGS.slice(0, visibleLogCount + 1));
      }

      // Auto scroll
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      if (elapsed < TOTAL_DURATION) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        // Đã xong 100%
        setTimeout(() => {
          onFinished();
        }, 500); // Delay nhẹ sau khi 100% rồi mới đóng
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      // --- EXIT ANIMATION ---
      initial={{ y: 0 }}
      exit={{
        y: "-100%",
        opacity: 0,
        filter: "blur(10px)",
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }, // Custom bezier cho cực mượt
      }}
      // --- CONTAINER STYLES ---
      className="fixed inset-0 z-[9999] bg-black text-green-500 font-mono overflow-hidden flex items-center justify-center"
      style={{ willChange: "transform, opacity" }}
    >
      {/* 3.1 Background Layers */}
      {/* Noise tĩnh */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

      {/* Grid Floor 3D (Perspective) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px",
          transform:
            "perspective(500px) rotateX(60deg) translateY(100px) scale(2)",
        }}
      />

      {/* Vignette tối 4 góc */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000_100%)] pointer-events-none z-0" />

      {/* 3.2 Main Interface Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-[95%] max-w-5xl h-[80vh] flex border border-green-900/80 bg-black/90 rounded-sm shadow-[0_0_100px_rgba(34,197,94,0.1)] backdrop-blur-md overflow-hidden"
      >
        {/* --- Scanline Effect (Chạy dọc màn hình) --- */}
        <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20"></div>
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-green-400/20 z-50 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* --- LEFT SIDEBAR (Monitor) --- */}
        <div className="w-64 border-r border-green-900/50 p-4 hidden md:flex flex-col justify-between bg-black/50">
          <div>
            <h3 className="text-sm font-bold border-b border-green-800 pb-2 mb-4 tracking-widest">
              SYS_MONITOR
            </h3>
            <StatusRow label="CPU_CORE" value={30 + Math.random() * 40} />
            <StatusRow label="RAM_ALLOC" value={progress} />
            <StatusRow
              label="SWORD_QI"
              value={Math.min(progress * 1.2, 100)}
              color="bg-emerald-400"
            />
            <StatusRow
              label="TEMP"
              value={45 + (progress / 100) * 40}
              color="bg-red-500"
            />
          </div>

          <div className="mt-4">
            <h3 className="text-xs text-green-700 mb-2">TARGET_LOCK</h3>
            <RadarGrid />
          </div>

          <div className="mt-auto">
            <div className="text-[10px] text-green-800 break-all font-mono opacity-60">
              ID: {`XL-${Date.now().toString(16).toUpperCase()}`}
              <br />
              LOC: XOM_NHA_LA
              <br />
              SEC: ENCRYPTED
            </div>
          </div>
        </div>

        {/* --- CENTER (Terminal Logs) --- */}
        <div className="flex-1 flex flex-col p-0 relative">
          {/* Header */}
          <div className="h-10 border-b border-green-900/50 bg-green-900/10 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/80 rounded-full animate-pulse" />
              <span className="text-sm font-bold tracking-widest text-green-400">
                {" "}
                TERMINAL_V.2.0.1{" "}
              </span>
            </div>
            <div className="text-xs text-green-700 font-mono">
              UPTIME: {(progress * 0.07).toFixed(2)}s
            </div>
          </div>

          {/* Log Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent"
          >
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={clsx(
                  "break-words",
                  // Dòng cuối cùng highlight
                  index === logs.length - 1
                    ? "text-green-300 font-bold bg-green-900/20 py-1"
                    : "text-green-600/90",
                  // Các dòng System/Warning thì đổi màu
                  log.includes("[WARN]") && "text-yellow-500",
                  log.includes("[ERR]") && "text-red-500",
                  log.includes("[FINAL]") && "text-emerald-300"
                )}
              >
                <span className="opacity-50 mr-2">
                  {`[${(index * 0.12).toFixed(2)}]`}
                </span>
                {log}
              </motion.div>
            ))}
            {/* Blinking Cursor */}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-green-500 align-middle ml-1"
            />
          </div>

          {/* Footer Progress */}
          <div className="h-16 border-t border-green-900/50 bg-black/40 p-4 flex flex-col justify-center">
            <div className="flex justify-between text-xs mb-1 uppercase tracking-widest">
              <span>Formation Compiling...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            {/* Thanh loading chính */}
            <div className="w-full h-2 bg-green-900/30 relative overflow-hidden">
              {/* Bar fill */}
              <motion.div
                className="absolute top-0 left-0 h-full bg-green-500"
                style={{ width: `${progress}%` }}
              />
              {/* Hiệu ứng ánh sáng chạy qua bar */}
              <motion.div
                className="absolute top-0 left-0 h-full w-20 bg-white/50 blur-md"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR (Hex Dump) --- */}
        <div className="w-16 border-l border-green-900/50 bg-black/50 hidden lg:block relative">
          <div className="absolute inset-0 flex flex-col overflow-hidden p-1">
            <HexColumn active={progress < 100} speed={100} />
          </div>
        </div>
      </motion.div>

      {/* 3.3 Loading Text Bottom */}
      <div className="absolute bottom-10 z-20 text-center">
        <p className="text-xs text-green-800 mt-2 animate-pulse">
          PRESSING REALITY...
        </p>
      </div>
    </motion.div>
  );
}
