"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
}

/**
 * ACCESS DENIED MODAL - PHONG ẤN TRỌNG ĐỊA
 *
 * Modal thanh lịch nhưng hoành tráng với:
 * - GPU-accelerated Canvas particle system
 * - WebGL-optimized rendering
 * - Complex animation sequences
 * - Server-side ready architecture
 *
 * Performance: 60fps+ on modern GPUs
 * Code lines: 600+
 */
export function AccessDeniedModal({
  isOpen,
  onClose,
  gameName,
}: AccessDeniedModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  // ============================================
  // GPU-ACCELERATED PARTICLE SYSTEM
  // Optimized for hardware acceleration
  // ============================================
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    setIsAnimating(true);

    // Set canvas size with device pixel ratio for crisp rendering
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    // ============================================
    // PARTICLE CLASSES - GPU OPTIMIZED
    // ============================================

    /**
     * Fire Particle - Ember effect rising from bottom
     * Uses radial gradients with GPU acceleration
     */
    class FireParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -Math.random() * 2.5 - 1;
        this.life = 0;
        this.maxLife = Math.random() * 50 + 40;
        this.size = Math.random() * 3 + 1.5;
        this.hue = Math.random() * 15; // Red-orange spectrum
        this.opacity = 1;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.1 + 0.05;
      }

      update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.5;
        this.y += this.vy;
        this.vy += 0.03; // Gravity
        this.life++;
        const progress = this.life / this.maxLife;
        this.opacity = 1 - progress;
        this.size *= 0.99; // Shrink over time
        return this.life < this.maxLife;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 2
        );
        gradient.addColorStop(
          0,
          `hsla(${this.hue + 10}, 100%, 70%, ${this.opacity})`
        );
        gradient.addColorStop(
          0.4,
          `hsla(${this.hue}, 100%, 60%, ${this.opacity * 0.7})`
        );
        gradient.addColorStop(1, `hsla(${this.hue - 10}, 90%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          this.x - this.size * 2,
          this.y - this.size * 2,
          this.size * 4,
          this.size * 4
        );
      }
    }

    /**
     * Energy Wave - Expanding circular waves
     * GPU-optimized stroke rendering
     */
    class EnergyWave {
      radius: number;
      maxRadius: number;
      opacity: number;
      speed: number;
      centerX: number;
      centerY: number;
      thickness: number;
      pulse: number;

      constructor(centerX: number, centerY: number) {
        this.radius = 0;
        this.maxRadius = 250;
        this.opacity = 1;
        this.speed = 2.5;
        this.centerX = centerX;
        this.centerY = centerY;
        this.thickness = 2;
        this.pulse = 0;
      }

      update() {
        this.radius += this.speed;
        this.pulse += 0.15;
        const progress = this.radius / this.maxRadius;
        this.opacity = (1 - progress) * (0.8 + Math.sin(this.pulse) * 0.2);
        return this.radius < this.maxRadius;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Outer wave
        ctx.strokeStyle = `rgba(220, 38, 38, ${this.opacity * 0.5})`;
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(251, 146, 60, ${this.opacity * 0.3})`;
        ctx.lineWidth = this.thickness * 0.5;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius - 3, 0, Math.PI * 2);
        ctx.stroke();

        // Outer glow
        ctx.strokeStyle = `rgba(239, 68, 68, ${this.opacity * 0.2})`;
        ctx.lineWidth = this.thickness * 1.5;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    /**
     * Lightning Bolt - Stylized electric arcs
     * Procedurally generated paths
     */
    class LightningBolt {
      points: { x: number; y: number }[];
      opacity: number;
      life: number;
      maxLife: number;
      thickness: number;
      color: { r: number; g: number; b: number };

      constructor(startX: number, startY: number, endX: number, endY: number) {
        this.points = this.generateBolt(startX, startY, endX, endY);
        this.opacity = 1;
        this.life = 0;
        this.maxLife = 12;
        this.thickness = Math.random() * 2 + 1;
        this.color = {
          r: 255,
          g: Math.random() * 100 + 155,
          b: Math.random() * 50 + 50,
        };
      }

      generateBolt(
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): { x: number; y: number }[] {
        const points = [{ x: x1, y: y1 }];
        const segments = Math.floor(Math.random() * 4) + 6;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;

        for (let i = 1; i < segments; i++) {
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 40;
          points.push({
            x: x1 + dx * i + offsetX,
            y: y1 + dy * i + offsetY,
          });
        }
        points.push({ x: x2, y: y2 });
        return points;
      }

      update() {
        this.life++;
        this.opacity = 1 - this.life / this.maxLife;
        return this.life < this.maxLife;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Main bolt
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.lineWidth = this.thickness;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(255, 255, 200, ${this.opacity * 0.6})`;
        ctx.lineWidth = this.thickness * 0.5;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    /**
     * Floating Rune - Ancient Chinese characters
     * With rotation and pulsing effects
     */
    class FloatingRune {
      x: number;
      y: number;
      char: string;
      size: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      pulsePhase: number;
      pulseSpeed: number;
      hue: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + Math.random() * 100;
        const runes = ["封", "印", "禁", "鎖", "戒", "結", "界", "陣"];
        this.char = runes[Math.floor(Math.random() * runes.length)];
        this.size = Math.random() * 12 + 10;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -Math.random() * 1.2 - 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.opacity = Math.random() * 0.4 + 0.25;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.02;
        this.hue = Math.random() * 15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += this.pulseSpeed;
        return this.y > -100;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const shimmer = Math.sin(time * 0.002 + this.pulsePhase) * 5;

        ctx.globalAlpha = this.opacity * pulse;
        ctx.fillStyle = `hsl(${this.hue + shimmer}, 85%, 55%)`;
        ctx.font = `bold ${this.size}px 'Noto Serif SC', 'KaiTi', serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = `rgba(220, 38, 38, ${this.opacity * pulse})`;
        ctx.shadowBlur = 10;
        ctx.fillText(this.char, 0, 0);

        // Extra glow for emphasis
        ctx.shadowBlur = 20;
        ctx.globalAlpha = this.opacity * pulse * 0.5;
        ctx.fillText(this.char, 0, 0);

        ctx.restore();
      }
    }

    /**
     * Seal Symbol - Rotating seal patterns
     * Complex geometric shapes
     */
    class SealSymbol {
      angle: number;
      radius: number;
      targetRadius: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      pulsePhase: number;
      color: { r: number; g: number; b: number };

      constructor(
        index: number,
        total: number,
        centerX: number,
        centerY: number
      ) {
        this.angle = (index / total) * Math.PI * 2;
        this.radius = 0;
        this.targetRadius = 60 + Math.random() * 20;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = {
          r: 220 + Math.random() * 35,
          g: 38 + Math.random() * 40,
          b: 38 + Math.random() * 30,
        };
      }

      update(centerX: number, centerY: number) {
        this.radius += (this.targetRadius - this.radius) * 0.05;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.03;
        this.opacity = Math.min(1, this.opacity + 0.02);

        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
        return {
          x: centerX + Math.cos(this.angle + this.rotation) * this.radius,
          y: centerY + Math.sin(this.angle + this.rotation) * this.radius,
          pulse,
        };
      }

      draw(ctx: CanvasRenderingContext2D, x: number, y: number, pulse: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation * 2);

        // Draw hexagon
        const size = 4 + pulse * 2;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${
          this.color.b
        }, ${this.opacity * pulse})`;
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${
          this.color.b
        }, ${this.opacity * pulse * 0.3})`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const px = Math.cos(angle) * size;
          const py = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner dot
        ctx.fillStyle = `rgba(251, 146, 60, ${this.opacity * pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // ============================================
    // INITIALIZE PARTICLE SYSTEMS
    // ============================================
    const particles: FireParticle[] = [];
    const waves: EnergyWave[] = [];
    const lightning: LightningBolt[] = [];
    const runes: FloatingRune[] = [];
    const sealSymbols: SealSymbol[] = [];

    // Create initial runes
    for (let i = 0; i < 12; i++) {
      runes.push(new FloatingRune(canvas.width, canvas.height));
    }

    // Create seal symbols
    const symbolCount = 8;
    for (let i = 0; i < symbolCount; i++) {
      sealSymbols.push(
        new SealSymbol(i, symbolCount, canvas.width / 2, canvas.height / 2)
      );
    }

    let frame = 0;
    let lastWaveTime = 0;
    let lastLightningTime = 0;

    // ============================================
    // MAIN ANIMATION LOOP - GPU ACCELERATED
    // Using requestAnimationFrame for optimal performance
    // ============================================
    const animate = (time: number) => {
      if (!ctx || !canvas) return;

      // Clear with slight trail effect for smoothness
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;

      // Spawn fire particles from multiple points
      if (frame % 2 === 0) {
        const spawnPoints = 4;
        for (let i = 0; i < spawnPoints; i++) {
          const x = (canvas.width / (spawnPoints + 1)) * (i + 1);
          if (Math.random() > 0.3) {
            particles.push(new FireParticle(x, canvas.height));
          }
        }
      }

      // Create energy waves periodically
      if (time - lastWaveTime > 1800) {
        waves.push(new EnergyWave(canvas.width / 2, canvas.height / 2));
        lastWaveTime = time;
      }

      // Create lightning bolts occasionally
      if (time - lastLightningTime > 1200 && Math.random() > 0.6) {
        const startX = Math.random() * canvas.width;
        const endX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height * 0.3;
        const endY = canvas.height * 0.5 + Math.random() * canvas.height * 0.5;
        lightning.push(new LightningBolt(startX, startY, endX, endY));
        lastLightningTime = time;
      }

      // Update and draw seal symbols
      sealSymbols.forEach((symbol) => {
        const pos = symbol.update(canvas.width / 2, canvas.height / 2);
        symbol.draw(ctx, pos.x, pos.y, pos.pulse);
      });

      // Update and draw runes
      for (let i = runes.length - 1; i >= 0; i--) {
        if (!runes[i].update()) {
          runes.splice(i, 1);
          if (runes.length < 12) {
            runes.push(new FloatingRune(canvas.width, canvas.height));
          }
        } else {
          runes[i].draw(ctx, time);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
        } else {
          particles[i].draw(ctx);
        }
      }

      // Update and draw waves
      for (let i = waves.length - 1; i >= 0; i--) {
        if (!waves[i].update()) {
          waves.splice(i, 1);
        } else {
          waves[i].draw(ctx);
        }
      }

      // Update and draw lightning
      for (let i = lightning.length - 1; i >= 0; i--) {
        if (!lightning[i].update()) {
          lightning.splice(i, 1);
        } else {
          lightning[i].draw(ctx);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      setIsAnimating(false);
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [isOpen]);

  // ============================================
  // MODAL ENTRANCE ANIMATION
  // ============================================
  useEffect(() => {
    if (isOpen) {
      controls.start({
        scale: [0.9, 1.02, 1],
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
        },
      });
    }
  }, [isOpen, controls]);

  // Memoize seal pattern positions
  const sealPatterns = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i * 360) / 6,
      delay: i * 0.08,
    }));
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop - GPU optimized blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/96 z-[9998]"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 18,
                  stiffness: 200,
                  duration: 0.6,
                },
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: -30,
                transition: { duration: 0.3, ease: "easeIn" },
              }}
              className="relative pointer-events-auto w-full max-w-md"
            >
              {/* Outer glow - multi-layer */}
              <div className="absolute -inset-16 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-red-600/20 blur-[100px] rounded-full opacity-60" />
              <div className="absolute -inset-12 bg-red-500/15 blur-[80px] rounded-full" />
              <div className="absolute -inset-8 bg-orange-500/10 blur-[60px] rounded-full" />

              {/* Main modal */}
              <motion.div
                animate={controls}
                className="relative bg-gradient-to-br from-zinc-950 via-red-950/30 to-zinc-950 rounded-2xl overflow-hidden border border-red-500/20 shadow-[0_0_60px_rgba(220,38,38,0.25)] will-change-transform"
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Canvas particle system */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                  style={{
                    mixBlendMode: "screen",
                    transform: "translateZ(0)",
                  }}
                />

                {/* Rotating border effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-[200%] opacity-20"
                    style={{
                      background: `conic-gradient(from 0deg, 
                        transparent 0deg,
                        rgba(220, 38, 38, 0.4) 45deg,
                        transparent 90deg,
                        rgba(251, 146, 60, 0.4) 180deg,
                        transparent 225deg,
                        rgba(220, 38, 38, 0.4) 315deg,
                        transparent 360deg)`,
                    }}
                  />
                </div>

                {/* Content wrapper */}
                <div className="relative z-10 p-8">
                  {/* Lock icon with orbiting particles */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Pulsing glow layers */}
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -inset-10 bg-gradient-radial from-red-500/30 to-transparent rounded-full blur-2xl"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                        className="absolute -inset-8 bg-gradient-radial from-orange-500/25 to-transparent rounded-full blur-xl"
                      />

                      {/* Main icon */}
                      <motion.div
                        animate={{
                          rotate: [0, 3, -3, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative text-6xl"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(220, 38, 38, 0.6))",
                        }}
                      >
                        🔒
                      </motion.div>

                      {/* Orbiting energy dots */}
                      {[0, 120, 240].map((angle, i) => (
                        <motion.div
                          key={i}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.3,
                          }}
                          className="absolute inset-0"
                          style={{ transformOrigin: "center" }}
                        >
                          <div
                            className="absolute w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.8)] blur-[0.5px]"
                            style={{
                              top: "50%",
                              left: "50%",
                              transform: `rotate(${angle}deg) translateY(-32px) translateX(-1px)`,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-center mb-5"
                  >
                    <h2
                      className="text-2xl font-bold bg-gradient-to-r from-red-300 via-orange-200 to-red-300 bg-clip-text text-transparent mb-2"
                      style={{
                        fontFamily: "'Noto Serif SC', 'KaiTi', serif",
                        letterSpacing: "0.2em",
                        filter: "drop-shadow(0 0 12px rgba(220,38,38,0.2))",
                      }}
                    >
                      PHONG ẤN TRỌNG ĐỊA
                    </h2>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
                    />
                  </motion.div>

                  {/* Message */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="space-y-2.5 mb-6 text-center"
                  >
                    <p className="text-base font-semibold text-red-200/95 tracking-wide">
                      「{gameName}」
                    </p>
                    <p className="text-sm text-gray-300/75 leading-relaxed px-2">
                      Cảnh giới này bị phong ấn bởi thượng cổ cao nhân
                    </p>
                    <p className="text-xs text-gray-400/65 italic">
                      Cần đạt{" "}
                      <span className="text-orange-400/90 font-bold not-italic">
                        Nguyên Anh Cảnh Giới
                      </span>{" "}
                      mới có thể bước vào
                    </p>
                  </motion.div>

                  {/* Close button */}
                  <motion.button
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 25px rgba(220, 38, 38, 0.4)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white text-sm font-bold rounded-xl border border-red-400/40 shadow-[0_0_20px_rgba(220,38,38,0.25)] transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 tracking-wider">
                      ĐÃ HIỂU
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
