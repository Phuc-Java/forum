"use client";

import Spline from "@splinetool/react-spline/next";
import React from "react";

export default function SplineModel() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const target = React.useRef({ rx: 0, ry: 0 });
  const current = React.useRef({ rx: 0, ry: 0 });
  const rafRef = React.useRef<number | null>(null);

  // respect reduced motion
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  React.useEffect(() => {
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    function onPointerMove(e: PointerEvent) {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = e.clientX - cx;
      const my = e.clientY - cy;
      const rx = Math.max(-12, Math.min(12, (my / rect.height) * 20));
      const ry = Math.max(-12, Math.min(12, (mx / rect.width) * 20));
      target.current.rx = rx;
      target.current.ry = ry;
    }

    function onLeave() {
      target.current.rx = 0;
      target.current.ry = 0;
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);

    const ease = 0.12;
    function loop() {
      current.current.rx += (target.current.rx - current.current.rx) * ease;
      current.current.ry += (target.current.ry - current.current.ry) * ease;
      if (ref.current) {
        const rx = current.current.rx;
        const ry = current.current.ry;
        ref.current.style.transform = `perspective(900px) translateY(8px) rotateX(${-rx}deg) rotateY(${ry}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced]);

  return (
    <div
      ref={ref}
      className="spline-canvas w-full h-full flex items-center justify-center"
      aria-hidden="true"
      role="img"
      style={{ willChange: "transform" }}
    >
      <div className="w-full h-full scale-[0.85] lg:scale-90 xl:scale-100">
        <Spline scene="/3D/scene.splinecode" />
      </div>
    </div>
  );
}
