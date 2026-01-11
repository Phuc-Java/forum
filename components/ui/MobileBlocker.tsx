"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// --- LOGIC HOOK: DETECT MOBILE ONLY ---
// Hook này đảm bảo component hoàn toàn biến mất khỏi DOM khi ở trên PC
// Giúp PC không phải gánh bất kỳ animation nào.
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check width < 900px
      const match = window.matchMedia("(max-width: 899px)");
      setIsMobile(match.matches);
    };

    // Initial check
    checkMobile();

    // Listener resize
    const match = window.matchMedia("(max-width: 899px)");
    // Modern browsers use addEventListener on MediaQueryList
    if (match.addEventListener) {
      match.addEventListener("change", (e) => setIsMobile(e.matches));
    } else {
      // Fallback
      window.addEventListener("resize", checkMobile);
    }

    return () => {
      if (match.removeEventListener) {
        match.removeEventListener("change", (e) => setIsMobile(e.matches));
      } else {
        window.removeEventListener("resize", checkMobile);
      }
    };
  }, []);

  return isMobile;
};

// --- GLOBAL STYLES & ANIMATIONS ---
const GlobalStyles = () => (
  <style jsx global>{`
    /* GPU Hardware Acceleration Enforcement */
    .gpu-layer {
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      perspective: 1000px;
      will-change: transform, opacity;
    }

    /* Animation: Scanner Line */
    @keyframes scan-down {
      0% {
        top: 0%;
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        top: 100%;
        opacity: 0;
      }
    }

    /* Animation: Floating Particles */
    @keyframes float-particle {
      0% {
        transform: translateY(110vh) scale(0);
        opacity: 0;
      }
      20% {
        opacity: 0.8;
      }
      80% {
        opacity: 0.5;
      }
      100% {
        transform: translateY(-10vh) scale(1);
        opacity: 0;
      }
    }

    /* Animation: Slow Spin */
    @keyframes spin-slow {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Animation: Glitch Text Effect */
    @keyframes glitch-skew {
      0% {
        transform: skew(0deg);
      }
      20% {
        transform: skew(-2deg);
      }
      40% {
        transform: skew(2deg);
      }
      60% {
        transform: skew(-1deg);
      }
      80% {
        transform: skew(1deg);
      }
      100% {
        transform: skew(0deg);
      }
    }

    @keyframes text-flicker {
      0% {
        opacity: 0.9;
      }
      5% {
        opacity: 0.2;
      }
      10% {
        opacity: 0.9;
      }
      100% {
        opacity: 0.9;
      }
    }

    /* Animation: Chain Rattle */
    @keyframes rattle {
      0%,
      100% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(0.5deg);
      }
      75% {
        transform: rotate(-0.5deg);
      }
    }

    /* Animation: Fog Movement */
    @keyframes fog-move {
      0% {
        transform: translateX(-10%);
      }
      50% {
        transform: translateX(10%);
      }
      100% {
        transform: translateX(-10%);
      }
    }

    .animate-scan-down {
      animation: scan-down 3s linear infinite;
    }
    .animate-float-particle {
      animation: float-particle linear infinite;
    }
    .animate-spin-slow {
      animation: spin-slow 60s linear infinite;
    }
    .chain-rattle {
      animation: rattle 3s ease-in-out infinite;
    }
    .glitch-text {
      animation: glitch-skew 3s infinite linear alternate-reverse,
        text-flicker 4s infinite;
    }
    .animate-fog {
      animation: fog-move 20s ease-in-out infinite;
    }
  `}</style>
);

