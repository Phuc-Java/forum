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

  const SPEED = 24; // px/s

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const FRICTION = 6; // per second exponential decay

    const update = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (draggingRef.current) {
        // position is controlled directly by pointer handlers while dragging
      } else if (Math.abs(velocityRef.current) > 0.5) {
        // apply inertia from last pointer movements
        posRef.current.x += velocityRef.current * dt;
        // exponential decay
        velocityRef.current *= Math.exp(-FRICTION * dt);
        if (Math.abs(velocityRef.current) < 0.5) velocityRef.current = 0;
      } else {
        // normal auto-scroll
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
      const dtMove = Math.max(1, now - prevTime) / 1000; // ms -> s, avoid zero
      const dxSinceLast = e.clientX - lastMoveXRef.current;
      const instantVel = dxSinceLast / dtMove;
      // smooth velocity: low-pass filter
      velocityRef.current = velocityRef.current * 0.2 + instantVel * 0.8;
      lastMoveXRef.current = e.clientX;
      lastMoveTimeRef.current = now;

      const dx = e.clientX - startX;
      posRef.current.x = startTranslate + dx;
      inner.style.transform = `translate3d(${posRef.current.x}px,0,0)`;
    };

    const onPointerUp = (e: PointerEvent) => {
      // keep velocityRef.current as set by last moves; it will be consumed by RAF loop
      draggingRef.current = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch {}
      container.classList.remove("dragging");
      lastMoveTimeRef.current = null;
      lastMoveXRef.current = 0;
    };

    container.addEventListener("pointerdown", onPointerDown);
    // attach move/up to container so pointer capture delivers events there
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    // Prevent native image dragging which interferes with pointer interactions
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

  return (
    <div className="film-scanner-root">
      <div className="film-strip" ref={containerRef} aria-hidden="false">
        <div className="film-strip-inner" ref={innerRef}>
          {loopItems.map((src, i) => (
            <div
              className="card"
              key={i}
              onDragStart={(e) => e.preventDefault()}
            >
              <Image
                src={src}
                alt={`film-${i}`}
                width={260}
                height={180}
                className="card-image"
                loading={i < 2 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .film-scanner-root {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          overflow: hidden;
          background: transparent;
          padding: 22px 0;
        }

        .film-strip {
          display: block;
          width: 100%;
          cursor: grab;
          touch-action: pan-y;
        }

        .film-strip.dragging { cursor: grabbing; }

        .film-strip-inner {
          display: flex;
          gap: 18px;
          align-items: center;
          will-change: transform;
          user-select: none;
        }

        .card {
          flex: 0 0 auto;
          width: 260px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.2));
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.04);
          position: relative;
        }

        .card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .card-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          display: block;
        }

        .film-strip:active { cursor: grabbing; }

        @media (prefers-reduced-motion: reduce) {
          .film-strip-inner { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
