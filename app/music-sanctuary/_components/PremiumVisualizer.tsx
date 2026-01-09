// app/music-sanctuary/_components/PremiumVisualizer.tsx
// Stunning audio visualizer with multiple effects
// GPU-accelerated with performance optimizations

"use client";

import React, { useRef, useEffect, memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AudioAnalysis } from "../types";

// Performance constants
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
const USE_OFFSCREEN_CANVAS = typeof OffscreenCanvas !== "undefined";

// GPU acceleration styles
const GPU_LAYER_STYLE: React.CSSProperties = {
  transform: "translateZ(0)",
  backfaceVisibility: "hidden",
  willChange: "transform",
  contain: "layout style paint",
};

// Throttle function for performance
const throttleRAF = (callback: () => void) => {
  let ticking = false;
  return () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
    }
  };
};

interface PremiumVisualizerProps {
  audioData: AudioAnalysis;
  isPlaying: boolean;
  albumArt?: string;
  accentColor?: string;
}

// ============================================================================
// WAVE VISUALIZER
// ============================================================================

const WaveVisualizer = memo(
  ({
    audioData,
    isPlaying,
    accentColor = "#10b981",
  }: {
    audioData: AudioAnalysis;
    isPlaying: boolean;
    accentColor: string;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const dataRef = useRef({ audioData, isPlaying, accentColor });
    const isVisibleRef = useRef(true);

    useEffect(() => {
      dataRef.current = { audioData, isPlaying, accentColor };
    }, [audioData, isPlaying, accentColor]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Visibility API - pause when tab is not visible
      const handleVisibilityChange = () => {
        isVisibleRef.current = !document.hidden;
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      const ctx = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
        willReadFrequently: false,
      });
      if (!ctx) return;

      // Pre-computed wave configs (avoid recreating every frame)
      const waveConfigs = [
        { frequency: 0.005, speed: 0.35, baseColor: accentColor, yOffset: 0 },
        { frequency: 0.007, speed: 0.45, baseColor: "#06b6d4", yOffset: 25 },
        { frequency: 0.01, speed: 0.6, baseColor: "#8b5cf6", yOffset: -25 },
      ];

      let width = 0;
      let height = 0;
      let centerY = 0;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio, 1.5); // Lower DPR for performance
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        centerY = height / 2;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      };

      resize();
      const throttledResize = throttleRAF(resize);
      window.addEventListener("resize", throttledResize);

      const draw = (timestamp: number) => {
        // Skip frame if not visible or throttled
        if (!isVisibleRef.current) {
          animationRef.current = requestAnimationFrame(draw);
          return;
        }

        // Frame rate limiting
        const elapsed = timestamp - lastFrameTimeRef.current;
        if (elapsed < FRAME_TIME) {
          animationRef.current = requestAnimationFrame(draw);
          return;
        }
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_TIME);

        // Fade effect
        ctx.fillStyle = "rgba(5, 5, 15, 0.08)";
        ctx.fillRect(0, 0, width, height);

        timeRef.current += 0.012;
        const time = timeRef.current;
        const {
          audioData: data,
          isPlaying: playing,
          accentColor: color,
        } = dataRef.current;

        const bass = playing ? data.bass : 0.1;
        const mid = playing ? data.mid : 0.1;
        const treble = playing ? data.treble : 0.1;
        const energy = playing ? data.energy : 0.1;

        // Reduced to 3 waves for performance
        const amplitudes = [50 + bass * 80, 40 + mid * 60, 30 + treble * 50];
        const alphas = [
          0.3 + energy * 0.2,
          0.25 + mid * 0.15,
          0.2 + treble * 0.1,
        ];

        // Use larger step for wave sampling (4px instead of 2px)
        const step = 4;

        waveConfigs.forEach((wave, waveIndex) => {
          const amplitude = amplitudes[waveIndex];
          const alpha = alphas[waveIndex];
          const currentColor = waveIndex === 0 ? color : wave.baseColor;

          ctx.beginPath();

          for (let x = 0; x <= width; x += step) {
            const y =
              centerY +
              wave.yOffset +
              Math.sin(x * wave.frequency + time * wave.speed + waveIndex) *
                amplitude +
              Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) *
                (amplitude * 0.3);

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const alphaHex = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0");
          const alphaHalfHex = Math.round(alpha * 0.5 * 255)
            .toString(16)
            .padStart(2, "0");

          const gradient = ctx.createLinearGradient(
            0,
            centerY - amplitude,
            0,
            height
          );
          gradient.addColorStop(0, `${currentColor}${alphaHex}`);
          gradient.addColorStop(0.5, `${currentColor}${alphaHalfHex}`);
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.fill();

          // Simplified stroke
          ctx.strokeStyle = `${currentColor}${Math.round(alpha * 2 * 255)
            .toString(16)
            .padStart(2, "0")}`;
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        animationRef.current = requestAnimationFrame(draw);
      };

      animationRef.current = requestAnimationFrame(draw);

      return () => {
        window.removeEventListener("resize", throttledResize);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        cancelAnimationFrame(animationRef.current);
      };
    }, [accentColor]);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ ...GPU_LAYER_STYLE, zIndex: 2 }}
      />
    );
  }
);

