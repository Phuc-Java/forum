"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { pressStart2P } from "./fonts"; // Giữ nguyên import font của bạn

// --- CẤU HÌNH SIÊU CẤP ---
const CONFIG = {
  WIDTH: 600,
  HEIGHT: 300,
  PADDLE_W: 12,
  PADDLE_H: 70,
  BALL_R: 6,
  WALL_OFFSET: 15,
  WIN_SCORE: 10,
  // Tốc độ
  INITIAL_SPEED: 8,
  MAX_SPEED: 25,
  ACCELERATION: 1.1, // Tăng tốc mỗi lần chạm
  // AI
  AI_REACTION: 0.15, // Tốc độ phản xạ (càng cao càng nhanh, 0.15 là rất mượt nhưng nhanh)
  AI_ERROR_MARGIN: 5, // Sai số pixel cực nhỏ
  // Hiệu ứng
  PARTICLE_COUNT: 40,
  TRAIL_LENGTH: 15,
  SHAKE_DECAY: 0.9,
  GRID_SIZE: 40,
  COLORS: {
    PLAYER: "#00f3ff", // Cyan Neon
    ENEMY: "#ff0055", // Magenta Neon
    BALL: "#ffffff",
    TEXT: "#ffffff",
    BG: "#050505",
  },
};

