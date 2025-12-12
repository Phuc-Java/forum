"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./page.module.css";

export default function SnowCanvas() {
  const cRef = useRef<HTMLCanvasElement | null>(null);
  const c2Ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = cRef.current;
    const c2 = c2Ref.current;
    if (!c || !c2) return;

    const ctx = c.getContext("2d");
    const ctx2 = c2.getContext("2d");
    if (!ctx || !ctx2) return;
    const _ctx = ctx!;
    const _ctx2 = ctx2!;

    const cw = (c.width = 4000);
    const ch = (c.height = 4000);
    c2.width = c2.height = 4000;
    const T = Math.PI * 2;

    type TreeParticle = {
      i: number;
      cx: number;
      cy: number;
      r: number;
      dot: number;
      prog: number;
      s: number;
      t?: unknown;
    };
    type SnowParticle = {
      x: number;
      y: number;
      i: number;
      s: number;
      a: number;
      t?: unknown;
    };

    const arr: TreeParticle[] = [];
    const arr2: SnowParticle[] = [];

    const m: { x: number; y: number } = { x: cw / 2, y: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const G = gsap as any;
    const xTo = G.quickTo(m, "x", { duration: 1.5, ease: "expo" });
    const yTo = G.quickTo(m, "y", { duration: 1.5, ease: "expo" });

    const onPointer = (e: PointerEvent) => {
      const rect = c.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      const scaledMouseX = mouseX * scaleX;
      const scaledMouseY = mouseY * scaleY;
      xTo(scaledMouseX);
      yTo(scaledMouseY);
    };

    c.addEventListener("pointermove", onPointer);

    for (let i = 0; i < 999; i++) {
      arr.push({
        i: i,
        cx: cw / 2,
        cy: gsap.utils.mapRange(0, 999, 600, 3700, i),
        r: i < 900 ? gsap.utils.mapRange(0, 999, 3, 770, i) : 50,
        dot: 9,
        prog: 0.25,
        s: 1,
      });

      const d = 99;
      arr[i].t = gsap
        .timeline({ repeat: -1 })
        .to(arr[i], { duration: d, prog: "+=1", ease: "slow(0.3, 0.4)" })
        .to(
          arr[i],
          {
            duration: d / 2,
            s: 0.15,
            repeat: 1,
            yoyo: true,
            ease: "power3.inOut",
          },
          0
        )
        .seek(Math.random() * d);

      arr2.push({
        x: cw * Math.random(),
        y: -9,
        i: i,
        s: 3 + 5 * Math.random(),
        a: 0.1 + 0.5 * Math.random(),
      });

      arr2[i].t = gsap
        .to(arr2[i], { ease: "none", y: ch, repeat: -1 })
        .seek(Math.random() * 99)
        .timeScale(arr2[i].s / 700);
    }

    function drawDot(cDot: TreeParticle) {
      const angle = cDot.prog * T;
      const vs = 0.2;
      const x = Math.cos(angle) * cDot.r + cDot.cx;
      const y = Math.sin(angle) * cDot.r * vs + cDot.cy;
      const d = Math.sqrt((x - m.x) ** 2 + (y - m.y) ** 2);
      const ms = gsap.utils.clamp(0.07, 1, d / cw);
      _ctx.beginPath();
      _ctx.arc(x, y, (cDot.dot * cDot.s) / 2 / ms, 0, T);
      _ctx.fill();
      _ctx.lineWidth = (cDot.dot * cDot.s * 2) / ms;
      _ctx.stroke();
    }

    function drawSnow(s: SnowParticle) {
      const ys = gsap.utils.interpolate(1.3, 0.1, s.y / ch);
      _ctx2.save();
      _ctx2.beginPath();
      _ctx2.translate(s.x, s.y);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _ctx2.rotate(
          50 * ((s as any).t?.progress ? (s as any).t.progress() : 0)
        );
      } catch {
        /* progress may not be available during cleanup */
      }
      _ctx2.arc(
        gsap.utils.interpolate(-55, 55, s.i / 999),
        gsap.utils.interpolate(-25, 25, s.i / 999),
        s.s * ys,
        0,
        T
      );
      _ctx2.globalAlpha = s.a * ys;
      _ctx2.fill();
      _ctx2.restore();
    }

    function render() {
      _ctx.clearRect(0, 0, cw, ch);
      _ctx2.clearRect(0, 0, cw, ch);
      arr.forEach((v) => drawDot(v));
      arr2.forEach((v) => drawSnow(v));
    }

    _ctx.fillStyle = _ctx2.fillStyle = "#fff";
    _ctx.strokeStyle = "rgba(255,255,255,0.05)";
    _ctx.globalCompositeOperation = "lighter";

    G.ticker.add(render);

    const intro1 = gsap.from(arr, {
      duration: 1,
      dot: 0,
      ease: "back.out(9)",
      stagger: -0.0009,
    });
    const intro2 = gsap.from(m, {
      duration: 1.5,
      y: ch * 1.2,
      ease: "power2.inOut",
    });

    return () => {
      c.removeEventListener("pointermove", onPointer);
      G.ticker.remove(render);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      try {
        // call kill safely if available
        if (intro1 && typeof (intro1 as any).kill === "function")
          (intro1 as any).kill();
        if (intro2 && typeof (intro2 as any).kill === "function")
          (intro2 as any).kill();
      } catch {}
      arr.forEach((a) => {
        if (a.t && typeof (a.t as any).kill === "function") (a.t as any).kill();
      });
      arr2.forEach((s) => {
        if (s.t && typeof (s.t as any).kill === "function") (s.t as any).kill();
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */
      _ctx.clearRect(0, 0, cw, ch);
      _ctx2.clearRect(0, 0, cw, ch);
    };
  }, []);

  return (
    <div className={styles.fixedBg} aria-hidden>
      <canvas
        ref={c2Ref}
        id="c2"
        className={`${styles.canvas} ${styles.canvasTop}`}
      />
      <canvas
        ref={cRef}
        id="c"
        className={`${styles.canvas} ${styles.canvasMain}`}
      />
    </div>
  );
}