// --- GRAPHICS ENGINE (SVG SHADERS) ---
const GraphicEngine = React.memo(() => (
  <svg
    width="0"
    height="0"
    className="fixed top-0 left-0 pointer-events-none opacity-0"
    aria-hidden="true"
  >
    <defs>
      {/* Paper Texture */}
      <filter id="paper-roughness" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves="3"
          result="noise"
        />
        <feDiffuseLighting in="noise" lightingColor="#fff8e7" surfaceScale="2">
          <feDistantLight azimuth="45" elevation="60" />
        </feDiffuseLighting>
        <feComposite operator="in" in2="SourceGraphic" />
      </filter>

      {/* Metal Rust */}
      <filter id="metal-rust" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.1"
          numOctaves="3"
          result="noise"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.4  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 1 0"
          in="noise"
          result="coloredNoise"
        />
        <feComposite
          operator="in"
          in="coloredNoise"
          in2="SourceGraphic"
          result="rust"
        />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="rust" />
        </feMerge>
      </filter>

      {/* Blood Ink */}
      <filter id="blood-ink" colorInterpolationFilters="sRGB">
        <feMorphology
          operator="dilate"
          radius="1"
          in="SourceAlpha"
          result="expanded"
        />
        <feGaussianBlur stdDeviation="2" in="expanded" result="blurred" />
        <feFlood floodColor="#7f1d1d" result="color" />
        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Cinnabar Seal */}
      <filter id="cinnabar-seal" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="0.5" in="SourceAlpha" result="blur" />
        <feSpecularLighting
          in="blur"
          surfaceScale="2"
          specularConstant="1"
          specularExponent="20"
          lightingColor="#ffcccc"
          result="specular"
        >
          <fePointLight x="-5000" y="-10000" z="20000" />
        </feSpecularLighting>
        <feComposite
          in="specular"
          in2="SourceAlpha"
          operator="in"
          result="specular"
        />
        <feComposite
          in="SourceGraphic"
          in2="specular"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
        />
      </filter>
    </defs>
  </svg>
));
GraphicEngine.displayName = "GraphicEngine";

