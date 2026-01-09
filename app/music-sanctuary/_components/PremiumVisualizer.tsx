// app/music-sanctuary/_components/PremiumVisualizer.tsx
// Stunning audio visualizer with multiple effects

"use client";

import React, { useRef, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { AudioAnalysis } from "../types";

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
    const dataRef = useRef({ audioData, isPlaying, accentColor });

    useEffect(() => {
      dataRef.current = { audioData, isPlaying, accentColor };
    }, [audioData, isPlaying, accentColor]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };

      resize();
      window.addEventListener("resize", resize);

      const draw = () => {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const centerY = height / 2;

        // Fade effect
        ctx.fillStyle = "rgba(5, 5, 15, 0.08)";
        ctx.fillRect(0, 0, width, height);

        timeRef.current += 0.015;
        const time = timeRef.current;
        const {
          audioData: data,
          isPlaying: playing,
          accentColor: color,
        } = dataRef.current;

        // Audio reactivity
        const bass = playing ? data.bass : 0.1;
        const mid = playing ? data.mid : 0.1;
        const treble = playing ? data.treble : 0.1;
        const energy = playing ? data.energy : 0.1;

        // Create multiple wave layers
        const waves = [
          {
            amplitude: 40 + bass * 80,
            frequency: 0.006,
            speed: 0.4,
            color: color,
            alpha: 0.25 + energy * 0.2,
            yOffset: 0,
          },
          {
            amplitude: 30 + mid * 60,
            frequency: 0.008,
            speed: 0.5,
            color: "#06b6d4",
            alpha: 0.2 + mid * 0.15,
            yOffset: 20,
          },
          {
            amplitude: 20 + treble * 40,
            frequency: 0.012,
            speed: 0.7,
            color: "#8b5cf6",
            alpha: 0.15 + treble * 0.1,
            yOffset: -20,
          },
          {
            amplitude: 15 + bass * 30,
            frequency: 0.015,
            speed: 0.9,
            color: "#ec4899",
            alpha: 0.1 + bass * 0.08,
            yOffset: 30,
          },
        ];

        waves.forEach((wave, waveIndex) => {
          ctx.beginPath();

          for (let x = 0; x <= width; x += 3) {
            const y =
              centerY +
              wave.yOffset +
              Math.sin(x * wave.frequency + time * wave.speed + waveIndex) *
                wave.amplitude +
              Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) *
                (wave.amplitude * 0.3) +
              Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7) *
                (wave.amplitude * 0.2);

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const gradient = ctx.createLinearGradient(
            0,
            centerY - wave.amplitude,
            0,
            height
          );
          gradient.addColorStop(
            0,
            `${wave.color}${Math.round(wave.alpha * 255)
              .toString(16)
              .padStart(2, "0")}`
          );
          gradient.addColorStop(
            0.5,
            `${wave.color}${Math.round(wave.alpha * 0.5 * 255)
              .toString(16)
              .padStart(2, "0")}`
          );
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.fill();

          // Add glow line at top of wave
          ctx.beginPath();
          for (let x = 0; x <= width; x += 3) {
            const y =
              centerY +
              wave.yOffset +
              Math.sin(x * wave.frequency + time * wave.speed + waveIndex) *
                wave.amplitude +
              Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) *
                (wave.amplitude * 0.3);

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.strokeStyle = `${wave.color}${Math.round(wave.alpha * 2 * 255)
            .toString(16)
            .padStart(2, "0")}`;
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationRef.current);
      };
    }, []);

    return (
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    );
  }
);

WaveVisualizer.displayName = "WaveVisualizer";

