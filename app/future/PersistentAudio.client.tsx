"use client";

import { useEffect, useRef, useState } from "react";
import {
  VolumeX,
  Sparkles,
  Play,
  Disc,
  Power,
  Cpu,
  Wifi,
  ShieldCheck,
  Terminal,
} from "lucide-react";

interface Props {
  isOverlayMode: boolean;
  onEnter: () => void;
}

export default function PersistentAudio({ isOverlayMode, onEnter }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [systemState, setSystemState] = useState<"IDLE" | "BOOTING" | "READY">(
    "IDLE"
  );
  const [loadingText, setLoadingText] = useState("INITIALIZING...");
  const [logLines, setLogLines] = useState<string[]>([]);
  const [ping, setPing] = useState(14);

  // 1. RANDOM PING - THỰC TẾ HƠN
  useEffect(() => {
    const updatePing = () => {
      setPing((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return next < 12 ? 12 : next > 24 ? 24 : next;
      });
      setTimeout(updatePing, Math.random() * 2000 + 1000);
    };
    const timer = setTimeout(updatePing, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 2. AUDIO & VIDEO
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      isPlaying ? audio.play().catch(() => {}) : audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isOverlayMode) videoRef.current?.play().catch(() => {});
    else videoRef.current?.pause();
  }, [isOverlayMode]);

  const handleStartSystem = () => {
    setIsPlaying(true);
    setSystemState("BOOTING");
    const logs = [
      { t: 500, msg: "CONNECTING TO SECURE_SERVER..." },
      { t: 1500, msg: "USER_AUTHENTICATED: OK" },
      { t: 2500, msg: "ALLOCATING VRAM [==========--] 85%" },
      { t: 4500, msg: "SYNCING NEURAL_LINK..." },
      { t: 6500, msg: "OPTIMIZING QUANTUM SHADERS..." },
      { t: 8500, msg: "ZEN_CORE INITIALIZED." },
      { t: 9500, msg: "SYSTEM READY TO LAUNCH." },
    ];
    logs.forEach((item) => {
      setTimeout(() => {
        setLoadingText(item.msg);
        setLogLines((prev) => [...prev.slice(-4), `> ${item.msg}`]);
      }, item.t);
    });
    setTimeout(() => setSystemState("READY"), 10000);
  };

  return (
    <>
      <audio ref={audioRef} src="/chill/blue - yung kai.mp3" loop />

      <div
        className={`fixed inset-0 z-[9999] transition-all duration-1000 bg-black ${
          isOverlayMode
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* BACKGROUND - TĂNG ĐỘ SÁNG */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(1.15) contrast(1.1) saturate(1.1)" }}
          >
            <source src="/chill/intro-bg.webm" type="video/webm" />
            <source src="/chill/default.mp4" type="video/mp4" />
          </video>
          {/* Scanline & Overlay Layers */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-10 bg-[length:100%_4px] pointer-events-none opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* HUD UI DECORATION */}
        <div className="absolute inset-0 p-10 pointer-events-none">
          <div className="flex justify-between items-start animate-in fade-in duration-1000">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-mono tracking-[0.2em] border border-cyan-500/40 px-4 py-1.5 bg-black/40 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Wifi size={12} className="animate-pulse" />
                <span>PING: {ping}MS</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono tracking-[0.2em] border border-emerald-500/40 px-4 py-1.5 bg-black/40 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <ShieldCheck size={12} />
                <span>SYSTEM_SECURE: TRUE</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 hidden md:block w-72">
            <div className="text-cyan-500 text-[10px] font-mono mb-2 flex items-center gap-2">
              <Terminal size={12} /> OPERATIONAL_LOGS
            </div>
            <div className="space-y-1">
              {logLines.map((line, i) => (
                <div
                  key={i}
                  className="text-[10px] text-white/40 font-mono truncate animate-in slide-in-from-left-2"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 right-10 text-right opacity-60">
            <div className="text-2xl font-black text-white tracking-tighter">
              ZEN 2.0
            </div>
            <div className="text-[9px] font-mono text-white/50 tracking-[3px]">
              VER_2026.01.16
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full gap-12 p-4">
          {/* TITLE - XÓM NHÀ LÁ (REFINED) */}
          <div className="text-center space-y-6">
            <h1 className="text-7xl md:text-[9rem] font-black text-white uppercase tracking-[0.05em] animate-breathing drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Xóm Nhà Lá
            </h1>
            <div className="flex items-center justify-center gap-5">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-cyan-500/50" />
              <div className="flex items-center gap-3 text-cyan-300 text-[11px] tracking-[0.6em] uppercase font-light">
                <Sparkles
                  size={14}
                  className="text-cyan-400 animate-spin-slow"
                />
                <span>Zen Space</span>
                <Sparkles
                  size={14}
                  className="text-cyan-400 animate-spin-slow"
                />
              </div>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>
          </div>

          {/* CONTROL CENTER */}
          <div className="mt-4 h-32 flex flex-col items-center justify-center w-full">
            {/* 1. IDLE - POLYGON BUTTON */}
            {systemState === "IDLE" && (
              <button
                onClick={handleStartSystem}
                className="group relative px-14 py-6 bg-white/5 backdrop-blur-md border border-white/20 transition-all duration-500 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                style={{
                  clipPath:
                    "polygon(15% 0, 100% 0, 100% 70%, 85% 100%, 0 100%, 0 30%)",
                }}
              >
                {/* Sheen effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-sheen" />

                <div className="flex items-center gap-5 text-white relative z-10">
                  <Power
                    size={22}
                    className="group-hover:text-cyan-400 transition-colors animate-pulse"
                  />
                  <div className="text-left">
                    <div className="text-[9px] text-white/40 tracking-[3px] font-mono">
                      STANDBY
                    </div>
                    <div className="text-base font-bold tracking-[4px] uppercase group-hover:text-cyan-300 transition-colors">
                      Khởi Động
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* 2. BOOTING - PROGRESS */}
            {systemState === "BOOTING" && (
              <div className="w-full max-w-sm space-y-5 animate-in fade-in zoom-in duration-700">
                <div className="flex justify-between items-end font-mono">
                  <div className="text-[10px] text-cyan-400 tracking-widest animate-pulse">
                    {loadingText}
                  </div>
                  <div className="text-[10px] text-white/30 tracking-widest uppercase">
                    Processing...
                  </div>
                </div>
                <div className="relative h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 shadow-[0_0_15px_cyan] animate-loading-fast"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            )}

            {/* 3. READY - POLYGON BUTTON (WHITE) */}
            {systemState === "READY" && (
              <button
                onClick={onEnter}
                className="group relative px-20 py-6 bg-white transition-all duration-700 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-in slide-in-from-bottom-6"
                style={{
                  clipPath:
                    "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)",
                }}
              >
                <div className="flex items-center gap-4 text-black relative z-10">
                  <span className="text-lg font-black tracking-[6px] uppercase">
                    Truy Cập
                  </span>
                  <Play size={20} className="fill-black" />
                </div>
                <div className="absolute inset-0 bg-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <div
            className={`mt-4 flex items-center gap-3 text-white/20 text-[10px] tracking-[5px] uppercase transition-opacity duration-1000 ${
              systemState !== "IDLE" ? "opacity-100" : "opacity-0"
            }`}
          >
            <Disc
              size={14}
              className={isPlaying ? "animate-spin text-cyan-500" : ""}
            />
            <span>Sound System Online</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading-fast {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes sheen {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes breathing {
          0%,
          100% {
            letter-spacing: 0.05em;
            opacity: 0.95;
          }
          50% {
            letter-spacing: 0.08em;
            opacity: 1;
          }
        }
        .animate-breathing {
          animation: breathing 5s ease-in-out infinite;
        }
        .animate-loading-fast {
          animation: loading-fast 10s linear forwards;
        }
        .animate-sheen {
          animation: sheen 1.5s infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