// --- COMPONENT: CHAIN LINK ---
const HyperChainLink = React.memo(
  ({
    angle,
    index,
    variant = "normal",
  }: {
    angle: number;
    index: number;
    variant?: "normal" | "rusted";
  }) => (
    <div
      className="relative w-8 h-14 -my-2 flex items-center justify-center gpu-layer"
      style={{
        transform: `rotate(${angle}deg) translate3d(0,0,0)`,
        zIndex: 50 - index,
      }}
    >
      <svg
        viewBox="0 0 40 70"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <linearGradient
            id={`chain-grad-${index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop
              offset="40%"
              stopColor={variant === "rusted" ? "#5c4033" : "#404040"}
            />
            <stop
              offset="60%"
              stopColor={variant === "rusted" ? "#8B4513" : "#737373"}
            />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>
        <path
          d="M10,15 A10,10 0 0,1 30,15 V55 A10,10 0 0,1 10,55 Z"
          fill="black"
          opacity="0.6"
          filter="blur(2px)"
          transform="translate(3, 3)"
        />
        <path
          d="M10,15 A10,10 0 0,1 30,15 V55 A10,10 0 0,1 10,55 Z"
          fill="none"
          stroke={`url(#chain-grad-${index})`}
          strokeWidth="8"
          filter={variant === "rusted" ? "url(#metal-rust)" : ""}
        />
      </svg>
    </div>
  )
);
HyperChainLink.displayName = "HyperChainLink";

// --- COMPONENT: S-HOOK ---
const SHookConnector = () => (
  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-16 z-[60] pointer-events-none drop-shadow-xl">
    <svg viewBox="0 0 50 80" className="w-full h-full overflow-visible">
      <path
        d="M25,5 C10,5 10,25 25,25 C40,25 40,45 25,45"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#metal-rust)"
      />
      <circle
        cx="25"
        cy="55"
        r="8"
        fill="none"
        stroke="#b45309"
        strokeWidth="4"
      />
      <circle cx="25" cy="55" r="8" fill="#1a0b0b" opacity="0.8" />
    </svg>
  </div>
);

// --- COMPONENT: ULTIMATE TALISMAN ---
const UltimateTalisman = React.memo(() => (
  <div className="relative w-full h-full flex flex-col items-center group perspective-[1000px]">
    <SHookConnector />
    <div className="relative z-50 w-full h-full bg-[#eab308] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden rounded-sm transform-gpu">
      {/* Texture Layers */}
      <div
        className="absolute inset-0 opacity-100 mix-blend-multiply bg-[#d97706]"
        style={{ filter: "url(#paper-roughness)" }}
      />
      <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-color-burn" />
      <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(69,26,3,0.9)] mix-blend-multiply" />

      {/* Ripped Edge */}
      <div className="absolute bottom-[-1px] left-0 w-full h-8 z-50 text-[#020202]">
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className="w-full h-full filter drop-shadow-sm"
        >
          <path
            d="M0,10 L0,0 L5,5 L10,0 L15,8 L20,0 L25,6 L30,0 L35,9 L40,0 L45,5 L50,0 L55,7 L60,0 L65,5 L70,0 L75,8 L80,0 L85,6 L90,0 L95,5 L100,0 L100,10 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-40 flex-1 flex flex-col items-center py-6 px-4 h-full">
        <div className="w-14 h-14 border-[3px] border-[#7f1d1d] rounded-full flex items-center justify-center mb-4 bg-[#f59e0b]/20 relative mt-4">
          <div className="absolute inset-0 border border-[#7f1d1d] rounded-full scale-75 opacity-50 border-dashed animate-spin-slow" />
          <div className="w-7 h-7 bg-[#7f1d1d] rotate-45 border-2 border-[#fcd34d]" />
        </div>

        <div className="flex-1 w-full flex justify-between items-center relative">
          <div className="h-full flex flex-col justify-around py-4 opacity-80 mix-blend-multiply">
            {Array.from("THIÊNĐỊA").map((c, i) => (
              <span
                key={i}
                className="text-[#450a0a] font-serif font-bold text-[10px] sm:text-xs transform -rotate-12"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-2 relative">
            <h1
              className="text-5xl sm:text-7xl font-black text-[#450a0a] font-serif tracking-tight drop-shadow-2xl"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                filter: "url(#blood-ink)",
              }}
            >
              PHONG
            </h1>
            <div className="relative w-24 h-24 my-[-15px] z-50 opacity-95 mix-blend-multiply">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full animate-pulse-slow drop-shadow"
                style={{ filter: "url(#cinnabar-seal)" }}
              >
                <rect
                  x="20"
                  y="20"
                  width="160"
                  height="160"
                  rx="20"
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="12"
                />
                <path
                  d="M60,60 H140 M100,60 V140 M60,140 H140 M70,100 H130"
                  stroke="#b91c1c"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <circle cx="170" cy="30" r="10" fill="#b91c1c" />
              </svg>
            </div>
            <h1
              className="text-5xl sm:text-7xl font-black text-[#450a0a] font-serif tracking-tight drop-shadow-2xl"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                filter: "url(#blood-ink)",
              }}
            >
              ẤN
            </h1>
          </div>

          <div className="h-full flex flex-col justify-around py-4 opacity-80 mix-blend-multiply">
            {Array.from("VÔCỰC").map((c, i) => (
              <span
                key={i}
                className="text-[#450a0a] font-serif font-bold text-[10px] sm:text-xs transform rotate-12"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));
UltimateTalisman.displayName = "UltimateTalisman";

// --- COMPONENT: PARTICLE SYSTEM ---
const ParticleSystem = React.memo(() => {
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: random(2, 4),
      left: random(5, 95),
      duration: random(15, 25),
      delay: random(0, 10),
      color: Math.random() > 0.6 ? "#fbbf24" : "#ef4444",
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 gpu-layer">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full blur-[0.5px] animate-float-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            backgroundColor: p.color,
            opacity: 0,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
});
ParticleSystem.displayName = "ParticleSystem";

// --- COMPONENT: MYSTIC FOG (New Visual Effect) ---
const MysticFog = React.memo(() => (
  <div className="absolute bottom-0 left-0 w-[200%] h-[30vh] z-10 pointer-events-none opacity-40 mix-blend-screen animate-fog gpu-layer">
    <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent" />
    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/foggy-birds.png')] bg-repeat-x" />
  </div>
));
MysticFog.displayName = "MysticFog";

// --- COMPONENT: CYBER WARNING UI (Enhanced) ---
const CyberWarningUI = React.memo(() => (
  <div className="relative z-[100] w-[90%] max-w-[380px] gpu-layer group">
    {/* Animated Pulse Glow */}
    <div className="absolute -inset-1 bg-gradient-to-b from-red-600/50 to-orange-600/20 rounded-2xl opacity-60 blur-md animate-pulse group-hover:opacity-80 transition-opacity duration-500" />

    {/* Border Decoration Corners */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl-lg z-20" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr-lg z-20" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500 rounded-bl-lg z-20" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 rounded-br-lg z-20" />

    <div className="relative bg-[#050505]/95 backdrop-blur-xl border border-red-500/40 rounded-xl p-5 overflow-hidden shadow-2xl">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Scanner Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_#ef4444] animate-scan-down opacity-80 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Warning Icon with Glitch */}
        <div className="mb-2 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-9 h-9 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Glitch Text Title */}
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-300 via-red-500 to-red-900 uppercase tracking-[0.2em] font-serif mb-2 drop-shadow-sm filter contrast-125 glitch-text relative">
          <span className="absolute inset-0 translate-x-[1px] text-red-500 opacity-50 mix-blend-screen">
            Cấm Địa
          </span>
          Cấm Địa
        </h2>

        <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-red-700 to-transparent mb-3 opacity-70" />

        <p className="text-neutral-300 text-xs leading-relaxed font-sans mb-4 font-medium tracking-wide">
          Đạo hữu đang sử dụng{" "}
          <span className="text-red-400 font-bold border-b border-red-500/50">
            Thiết Bị Di Động
          </span>
          .
          <br />
          Màn hình nhỏ không thể chứa đựng linh khí.
          <br />
          <span className="text-[10px] text-neutral-500 mt-1 block italic">
            (Vui lòng quay lại bằng PC/Laptop)
          </span>
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/60 border border-red-500/30 rounded-full shadow-inner hover:bg-red-900/60 transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[9px] font-mono text-red-300 tracking-widest font-bold">
            SYSTEM LOCKED
          </span>
        </div>
      </div>
    </div>
  </div>
));
CyberWarningUI.displayName = "CyberWarningUI";

// --- MAIN COMPONENT ---
const MobileBlocker = () => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // MASTER RULE: Nếu không phải mobile hoặc chưa mount, tuyệt đối không render gì cả.
  // Điều này đảm bảo 0% usage trên PC.
  if (!mounted || !isMobile) return null;

  return (
    // CONTAINER CHÍNH
    <div className="fixed inset-0 z-[99999] bg-[#020202] flex flex-col items-center overflow-hidden font-sans select-none h-[100dvh]">
      <GlobalStyles />
      <GraphicEngine />

      {/* LAYER 0: BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_#1a0505_0%,_#09090b_70%,_#000000_100%)]" />
        <ParticleSystem />
        <MysticFog />
        {/* Magic Circle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 mix-blend-color-dodge overflow-hidden">
          <div className="w-[150vw] h-[150vw] animate-spin-slow">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full stroke-red-800 fill-none stroke-[0.2]"
            >
              <circle cx="50" cy="50" r="48" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="35" />
              <path d="M50,2 L98,85 L2,85 Z" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* LAYER 1: CHAINS */}
      <div className="absolute top-[-30px] w-full h-full pointer-events-none z-10 flex justify-center gpu-layer">
        <div className="absolute left-[-20px] top-[-30px] origin-top-left rotate-[25deg] opacity-70 blur-[1px]">
          <div className="flex flex-col items-center">
            {Array.from({ length: 14 }).map((_, i) => (
              <HyperChainLink
                key={`l-${i}`}
                index={i}
                angle={i % 2 ? 90 : 0}
                variant="rusted"
              />
            ))}
          </div>
        </div>
        <div className="absolute right-[-20px] top-[-30px] origin-top-right -rotate-[25deg] opacity-70 blur-[1px]">
          <div className="flex flex-col items-center">
            {Array.from({ length: 14 }).map((_, i) => (
              <HyperChainLink
                key={`r-${i}`}
                index={i}
                angle={i % 2 ? 90 : 0}
                variant="rusted"
              />
            ))}
          </div>
        </div>
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 z-20 chain-rattle">
          <div className="flex flex-col items-center">
            {Array.from({ length: 9 }).map((_, i) => (
              <HyperChainLink key={`c-${i}`} index={i} angle={0} />
            ))}
          </div>
        </div>
      </div>

      {/* LAYER 2: MAIN CONTENT */}
      <div className="relative z-30 w-full h-full flex flex-col items-center">
        {/* Bùa Chú */}
        <div className="flex-1 w-full flex items-start justify-center pt-[10vh] z-[200]">
          <motion.div
            initial={{ y: -150, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              rotateZ: [0, 2, -2, 0],
              rotateY: [0, 8, -8, 0],
            }}
            transition={{
              y: { type: "spring", stiffness: 40 },
              rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative w-[50vw] max-w-[220px] h-[52vh] min-h-[300px] max-h-[580px] origin-top transform-style-3d will-change-transform mt-[-20px]"
          >
            <UltimateTalisman />
          </motion.div>
        </div>

        {/* UI Cảnh Báo (Fixed Bottom Safe Area) */}
        <div className="flex-none w-full flex justify-center pb-[calc(env(safe-area-inset-bottom)+40px)] z-[100]">
          <CyberWarningUI />
        </div>
      </div>

      {/* LAYER 3: POST-PROCESSING */}
      <div className="absolute inset-0 z-[300] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] opacity-80" />
      <div className="absolute inset-0 z-[300] pointer-events-none opacity-15 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[size:100%_4px]" />
    </div>
  );
};

export default MobileBlocker;
