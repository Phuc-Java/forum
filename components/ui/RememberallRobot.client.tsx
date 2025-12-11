"use client";

import React from "react";
import Spline from "@splinetool/react-spline/next";

export default function RememberallRobot() {
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Simple pointer parallax handled on the container similar to other spline usages
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let raf: number | null = null;
    const target = { rx: 0, ry: 0 };
    const current = { rx: 0, ry: 0 };
    const ease = 0.12;

    function onPointerMove(e: PointerEvent) {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = e.clientX - cx;
      const my = e.clientY - cy;
      target.rx = Math.max(-12, Math.min(12, (my / rect.height) * 20));
      target.ry = Math.max(-12, Math.min(12, (mx / rect.width) * 20));
    }

    function loop() {
      current.rx += (target.rx - current.rx) * ease;
      current.ry += (target.ry - current.ry) * ease;
      if (ref.current) {
        ref.current.style.transform = `perspective(800px) translateY(4px) rotateX(${-current.rx}deg) rotateY(${
          current.ry
        }deg)`;
      }
      raf = requestAnimationFrame(loop);
    }

    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerleave", () => {
      target.rx = 0;
      target.ry = 0;
    });
    raf = requestAnimationFrame(loop);

    return () => {
      node.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="w-full h-full will-change-transform">
      <div className="w-full h-full">
        <Spline scene="/3D/rememberall_robot.spline" />
      </div>
    </div>
  );
}