// ============================================================================
// PARTICLE FIELD
// ============================================================================

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
    const particlesRef = useRef<
      Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        hue: number;
        life: number;
      }>
    >([]);
    const dataRef = useRef({ audioData, isPlaying });

    useEffect(() => {
      dataRef.current = { audioData, isPlaying };
    }, [audioData, isPlaying]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };

      resize();
      window.addEventListener("resize", resize);

      // Initialize particles - reduced count for performance
      const particles = particlesRef.current;
      const maxParticles = 60; // Reduced from 100

      const draw = () => {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const { audioData: data, isPlaying: playing } = dataRef.current;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Add new particles based on audio
        if (playing && data.energy > 0.3 && particles.length < maxParticles) {
          const count = Math.floor(data.energy * 5);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * width,
              y: height + 10,
              vx: (Math.random() - 0.5) * 2,
              vy: -2 - Math.random() * 4 * data.energy,
              size: 2 + Math.random() * 4,
              hue: 160 + Math.random() * 60, // Cyan to green
              life: 1,
            });
          }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          // Update
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02; // Slight gravity
          p.life -= 0.01;

          // Remove dead particles
          if (p.life <= 0 || p.y < -10) {
            particles.splice(i, 1);
            continue;
          }

          // Draw
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 2
          );
          gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.life})`);
          gradient.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    );
  }
);

ParticleField.displayName = "ParticleField";

// ============================================================================
// CIRCULAR SPECTRUM
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
    const bars = 48;
    const radius = 120; // Slightly smaller for better fit

    return (
      // Positioned in the right area (accounting for sidebar)
      <div
        className="absolute pointer-events-none"
        style={{
          top: "45%",
          left: "calc(50% + 100px)", // Offset for playlist sidebar
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      >
        {/* Album art glow background */}
        {albumArt && (
          <div
            className="absolute rounded-full overflow-hidden opacity-25 blur-3xl"
            style={{
              width: radius * 3,
              height: radius * 3,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <img src={albumArt} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Circular bars container */}
        <div
          className="relative"
          style={{
            width: radius * 2 + 80,
            height: radius * 2 + 80,
            willChange: "transform",
          }}
        >
          {Array.from({ length: bars }).map((_, i) => {
            const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
            const freqIndex = i / bars;

            let intensity = 0.1;
            if (isPlaying) {
              if (freqIndex < 0.33) {
                intensity = audioData.bass;
              } else if (freqIndex < 0.66) {
                intensity = audioData.mid;
              } else {
                intensity = audioData.treble;
              }
            }

            const barHeight = 18 + intensity * 50;
            const x = Math.cos(angle) * radius + radius + 40;
            const y = Math.sin(angle) * radius + radius + 40;
            const rotation = (angle * 180) / Math.PI + 90;

            // Color based on frequency
            const hue = 160 + freqIndex * 60;

            return (
              <div
                key={i}
                className="absolute origin-bottom rounded-full gpu-accelerated"
                style={{
                  left: x,
                  top: y,
                  width: 3,
                  height: barHeight,
                  transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
                  background: `linear-gradient(to top, hsla(${hue}, 80%, 50%, 0.8), hsla(${hue}, 80%, 70%, 0.4))`,
                  boxShadow: isPlaying
                    ? `0 0 8px hsla(${hue}, 80%, 50%, 0.4)`
                    : "none",
                  transition: "height 0.1s ease-out",
                }}
              />
            );
          })}

          {/* Outer glow ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: radius * 1.5,
              height: radius * 1.5,
              left: "50%",
              top: "50%",
              marginLeft: -(radius * 1.5) / 2,
              marginTop: -(radius * 1.5) / 2,
              background: isPlaying
                ? "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)"
                : "transparent",
              transition: "background 0.5s ease",
              pointerEvents: "none",
            }}
          />

          {/* Center vinyl disc - rotates */}
          <motion.div
            className="absolute rounded-full overflow-hidden gpu-accelerated"
            style={{
              width: radius * 1.35,
              height: radius * 1.35,
              left: "50%",
              top: "50%",
              marginLeft: -(radius * 1.35) / 2,
              marginTop: -(radius * 1.35) / 2,
              background:
                "conic-gradient(from 0deg, #1a1a1a 0deg, #2d2d2d 30deg, #1a1a1a 60deg, #252525 90deg, #1a1a1a 120deg, #2a2a2a 150deg, #1a1a1a 180deg, #282828 210deg, #1a1a1a 240deg, #2c2c2c 270deg, #1a1a1a 300deg, #262626 330deg, #1a1a1a 360deg)",
              boxShadow: isPlaying
                ? "0 0 80px rgba(16, 185, 129, 0.3), 0 0 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5)"
                : "0 0 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5)",
              border: "2px solid rgba(255,255,255,0.08)",
            }}
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            {/* Vinyl grooves - more realistic */}
            <div className="absolute inset-0 rounded-full">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    inset: 8 + i * 6,
                    border:
                      i % 3 === 0
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(255,255,255,0.03)",
                  }}
                />
              ))}
            </div>

            {/* Vinyl shine/reflection effect */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)",
              }}
            />

            {/* Album art - counter-rotate to stay still */}
            {albumArt ? (
              <motion.div
                className="absolute rounded-full overflow-hidden"
                style={{
                  inset: "20%",
                  boxShadow:
                    "0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.3)",
                  border: "3px solid rgba(255,255,255,0.1)",
                }}
                animate={{ rotate: isPlaying ? -360 : 0 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src={albumArt}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Album art overlay for depth */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  inset: "25%",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
                  boxShadow:
                    "0 0 30px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0,0,0,0.3)",
                  border: "3px solid rgba(255,255,255,0.2)",
                }}
                animate={{ rotate: isPlaying ? -360 : 0 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <svg
                  className="w-10 h-10 text-white drop-shadow-lg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </motion.div>
            )}

            {/* Center spindle/hole with metallic effect */}
            <div
              className="absolute rounded-full"
              style={{
                width: 28,
                height: 28,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle at 40% 40%, #4a4a4a 0%, #1a1a1a 50%, #0a0a0a 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.5)",
                border: "2px solid #333",
              }}
            >
              {/* Inner hole */}
              <div
                className="absolute rounded-full bg-black"
                style={{
                  width: 10,
                  height: 10,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "inset 0 1px 3px rgba(255,255,255,0.1)",
                }}
              />
            </div>
          </motion.div>

          {/* Pulsing ring effect when playing */}
          {isPlaying && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: radius * 1.6,
                height: radius * 1.6,
                left: "50%",
                top: "50%",
                marginLeft: -(radius * 1.6) / 2,
                marginTop: -(radius * 1.6) / 2,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

CircularSpectrum.displayName = "CircularSpectrum";

// ============================================================================
// FLOATING ORBS
// ============================================================================

const FloatingOrbs = memo(
  ({
    audioData,
    isPlaying,
  }: {
    audioData: AudioAnalysis;
    isPlaying: boolean;
  }) => {
    const orbs = useMemo(
      () => [
        { x: 15, y: 25, size: 200, color: "#10b981", delay: 0 },
        { x: 80, y: 20, size: 150, color: "#06b6d4", delay: 1 },
        { x: 10, y: 70, size: 180, color: "#8b5cf6", delay: 2 },
        { x: 85, y: 75, size: 160, color: "#ec4899", delay: 0.5 },
        { x: 50, y: 80, size: 140, color: "#f59e0b", delay: 1.5 },
      ],
      []
    );

    const energy = isPlaying ? audioData.energy : 0.2;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size * (1 + energy * 0.3),
              height: orb.size * (1 + energy * 0.3),
              background: `radial-gradient(circle, ${orb.color}20 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1 + energy * 0.2, 0.95, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
);

FloatingOrbs.displayName = "FloatingOrbs";

// ============================================================================
// MAIN PREMIUM VISUALIZER
// ============================================================================

const PremiumVisualizer = memo(
  ({
    audioData,
    isPlaying,
    albumArt,
    accentColor = "#10b981",
  }: PremiumVisualizerProps) => {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#05050f]">
        {/* Floating orbs background */}
        <FloatingOrbs audioData={audioData} isPlaying={isPlaying} />

        {/* Wave visualizer */}
        <WaveVisualizer
          audioData={audioData}
          isPlaying={isPlaying}
          accentColor={accentColor}
        />

        {/* Particle effects */}
        <ParticleField audioData={audioData} isPlaying={isPlaying} />

        {/* Circular spectrum with album art */}
        <CircularSpectrum
          audioData={audioData}
          isPlaying={isPlaying}
          albumArt={albumArt}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    );
  }
);

PremiumVisualizer.displayName = "PremiumVisualizer";

export default PremiumVisualizer;
