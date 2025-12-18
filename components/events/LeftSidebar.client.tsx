"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";

export default function LeftSidebar() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let gsap: any = null;
    let Draggable: any = null;

    // --- AUDIO LOGIC (GIỮ NGUYÊN) ---
    let magicAudio: HTMLAudioElement | null = null;
    let magicPlayed = false;
    let magicLocateAttempted = false;

    async function locateMagicSrc() {
      if (magicLocateAttempted) return null;
      magicLocateAttempted = true;
      const candidates = [
        "/Music/Phép Màu.mp3",
        "/Music/Phep Mau.mp3",
        "/Music/PhepMau.mp3",
        "/Music/Phep-Mau.mp3",
        "/Music/Phep%20Mau.mp3",
        "/Music/phep-mau.mp3",
        "/Music/phep_mau.mp3",
      ];
      for (const c of candidates) {
        try {
          const res = await fetch(c, { method: "HEAD" });
          if (res.ok) return c;
        } catch {
          // ignore
        }
      }
      return null;
    }

    function createMagicAudio(src: string) {
      if (magicAudio) return magicAudio;
      try {
        magicAudio = document.createElement("audio");
        magicAudio.id = "magic-music";
        magicAudio.preload = "auto";
        magicAudio.src = src;
        magicAudio.loop = false;
        document.body.appendChild(magicAudio);
        magicAudio.addEventListener("ended", () => {
          magicPlayed = true;
        });
      } catch {
        magicAudio = null;
      }
      return magicAudio;
    }

    // --- VISUAL & LOGIC CONFIG ---
    let snowParticleIntervalId: number | null = null;
    let heartParticleIntervalId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const sidebar = rootRef.current;

    const CONFIG = {
      minTemp: 20,
      maxTemp: 110,
      defaultTemp: 70,
      gradientColors: [
        "#a29bfe", // Tím nhạt (Lạnh)
        "#6c5ce7", // Tím đậm
        "#e84393", // Hồng
        "#d63031", // Đỏ
        "#ff7675", // Cam đào (Nóng)
      ],
      gradientStops: [0, 0.2, 0.5, 0.8, 1],
      thresholds: { snow: 40, heart: 110 },
    };

    const els = {
      track: (sidebar?.querySelector("#track") as HTMLElement) || null,
      mercury: (sidebar?.querySelector("#mercury") as HTMLElement) || null,
      knob: (sidebar?.querySelector("#knob") as HTMLElement) || null,
      scaleContainer:
        (sidebar?.querySelector("#scaleContainer") as HTMLElement) || null,
      tempValue: (sidebar?.querySelector("#tempValue") as HTMLElement) || null,
      statusText:
        (sidebar?.querySelector("#statusText") as HTMLElement) || null,
      uiParticles:
        (sidebar?.querySelector("#uiParticles") as HTMLElement) || null,
      root: document.documentElement || null,
    };

    let currentTemp = CONFIG.defaultTemp;
    let trackHeight = 0;
    let knobBounds = { minY: 0, maxY: 0 };
    let scaleItems: HTMLElement[] = [];
    let colorMap: (t: number) => string;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function createColorMap() {
      const stops = CONFIG.gradientStops;
      const colors = CONFIG.gradientColors.map((c: string) =>
        (gsap as any).utils.splitColor(c)
      );
      return (t: number) => {
        t = Math.max(0, Math.min(1, t));
        for (let i = 0; i < stops.length - 1; i++) {
          const s0 = stops[i],
            s1 = stops[i + 1];
          if (t >= s0 && t <= s1) {
            const n = (t - s0) / (s1 - s0);
            const c0 = colors[i],
              c1 = colors[i + 1];
            return `rgb(${Math.round(lerp(c0[0], c1[0], n))},${Math.round(
              lerp(c0[1], c1[1], n)
            )},${Math.round(lerp(c0[2], c1[2], n))})`;
          }
        }
        const last = colors[colors.length - 1];
        return `rgb(${Math.round(last[0])},${Math.round(last[1])},${Math.round(
          last[2]
        )})`;
      };
    }

    function buildScale() {
      if (!els.scaleContainer || !els.track) return;
      els.scaleContainer.innerHTML = "";
      scaleItems = [];
      const min = CONFIG.minTemp,
        max = CONFIG.maxTemp,
        range = max - min;
      const rect = els.track.getBoundingClientRect();
      const trackH = rect.height;

      // Vẽ vạch chia
      for (let t = max; t >= min; t -= 5) {
        const el = document.createElement("div");
        el.className = "scale-mark";
        const tick = document.createElement("div");
        tick.className = "tick";

        if (t % 20 === 0 || t === max || t === min) tick.style.width = "16px";
        else tick.style.width = "8px";

        // Tính vị trí top
        const y = ((max - t) / range) * (trackH - 1);
        el.style.top = `${y}px`;

        if (t % 20 === 0 || t === min || t === max) {
          el.innerHTML = `<span class="tick-label">${t}</span>`;
          el.appendChild(tick);
        } else {
          el.appendChild(tick);
        }

        el.dataset.temp = String(t);
        els.scaleContainer.appendChild(el);
        scaleItems.push(el);
      }
    }

    function updateScaleVisuals(knobY: number) {
      if (!scaleItems || !els.track) return;
      const referenceKnobY = knobY;

      scaleItems.forEach((el) => {
        const elY = parseFloat(el.style.top || "0");
        const dist = Math.abs(referenceKnobY - elY);
        const maxDist = 60;
        if (dist < maxDist) {
          const p = 1 - dist / maxDist;
          (gsap as any).set(el, {
            opacity: 0.9 + p * 0.1,
            scale: 1 + p * 0.2,
            color: "var(--glow-color)",
            zIndex: 10,
          });
        } else {
          (gsap as any).set(el, {
            opacity: 0.3,
            scale: 1,
            color: "rgba(255,255,255,0.2)",
            zIndex: 1,
          });
        }
      });
    }

    function updateStatusText(t: number) {
      let txt = "";
      if (t < 35) txt = "Lạnh Lẽo";
      else if (t < 55) txt = "Hờ Hững";
      else if (t < 75) txt = "Rung Động";
      else if (t < 90) txt = "Cuồng Nhiệt";
      else if (t < 110) txt = "Cháy Bỏng";
      else txt = "Vĩnh Cửu";
      if (els.statusText) els.statusText.textContent = txt;
    }

    function applyColorTheme(color: string) {
      if (els.root) els.root.style.setProperty("--glow-color", color);
      if (els.tempValue) {
        els.tempValue.style.color = color;
        els.tempValue.style.textShadow = `0 0 20px ${color}`;
      }
      if (els.statusText) {
        els.statusText.style.color = color;
        els.statusText.style.textShadow = `0 0 10px ${color}`;
      }
      if (els.mercury)
        els.mercury.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}`;
    }

    function updateSystemFromY(yPos: number) {
      yPos = Math.max(knobBounds.minY, Math.min(knobBounds.maxY, yPos));

      const pct = yPos / trackHeight;
      const temp = CONFIG.maxTemp - pct * (CONFIG.maxTemp - CONFIG.minTemp);
      currentTemp = Math.round(temp);

      const norm =
        (currentTemp - CONFIG.minTemp) / (CONFIG.maxTemp - CONFIG.minTemp);
      const color = colorMap(norm);

      if (els.tempValue) els.tempValue.textContent = currentTemp + "°";

      if (els.mercury) els.mercury.style.height = (1 - pct) * 100 + "%";

      applyColorTheme(color);
      updateStatusText(currentTemp);

      // Play music logic
      if (!magicPlayed && currentTemp >= CONFIG.maxTemp) {
        (async () => {
          const src = await locateMagicSrc();
          if (src) {
            const audio = createMagicAudio(src);
            if (audio && audio.paused) {
              audio
                .play()
                .then(() => {
                  magicPlayed = true;
                })
                .catch(() => {});
            }
          }
        })();
      }

      updateScaleVisuals(yPos);
      updateSnowParticles(currentTemp);
      updateHeartParticles(currentTemp);
    }

    function initLayout() {
      if (!els.track) return;
      const rect = els.track.getBoundingClientRect();
      trackHeight = rect.height;
      knobBounds = { minY: 0, maxY: trackHeight };
      buildScale();

      const norm =
        (CONFIG.defaultTemp - CONFIG.minTemp) /
        (CONFIG.maxTemp - CONFIG.minTemp);
      const startY = trackHeight * (1 - norm);

      if (gsap && els.knob) gsap.set(els.knob, { y: startY });
      updateSystemFromY(startY);
    }

    function initDrag() {
      if (Draggable && els.knob) {
        Draggable.create(els.knob, {
          type: "y",
          bounds: { minY: knobBounds.minY, maxY: knobBounds.maxY },
          inertia: true,
          // GPU Optimization
          force3D: true,
          onDrag: function () {
            // @ts-ignore
            updateSystemFromY(this.y);
          },
          onThrowUpdate: function () {
            // @ts-ignore
            updateSystemFromY(this.y);
          },
        });
      }
    }

    // --- SNOW PARTICLES (OPTIMIZED) ---
    const maxSnowSpawnInterval = 5;
    const maxSnowFallDuration = 7;
    function createSnowParticle() {
      if (!els.uiParticles) return;
      const p = document.createElement("div");
      p.className = "particle snow";
      els.uiParticles.appendChild(p);
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const size = Math.random() * 6 + 2;
      const baseOpacity = 0.5 + Math.random() * 0.5;

      // Use CSS var for dynamic color
      p.style.width = p.style.height = size + "px";
      p.style.background = `radial-gradient(circle, rgba(255,255,255,${baseOpacity}) 0%, transparent 100%)`;

      const startX = Math.random() * vw;
      gsap.set(p, { x: startX, y: -50, opacity: 0 });

      const swayX = 50 + Math.random() * 50;
      const fallDuration = getSnowFallDuration(currentTemp);

      gsap
        .timeline({ onComplete: () => p.remove() })
        .to(p, { opacity: 1, duration: 0.5 })
        .to(
          p,
          {
            y: vh + 50,
            x: `+=${Math.random() * swayX - swayX / 2}`,
            rotation: Math.random() * 360,
            duration: fallDuration,
            ease: "none",
          },
          0
        );
    }

    function getSnowFallDuration(temp: number) {
      const clamped = Math.max(
        CONFIG.minTemp,
        Math.min(temp, CONFIG.thresholds.snow)
      );
      const range = CONFIG.thresholds.snow - CONFIG.minTemp;
      const pct = (CONFIG.thresholds.snow - clamped) / range;
      return lerp(maxSnowFallDuration, maxSnowFallDuration * 0.55, pct);
    }
    function getSnowSpawnInterval(temp: number) {
      const clamped = Math.max(
        CONFIG.minTemp,
        Math.min(temp, CONFIG.thresholds.snow)
      );
      const range = CONFIG.thresholds.snow - CONFIG.minTemp;
      const pct = (CONFIG.thresholds.snow - clamped) / range;
      return lerp(maxSnowSpawnInterval, maxSnowSpawnInterval * 0.45, pct);
    }

    function updateSnowParticles(temp: number) {
      if (!els.uiParticles) return;
      if (temp > CONFIG.thresholds.snow) {
        if (snowParticleIntervalId !== null) {
          clearInterval(snowParticleIntervalId);
          snowParticleIntervalId = null;
        }
        return;
      }
      if (snowParticleIntervalId !== null)
        clearInterval(snowParticleIntervalId);
      createSnowParticle();
      const interval = getSnowSpawnInterval(temp) * 100;
      snowParticleIntervalId = window.setInterval(createSnowParticle, interval);
    }

    // --- HEART PARTICLES (OPTIMIZED) ---
    function createHeartParticle() {
      if (!els.uiParticles) return;
      const p = document.createElement("div");
      p.className = "particle heart";
      p.innerHTML = "✦"; // Dùng ngôi sao hoặc tim cách điệu
      els.uiParticles.appendChild(p);
      const vh = window.innerHeight;
      const size = Math.random() * 20 + 10;

      p.style.fontSize = size + "px";
      p.style.color = "var(--glow-color)"; // Dùng màu dynamic
      p.style.textShadow = "0 0 10px var(--glow-color)";

      const startX = Math.random() * window.innerWidth;
      gsap.set(p, { x: startX, y: vh + 50, opacity: 0, scale: 0.5 });

      const swayX = 80 + Math.random() * 80;
      const floatDuration = 5 + Math.random() * 3;

      gsap
        .timeline({ onComplete: () => p.remove() })
        .to(p, { opacity: 1, scale: 1, duration: 0.5 })
        .to(
          p,
          {
            y: -100,
            x: `+=${Math.random() * swayX - swayX / 2}`,
            rotation: Math.random() * 360,
            duration: floatDuration,
            ease: "power1.out",
          },
          0
        );
    }

    function updateHeartParticles(temp: number) {
      if (!els.uiParticles) return;
      if (temp < CONFIG.maxTemp) {
        if (heartParticleIntervalId !== null) {
          clearInterval(heartParticleIntervalId);
          heartParticleIntervalId = null;
        }
        return;
      }
      if (heartParticleIntervalId !== null) return;
      createHeartParticle();
      heartParticleIntervalId = window.setInterval(createHeartParticle, 300);
    }

    // --- SETUP ---
    async function setup() {
      try {
        const gsapModule = await import("gsap");
        gsap = gsapModule.default || gsapModule;
        try {
          // @ts-ignore
          const DraggableModule = await import("gsap/Draggable");
          Draggable = DraggableModule.default || DraggableModule;
          gsap.registerPlugin(Draggable);
        } catch {}

        colorMap = createColorMap();
        initLayout();
        initDrag();
        updateSnowParticles(currentTemp);
        updateHeartParticles(currentTemp);

        const onResize = () => {
          initLayout();
          updateSnowParticles(currentTemp);
          updateHeartParticles(currentTemp);
        };
        window.addEventListener("resize", onResize);
        if ((window as any).ResizeObserver) {
          resizeObserver = new ResizeObserver(onResize);
          if (sidebar) resizeObserver.observe(sidebar);
        }
      } catch {}
    }
    setup();

    return () => {
      if (snowParticleIntervalId) clearInterval(snowParticleIntervalId);
      if (heartParticleIntervalId) clearInterval(heartParticleIntervalId);
      if (resizeObserver) resizeObserver.disconnect();
      if (magicAudio) {
        magicAudio.pause();
        magicAudio.remove();
      }
    };
  }, []);

  return (
    <>
      <button
        className={`sidebar-love-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((s) => !s)}
        aria-label="Toggle Love Meter"
      >
        <div className="btn-inner-glow">
          <span className="heart-icon">✦</span>
        </div>
      </button>

      <aside
        className={`mycrush-sidebar ${open ? "open" : "closed"}`}
        ref={rootRef}
        aria-hidden={!open}
      >
        {/* SVG FILTER CHO HIỆU ỨNG CHẤT LỎNG */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter
              id="turbulent-displace"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.03"
                numOctaves="3"
                result="noise1"
                seed="1"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise1"
                scale="6"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <div id="app">
          <div className="thermostat-ui">
            <div className="sidebar-header">
              <h3>Tình Yêu Kế</h3>
              <div className="divider"></div>
            </div>

            <div className="thermostat glass-panel">
              <div className="thermostat-inner">
                <div className="scale-container" id="scaleContainer" />

                {/* Ống chứa nhiệt độ */}
                <div className="track" id="track">
                  <div className="mercury-container">
                    <div className="mercury" id="mercury" />
                    <div className="mercury-bubble-layer"></div>
                  </div>
                </div>

                <div className="knob-zone">
                  <div className="knob" id="knob">
                    <div className="knob-ring"></div>
                    <div className="knob-core"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="temp-readout">
              <div className="temp-value" id="tempValue">
                70°
              </div>
              <div className="status-text" id="statusText">
                Rung Động
              </div>
            </div>
          </div>
        </div>

        <div id="uiParticles" />

        <style jsx>{`
          /* GLOBAL VARS */
          :global(:root) {
            --glow-color: #ff0055;
            --glass-bg: rgba(5, 5, 5, 0.85); /* Tối hơn cho Dark Mode */
            --glass-border: rgba(212, 175, 55, 0.3); /* Viền vàng kim */
            --gold-accent: #d4af37;
          }

          /* --- SIDEBAR CONTAINER --- */
          .mycrush-sidebar {
            position: fixed;
            left: 20px;
            top: 20%; /* Căn giữa dọc */
            height: auto;
            min-height: 550px;
            width: 140px;
            padding: 30px 10px;
            z-index: 2000;

            /* Glassmorphism Dark Theme */
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);

            /* Border & Glow */
            border: 1px solid var(--glass-border);
            border-radius: 50px; /* Bo tròn như viên thuốc */
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.8),
              inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 1);

            transform: translateX(-150%) scale(0.9);
            opacity: 0;
            transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            visibility: hidden;

            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .mycrush-sidebar.open {
            transform: translateX(0) scale(1);
            opacity: 1;
            visibility: visible;
          }

          /* --- HEADER --- */
          .sidebar-header {
            width: 100%;
            text-align: center;
            margin-bottom: 25px;
          }
          .sidebar-header h3 {
            margin: 0;
            font-family: "Orbitron", sans-serif;
            font-size: 10px;
            letter-spacing: 3px;
            color: var(--gold-accent);
            text-transform: uppercase;
            text-shadow: 0 0 5px var(--gold-accent);
          }
          .divider {
            height: 1px;
            width: 20px;
            background: var(--gold-accent);
            margin: 8px auto 0;
            box-shadow: 0 0 5px var(--gold-accent);
          }

          /* --- TOGGLE BUTTON --- */
          :global(.sidebar-love-btn) {
            position: fixed;
            left: 20px;
            top: 100px;
            z-index: 2001;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #000;
            border: 1px solid var(--gold-accent);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s ease;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
          }
          .btn-inner-glow {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(
              circle,
              rgba(212, 175, 55, 0.2) 0%,
              transparent 70%
            );
          }
          :global(.sidebar-love-btn:hover) {
            transform: scale(1.1);
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);
          }
          :global(.sidebar-love-btn.active) {
            background: var(--gold-accent);
            color: #000;
            box-shadow: 0 0 30px var(--gold-accent);
          }
          .heart-icon {
            font-size: 20px;
            color: var(--gold-accent);
            transition: color 0.3s;
          }
          :global(.sidebar-love-btn.active) .heart-icon {
            color: #000;
          }

          /* --- THERMOSTAT STRUCTURE --- */
          #app {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
          }
          .thermostat-ui {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }

          .thermostat {
            position: relative;
            width: 60px;
            height: 350px;
            margin-bottom: 20px;
          }
          .thermostat-inner {
            position: relative;
            width: 100%;
            height: 100%;
          }

          /* --- TRACK (ỐNG NHIỆT) --- */
          .track {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            transform: translateX(-50%);
            width: 10px;
            background: #111;
            border-radius: 999px;
            box-shadow: inset 0 0 10px #000;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1;
            overflow: hidden;
          }

          /* --- MERCURY (CHẤT LỎNG) --- */
          .mercury-container {
            width: 100%;
            height: 100%;
            position: relative;
            filter: url(#turbulent-displace); /* Hiệu ứng lỏng */
          }
          .mercury {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50%;
            background: var(--glow-color);
            box-shadow: 0 0 20px var(--glow-color);
            transition: height 0.1s linear;
            will-change: height; /* GPU Optimized */
          }
          /* Bọt khí trong ống */
          .mercury-bubble-layer {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(
              rgba(255, 255, 255, 0.8) 1px,
              transparent 1px
            );
            background-size: 10px 10px;
            opacity: 0.3;
            mix-blend-mode: overlay;
          }

          /* --- KNOB (NÚT KÉO) --- */
          .knob-zone {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            pointer-events: none;
            z-index: 10;
          }
          .knob {
            position: absolute;
            left: 50%;
            width: 36px;
            height: 36px;
            margin-left: -18px;
            border-radius: 50%;
            background: #000;
            border: 2px solid var(--glow-color);
            box-shadow: 0 0 20px var(--glow-color),
              inset 0 0 10px var(--glow-color);
            cursor: grab;
            pointer-events: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            will-change: transform; /* GPU Optimized */
          }
          .knob:active {
            cursor: grabbing;
            transform: scale(1.1);
          }
          .knob-core {
            width: 8px;
            height: 8px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 10px #fff;
          }
          .knob-ring {
            position: absolute;
            inset: -4px;
            border: 1px dashed var(--glow-color);
            border-radius: 50%;
            opacity: 0.5;
            animation: spin 10s linear infinite;
          }

          @keyframes spin {
            100% {
              transform: rotate(360deg);
            }
          }

          /* --- SCALE (THƯỚC ĐO) --- */
          .scale-container {
            position: absolute;
            left: -40px;
            top: 0;
            bottom: 0;
            width: 40px;
            pointer-events: none;
          }
          :global(.scale-mark) {
            position: absolute;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            height: 0;
            transition: all 0.3s;
            will-change: transform, opacity;
          }
          :global(.tick) {
            height: 1px;
            background: var(--glow-color);
            margin-left: 8px;
            box-shadow: 0 0 5px var(--glow-color);
          }
          :global(.tick-label) {
            font-family: "Share Tech Mono", monospace;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            margin-right: 4px;
          }

          /* --- READOUT --- */
          .temp-readout {
            text-align: center;
            margin-top: 10px;
          }
          .temp-value {
            font-family: "Share Tech Mono", monospace;
            font-size: 42px;
            font-weight: 700;
            color: #fff;
            text-shadow: 0 0 15px var(--glow-color);
            margin-bottom: 4px;
            transition: color 0.3s;
          }
          .status-text {
            font-family: "Playfair Display", serif;
            font-size: 14px;
            font-style: italic;
            letter-spacing: 1px;
            color: var(--glow-color);
            opacity: 0.9;
            text-shadow: 0 0 10px var(--glow-color);
            transition: color 0.3s;
          }

          /* --- PARTICLES --- */
          #uiParticles {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1000;
          }
          :global(.particle) {
            position: absolute;
            pointer-events: none;
          }
          :global(.particle.snow) {
            border-radius: 50%;
          }
          :global(.particle.heart) {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* RESPONSIVE MOBILE */
          @media (max-width: 768px) {
            .mycrush-sidebar {
              top: auto;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%) translateY(120%);
              width: 90%;
              max-width: 320px;
              flex-direction: row;
              height: 100px;
              min-height: auto;
              padding: 0 20px;
              border-radius: 20px;
            }
            .mycrush-sidebar.open {
              transform: translateX(-50%) translateY(0);
            }
            .thermostat {
              transform: rotate(-90deg);
              width: 200px;
              height: 40px;
              margin: 0;
            }
            .scale-container {
              display: none;
            } /* Ẩn thước đo trên mobile cho gọn */

            .sidebar-header,
            .divider {
              display: none;
            }

            .temp-readout {
              margin-left: auto;
              text-align: right;
              margin-top: 0;
              display: flex;
              flex-direction: column-reverse; /* Đảo ngược để số ở trên */
            }
            .temp-value {
              font-size: 24px;
            }
            .status-text {
              font-size: 10px;
            }

            :global(.sidebar-love-btn) {
              top: auto;
              bottom: 140px;
              left: 20px;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