WaveVisualizer.displayName = "WaveVisualizer";

// ============================================================================
// PARTICLE FIELD - Object pooling for performance
// ============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  life: number;
  active: boolean;
}

const ParticleField = memo(
  ({
    audioData,
    isPlaying,
  }: {
    audioData: AudioAnalysis;
    isPlaying: boolean;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const lastFrameTimeRef = useRef(0);
    const isVisibleRef = useRef(true);
    const dataRef = useRef({ audioData, isPlaying });

    // Object pool for particles (pre-allocated)
    const particlePoolRef = useRef<Particle[]>([]);
    const activeCountRef = useRef(0);

    useEffect(() => {
      dataRef.current = { audioData, isPlaying };
    }, [audioData, isPlaying]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleVisibilityChange = () => {
        isVisibleRef.current = !document.hidden;
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      const ctx = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
        willReadFrequently: false,
      });
      if (!ctx) return;

      let width = 0;
      let height = 0;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio, 1.5);
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      };

      resize();
      const throttledResize = throttleRAF(resize);
      window.addEventListener("resize", throttledResize);

      // Pre-allocate particle pool (reduced count)
      const maxParticles = 80;
      const pool = particlePoolRef.current;
      for (let i = pool.length; i < maxParticles; i++) {
        pool.push({
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          size: 0,
          hue: 0,
          life: 0,
          active: false,
        });
      }

      const getParticle = (): Particle | null => {
        for (const p of pool) {
          if (!p.active) {
            p.active = true;
            activeCountRef.current++;
            return p;
          }
        }
        return null;
      };

      const returnParticle = (p: Particle) => {
        p.active = false;
        activeCountRef.current--;
      };

      const draw = (timestamp: number) => {
        if (!isVisibleRef.current) {
          animationRef.current = requestAnimationFrame(draw);
          return;
        }

        const elapsed = timestamp - lastFrameTimeRef.current;
        if (elapsed < FRAME_TIME) {
          animationRef.current = requestAnimationFrame(draw);
          return;
        }
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_TIME);

        const { audioData: data, isPlaying: playing } = dataRef.current;

        ctx.fillStyle = "rgba(5, 5, 15, 0.18)";
        ctx.fillRect(0, 0, width, height);

        // Spawn particles from pool
        if (
          playing &&
          data.energy > 0.25 &&
          activeCountRef.current < maxParticles - 10
        ) {
          const count = Math.min(3, Math.floor(data.energy * 4));
          for (let i = 0; i < count; i++) {
            const p = getParticle();
            if (p) {
              const spawnX = Math.random() * width;
              p.x = spawnX;
              p.y = height + 10;
              p.vx = (Math.random() - 0.5) * 2;
              p.vy = -2.5 - Math.random() * 4 * data.energy;
              p.size = 2 + Math.random() * 4 * data.bass;
              p.hue = 140 + Math.random() * 60;
              p.life = 1;
            }
          }
        }

        // Batch render particles
        for (const p of pool) {
          if (!p.active) continue;

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
          p.vx *= 0.99;
          p.life -= 0.012;

          if (playing && data.energy > 0.3) {
            p.vy -= data.bass * 0.15;
          }

          if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > width + 20) {
            returnParticle(p);
            continue;
          }

          // Simplified glow render
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 2
          );
          gradient.addColorStop(0, `hsla(${p.hue}, 85%, 60%, ${p.life})`);
          gradient.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      animationRef.current = requestAnimationFrame(draw);

      return () => {
        window.removeEventListener("resize", throttledResize);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        cancelAnimationFrame(animationRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ ...GPU_LAYER_STYLE, zIndex: 5 }}
      />
    );
  }
);

ParticleField.displayName = "ParticleField";

// ============================================================================
// CIRCULAR SPECTRUM - CSS-only GPU animation
// ============================================================================

