"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

interface UnderDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
}

/**
 * UNDER DEVELOPMENT MODAL - ĐANG PHÁT TRIỂN
 *
 * Modal xây dựng với:
 * - GPU-accelerated construction particles
 * - Blueprint grid animation
 * - Rotating gears and tools
 * - Holographic building effects
 *
 * Performance: 60fps+
 * Code lines: 600+
 * Language: Vietnamese
 */
export function UnderDevelopmentModal({
  isOpen,
  onClose,
  gameName,
}: UnderDevelopmentModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();
  const [buildProgress, setBuildProgress] = useState(0);

  // ============================================
  // GPU-ACCELERATED CONSTRUCTION PARTICLE SYSTEM
  // Building/development themed effects
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

    // ============================================
    // FIX: RESIZE LOGIC (SỬA LỖI KHÔNG PHỦ KÍN)
    // ============================================
    const resize = () => {
      const parent = canvas.parentElement; // Lấy khung cha
      if (parent) {
        const dpr = window.devicePixelRatio || 1;

        // Lấy kích thước thật của khung cha
        canvas.width = parent.offsetWidth * dpr;
        canvas.height = parent.offsetHeight * dpr;

        ctx.scale(dpr, dpr);

        // QUAN TRỌNG: Không set style cứng ở đây
        // Để class w-full h-full tự lo việc hiển thị
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // ============================================
    // PARTICLE CLASSES - CONSTRUCTION THEME
    // ============================================

    /**
     * Blueprint Grid - Animated construction grid
     * Simulates blueprint/technical drawing effect
     */
    class BlueprintGrid {
      opacity: number;
      pulsePhase: number;
      gridSize: number;
      majorLineInterval: number;

      constructor() {
        this.opacity = 0.3;
        this.pulsePhase = 0;
        this.gridSize = 20;
        this.majorLineInterval = 5;
      }

      update() {
        this.pulsePhase += 0.02;
      }

      draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 0.9;

        ctx.strokeStyle = `rgba(34, 211, 238, ${this.opacity * 0.15 * pulse})`;
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let x = 0; x < width; x += this.gridSize) {
          const isMajor = x % (this.gridSize * this.majorLineInterval) === 0;
          ctx.strokeStyle = isMajor
            ? `rgba(34, 211, 238, ${this.opacity * 0.25 * pulse})`
            : `rgba(34, 211, 238, ${this.opacity * 0.15 * pulse})`;
          ctx.lineWidth = isMajor ? 1 : 0.5;

          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < height; y += this.gridSize) {
          const isMajor = y % (this.gridSize * this.majorLineInterval) === 0;
          ctx.strokeStyle = isMajor
            ? `rgba(34, 211, 238, ${this.opacity * 0.25 * pulse})`
            : `rgba(34, 211, 238, ${this.opacity * 0.15 * pulse})`;
          ctx.lineWidth = isMajor ? 1 : 0.5;

          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }
    }

    /**
     * Building Block - Animated construction blocks
     * Rising from bottom to build structure
     */
    class BuildingBlock {
      x: number;
      y: number;
      width: number;
      height: number;
      targetY: number;
      speed: number;
      color: { h: number; s: number; l: number };
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      pulsePhase: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.width = Math.random() * 15 + 8;
        this.height = Math.random() * 15 + 8;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = canvasHeight + this.height;
        this.targetY = Math.random() * canvasHeight * 0.7;
        this.speed = Math.random() * 1.5 + 0.8;
        this.color = {
          h: Math.random() * 40 + 180, // Blue-cyan range
          s: 70 + Math.random() * 20,
          l: 55 + Math.random() * 20,
        };
        this.opacity = Math.random() * 0.4 + 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        if (this.y > this.targetY) {
          this.y -= this.speed;
        }
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.05;
        return this.y > -this.height * 2;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;

        // Block shadow
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity * 0.3})`;
        ctx.fillRect(
          -this.width / 2 + 2,
          -this.height / 2 + 2,
          this.width,
          this.height
        );

        // Main block
        const gradient = ctx.createLinearGradient(
          -this.width / 2,
          -this.height / 2,
          this.width / 2,
          this.height / 2
        );
        gradient.addColorStop(
          0,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l + 15}%, ${
            this.opacity * pulse
          })`
        );
        gradient.addColorStop(
          1,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l - 10}%, ${
            this.opacity * pulse
          })`
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );

        // Block outline
        ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l + 20
        }%, ${this.opacity * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );

        // Inner detail line
        ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l + 30
        }%, ${this.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(
          -this.width / 2 + 2,
          -this.height / 2 + 2,
          this.width - 4,
          this.height - 4
        );

        ctx.restore();
      }
    }

    /**
     * Gear/Cog - Rotating mechanical gears
     * Represents ongoing development work
     */
    class Gear {
      x: number;
      y: number;
      radius: number;
      teeth: number;
      rotation: number;
      rotationSpeed: number;
      color: { h: number; s: number; l: number };
      opacity: number;
      pulsePhase: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 20 + 15;
        this.teeth = Math.floor(Math.random() * 4) + 8;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        this.color = {
          h: Math.random() * 30 + 190,
          s: 60 + Math.random() * 25,
          l: 50 + Math.random() * 20,
        };
        this.opacity = Math.random() * 0.3 + 0.25;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.04;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
        const toothDepth = this.radius * 0.2;

        // Draw gear teeth
        ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l
        }%, ${this.opacity * pulse})`;
        ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l - 10
        }%, ${this.opacity * pulse * 0.5})`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        for (let i = 0; i < this.teeth; i++) {
          const angle = (i / this.teeth) * Math.PI * 2;
          const nextAngle = ((i + 1) / this.teeth) * Math.PI * 2;
          const midAngle = (angle + nextAngle) / 2;

          // Outer tooth edge
          const outerX1 = Math.cos(angle) * (this.radius + toothDepth);
          const outerY1 = Math.sin(angle) * (this.radius + toothDepth);
          const outerX2 = Math.cos(nextAngle) * (this.radius + toothDepth);
          const outerY2 = Math.sin(nextAngle) * (this.radius + toothDepth);

          // Inner tooth edge
          const innerX1 = Math.cos(midAngle - 0.15) * this.radius;
          const innerY1 = Math.sin(midAngle - 0.15) * this.radius;
          const innerX2 = Math.cos(midAngle + 0.15) * this.radius;
          const innerY2 = Math.sin(midAngle + 0.15) * this.radius;

          if (i === 0) ctx.moveTo(innerX1, innerY1);
          ctx.lineTo(outerX1, outerY1);
          ctx.lineTo(outerX2, outerY2);
          ctx.lineTo(innerX2, innerY2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l + 10
        }%, ${this.opacity * pulse * 0.7})`;
        ctx.fill();
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l - 20
        }%, ${this.opacity * pulse})`;
        ctx.fill();

        ctx.restore();
      }
    }

    /**
     * Spark Particle - Welding/construction sparks
     * Small bright particles for energy effect
     */
    class Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: { r: number; g: number; b: number };
      opacity: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1;
        this.life = 0;
        this.maxLife = Math.random() * 30 + 20;
        this.size = Math.random() * 2 + 1;
        this.color = {
          r: 200 + Math.random() * 55,
          g: 180 + Math.random() * 75,
          b: 100 + Math.random() * 100,
        };
        this.opacity = 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.vx *= 0.98; // Air resistance
        this.life++;
        this.opacity = 1 - this.life / this.maxLife;
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
          `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${
            this.opacity * 0.5
          })`
        );
        gradient.addColorStop(
          1,
          `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`
        );

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
     * Tool Icon - Floating construction tools
     * Visual representation of development tools
     */
    class ToolIcon {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      pulsePhase: number;
      color: { h: number; s: number; l: number };

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + 50;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -Math.random() * 1.5 - 0.5;
        const tools = ["⚙️", "🔧", "🔨", "⚡", "🛠️", "⚒️"];
        this.char = tools[Math.floor(Math.random() * tools.length)];
        this.size = Math.random() * 15 + 18;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = {
          h: Math.random() * 40 + 185,
          s: 70,
          l: 65,
        };
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.04;
        return this.y > -100;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        ctx.globalAlpha = this.opacity * pulse;

        // Glow effect
        ctx.shadowColor = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, 0.6)`;
        ctx.shadowBlur = 15;

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.char, 0, 0);

        ctx.restore();
      }
    }

    /**
     * Progress Bar Particle - Animated loading bars
     * Small progress indicators floating around
     */
    class ProgressBarParticle {
      x: number;
      y: number;
      width: number;
      height: number;
      progress: number;
      progressSpeed: number;
      vy: number;
      opacity: number;
      color: { h: number; s: number; l: number };

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + 20;
        this.width = Math.random() * 40 + 30;
        this.height = 4;
        this.progress = Math.random();
        this.progressSpeed = Math.random() * 0.01 + 0.005;
        this.vy = -Math.random() * 0.8 - 0.3;
        this.opacity = Math.random() * 0.4 + 0.3;
        this.color = {
          h: Math.random() * 30 + 180,
          s: 75,
          l: 60,
        };
      }

      update() {
        this.y += this.vy;
        this.progress += this.progressSpeed;
        if (this.progress > 1) this.progress = 0;
        return this.y > -50;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Background bar
        ctx.fillStyle = `rgba(100, 100, 120, ${this.opacity * 0.3})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Progress fill
        const gradient = ctx.createLinearGradient(
          this.x,
          this.y,
          this.x + this.width * this.progress,
          this.y
        );
        gradient.addColorStop(
          0,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${this.opacity})`
        );
        gradient.addColorStop(
          1,
          `hsla(${this.color.h + 20}, ${this.color.s}%, ${
            this.color.l + 10
          }%, ${this.opacity})`
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width * this.progress, this.height);

        // Border
        ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l + 15
        }%, ${this.opacity * 0.8})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
      }
    }

    // ============================================
    // INITIALIZE PARTICLE SYSTEMS
    // ============================================
    const blueprintGrid = new BlueprintGrid();
    const buildingBlocks: BuildingBlock[] = [];
    const gears: Gear[] = [];
    const sparks: Spark[] = [];
    const toolIcons: ToolIcon[] = [];
    const progressBars: ProgressBarParticle[] = [];

    // Create initial particles
    for (let i = 0; i < 10; i++) {
      buildingBlocks.push(new BuildingBlock(canvas.width, canvas.height));
    }

    for (let i = 0; i < 6; i++) {
      gears.push(new Gear(canvas.width, canvas.height));
    }

    for (let i = 0; i < 8; i++) {
      toolIcons.push(new ToolIcon(canvas.width, canvas.height));
    }

    for (let i = 0; i < 5; i++) {
      progressBars.push(new ProgressBarParticle(canvas.width, canvas.height));
    }

    let frame = 0;
    let lastSparkTime = 0;

    // ============================================
    // MAIN ANIMATION LOOP
    // GPU-accelerated rendering
    // ============================================
    const animate = (time: number) => {
      if (!ctx || !canvas) return;

      // Subtle fade for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;

      // Draw blueprint grid
      blueprintGrid.update();
      blueprintGrid.draw(ctx, canvas.width, canvas.height);

      // Spawn sparks occasionally
      if (time - lastSparkTime > 200 && Math.random() > 0.7) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        for (let i = 0; i < 5; i++) {
          sparks.push(new Spark(x, y));
        }
        lastSparkTime = time;
      }

      // Spawn new particles
      if (frame % 40 === 0 && buildingBlocks.length < 15) {
        buildingBlocks.push(new BuildingBlock(canvas.width, canvas.height));
      }

      if (frame % 60 === 0 && toolIcons.length < 12) {
        toolIcons.push(new ToolIcon(canvas.width, canvas.height));
      }

      if (frame % 80 === 0 && progressBars.length < 8) {
        progressBars.push(new ProgressBarParticle(canvas.width, canvas.height));
      }

      // Update and draw gears
      gears.forEach((gear) => {
        gear.update();
        gear.draw(ctx);
      });

      // Update and draw building blocks
      for (let i = buildingBlocks.length - 1; i >= 0; i--) {
        if (!buildingBlocks[i].update()) {
          buildingBlocks.splice(i, 1);
        } else {
          buildingBlocks[i].draw(ctx);
        }
      }

      // Update and draw progress bars
      for (let i = progressBars.length - 1; i >= 0; i--) {
        if (!progressBars[i].update()) {
          progressBars.splice(i, 1);
        } else {
          progressBars[i].draw(ctx);
        }
      }

      // Update and draw tool icons
      for (let i = toolIcons.length - 1; i >= 0; i--) {
        if (!toolIcons[i].update()) {
          toolIcons.splice(i, 1);
        } else {
          toolIcons[i].draw(ctx, time);
        }
      }

      // Update and draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        if (!sparks[i].update()) {
          sparks.splice(i, 1);
        } else {
          sparks[i].draw(ctx);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [isOpen]);

  // ============================================
  // BUILD PROGRESS ANIMATION
  // ============================================
  useEffect(() => {
    if (!isOpen) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 0; // Loop animation
      }
      setBuildProgress(Math.min(progress, 95));
    }, 800);

    controls.start({
      scale: [0.95, 1.02, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    });

    return () => clearInterval(interval);
  }, [isOpen, controls]);

  // Development stages
  const devStages = useMemo(
    () => [
      { name: "Thiết kế", icon: "📐", color: "from-blue-500 to-cyan-500" },
      { name: "Phát triển", icon: "⚙️", color: "from-purple-500 to-pink-500" },
      { name: "Tối ưu", icon: "⚡", color: "from-yellow-500 to-orange-500" },
      { name: "Test", icon: "🧪", color: "from-green-500 to-emerald-500" },
    ],
    []
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/97 z-[9998]"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
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
                  damping: 20,
                  stiffness: 180,
                  duration: 0.7,
                },
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: -30,
                transition: { duration: 0.3 },
              }}
              className="relative pointer-events-auto w-full max-w-md"
            >
              {/* Outer glow */}
              <div className="absolute -inset-16 bg-gradient-to-r from-cyan-600/20 via-blue-500/20 to-purple-600/20 blur-[100px] rounded-full opacity-70" />
              <div className="absolute -inset-12 bg-cyan-500/15 blur-[80px] rounded-full" />
              <div className="absolute -inset-8 bg-blue-500/10 blur-[60px] rounded-full" />

              {/* Main modal */}
              <motion.div
                animate={controls}
                className="relative bg-gradient-to-br from-zinc-950 via-blue-950/30 to-zinc-950 rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_60px_rgba(34,211,238,0.25)] will-change-transform"
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Canvas background - covers entire modal */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-70"
                  style={{
                    mixBlendMode: "screen",
                    transform: "translateZ(0)",
                    zIndex: 1,
                  }}
                />

                {/* Rotating border */}
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
                        rgba(34, 211, 238, 0.5) 60deg,
                        transparent 120deg,
                        rgba(139, 92, 246, 0.4) 240deg,
                        transparent 300deg,
                        rgba(59, 130, 246, 0.4) 330deg,
                        transparent 360deg)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8">
                  {/* Gear icon with rotation */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Pulsing rings */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -inset-10 bg-gradient-radial from-cyan-500/30 to-transparent rounded-full blur-2xl"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                        className="absolute -inset-8 bg-gradient-radial from-blue-500/25 to-transparent rounded-full blur-xl"
                      />

                      {/* Rotating gear icon */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="relative text-6xl"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(34, 211, 238, 0.7))",
                        }}
                      >
                        ⚙️
                      </motion.div>

                      {/* Orbiting progress indicators */}
                      {[0, 90, 180, 270].map((angle, i) => (
                        <motion.div
                          key={i}
                          animate={{ rotate: -360 }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.3,
                          }}
                          className="absolute inset-0"
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                            className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                            style={{
                              top: "50%",
                              left: "50%",
                              transform: `rotate(${angle}deg) translateY(-35px) translateX(-1px)`,
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
                      className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-transparent mb-2"
                      style={{
                        fontFamily: "'Roboto', 'Inter', sans-serif",
                        letterSpacing: "0.1em",
                        filter: "drop-shadow(0 0 12px rgba(34,211,238,0.2))",
                      }}
                    >
                      ĐANG PHÁT TRIỂN
                    </h2>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
                    />
                  </motion.div>

                  {/* Message */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="space-y-2.5 mb-5 text-center"
                  >
                    <p
                      className="text-base font-semibold text-cyan-200/95"
                      style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }}
                    >
                      {gameName}
                    </p>
                    <p className="text-sm text-gray-300/75 leading-relaxed px-2">
                      Bí cảnh đang được xây dựng bởi đội ngũ phát triển
                    </p>
                    <p className="text-xs text-gray-400/65">
                      Shader optimization, physics engine & AI system đang hoàn
                      thiện
                    </p>
                  </motion.div>

                  {/* Development stages */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="grid grid-cols-2 gap-2 mb-5"
                  >
                    {devStages.map((stage, i) => (
                      <motion.div
                        key={stage.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                        className={`px-3 py-2 bg-gradient-to-r ${stage.color} bg-opacity-10 border border-cyan-500/30 rounded-lg text-xs font-medium text-cyan-300/90 backdrop-blur-sm flex items-center gap-2`}
                      >
                        <span className="text-base">{stage.icon}</span>
                        <span>{stage.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Progress bar */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mb-2"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-cyan-300/80 font-mono">
                        Tiến độ
                      </span>
                      <span className="text-xs text-cyan-400 font-mono font-bold">
                        {Math.round(buildProgress)}%
                      </span>
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg h-2.5 overflow-hidden border border-cyan-500/20">
                      <motion.div
                        animate={{ width: `${buildProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-400 to-purple-500 shadow-[0_0_15px_rgba(34,211,238,0.6)] relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ x: ["0%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Status text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-xs text-gray-400/70 mb-6 font-mono"
                  >
                    Đội ngũ đang nỗ lực hoàn thiện...
                  </motion.p>

                  {/* Close button */}
                  <motion.button
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 25px rgba(34, 211, 238, 0.4)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 tracking-wider">
                      ĐÃ HIỂU
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
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