// --- HỆ THỐNG PARTICLE & VẬT LÝ ---
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string, speedMultiplier: number) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * speedMultiplier + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.03; // Tan dần
    this.size *= 0.95; // Nhỏ dần
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// --- COMPONENT CHÍNH ---
const PongGameUltimate = () => {
  // --- STATE REACT ---
  const [score, setScore] = useState({ p: 0, c: 0 });
  const [gameState, setGameState] = useState<"MENU" | "PLAYING" | "ENDED">(
    "MENU"
  );
  const [winner, setWinner] = useState<"PLAYER" | "COMPUTER" | null>(null);

  // --- REFS (TRÁNH RENDER LẠI) ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number | null>(null);

  // Game Loop State (Mutable object for performance)
  const engine = useRef({
    // Objects
    playerY: CONFIG.HEIGHT / 2,
    computerY: CONFIG.HEIGHT / 2,
    ball: {
      x: CONFIG.WIDTH / 2,
      y: CONFIG.HEIGHT / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      trail: [] as { x: number; y: number }[], // Lưu vị trí cũ để vẽ đuôi
    },
    // Effects
    particles: [] as Particle[],
    shake: 0,
    glitch: 0,
    backgroundOffset: 0,
    // Input
    mouseY: CONFIG.HEIGHT / 2,
    // AI Prediction
    predictedY: CONFIG.HEIGHT / 2,
  });

  // --- LOGIC ---

  const initBall = (direction: 1 | -1) => {
    const e = engine.current;
    e.ball.x = CONFIG.WIDTH / 2;
    e.ball.y = CONFIG.HEIGHT / 2;
    e.ball.speed = CONFIG.INITIAL_SPEED;
    e.ball.trail = [];

    // Góc ngẫu nhiên nhưng không quá dốc
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
    e.ball.vx = direction * e.ball.speed * Math.cos(angle);
    e.ball.vy = e.ball.speed * Math.sin(angle);

    // Reset AI target
    e.predictedY = CONFIG.HEIGHT / 2;
  };

  const spawnExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      engine.current.particles.push(new Particle(x, y, color, 4));
    }
  };

  // --- AI SIÊU CẤP (PREDICTION) ---
  const predictBallLanding = () => {
    const e = engine.current;

    // Chỉ tính toán khi bóng đang bay về phía máy (vx > 0)
    if (e.ball.vx > 0) {
      let simX = e.ball.x;
      let simY = e.ball.y;
      let simVy = e.ball.vy;
      // Tính thời gian bóng bay tới mặt vợt máy
      const paddleX = CONFIG.WIDTH - CONFIG.WALL_OFFSET - CONFIG.PADDLE_W;

      // Mô phỏng quỹ đạo (đơn giản hóa)
      while (simX < paddleX) {
        simX += e.ball.vx; // Bước nhảy lớn để tiết kiệm CPU
        simY += simVy;

        // Xử lý va chạm tường trong mô phỏng
        if (simY < 0 || simY > CONFIG.HEIGHT) {
          simVy = -simVy;
        }
      }
      e.predictedY = simY;
    } else {
      // Khi bóng bay đi, AI di chuyển về giữa để thủ
      e.predictedY = CONFIG.HEIGHT / 2;
    }
  };

  const update = () => {
    if (gameState !== "PLAYING") return;
    const e = engine.current;

    // 1. Player Movement (Smooth Lerp)
    // Giới hạn trong sân
    const targetPlayerY = Math.max(
      CONFIG.PADDLE_H / 2,
      Math.min(CONFIG.HEIGHT - CONFIG.PADDLE_H / 2, e.mouseY)
    );
    e.playerY += (targetPlayerY - e.playerY) * 0.2;

    // 2. AI Movement (God Mode)
    // AI sẽ di chuyển tới vị trí dự đoán (predictedY)
    // AI_REACTION 0.15 là rất nhanh, gần như con người phản xạ cực đỉnh
    e.computerY += (e.predictedY - e.computerY) * CONFIG.AI_REACTION;
    // Giới hạn AI
    e.computerY = Math.max(
      CONFIG.PADDLE_H / 2,
      Math.min(CONFIG.HEIGHT - CONFIG.PADDLE_H / 2, e.computerY)
    );

    // 3. Ball Physics
    e.ball.x += e.ball.vx;
    e.ball.y += e.ball.vy;

    // Lưu trail
    e.ball.trail.push({ x: e.ball.x, y: e.ball.y });
    if (e.ball.trail.length > CONFIG.TRAIL_LENGTH) e.ball.trail.shift();

    // Wall Hit
    if (
      e.ball.y <= CONFIG.BALL_R ||
      e.ball.y >= CONFIG.HEIGHT - CONFIG.BALL_R
    ) {
      e.ball.vy = -e.ball.vy;
      e.shake = 3; // Rung nhẹ khi chạm tường
    }

    // Paddle Hit Logic
    const paddleLeft = CONFIG.WALL_OFFSET + CONFIG.PADDLE_W;
    const paddleRight = CONFIG.WIDTH - CONFIG.WALL_OFFSET - CONFIG.PADDLE_W;

    // -- Check Player Hit --
    if (
      e.ball.x - CONFIG.BALL_R < paddleLeft &&
      e.ball.x > CONFIG.WALL_OFFSET &&
      Math.abs(e.ball.y - e.playerY) < CONFIG.PADDLE_H / 2 + CONFIG.BALL_R
    ) {
      // Hit Player
      const hitPoint = (e.ball.y - e.playerY) / (CONFIG.PADDLE_H / 2);
      const angle = hitPoint * (Math.PI / 4); // Góc đánh tối đa 45 độ

      e.ball.speed = Math.min(
        e.ball.speed * CONFIG.ACCELERATION,
        CONFIG.MAX_SPEED
      );
      e.ball.vx = Math.abs(e.ball.speed * Math.cos(angle)); // Luôn dương
      e.ball.vy = e.ball.speed * Math.sin(angle);
      e.ball.x = paddleLeft + CONFIG.BALL_R; // Tránh kẹt bóng

      spawnExplosion(e.ball.x, e.ball.y, CONFIG.COLORS.PLAYER);
      e.shake = 10;
      e.glitch = 5;
      predictBallLanding(); // Tính toán lại cho AI ngay khi bóng bị đánh
    }

    // -- Check AI Hit --
    else if (
      e.ball.x + CONFIG.BALL_R > paddleRight &&
      e.ball.x < CONFIG.WIDTH - CONFIG.WALL_OFFSET &&
      Math.abs(e.ball.y - e.computerY) < CONFIG.PADDLE_H / 2 + CONFIG.BALL_R
    ) {
      // Hit AI
      const hitPoint = (e.ball.y - e.computerY) / (CONFIG.PADDLE_H / 2);
      const angle = hitPoint * (Math.PI / 4);

      e.ball.speed = Math.min(
        e.ball.speed * CONFIG.ACCELERATION,
        CONFIG.MAX_SPEED
      );
      e.ball.vx = -Math.abs(e.ball.speed * Math.cos(angle)); // Luôn âm
      e.ball.vy = e.ball.speed * Math.sin(angle);
      e.ball.x = paddleRight - CONFIG.BALL_R;

      spawnExplosion(e.ball.x, e.ball.y, CONFIG.COLORS.ENEMY);
      e.shake = 10;
      e.glitch = 5;
    }

    // Scoring
    if (e.ball.x < 0) {
      // AI ghi bàn
      setScore((s) => ({ ...s, c: s.c + 1 }));
      e.shake = 20;
      initBall(1);
    } else if (e.ball.x > CONFIG.WIDTH) {
      // Player ghi bàn
      setScore((s) => ({ ...s, p: s.p + 1 }));
      e.shake = 20;
      initBall(-1);
    }

    // Hiệu ứng nền & rung
    e.backgroundOffset = (e.backgroundOffset + 0.5) % CONFIG.GRID_SIZE;
    if (e.shake > 0) e.shake *= CONFIG.SHAKE_DECAY;
    if (e.shake < 0.5) e.shake = 0;
    if (e.glitch > 0) e.glitch--;

    // Update Particles
    for (let i = e.particles.length - 1; i >= 0; i--) {
      const p = e.particles[i];
      p.update();
      if (p.life <= 0) e.particles.splice(i, 1);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const e = engine.current;

    // --- SETUP DRAW ---
    ctx.save();

    // Screen Shake apply global
    if (e.shake > 0) {
      const dx = (Math.random() - 0.5) * e.shake;
      const dy = (Math.random() - 0.5) * e.shake;
      ctx.translate(dx, dy);
    }

    // 1. Clear & Background (Dark Void)
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // 2. Retro Grid (Moving)
    ctx.strokeStyle = "rgba(0, 243, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Dọc
    for (let x = 0; x <= CONFIG.WIDTH; x += CONFIG.GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CONFIG.HEIGHT);
    }
    // Ngang (Moving)
    for (
      let y = e.backgroundOffset - CONFIG.GRID_SIZE;
      y <= CONFIG.HEIGHT;
      y += CONFIG.GRID_SIZE
    ) {
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.WIDTH, y);
    }
    ctx.stroke();

    // 3. Center Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CONFIG.WIDTH / 2, 0);
    ctx.lineTo(CONFIG.WIDTH / 2, CONFIG.HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Particles (Nổ phía sau các vật thể)
    e.particles.forEach((p) => p.draw(ctx));

    // 5. Draw Paddles (Neon Glow)
    const drawPaddle = (x: number, y: number, color: string) => {
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      // Glitch effect nếu đang va chạm mạnh
      let gx = x;
      if (e.glitch > 0) gx += (Math.random() - 0.5) * 5;

      // Vẽ hình chữ nhật bo tròn nhẹ
      ctx.fillRect(
        gx,
        y - CONFIG.PADDLE_H / 2,
        CONFIG.PADDLE_W,
        CONFIG.PADDLE_H
      );

      // Lõi trắng bên trong để tạo cảm giác sáng cực mạnh
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(
        gx + 2,
        y - CONFIG.PADDLE_H / 2 + 2,
        CONFIG.PADDLE_W - 4,
        CONFIG.PADDLE_H - 4
      );
    };

    drawPaddle(CONFIG.WALL_OFFSET, e.playerY, CONFIG.COLORS.PLAYER);
    drawPaddle(
      CONFIG.WIDTH - CONFIG.WALL_OFFSET - CONFIG.PADDLE_W,
      e.computerY,
      CONFIG.COLORS.ENEMY
    );

    // 6. Draw Ball & Trail
    if (gameState === "PLAYING") {
      // Vẽ đuôi (Trail)
      e.ball.trail.forEach((pos, index) => {
        const ratio = index / e.ball.trail.length;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, CONFIG.BALL_R * ratio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ratio * 0.5})`;
        ctx.fill();
      });

      // Vẽ bóng chính
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#fff";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(e.ball.x, e.ball.y, CONFIG.BALL_R, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Scanline Overlay (TV effect)
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let i = 0; i < CONFIG.HEIGHT; i += 2) {
      ctx.fillRect(0, i, CONFIG.WIDTH, 1);
    }

    ctx.restore();
  };

  const gameLoop = useCallback(() => {
    update();
    draw();
    reqRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [gameLoop]);

  // Mouse Handler (Global)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      engine.current.mouseY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Check Win Condition
  useEffect(() => {
    if (score.p >= CONFIG.WIN_SCORE) {
      setWinner("PLAYER");
      setGameState("ENDED");
    } else if (score.c >= CONFIG.WIN_SCORE) {
      setWinner("COMPUTER");
      setGameState("ENDED");
    }
  }, [score]);

  return (
    <div className={`ultimate-pong ${pressStart2P.variable}`}>
      <div
        ref={containerRef}
        className="crt-container"
        style={{ width: CONFIG.WIDTH, height: CONFIG.HEIGHT }}
      >
        <canvas
          ref={canvasRef}
          width={CONFIG.WIDTH}
          height={CONFIG.HEIGHT}
          className="game-canvas"
        />

        {/* UI OVERLAY */}
        <div className="ui-layer">
          <div className="score-board">
            <h1 className="p-score glitch" data-text={score.p}>
              {score.p}
            </h1>
            <div className="divider" />
            <h1 className="c-score glitch" data-text={score.c}>
              {score.c}
            </h1>
          </div>

          {gameState === "MENU" && (
            <div className="menu">
              <h2 className="title neon-text">NEON PONG</h2>
              <p className="subtitle">FIRST TO 10 WINS</p>
              <button
                className="start-btn"
                onClick={() => {
                  initBall(Math.random() > 0.5 ? 1 : -1);
                  setScore({ p: 0, c: 0 });
                  setGameState("PLAYING");
                }}
              >
                START SYSTEM
              </button>
            </div>
          )}

          {gameState === "ENDED" && (
            <div className="menu">
              <h2
                className="title neon-text"
                style={{
                  color:
                    winner === "PLAYER"
                      ? CONFIG.COLORS.PLAYER
                      : CONFIG.COLORS.ENEMY,
                }}
              >
                {winner === "PLAYER" ? "SYSTEM HACKED" : "SYSTEM FAILURE"}
              </h2>
              <p className="subtitle">
                {winner === "PLAYER" ? "YOU ARE GODLIKE" : "TRY HARDER HUMAN"}
              </p>
              <button
                className="start-btn"
                onClick={() => {
                  initBall(Math.random() > 0.5 ? 1 : -1);
                  setScore({ p: 0, c: 0 });
                  setGameState("PLAYING");
                }}
              >
                REBOOT
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ultimate-pong {
          position: absolute;
          top: 5%; /* GIỮ NGUYÊN VỊ TRÍ NHƯ YÊU CẦU */
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          font-family: var(--font-press-start), monospace;
          user-select: none;
        }

        .crt-container {
          position: relative;
          background: #000;
          border: 2px solid #333;
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.2),
            0 0 50px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 0, 0, 1);
          overflow: hidden;
          border-radius: 4px;
        }

        .game-canvas {
          display: block;
          /* Tăng độ nét trên màn hình retina */
          image-rendering: pixelated;
        }

        .ui-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-board {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 40px;
          z-index: 2;
        }

        .p-score {
          color: ${CONFIG.COLORS.PLAYER};
          text-shadow: 0 0 10px ${CONFIG.COLORS.PLAYER};
          font-size: 32px;
          margin: 0;
        }
        .c-score {
          color: ${CONFIG.COLORS.ENEMY};
          text-shadow: 0 0 10px ${CONFIG.COLORS.ENEMY};
          font-size: 32px;
          margin: 0;
        }
        .divider {
          width: 2px;
          height: 20px;
          background: #333;
        }

        .menu {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          pointer-events: auto;
          animation: fadeIn 0.3s ease;
        }

        .title {
          font-size: 40px;
          margin: 0;
          letter-spacing: 2px;
        }

        .neon-text {
          color: #fff;
          text-shadow: 0 0 5px #fff, 0 0 10px #fff,
            0 0 20px ${CONFIG.COLORS.PLAYER}, 0 0 40px ${CONFIG.COLORS.PLAYER};
          animation: pulsate 1.5s infinite alternate;
        }

        .subtitle {
          color: #aaa;
          font-size: 12px;
          margin: 0;
        }

        .start-btn {
          background: transparent;
          border: 2px solid ${CONFIG.COLORS.PLAYER};
          color: ${CONFIG.COLORS.PLAYER};
          padding: 12px 30px;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
        }

        .start-btn:hover {
          background: ${CONFIG.COLORS.PLAYER};
          color: #000;
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.8);
          transform: scale(1.05);
        }

        @keyframes pulsate {
          100% {
            text-shadow: 0 0 4px #fff, 0 0 10px #fff,
              0 0 20px ${CONFIG.COLORS.PLAYER};
          }
          0% {
            text-shadow: 0 0 2px #fff, 0 0 5px #fff,
              0 0 10px ${CONFIG.COLORS.PLAYER};
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PongGameUltimate;