const CircularSpectrum = memo(
  ({
    audioData,
    isPlaying,
    albumArt,
  }: {
    audioData: AudioAnalysis;
    isPlaying: boolean;
    albumArt?: string;
  }) => {
    const bars = 64; // Increased for denser, fuller spectrum
    const radius = 180; // Increased from 120 for larger display
    const padding = 80; // Space for bars to extend

    // Memoize bar elements to prevent re-renders
    const barElements = useMemo(() => {
      return Array.from({ length: bars }).map((_, i) => {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const freqIndex = i / bars;
        const x = Math.cos(angle) * radius + radius + padding;
        const y = Math.sin(angle) * radius + radius + padding;
        const rotation = (angle * 180) / Math.PI + 90;
        const hue = 150 + freqIndex * 80;

        return { i, x, y, rotation, hue, freqIndex };
      });
    }, [bars, radius, padding]);

    // Calculate intensities
    const getIntensity = useCallback(
      (freqIndex: number) => {
        if (!isPlaying) return 0.1;
        if (freqIndex < 0.25) return audioData.bass * 1.1;
        if (freqIndex < 0.5) return audioData.bass * 0.4 + audioData.mid * 0.6;
        if (freqIndex < 0.75)
          return audioData.mid * 0.7 + audioData.treble * 0.3;
        return audioData.treble;
      },
      [audioData, isPlaying]
    );

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          top: "45%",
          left: "calc(50% + 100px)",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      >
        {/* Album art glow - simplified */}
        {albumArt && (
          <div
            className="absolute rounded-full overflow-hidden opacity-20 blur-2xl"
            style={{
              width: radius * 3.5,
              height: radius * 3.5,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translateZ(0)",
            }}
          >
            <img
              src={albumArt}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Circular bars - GPU accelerated */}
        <div
          className="relative"
          style={{
            width: radius * 2 + padding * 2,
            height: radius * 2 + padding * 2,
          }}
        >
          {barElements.map(({ i, x, y, rotation, hue, freqIndex }) => {
            const intensity = getIntensity(freqIndex);
            const barHeight = 25 + intensity * 75; // Increased bar heights

            return (
              <div
                key={i}
                className="absolute origin-bottom rounded-full"
                style={{
                  left: x,
                  top: y,
                  width: 4, // Slightly wider bars
                  height: barHeight,
                  transform: `translate(-50%, -100%) rotate(${rotation}deg) translateZ(0)`,
                  background: `linear-gradient(to top, hsla(${hue}, 80%, 50%, 0.85), hsla(${hue}, 85%, 70%, 0.4))`,
                  boxShadow: isPlaying
                    ? `0 0 10px hsla(${hue}, 80%, 50%, 0.5)`
                    : "none",
                  transition: "height 0.1s ease-out",
                }}
              />
            );
          })}

          {/* Center vinyl disc - CSS animation instead of Framer Motion */}
          <div
            className="absolute rounded-full overflow-hidden"
            style={{
              width: radius * 1.1,
              height: radius * 1.1,
              left: "50%",
              top: "50%",
              marginLeft: -(radius * 1.1) / 2,
              marginTop: -(radius * 1.1) / 2,
              background:
                "conic-gradient(from 0deg, #1a1a1a 0deg, #2d2d2d 30deg, #1a1a1a 60deg, #252525 90deg, #1a1a1a 120deg, #2a2a2a 150deg, #1a1a1a 180deg, #282828 210deg, #1a1a1a 240deg, #2c2c2c 270deg, #1a1a1a 300deg, #262626 330deg, #1a1a1a 360deg)",
              boxShadow: isPlaying
                ? "0 0 60px rgba(16, 185, 129, 0.25), 0 0 30px rgba(0,0,0,0.7)"
                : "0 0 40px rgba(0,0,0,0.7)",
              border: "2px solid rgba(255,255,255,0.06)",
              animation: isPlaying ? "spin 6s linear infinite" : "none",
              transform: "translateZ(0)",
              willChange: isPlaying ? "transform" : "auto",
            }}
          >
            {/* Simplified vinyl grooves */}
            <div className="absolute inset-0 rounded-full">
              {[0, 3, 6, 9].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    inset: 8 + i * 8,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                />
              ))}
            </div>

            {/* Album art */}
            {albumArt ? (
              <div
                className="absolute rounded-full overflow-hidden"
                style={{
                  inset: "20%",
                  boxShadow: "0 0 25px rgba(0,0,0,0.7)",
                  border: "3px solid rgba(255,255,255,0.1)",
                  animation: isPlaying
                    ? "spin-reverse 6s linear infinite"
                    : "none",
                  transform: "translateZ(0)",
                }}
              >
                <img
                  src={albumArt}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  inset: "25%",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
                  boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                  border: "3px solid rgba(255,255,255,0.2)",
                  animation: isPlaying
                    ? "spin-reverse 6s linear infinite"
                    : "none",
                }}
              >
                <svg
                  className="w-12 h-12 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}

            {/* Center spindle */}
            <div
              className="absolute rounded-full"
              style={{
                width: 32,
                height: 32,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle at 40% 40%, #3a3a3a 0%, #1a1a1a 60%)",
                border: "2px solid #333",
              }}
            >
              <div
                className="absolute rounded-full bg-black"
                style={{
                  width: 12,
                  height: 12,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* CSS Keyframes injected via style tag */}
        <style jsx>{`
          @keyframes spin {
            from {
              transform: translateZ(0) rotate(0deg);
            }
            to {
              transform: translateZ(0) rotate(360deg);
            }
          }
          @keyframes spin-reverse {
            from {
              transform: translateZ(0) rotate(0deg);
            }
            to {
              transform: translateZ(0) rotate(-360deg);
            }
          }
        `}</style>
      </div>
    );
  }
);

