"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const images = [
  "/film scroll/unnamed.jpg",
  "/film scroll/unnamed (1).jpg",
  "/film scroll/unnamed (2).jpg",
  "/film scroll/unnamed (3).jpg",
  "/film scroll/unnamed (4).jpg",
  "/film scroll/unnamed (5).jpg",
  "/film scroll/unnamed (6).jpg",
  "/film scroll/unnamed (7).jpg",
  "/film scroll/unnamed (8).jpg",
  "/film scroll/unnamed (9).jpg",
  "/film scroll/unnamed (10).jpg",
  "/film scroll/unnamed (11).jpg",
  "/film scroll/unnamed (12).jpg",
  "/film scroll/unnamed (13).jpg",
];

export default function FilmScannerSimple() {
  const loopItems = [...images, ...images];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef<{ x: number }>({ x: 0 });
  const draggingRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number | null>(null);
  const lastMoveXRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const SPEED = 24;

  // (GIỮ NGUYÊN PHẦN LOGIC USEEFFECT CỦA BẠN - KHÔNG THAY ĐỔI)
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const FRICTION = 6;
    const update = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      if (draggingRef.current) {
      } else if (Math.abs(velocityRef.current) > 0.5) {
        posRef.current.x += velocityRef.current * dt;
        velocityRef.current *= Math.exp(-FRICTION * dt);
        if (Math.abs(velocityRef.current) < 0.5) velocityRef.current = 0;
      } else {
        posRef.current.x -= SPEED * dt;
      }
      const halfWidth = inner.scrollWidth / 2;
      if (posRef.current.x <= -halfWidth) posRef.current.x += halfWidth;
      if (posRef.current.x >= 0) posRef.current.x -= halfWidth;
      inner.style.transform = `translate3d(${posRef.current.x}px,0,0)`;
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    let startX = 0;
    let startTranslate = 0;
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      try {
        container.setPointerCapture?.(e.pointerId);
      } catch {}
      draggingRef.current = true;
      startX = e.clientX;
      startTranslate = posRef.current.x;
      lastMoveXRef.current = e.clientX;
      lastMoveTimeRef.current = performance.now();
      velocityRef.current = 0;
      container.classList.add("dragging");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const now = performance.now();
      const prevTime = lastMoveTimeRef.current ?? now;
      const dtMove = Math.max(1, now - prevTime) / 1000;
      const dxSinceLast = e.clientX - lastMoveXRef.current;
      const instantVel = dxSinceLast / dtMove;
      velocityRef.current = velocityRef.current * 0.2 + instantVel * 0.8;
      lastMoveXRef.current = e.clientX;
      lastMoveTimeRef.current = now;
      const dx = e.clientX - startX;
      posRef.current.x = startTranslate + dx;
      inner.style.transform = `translate3d(${posRef.current.x}px,0,0)`;
    };
    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch {}
      container.classList.remove("dragging");
      lastMoveTimeRef.current = null;
      lastMoveXRef.current = 0;
    };
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    const imgs = inner.querySelectorAll("img");
    const preventDrag = (ev: Event) => ev.preventDefault();
    imgs.forEach((img) => img.addEventListener("dragstart", preventDrag));
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      imgs.forEach((img) => img.removeEventListener("dragstart", preventDrag));
    };
  }, []);
  // (KẾT THÚC PHẦN LOGIC)

  return (
    <div className="film-scanner-root">
      {/* Thêm một đường kẻ Laser quét qua */}
      <div className="laser-line"></div>

      <div className="film-strip" ref={containerRef} aria-hidden="false">
        <div className="film-strip-inner" ref={innerRef}>
          {loopItems.map((src, i) => (
            <div
              className="card-scanner"
              key={i}
              onDragStart={(e) => e.preventDefault()}
            >
              <Image
                src={src}
                alt={`film-${i}`}
                width={260}
                height={180}
                className="card-image-scanner"
                loading={i < 2 ? "eager" : "lazy"}
                draggable={false}
              />
              {/* Thêm hiệu ứng số thứ tự kiểu tech */}
              <div className="tech-number">{(i % images.length) + 1}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .film-scanner-root {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          overflow: hidden;
          background: transparent;
          padding: 30px 0;
          position: relative;
        }

        .laser-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: #bc13fe;
          z-index: 10;
          box-shadow: 0 0 15px #bc13fe;
          opacity: 0.7;
          pointer-events: none;
        }

        .film-strip {
          display: block;
          width: 100%;
          cursor: grab;
          touch-action: pan-y;
          mask-image: linear-gradient(
            to right,
            transparent,
            black 15%,
            black 85%,
            transparent
          );
        }
        .film-strip.dragging {
          cursor: grabbing;
        }

        .film-strip-inner {
          display: flex;
          gap: 20px;
          align-items: center;
          will-change: transform;
          user-select: none;
        }

        .card-scanner {
          flex: 0 0 auto;
          width: 200px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          border: 1px solid #333;
          position: relative;
          transition: 0.3s;
          filter: grayscale(100%);
        }

        /* Hiệu ứng khi lướt qua tia laser ở giữa (dùng hover giả lập) */
        .card-scanner:hover {
          filter: grayscale(0%);
          border-color: #bc13fe;
          box-shadow: 0 0 15px rgba(188, 19, 254, 0.4);
          transform: scale(1.1);
          z-index: 2;
        }

        .card-image-scanner {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          display: block;
          opacity: 0.7;
        }
        .card-scanner:hover .card-image-scanner {
          opacity: 1;
        }

        .tech-number {
          position: absolute;
          bottom: 5px;
          right: 5px;
          font-family: monospace;
          font-size: 10px;
          color: #00f3ff;
          background: rgba(0, 0, 0, 0.8);
          padding: 2px 4px;
        }

        .film-strip:active {
          cursor: grabbing;
        }
        @media (prefers-reduced-motion: reduce) {
          .film-strip-inner {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
