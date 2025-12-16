"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { SCROLL_PAINTINGS } from "@/components/data/film-data";

export default function SpiritScroll() {
  const loopItems = [...SCROLL_PAINTINGS, ...SCROLL_PAINTINGS];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef<{ x: number }>({ x: 0 });
  const draggingRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number | null>(null);
  const lastMoveXRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const SPEED = 25; // Tốc độ trôi nhẹ nhàng như nước chảy

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const FRICTION = 4; // Ma sát

    const update = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.5) {
          posRef.current.x += velocityRef.current * dt;
          velocityRef.current *= Math.exp(-FRICTION * dt);
          if (Math.abs(velocityRef.current) < 0.5) velocityRef.current = 0;
        } else {
          posRef.current.x -= SPEED * dt;
        }
      }

      const halfWidth = inner.scrollWidth / 2;
      if (posRef.current.x <= -halfWidth) posRef.current.x += halfWidth;
      if (posRef.current.x >= 0) posRef.current.x -= halfWidth;

      inner.style.transform = `translate3d(${posRef.current.x}px,0,0)`;
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Handlers (Giữ nguyên logic vật lý mượt mà của đạo hữu)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
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
      container.classList.add("cursor-grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const now = performance.now();
      const dtMove = Math.max(1, now - (lastMoveTimeRef.current ?? now)) / 1000;
      const instantVel = (e.clientX - lastMoveXRef.current) / dtMove;
      velocityRef.current = velocityRef.current * 0.2 + instantVel * 0.8;
      lastMoveXRef.current = e.clientX;
      lastMoveTimeRef.current = now;
      posRef.current.x = startTranslate + (e.clientX - startX);
    };

    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch {}
      container.classList.remove("cursor-grabbing");
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div className="relative w-screen -ml-[50vw] left-1/2 overflow-hidden py-16 select-none bg-[#0a0500]">
      {/* Decorative Line (Sợi tơ vàng) */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#ffd700] to-transparent z-20 shadow-[0_0_15px_#ffd700] opacity-60" />

      {/* Ancient Text */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl text-[#cba135] font-serif z-20 opacity-80"
        style={{ letterSpacing: "0.5em" }}
      >
        ✦ VẠN CỔ HỌA QUYỂN ✦
      </div>

      <div
        ref={containerRef}
        className="relative w-full cursor-grab active:cursor-grabbing"
        style={{
          maskImage:
            "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div
          ref={innerRef}
          className="flex gap-10 items-center w-max will-change-transform px-10"
        >
          {loopItems.map((src, i) => (
            <div
              key={i}
              className="group relative flex-none w-[200px] h-[300px] flex items-center justify-center bg-[#1a120b] border-[4px] border-[#3e2723] rounded-sm overflow-hidden transition-all duration-700 ease-out shadow-2xl hover:scale-105 hover:-translate-y-4 hover:border-[#ffd700] hover:shadow-[0_20px_50px_rgba(255,215,0,0.15)]"
            >
              {/* Giấy cũ texture */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 z-10 pointer-events-none" />

              <Image
                src={src}
                alt={`scroll-${i}`}
                fill
                className="object-cover opacity-60 sepia-[0.6] group-hover:sepia-0 group-hover:opacity-100 transition-all duration-700"
                draggable={false}
              />

              {/* Vertical Text (Câu đối) */}
              <div className="absolute top-2 right-2 w-6 flex flex-col items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <div className="w-[1px] h-full bg-white/20 absolute right-[-4px]" />
                {["Thiên", "Địa", "Huyền", "Hoàng"].map((char, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-[#ffd700] font-bold bg-black/50 p-0.5 rounded shadow-sm leading-none"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