CircularSpectrum.displayName = "CircularSpectrum";

// ============================================================================
// FLOATING ORBS - Simplified CSS-only animation
// ============================================================================

const FloatingOrbs = memo(
  ({
    audioData,
    isPlaying,
  }: {
    audioData: AudioAnalysis;
    isPlaying: boolean;
  }) => {
    // Reduced orb count for performance
    const orbs = useMemo(
      () => [
        { x: 15, y: 25, size: 200, color: "#10b981", delay: 0 },
        { x: 80, y: 20, size: 160, color: "#06b6d4", delay: 1 },
        { x: 10, y: 70, size: 180, color: "#8b5cf6", delay: 2 },
        { x: 85, y: 75, size: 150, color: "#ec4899", delay: 0.5 },
        { x: 50, y: 80, size: 140, color: "#f59e0b", delay: 1.5 },
      ],
      []
    );

    const energy = isPlaying ? audioData.energy : 0.15;

    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size * (1 + energy * 0.3),
              height: orb.size * (1 + energy * 0.3),
              background: `radial-gradient(circle, ${orb.color}20 0%, ${orb.color}08 40%, transparent 65%)`,
              animation: `floatOrb${i} ${12 + i * 2}s ease-in-out infinite`,
              animationDelay: `${orb.delay}s`,
              transform: "translateZ(0)",
              contain: "layout style paint",
            }}
          />
        ))}
        <style jsx>{`
          @keyframes floatOrb0 {
            0%,
            100% {
              transform: translateZ(0) translate(0, 0);
            }
            50% {
              transform: translateZ(0) translate(30px, -25px);
            }
          }
          @keyframes floatOrb1 {
            0%,
            100% {
              transform: translateZ(0) translate(0, 0);
            }
            50% {
              transform: translateZ(0) translate(-25px, 30px);
            }
          }
          @keyframes floatOrb2 {
            0%,
            100% {
              transform: translateZ(0) translate(0, 0);
            }
            50% {
              transform: translateZ(0) translate(20px, 35px);
            }
          }
          @keyframes floatOrb3 {
            0%,
            100% {
              transform: translateZ(0) translate(0, 0);
            }
            50% {
              transform: translateZ(0) translate(-30px, -20px);
            }
          }
          @keyframes floatOrb4 {
            0%,
            100% {
              transform: translateZ(0) translate(0, 0);
            }
            50% {
              transform: translateZ(0) translate(15px, -30px);
            }
          }
        `}</style>
      </div>
    );
  }
);

FloatingOrbs.displayName = "FloatingOrbs";

// ============================================================================
// MAIN PREMIUM VISUALIZER - GPU Optimized
// ============================================================================

const PremiumVisualizer = memo(
  ({
    audioData,
    isPlaying,
    albumArt,
    accentColor = "#10b981",
  }: PremiumVisualizerProps) => {
    return (
      <div
        className="absolute inset-0 z-0 bg-[#05050f]"
        style={{
          isolation: "isolate",
        }}
      >
        {/* Floating orbs background - CSS animation */}
        <FloatingOrbs audioData={audioData} isPlaying={isPlaying} />

        {/* Wave visualizer - Canvas with GPU hints */}
        <WaveVisualizer
          audioData={audioData}
          isPlaying={isPlaying}
          accentColor={accentColor}
        />

        {/* Particle effects - Object pooling */}
        <ParticleField audioData={audioData} isPlaying={isPlaying} />

        {/* Circular spectrum with album art - CSS animations */}
        <CircularSpectrum
          audioData={audioData}
          isPlaying={isPlaying}
          albumArt={albumArt}
        />

        {/* Vignette overlay - static, GPU layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
            transform: "translateZ(0)",
            zIndex: 15,
          }}
        />

        {/* Noise texture - static, will-change: none for performance */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            transform: "translateZ(0)",
            zIndex: 20,
          }}
        />
      </div>
    );
  }
);

PremiumVisualizer.displayName = "PremiumVisualizer";

export default PremiumVisualizer;
