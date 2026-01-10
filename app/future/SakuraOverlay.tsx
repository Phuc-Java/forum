"use client";

import { useEffect, useRef } from "react";

// Cấu hình hiệu ứng
const CONFIG = {
  PETAL_COUNT: 150, // Số lượng cánh hoa (tăng lên nếu máy mạnh, 150 là đẹp)
  BASE_SPEED: 1, // Tốc độ rơi cơ bản (thấp để tạo cảm giác êm dịu)
  VAR_SPEED: 1, // Biến thiên tốc độ
  WIND: 0.5, // Gió thổi ngang
  COLORS: [
    "rgba(255, 183, 178, 0.8)", // Hồng phấn đậm
    "rgba(255, 209, 220, 0.8)", // Hồng nhạt
    "rgba(255, 255, 255, 0.9)", // Trắng sáng
    "rgba(255, 192, 203, 0.6)", // Hồng trong suốt
  ],
};

class Petal {
  x!: number;
  y!: number;
  z!: number; // Độ sâu giả lập (kích thước)
  vx!: number;
  vy!: number;
  width!: number;
  height!: number;
  rotation!: number;
  rotationSpeed!: number;
  color!: string;
  canvasWidth!: number;
  canvasHeight!: number;
  flip!: number;
  flipSpeed!: number;

  constructor(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * this.canvasWidth;
    // Nếu là lần đầu, rải đều khắp màn hình. Nếu không, bắt đầu từ trên đỉnh.
    this.y = initial ? Math.random() * this.canvasHeight : -20;
    this.z = Math.random() * 0.5 + 0.5; // Hệ số tỷ lệ 0.5 -> 1.0

    // Kích thước ngẫu nhiên dựa trên độ sâu z
    const size = Math.random() * 10 + 10;
    this.width = size * this.z;
    this.height = size * 0.8 * this.z;

    // Tốc độ rơi và gió
    this.vy = (CONFIG.BASE_SPEED + Math.random() * CONFIG.VAR_SPEED) * this.z;
    this.vx = (Math.random() - 0.5) * 1 + CONFIG.WIND;

    // Góc xoay
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;

    // Hiệu ứng lật cánh hoa (3D giả)
    this.flip = Math.random();
    this.flipSpeed = Math.random() * 0.03;

    this.color =
      CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.flip += this.flipSpeed;

    // Gió thổi nhẹ theo hình sin để tạo cảm giác trôi bồng bềnh
    this.x += Math.sin(this.y * 0.01) * 0.5;

    // Nếu ra khỏi màn hình thì reset lại lên trên
    if (
      this.y > this.canvasHeight + 20 ||
      this.x > this.canvasWidth + 20 ||
      this.x < -20
    ) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Hiệu ứng lật 3D bằng cách scale trục Y theo hình sin
    ctx.scale(1, Math.abs(Math.sin(this.flip)));

    ctx.beginPath();
    ctx.fillStyle = this.color;

    // Vẽ hình dáng cánh hoa (Oval biến dạng nhẹ)
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      this.width / 2,
      -this.height / 2,
      this.width,
      0,
      0,
      this.height
    );
    ctx.bezierCurveTo(-this.width, 0, -this.width / 2, -this.height / 2, 0, 0);

    ctx.fill();
    ctx.restore();
  }
}

const SakuraOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const petals: Petal[] = [];
    for (let i = 0; i < CONFIG.PETAL_COUNT; i++) {
      petals.push(new Petal(width, height));
    }

    let animationId: number;

    const render = () => {
      // Xóa màn hình cũ
      ctx.clearRect(0, 0, width, height);

      // Cập nhật và vẽ từng cánh hoa
      petals.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationId = requestAnimationFrame(render);
    };

    // Handle Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Cập nhật lại biên giới hạn cho các cánh hoa hiện có
      petals.forEach((p) => {
        p.canvasWidth = width;
        p.canvasHeight = height;
      });
    };

    window.addEventListener("resize", handleResize);
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default SakuraOverlay;
