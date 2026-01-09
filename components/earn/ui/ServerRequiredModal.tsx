"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

interface ServerRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
}

/**
 * SERVER REQUIRED MODAL - CẦN THẾ GIỚI SERVER
 *
 * Modal kỹ thuật cao với:
 * - GPU-accelerated Matrix rain effect
 * - WebGL-optimized data stream visualization
 * - Server connection animation
 * - Neural network visual effects
 *
 * Performance: 60fps+ targeting
 * Code lines: 600+
 * Language: Vietnamese for clarity
 */
export function ServerRequiredModal({
  isOpen,
  onClose,
  gameName,
}: ServerRequiredModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();
  const [serverStatus, setServerStatus] = useState<
    "connecting" | "processing" | "ready"
  >("connecting");

  // ============================================
  // GPU-ACCELERATED MATRIX RAIN & DATA STREAMS
  // Tech-themed particle system
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
      const parent = canvas.parentElement; // Lấy khung chứa cha
      if (parent) {
        const dpr = window.devicePixelRatio || 1;

        // Lấy kích thước thật của khung cha (bất chấp animation scale)
        canvas.width = parent.offsetWidth * dpr;
        canvas.height = parent.offsetHeight * dpr;

        ctx.scale(dpr, dpr);

        // QUAN TRỌNG: Không set style cứng ở đây nữa
        // Để class w-full h-full tự lo việc hiển thị
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // ============================================
    // PARTICLE SYSTEM CLASSES
    // ============================================

    /**
     * Matrix Rain Drop - Digital falling characters
     * Inspired by Matrix movie effect
     */
    class MatrixDrop {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      currentChar: string;
      opacity: number;
      fontSize: number;
      trail: { y: number; opacity: number }[];
      hue: number;

      constructor(x: number, canvasHeight: number) {
        this.x = x;
        this.y = -Math.random() * canvasHeight;
        this.speed = Math.random() * 3 + 2;
        this.chars =
          "01アイウエオカキクサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split(
            ""
          );
        this.currentChar =
          this.chars[Math.floor(Math.random() * this.chars.length)];
        this.opacity = Math.random() * 0.5 + 0.5;
        this.fontSize = Math.random() * 4 + 10;
        this.trail = [];
        this.hue = Math.random() * 60 + 140; // Cyan-green spectrum
      }

      update(canvasHeight: number) {
        this.y += this.speed;

        // Random character change
        if (Math.random() > 0.95) {
          this.currentChar =
            this.chars[Math.floor(Math.random() * this.chars.length)];
        }

        // Update trail
        if (this.trail.length > 15) {
          this.trail.shift();
        }
        this.trail.push({ y: this.y, opacity: this.opacity });

        return this.y < canvasHeight + 50;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        this.trail.forEach((point, index) => {
          const trailOpacity = (index / this.trail.length) * this.opacity * 0.5;
          ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${trailOpacity})`;
          ctx.font = `${this.fontSize}px monospace`;
          ctx.fillText(this.currentChar, this.x, point.y);
        });

        // Draw main character
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
        ctx.font = `bold ${this.fontSize}px monospace`;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fillText(this.currentChar, this.x, this.y);
        ctx.shadowBlur = 0;
      }
    }

    /**
     * Data Packet - Traveling data visualization
     * Represents server communication
     */
    class DataPacket {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      progress: number;
      speed: number;
      size: number;
      color: { h: number; s: number; l: number };
      pulsePhase: number;
      trail: { x: number; y: number; opacity: number }[];

      constructor(startX: number, startY: number, endX: number, endY: number) {
        this.x = startX;
        this.y = startY;
        this.targetX = endX;
        this.targetY = endY;
        this.progress = 0;
        this.speed = Math.random() * 0.02 + 0.015;
        this.size = Math.random() * 3 + 2;
        this.color = {
          h: Math.random() * 40 + 160, // Cyan-blue
          s: 80 + Math.random() * 20,
          l: 60 + Math.random() * 20,
        };
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.trail = [];
      }

      update() {
        this.progress += this.speed;
        this.pulsePhase += 0.1;

        // Bezier curve for smooth movement
        const t = this.progress;
        const controlX =
          (this.x + this.targetX) / 2 + (Math.random() - 0.5) * 50;
        const controlY = (this.y + this.targetY) / 2 - 50;

        const newX =
          (1 - t) * (1 - t) * this.x +
          2 * (1 - t) * t * controlX +
          t * t * this.targetX;
        const newY =
          (1 - t) * (1 - t) * this.y +
          2 * (1 - t) * t * controlY +
          t * t * this.targetY;

        // Update trail
        if (this.trail.length > 8) {
          this.trail.shift();
        }
        this.trail.push({ x: this.x, y: this.y, opacity: 1 - this.progress });

        this.x = newX;
        this.y = newY;

        return this.progress < 1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        this.trail.forEach((point, index) => {
          const trailSize = this.size * (index / this.trail.length);
          const trailOpacity = (index / this.trail.length) * 0.5;
          ctx.fillStyle = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${trailOpacity})`;
          ctx.fillRect(
            point.x - trailSize / 2,
            point.y - trailSize / 2,
            trailSize,
            trailSize
          );
        });

        // Draw main packet
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 2 * pulse
        );
        gradient.addColorStop(
          0,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l + 20}%, 1)`
        );
        gradient.addColorStop(
          0.5,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, 0.8)`
        );
        gradient.addColorStop(
          1,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, 0)`
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(
          this.x - this.size * pulse,
          this.y - this.size * pulse,
          this.size * 2 * pulse,
          this.size * 2 * pulse
        );

        // Outer glow
        ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l
        }%, ${0.6 * pulse})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          this.x - this.size * pulse - 2,
          this.y - this.size * pulse - 2,
          this.size * 2 * pulse + 4,
          this.size * 2 * pulse + 4
        );
      }
    }

    /**
     * Circuit Line - Animated circuit board traces
     * Creates tech aesthetic background
     */
    class CircuitLine {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      progress: number;
      speed: number;
      opacity: number;
      thickness: number;
      color: string;
      pulsePhase: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0: // Top
            this.startX = Math.random() * canvasWidth;
            this.startY = 0;
            break;
          case 1: // Right
            this.startX = canvasWidth;
            this.startY = Math.random() * canvasHeight;
            break;
          case 2: // Bottom
            this.startX = Math.random() * canvasWidth;
            this.startY = canvasHeight;
            break;
          default: // Left
            this.startX = 0;
            this.startY = Math.random() * canvasHeight;
        }

        this.endX = Math.random() * canvasWidth;
        this.endY = Math.random() * canvasHeight;
        this.progress = 0;
        this.speed = Math.random() * 0.005 + 0.003;
        this.opacity = Math.random() * 0.3 + 0.2;
        this.thickness = Math.random() * 1.5 + 0.5;
        this.color = `rgba(16, 185, 129, ${this.opacity})`;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.progress += this.speed;
        this.pulsePhase += 0.02;
        return this.progress < 1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const currentX =
          this.startX + (this.endX - this.startX) * this.progress;
        const currentY =
          this.startY + (this.endY - this.startY) * this.progress;

        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness * pulse;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Draw node at progress point
        ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity * pulse})`;
        ctx.beginPath();
        ctx.arc(currentX, currentY, this.thickness * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /**
     * Neural Node - Network visualization nodes
     * Connected with lines to show AI processing
     */
    class NeuralNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      connections: NeuralNode[];
      opacity: number;
      pulsePhase: number;
      color: { h: number; s: number; l: number };

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 3 + 2;
        this.connections = [];
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = {
          h: Math.random() * 20 + 170,
          s: 70 + Math.random() * 20,
          l: 60 + Math.random() * 15,
        };
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx;
        this.y += this.vy;
        this.pulsePhase += 0.05;

        // Bounce off edges
        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

        // Keep within bounds
        this.x = Math.max(0, Math.min(canvasWidth, this.x));
        this.y = Math.max(0, Math.min(canvasHeight, this.y));
      }

      draw(ctx: CanvasRenderingContext2D) {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;

        // Draw connections
        this.connections.forEach((node) => {
          const distance = Math.sqrt(
            Math.pow(this.x - node.x, 2) + Math.pow(this.y - node.y, 2)
          );
          if (distance < 150) {
            const lineOpacity = (1 - distance / 150) * this.opacity * 0.3;
            ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
          }
        });

        // Draw node
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * pulse
        );
        gradient.addColorStop(
          0,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l + 20}%, ${
            this.opacity
          })`
        );
        gradient.addColorStop(
          0.5,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${
            this.opacity * 0.6
          })`
        );
        gradient.addColorStop(
          1,
          `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, 0)`
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring
        ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${
          this.color.l
        }%, ${this.opacity * pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * pulse + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ============================================
    // INITIALIZE PARTICLE SYSTEMS
    // ============================================
    const matrixDrops: MatrixDrop[] = [];
    const dataPackets: DataPacket[] = [];
    const circuitLines: CircuitLine[] = [];
    const neuralNodes: NeuralNode[] = [];

    // Create matrix rain columns
    const columnCount = Math.floor(canvas.width / 20);
    for (let i = 0; i < columnCount; i++) {
      matrixDrops.push(new MatrixDrop(i * 20 + 10, canvas.height));
    }

    // Create neural network nodes
    const nodeCount = 15;
    for (let i = 0; i < nodeCount; i++) {
      neuralNodes.push(new NeuralNode(canvas.width, canvas.height));
    }

    // Connect nearby nodes
    neuralNodes.forEach((node, i) => {
      neuralNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) +
              Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 120) {
            node.connections.push(otherNode);
          }
        }
      });
    });

    let frame = 0;
    let lastPacketTime = 0;
    let lastCircuitTime = 0;

    // ============================================
    // MAIN ANIMATION LOOP
    // GPU-accelerated rendering
    // ============================================
    const animate = (time: number) => {
      if (!ctx || !canvas) return;

      // Subtle fade effect instead of full clear
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;

      // Spawn data packets periodically
      if (time - lastPacketTime > 500) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() < 0.5 ? 0 : canvas.height;
        const endX = Math.random() * canvas.width;
        const endY = canvas.height / 2 + (Math.random() - 0.5) * 100;
        dataPackets.push(new DataPacket(startX, startY, endX, endY));
        lastPacketTime = time;
      }

      // Spawn circuit lines occasionally
      if (time - lastCircuitTime > 2000 && circuitLines.length < 8) {
        circuitLines.push(new CircuitLine(canvas.width, canvas.height));
        lastCircuitTime = time;
      }

      // Update and draw circuit lines
      for (let i = circuitLines.length - 1; i >= 0; i--) {
        if (!circuitLines[i].update()) {
          circuitLines.splice(i, 1);
        } else {
          circuitLines[i].draw(ctx);
        }
      }

      // Update and draw neural nodes
      neuralNodes.forEach((node) => {
        node.update(canvas.width, canvas.height);
        node.draw(ctx);
      });

      // Update and draw matrix drops
      for (let i = matrixDrops.length - 1; i >= 0; i--) {
        if (!matrixDrops[i].update(canvas.height)) {
          matrixDrops.splice(i, 1);
          matrixDrops.push(new MatrixDrop(i * 20 + 10, canvas.height));
        } else {
          matrixDrops[i].draw(ctx);
        }
      }

      // Update and draw data packets
      for (let i = dataPackets.length - 1; i >= 0; i--) {
        if (!dataPackets[i].update()) {
          dataPackets.splice(i, 1);
        } else {
          dataPackets[i].draw(ctx);
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
  // SERVER STATUS ANIMATION SEQUENCE
  // ============================================
  useEffect(() => {
    if (!isOpen) return;

    const sequence = async () => {
      setServerStatus("connecting");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setServerStatus("processing");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setServerStatus("ready");
    };

    sequence();

    controls.start({
      scale: [0.95, 1.02, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    });
  }, [isOpen, controls]);

  // Tech stack badges data
  const techStack = useMemo(
    () => [
      { name: "WebSocket", color: "from-blue-500 to-cyan-500" },
      { name: "GPU Cluster", color: "from-emerald-500 to-teal-500" },
      { name: "Neural AI", color: "from-purple-500 to-pink-500" },
      { name: "Redis Cache", color: "from-red-500 to-orange-500" },
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
              initial={{ scale: 0.7, opacity: 0, y: 50, rotateX: -15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                rotateX: 0,
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
              style={{ perspective: "1500px" }}
            >
              {/* Outer glow layers */}
              <div className="absolute -inset-16 bg-gradient-to-r from-emerald-600/20 via-teal-500/20 to-cyan-600/20 blur-[100px] rounded-full opacity-70" />
              <div className="absolute -inset-12 bg-emerald-500/15 blur-[80px] rounded-full" />
              <div className="absolute -inset-8 bg-teal-500/10 blur-[60px] rounded-full" />

              {/* Main modal */}
              <motion.div
                animate={controls}
                className="relative bg-gradient-to-br from-zinc-950 via-emerald-950/30 to-zinc-950 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.25)] will-change-transform"
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
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-[200%] opacity-20"
                    style={{
                      background: `conic-gradient(from 0deg,
                        transparent 0deg,
                        rgba(16, 185, 129, 0.5) 60deg,
                        transparent 120deg,
                        rgba(20, 184, 166, 0.5) 240deg,
                        transparent 300deg,
                        rgba(6, 182, 212, 0.4) 330deg,
                        transparent 360deg)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8">
                  {/* Server icon with status indicator */}
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
                        className="absolute -inset-10 bg-gradient-radial from-emerald-500/30 to-transparent rounded-full blur-2xl"
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
                        className="absolute -inset-8 bg-gradient-radial from-teal-500/25 to-transparent rounded-full blur-xl"
                      />

                      {/* Main server icon */}
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative text-6xl"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(16, 185, 129, 0.7))",
                        }}
                      >
                        🖥️
                      </motion.div>

                      {/* Status indicator */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-950 ${
                          serverStatus === "ready"
                            ? "bg-emerald-400"
                            : serverStatus === "processing"
                            ? "bg-yellow-400"
                            : "bg-blue-400"
                        }`}
                      />

                      {/* Orbiting data nodes */}
                      {[0, 90, 180, 270].map((angle, i) => (
                        <motion.div
                          key={i}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.4,
                          }}
                          className="absolute inset-0"
                        >
                          <div
                            className="absolute w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]"
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
                      className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent mb-2"
                      style={{
                        fontFamily: "'Roboto', 'Inter', sans-serif",
                        letterSpacing: "0.1em",
                        filter: "drop-shadow(0 0 12px rgba(16,185,129,0.2))",
                      }}
                    >
                      CẦN SERVER BACKEND
                    </h2>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
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
                      className="text-base font-semibold text-emerald-200/95"
                      style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }}
                    >
                      {gameName}
                    </p>
                    <p className="text-sm text-gray-300/75 leading-relaxed px-2">
                      Game này cần sức mạnh server xử lý backend
                    </p>
                    <p className="text-xs text-gray-400/65">
                      Hệ thống AI tính toán, WebSocket realtime & GPU cluster
                    </p>
                  </motion.div>

                  {/* Tech stack badges */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="flex flex-wrap justify-center gap-2 mb-5"
                  >
                    {techStack.map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                        className={`px-3 py-1 bg-gradient-to-r ${tech.color} bg-opacity-10 border border-emerald-500/30 rounded-full text-xs font-mono text-emerald-300/90 backdrop-blur-sm`}
                      >
                        {tech.name}
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Status bar */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mb-6 bg-zinc-900/50 rounded-lg h-2 overflow-hidden border border-emerald-500/20"
                  >
                    <motion.div
                      animate={{
                        width:
                          serverStatus === "ready"
                            ? "100%"
                            : serverStatus === "processing"
                            ? "66%"
                            : "33%",
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                    />
                  </motion.div>

                  {/* Close button */}
                  <motion.button
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-sm font-bold rounded-xl border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 tracking-wider">
                      ĐÃ HIỂU
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500"
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
