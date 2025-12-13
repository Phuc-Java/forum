"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";

export default function LeftSidebar() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let gsap: any = null;
    let Draggable: unknown = null;

    // audio for "Phép Màu" — play once when reaching 'Chung thủy'
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
          // ignore and try next
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
    let snowParticleIntervalId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const sidebar = rootRef.current;

    const CONFIG: {
      minTemp: number;
      maxTemp: number;
      defaultTemp: number;
      gradientColors: string[];
      gradientStops: number[];
      thresholds: { snow: number };
    } = {
      minTemp: 20,
      maxTemp: 110,
      defaultTemp: 70,
      gradientColors: [
        "#00eaff",
        "#0099ff",
        "#00ff73",
        "#ffdd00",
        "#ff8800",
        "#ff0044",
      ],
      gradientStops: [0, 0.25, 0.5, 0.7, 0.85, 1],
      thresholds: { snow: 40 },
    };

    const els: {
      track: HTMLElement | null;
      mercury: HTMLElement | null;
      knob: HTMLElement | null;
      scaleContainer: HTMLElement | null;
      tempValue: HTMLElement | null;
      statusText: HTMLElement | null;
      uiParticles: HTMLElement | null;
      root: HTMLElement | null;
    } = {
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
    let trackHeight = 0,
      knobBounds: { minY: number; maxY: number } = { minY: 0, maxY: 0 },
      scaleItems: HTMLElement[] = [],
      colorMap: (t: number) => string;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function createColorMap() {
      const stops = CONFIG.gradientStops;
      const colors = CONFIG.gradientColors.map((c: string) =>
        // gsap is initialized before this is used (createColorMap called after import)
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
        // fallback: return last color if no range matched
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
      for (let t = min; t <= max; t += 2) {
        const el = document.createElement("div");
        el.className = "scale-mark";
        const tick = document.createElement("div");
        tick.className = "tick";
        if (t % 10 === 0) tick.style.width = "18px";
        else if (t % 5 === 0) tick.style.width = "12px";
        else tick.style.width = "6px";
        // Position marks so values increase from top -> bottom (min at top)
        const y = ((t - min) / range) * (trackH - 1);
        el.style.top = `${y}px`;
        if (t % 10 === 0) el.innerHTML = `${t}<div class=\"tick\"></div>`;
        el.appendChild(tick);
        el.dataset.temp = String(t);
        els.scaleContainer.appendChild(el);
        scaleItems.push(el);
      }
    }

    function updateScaleVisuals(knobY: number) {
      if (!scaleItems || !els.track) return;
      // The scale marks' `top` values are measured from the top of the track.
      // The draggable `knobY` is measured from the same origin but increasing
      // downward. To make the scale highlight follow the knob direction
      // (knob up -> higher numbers highlight), invert the knob Y when
      // comparing to element positions.
      const referenceKnobY =
        typeof trackHeight === "number" && trackHeight
          ? trackHeight - knobY
          : els.track.getBoundingClientRect().height - knobY;

      scaleItems.forEach((el: HTMLElement) => {
        const elY = parseFloat((el as HTMLElement).style.top || "0");
        const dist = Math.abs(referenceKnobY - elY);
        const maxDist = 70;
        if (dist < maxDist) {
          const p = 1 - dist / maxDist;
          (gsap as any).set(el, {
            scale: 1 + p * 0.8,
            opacity: 0.6 + p * 0.6,
            color: "#fff",
            textShadow: "0 0 8px var(--glow-color)",
          });
        } else {
          (gsap as any).set(el, {
            scale: 1,
            opacity: 0.3,
            color: "rgba(255,255,255,0.35)",
            textShadow: "none",
          });
        }
      });
    }

    function updateStatusText(t: number) {
      // Map numeric value to "love levels" (Vietnamese)
      let txt = "";
      if (t < 32) txt = "Thờ ơ";
      else if (t < 55) txt = "Quan tâm";
      else if (t < 66) txt = "Thích";
      else if (t <= 74) txt = "Crush";
      else if (t < 85) txt = "Yêu";
      else if (t < 95) txt = "Nồng nàn";
      else txt = "Chung thủy";
      if (els.statusText) els.statusText.textContent = txt;
    }

    function applyColorTheme(color: string) {
      if (els.root) els.root.style.setProperty("--glow-color", color);
      if (els.tempValue) els.tempValue.style.color = color;
      if (els.statusText) els.statusText.style.color = color;
      if (els.mercury)
        els.mercury.style.boxShadow = `0 0 40px ${color}, 0 0 80px ${color}`;
    }

    function updateSystemFromY(yPos: number) {
      yPos = Math.max(knobBounds.minY, Math.min(knobBounds.maxY, yPos));
      const pct = 1 - yPos / trackHeight;
      const temp = CONFIG.minTemp + pct * (CONFIG.maxTemp - CONFIG.minTemp);
      currentTemp = Math.round(temp);
      const norm =
        (currentTemp - CONFIG.minTemp) / (CONFIG.maxTemp - CONFIG.minTemp);
      const color = colorMap(norm);
      if (els.tempValue) els.tempValue.textContent = currentTemp + "°";
      if (els.mercury)
        (els.mercury as HTMLElement).style.height = pct * 100 + "%";
      applyColorTheme(color);
      updateStatusText(currentTemp);
      // If we've reached the highest love level (Chung thủy), play the magic track once
      try {
        if (!magicPlayed && currentTemp >= 95) {
          // locate and play (only once)
          (async () => {
            const src = await locateMagicSrc();
            if (!src) return;
            const audio = createMagicAudio(src);
            if (!audio) return;
            // attempt to play; browsers may block autoplay without user gesture
            audio.currentTime = 0;
            try {
              await audio.play();
            } catch {
              // playback blocked — attach a one-time resume on user interaction
              const resume = () => {
                audio.play().catch(() => {});
                window.removeEventListener("click", resume);
                window.removeEventListener("keydown", resume);
              };
              window.addEventListener("click", resume);
              window.addEventListener("keydown", resume);
            }
          })();
        }
      } catch {
        // ignore audio errors
      }
      updateScaleVisuals(yPos);
      updateSnowParticles(currentTemp);
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
      try {
        if (Draggable && els.knob) {
          (Draggable as any).create(els.knob, {
            type: "y",
            bounds: { minY: knobBounds.minY, maxY: knobBounds.maxY },
            inertia: true,
            onDrag() {
              updateSystemFromY((this as unknown as { y: number }).y);
            },
            onThrowUpdate() {
              updateSystemFromY((this as unknown as { y: number }).y);
            },
          });
        }
      } catch {
        // ignore
      }
    }

    const maxSnowSpawnInterval = 5;
    const maxSnowFallDuration = 7;

    function createSnowParticle() {
      if (!els.uiParticles) return;
      const p = document.createElement("div");
      p.className = "particle";
      els.uiParticles.appendChild(p);

      const vw = window.innerWidth,
        vh = window.innerHeight;
      const size = Math.random() * 12 + 7;
      const baseOpacity = 0.9 + Math.random() * 0.1;
      const blurVal = Math.random() * 1.6 + 0.9;

      p.style.width = p.style.height = size + "px";
      p.style.borderRadius = "50%";
      p.style.background = `radial-gradient(circle, rgba(255,255,255,${baseOpacity}) 0%, rgba(255,255,255,${
        baseOpacity * 0.9
      }) 70%, transparent 100%)`;
      p.style.filter = `blur(${blurVal}px)`;
      p.style.boxShadow = "0 0 24px rgba(255,255,255,0.95)";

      const startX = Math.random() * vw;
      const startY = -50 - Math.random() * 150;

      gsap.set(p, { x: startX, y: startY, opacity: 0, scale: 0.6 });

      const swayX = 80 + Math.random() * 60;
      const fallDuration = getSnowFallDuration(currentTemp);

      gsap
        .timeline({ onComplete: () => p.remove() })
        .to(p, { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" })
        .to(
          p,
          {
            y: vh + 80,
            x: "+=" + (Math.random() * swayX - swayX / 2),
            rotation: Math.random() * 180,
            opacity: 0,
            duration: fallDuration,
            ease: "none",
          },
          0
        )
        .to(
          p,
          {
            x: "+=" + (Math.random() * 40 - 20),
            yoyo: true,
            repeat: 1,
            duration: 2 + Math.random() * 3,
            ease: "sine.inOut",
          },
          0.2
        );
    }

    function getSnowFallDuration(temp: number) {
      const clampedTemp = Math.max(20, Math.min(temp, 40));
      const requiredPct = (40 - clampedTemp) / 20;
      return lerp(maxSnowFallDuration, maxSnowFallDuration * 0.55, requiredPct);
    }

    function getSnowSpawnInterval(temp: number) {
      const clampedTemp = Math.max(20, Math.min(temp, 40));
      const requiredPct = (40 - clampedTemp) / 20;
      return lerp(
        maxSnowSpawnInterval,
        maxSnowSpawnInterval * 0.45,
        requiredPct
      );
    }

    function updateSnowParticles(temp: number) {
      if (!els.uiParticles) return;
      if (temp > CONFIG.thresholds.snow) {
        if (snowParticleIntervalId !== null) {
          clearInterval(snowParticleIntervalId as number);
          snowParticleIntervalId = null;
        }
        els.uiParticles.innerHTML = "";
        return;
      }

      if (snowParticleIntervalId !== null)
        clearInterval(snowParticleIntervalId as number);

      createSnowParticle();

      const spawnInterval = getSnowSpawnInterval(temp) * 100;
      snowParticleIntervalId = window.setInterval(() => {
        createSnowParticle();
      }, spawnInterval);
    }

    async function setup() {
      try {
        const gsapModule: typeof import("gsap") = await import("gsap");
        gsap = (gsapModule as any).default || (gsapModule as any);
        try {
          // ts-ignore: some GSAP type files differ in casing in node_modules
          // which can trigger TypeScript library errors; runtime import is unchanged
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const DraggableModule = await import("gsap/Draggable");
          Draggable =
            (DraggableModule as any).default || (DraggableModule as any);
          (gsap as any).registerPlugin?.(Draggable);
        } catch {
          // Draggable optional
        }

        colorMap = createColorMap();
        initLayout();
        initDrag();
        updateSnowParticles(currentTemp);

        const onResize = () => {
          initLayout();
          updateSnowParticles(currentTemp);
        };
        window.addEventListener("resize", onResize);

        if ((window as any).ResizeObserver) {
          resizeObserver = new ResizeObserver(onResize);
          if (sidebar) resizeObserver.observe(sidebar);
        }
      } catch {
        // fail silently
      }
    }

    setup();

    return () => {
      if (snowParticleIntervalId) clearInterval(snowParticleIntervalId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <button
        className={`sidebar-love-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((s) => !s)}
        aria-pressed={open}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.1 20.8c-.6-.5-5.3-4.6-7.7-7.1C1.5 10.7 2 6.7 4.6 5.1c1.4-.9 3.2-.7 4.4.4l.9.9.9-.9c1.2-1.1 3-1.3 4.4-.4 2.6 1.6 3.1 5.6-.8 8.6-2.4 2.2-7.1 6.2-7.7 6.8z"
            fill="currentColor"
          />
        </svg>
      </button>

      <aside
        className={`mycrush-sidebar ${open ? "open" : "closed"}`}
        ref={rootRef}
        aria-hidden={!open}
      >
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter
              id="turbulent-displace"
              colorInterpolationFilters="sRGB"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="10"
                result="noise1"
                seed="1"
              />
              <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                <animate
                  attributeName="dy"
                  values="700; 0"
                  dur="6s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="10"
                result="noise2"
                seed="1"
              />
              <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                <animate
                  attributeName="dy"
                  values="0; -700"
                  dur="6s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="10"
                result="noise3"
                seed="2"
              />
              <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                <animate
                  attributeName="dx"
                  values="490; 0"
                  dur="6s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.02"
                numOctaves="10"
                result="noise4"
                seed="2"
              />
              <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                <animate
                  attributeName="dx"
                  values="0; -490"
                  dur="6s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>
              <feComposite
                in="offsetNoise1"
                in2="offsetNoise2"
                result="part1"
              />
              <feComposite
                in="offsetNoise3"
                in2="offsetNoise4"
                result="part2"
              />
              <feBlend
                in="part1"
                in2="part2"
                mode="color-dodge"
                result="combinedNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="combinedNoise"
                scale="30"
                xChannelSelector="R"
                yChannelSelector="B"
              />
            </filter>
          </defs>
        </svg>

        <div id="app">
          <div className="thermostat-ui">
            <div className="thermostat glass-panel">
              <div className="thermostat-inner">
                <div className="glass-noise" />
                <div className="scale-container" id="scaleContainer" />
                <div className="track" id="track">
                  <div className="mercury" id="mercury" />
                </div>
                <div className="knob-zone">
                  <div className="knob" id="knob" />
                </div>
              </div>
            </div>
            <div className="temp-readout">
              <div className="temp-value" id="tempValue">
                70°
              </div>
              <div className="temp-label">MỨC ĐỘ TÌNH YÊU</div>
              <div className="status-text" id="statusText">
                Crush
              </div>
            </div>
          </div>
        </div>
        <div className="particles-container" id="uiParticles" />

        <style jsx>{`
          :global(:root) {
            --glow-color: #00a2fa;
          }
          /* Scoped styles copied from original thermostat CSS (no visual or logic changes) */
          .mycrush-sidebar {
            position: fixed;
            left: 36px; /* align with toggle */
            top: 112px; /* will slide from above */
            width: 180px; /* reduced width */
            height: calc(100vh - 152px);
            padding: 12px;
            z-index: 2000;
            background: linear-gradient(
              180deg,
              rgba(10, 10, 12, 0.6),
              rgba(10, 10, 12, 0.45)
            );
            border: 1px solid rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            backdrop-filter: blur(6px);
            color: #fff;
            transform: translateY(-18px) scale(0.995);
            transform-origin: top center;
            opacity: 0;
            pointer-events: none;
            transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1),
              opacity 200ms ease;
          }
          .mycrush-sidebar.open {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
          }
          #app {
            z-index: 10;
            position: relative;
          }
          .thermostat-ui,
          .thermostat {
            z-index: 10;
            position: relative;
          }
          .particles-container {
            z-index: 1;
          }
          /* Keep thermostat compact to fit sidebar width */
          .thermostat-ui {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .thermostat {
            width: 100px; /* reduced */
            height: 340px; /* reduced */
            border-radius: 999px;
          }
          .thermostat-inner {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: inherit;
          }
          .glass-noise {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            opacity: 0.08;
            mix-blend-mode: overlay;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          }
          .track {
            position: absolute;
            top: 36px;
            bottom: 36px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            border-radius: 999px;
            background: radial-gradient(
                circle at 50% 0%,
                rgba(255, 255, 255, 0.35) 0,
                transparent 55%
              ),
              radial-gradient(
                circle at 50% 100%,
                rgba(0, 0, 0, 1) 0,
                rgba(0, 0, 0, 0.9) 70%
              ),
              linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.04),
                rgba(0, 0, 0, 0.8)
              );
            background-blend-mode: screen, normal, soft-light;
            box-shadow: inset 0 0 18px rgba(0, 0, 0, 1),
              0 0 18px rgba(0, 0, 0, 0.8);
            overflow: hidden;
          }
          .mercury {
            position: absolute;
            bottom: 0;
            left: -45%;
            width: 190%;
            height: 0%;
            background: var(--glow-color);
            filter: url(#turbulent-displace);
            mix-blend-mode: screen;
            box-shadow: 0 0 45px var(--glow-color), 0 0 90px var(--glow-color);
            transition: height 0.12s linear, box-shadow 0.3s ease,
              background 0.25s ease;
            opacity: 0.95;
          }
          .knob-zone {
            position: absolute;
            top: 36px;
            bottom: 36px;
            left: 0;
            right: 0;
            pointer-events: none;
          }
          .knob {
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            border-radius: 999px;
            background: rgba(10, 10, 10, 0.7);
            backdrop-filter: blur(12px) saturate(260%) brightness(1.25);
            border: 1px solid rgba(255, 255, 255, 0.14);
            box-shadow: inset 0 1px 18px rgba(255, 255, 255, 0.15),
              0 8px 26px rgba(0, 0, 0, 0.9);
            cursor: grab;
            pointer-events: auto;
            transition: box-shadow 0.2s ease, transform 0.15s ease;
          }
          .scale-container {
            position: absolute;
            top: 36px;
            bottom: 36px;
            left: -52px;
            width: 64px;
            pointer-events: none;
          }
          .scale-mark {
            position: absolute;
            right: 0;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.35);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            transform-origin: right center;
            transition: all 0.1s ease;
          }
          .tick {
            height: 2px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 2px;
            flex-shrink: 0;
          }
          .temp-readout {
            text-align: center;
          }
          .temp-value {
            font-size: 1.9rem;
            font-weight: 700;
            text-shadow: 0 0 24px var(--glow-color);
            color: var(--glow-color);
          }
          .temp-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.34em;
            opacity: 0.7;
            margin-top: 6px;
          }
          .status-text {
            margin-top: 6px;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            color: var(--glow-color);
            opacity: 0.95;
          }
          .particles-container {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
          }

          /* Toggle button — make smaller and lower on page */
          :global(.sidebar-love-btn) {
            position: fixed !important;
            left: 12px !important; /* keep near left edge */
            top: 79px !important; /* move down */
            width: 64px !important; /* smaller */
            height: 64px !important;
            border-radius: 999px !important; /* circle */
            background: radial-gradient(
              circle at 30% 30%,
              rgba(255, 45, 149, 0.08),
              rgba(0, 0, 0, 0.6)
            ) !important;
            border: 1px solid rgba(255, 255, 255, 0.06) !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            color: #ff2d95 !important; /* deep pink */
            z-index: 9999 !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55),
              0 0 12px rgba(255, 45, 149, 0.08) !important;
            cursor: pointer !important;
            transition: transform 140ms ease, box-shadow 140ms ease,
              background 140ms ease !important;
            backdrop-filter: blur(6px) saturate(160%) !important;
            -webkit-tap-highlight-color: transparent;
          }
          :global(.sidebar-love-btn:active) {
            transform: translateY(1px) scale(0.985) !important;
          }
          :global(.sidebar-love-btn svg) {
            display: block !important;
            width: 28px !important;
            height: 28px !important;
          }
          :global(.sidebar-love-btn.active) {
            box-shadow: 0 12px 40px rgba(255, 45, 149, 0.22) !important;
            color: #ff4aa8 !important;
            background: linear-gradient(
              180deg,
              rgba(40, 4, 8, 0.85),
              rgba(0, 0, 0, 0.5)
            ) !important;
            transform: scale(1.02) !important;
          }
          /* make it keyboard accessible visually */
          :global(.sidebar-love-btn:focus) {
            outline: 2px solid rgba(255, 45, 149, 0.14) !important;
            outline-offset: 3px !important;
          }
          .particle {
            position: absolute;
            border-radius: 50%;
          }
          @media (max-width: 480px) {
            .thermostat {
              transform: scale(0.9);
            }
          }
        `}</style>
      </aside>
    </>
  );
}
