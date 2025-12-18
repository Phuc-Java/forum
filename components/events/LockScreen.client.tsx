"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import "flickity/css/flickity.css";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// --- DYNAMIC IMPORTS ---
const HeartCanvas = dynamic(() => import("./HeartCanvas.client"), {
  ssr: false,
  loading: () => (
    <div className="text-pink-500/30 text-xs font-mono tracking-widest">
      LOADING LOVE...
    </div>
  ),
});

const LeftSidebar = dynamic(() => import("./LeftSidebar.client"), {
  ssr: false,
});

// --- SUB-COMPONENT: GLOWING SAKURA (FULL SCREEN) ---
const GlowingSakura = () => {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 10,
      size: 6 + Math.random() * 8,
      blur: Math.random() < 0.5 ? 0 : 2,
    }));
    setPetals(newPetals);
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="sakura-night-container">
      {petals.map((p) => (
        <div
          key={p.id}
          className="glowing-petal"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: `blur(${p.blur}px)`,
          }}
        />
      ))}
      <div className="firefly"></div>
      <div
        className="firefly"
        style={{ top: "30%", left: "20%", animationDelay: "1s" }}
      ></div>
      <div
        className="firefly"
        style={{ top: "70%", left: "80%", animationDelay: "2s" }}
      ></div>
    </div>
  );
};

// --- HELPER: WRAPPER PROFILE CARD ---
const ProfileCardWrapper = ({ type, name, role, handle, delay }: any) => {
  // Use public avatars folder if available; fallback to ui-avatars if not
  const publicDefault = "/avatars/default.jpg";
  const fallbackAvatar = publicDefault;

  const ProfileCard = dynamic(() => import("../ui/ProfileCard"), {
    loading: () => (
      <div className="w-[300px] h-[450px] bg-black/40 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-center">
        <span className="text-white/20 animate-pulse text-xs font-mono">
          SUMMONING...
        </span>
      </div>
    ),
    ssr: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: delay, ease: "circOut" }}
    >
      <ProfileCard
        name={name}
        title={role}
        handle={handle}
        avatarUrl={fallbackAvatar}
        enableTilt={true}
        className={type === "user" ? "ronin-style" : "muse-style"}
      />
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export default function LockScreen({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shojiLeftRef = useRef<HTMLDivElement>(null);
  const shojiRightRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useState("0000");
  const [isVerified, setIsVerified] = useState(false);

  const heartRef = useRef<HTMLDivElement | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // --- LOGIC (Giữ nguyên) ---
  useEffect(() => {
    if (!rootRef.current) return;

    (async () => {
      const FlickityModule = (await import("flickity")).default;
      const HowlModule = (await import("howler")).Howl;

      const dom = {
        lock: rootRef.current!.querySelector(".lock-mechanism") as HTMLElement,
        rows: Array.from(
          rootRef.current!.querySelectorAll(".dial-row")
        ) as HTMLElement[],
      };

      const sounds: Record<string, any> = {
        select: new HowlModule({
          src: ["https://cdn.freesound.org/previews/256/256127_4486188-lq.mp3"],
          volume: 0.3,
          rate: 1.2,
        }),
        hover: new HowlModule({
          src: ["https://cdn.freesound.org/previews/256/256127_4486188-lq.mp3"],
          volume: 0.05,
          rate: 2.5,
        }),
        success: new HowlModule({
          src: ["https://cdn.freesound.org/previews/337/337049_3232293-lq.mp3"],
          volume: 0.6,
          rate: 1,
        }),
        fail: new HowlModule({
          src: ["https://cdn.freesound.org/previews/173/173958_3200632-lq.mp3"],
          volume: 0.4,
          rate: 1,
        }),
      };

      const pin = "8844";
      let verified = false;

      function getCode() {
        let code = "";
        for (let i = 0; i < dom.rows.length; i++) {
          const sel = dom.rows[i].querySelector(".is-selected .dial-text");
          code += sel ? sel.textContent : "0";
        }
        return code;
      }

      function onChange() {
        sounds.select.play();
        const nextCode = getCode();
        setCode(nextCode);
        if (nextCode === pin) {
          if (!verified) sounds.success.play();
          verified = true;
          setTimeout(() => setIsVerified(true), 600);
        } else {
          if (verified) sounds.fail.play();
          verified = false;
          setIsVerified(false);
        }
      }

      type FlktyLike = {
        selectedIndex?: number;
        on?: (ev: string, cb: () => void) => void;
        destroy?: () => void;
      };
      const flktys: any[] = [];
      const lastIndexMap = new WeakMap<object, number>();

      dom.rows.forEach((row) => {
        const flkty = new FlickityModule(row as Element, {
          selectedAttraction: 0.2,
          friction: 0.5,
          cellAlign: "center",
          pageDots: false,
          wrapAround: true,
          prevNextButtons: false,
        });
        lastIndexMap.set(flkty as object, 0);

        (flkty as FlktyLike).on?.("select", () => {
          const last = lastIndexMap.get(flkty as object) ?? 0;
          const selected = (flkty as FlktyLike).selectedIndex ?? 0;
          if (selected !== last) onChange();
          lastIndexMap.set(flkty as object, selected);
        });

        row.addEventListener("mouseenter", () => sounds.hover.play());
        flktys.push(flkty);
      });

      onChange();

      return () => {
        flktys.forEach((f) => f?.destroy?.());
        Object.values(sounds).forEach((s) => s.unload && s.unload());
      };
    })();
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    const timer = setTimeout(() => {
      setShowHeart(true);
      setShowSidebar(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [isVerified]);

  return (
    <>
      {/* 1. HOA ANH ĐÀO (ĐƯA RA NGOÀI ĐỂ FULL MÀN HÌNH) */}
      {/* Nó sẽ nằm trên lớp background nhưng dưới lớp Lock */}
      <GlowingSakura />

      {/* 2. DARK SHOJI GATES */}
      <div
        className={`dark-shoji-container ${isVerified ? "open" : ""}`}
        ref={rootRef}
      >
        <div className="shoji-panel left" ref={shojiLeftRef}>
          <div className="dark-paper-texture"></div>
          <div className="ebony-frame">
            <div className="lattice-pattern"></div>
          </div>
        </div>

        <div className="shoji-panel right" ref={shojiRightRef}>
          <div className="dark-paper-texture"></div>
          <div className="ebony-frame">
            <div className="lattice-pattern"></div>
          </div>
        </div>

        {/* 3. LOCK BOX (NẰM THẤP) */}
        <div className={`lock-box-wrapper ${isVerified ? "fade-out" : ""}`}>
          <div className="moon-lantern">
            <div className="moon-text">秘</div>
            <div className="moon-glow"></div>
          </div>

          <div className="lock-mechanism">
            <div className="gold-corner top-left"></div>
            <div className="gold-corner top-right"></div>
            <div className="gold-corner bottom-left"></div>
            <div className="gold-corner bottom-right"></div>

            <div className="code-display-dark">
              <span className="current-code">{code}</span>
              <div className={`status-led ${isVerified ? "verified" : ""}`}>
                <span className="led-dot"></span>
                {isVerified ? "UNLOCKED" : "LOCKED"}
              </div>
            </div>

            <div className="dials-container">
              {Array.from({ length: 4 }).map((_, r) => (
                <div className="dial-row-wrapper" key={r}>
                  <div className="glass-highlight"></div>
                  <div className="dial-row">
                    {Array.from({ length: 10 }).map((_, n) => (
                      <div className="dial-cell" key={n}>
                        <div className="dial-text">{n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="guide-text">
            "Trong bóng tối, chỉ có trái tim dẫn lối."
          </div>
        </div>
      </div>

      {/* 4. UNLOCKED CONTENT */}
      <div className={`inner-sanctuary ${isVerified ? "visible" : ""}`}>
        <div className="starry-night-bg"></div>

        <div className="zen-layout">
          <div className="sidebar-area" ref={sidebarRef}>
            {showSidebar && <LeftSidebar />}
          </div>

          <div className="main-altar">
            <div className="scroll-message">
              <div className="scroll-paper-dark">{children}</div>
            </div>

            <div className="cards-shrine">
              <div className="card-column left">
                <div className="ema-card-placeholder">
                  <ProfileCardWrapper
                    type="user"
                    name=" Tuấn Phúc"
                    handle="@hacker.lo"
                    role="The Keeper"
                    delay={0.5}
                  />
                </div>
              </div>

              <div className="heart-column" ref={heartRef}>
                {showHeart && <HeartCanvas />}
              </div>

              <div className="card-column right">
                <div className="ema-card-placeholder">
                  <ProfileCardWrapper
                    type="crush"
                    name="Người Ấy"
                    handle="@my.universe"
                    role="The Muse"
                    delay={0.7}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mưa hoa đêm bên trong */}
        <div className="inner-glow-storm">
          <GlowingSakura />
        </div>
      </div>

      <style jsx global>{`
        :root {
          --ebony: #121212;
          --charcoal: #1e1e1e;
          --gold-leaf: #d4af37;
          --gold-dim: #8a7342;
          --neon-pink: #ff0055;
          --glow-pink: #ff4d8d;
          --night-blue: #0a0e17;
        }

        /* --- SAKURA FIXED (Sửa lỗi: Position Fixed Full Screen) --- */
        .sakura-night-container {
          position: fixed; /* QUAN TRỌNG: Để hoa không bị phụ thuộc vào cha */
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 105; /* Hiện trên Shoji (100) nhưng dưới Lock (110) */
          pointer-events: none; /* Click xuyên qua */
        }
        .glowing-petal {
          position: absolute;
          top: -10%;
          background: radial-gradient(circle, #fff, var(--glow-pink));
          border-radius: 50% 0 50% 50%;
          opacity: 0.8;
          animation: fall-glow 10s linear infinite;
          box-shadow: 0 0 5px var(--glow-pink);
        }
        @keyframes fall-glow {
          0% {
            top: -10%;
            transform: translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            top: 110%;
            transform: translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }

        .firefly {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffff00;
          border-radius: 50%;
          box-shadow: 0 0 10px #ffff00;
          animation: fly 20s infinite alternate;
          top: 50%;
          left: 50%;
        }
        @keyframes fly {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(100px, -50px);
            opacity: 0;
          }
        }

        /* --- DARK SHOJI GATES --- */
        .dark-shoji-container {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          pointer-events: none;
          background: #000;
        }
        .shoji-panel {
          width: 50%;
          height: 100%;
          background: #050505;
          position: relative;
          transition: transform 1.8s cubic-bezier(0.2, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          border-right: 2px solid #000;
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.9);
        }
        .shoji-panel.right {
          border-left: 2px solid #000;
          border-right: none;
        }

        .dark-paper-texture {
          position: absolute;
          inset: 0;
          background: #111;
          opacity: 1;
          background-image: url("https://www.transparenttextures.com/patterns/black-linen.png");
        }
        .lattice-pattern {
          position: absolute;
          inset: 10px;
          border: 12px solid #000;
          background-image: linear-gradient(#000 6px, transparent 6px),
            linear-gradient(90deg, #000 6px, transparent 6px);
          background-size: 120px 180px;
          background-position: center;
          opacity: 0.6;
        }

        .dark-shoji-container.open .shoji-panel.left {
          transform: translateX(-100%);
        }
        .dark-shoji-container.open .shoji-panel.right {
          transform: translateX(100%);
        }
        .dark-shoji-container.open .lock-box-wrapper {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s;
        }

        /* --- LOCK BOX (ĐẨY XUỐNG 60%) --- */
        .lock-box-wrapper {
          position: absolute;
          top: 60%;
          left: 50%; /* GIỮ NGUYÊN VỊ TRÍ THẤP */
          transform: translate(-50%, -50%);
          z-index: 110;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          width: 100%;
          pointer-events: none;
        }

        .lock-mechanism {
          pointer-events: auto;
          background: #1a1a1a;
          padding: 30px;
          border-radius: 2px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 1),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          position: relative;
          width: 360px;
          background-image: linear-gradient(to bottom, #222, #111);
        }

        .gold-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid var(--gold-leaf);
          transition: all 0.3s;
          opacity: 0.6;
        }
        .top-left {
          top: 6px;
          left: 6px;
          border-right: 0;
          border-bottom: 0;
        }
        .top-right {
          top: 6px;
          right: 6px;
          border-left: 0;
          border-bottom: 0;
        }
        .bottom-left {
          bottom: 6px;
          left: 6px;
          border-right: 0;
          border-top: 0;
        }
        .bottom-right {
          bottom: 6px;
          right: 6px;
          border-left: 0;
          border-top: 0;
        }

        .code-display-dark {
          background: #000;
          padding: 15px 20px;
          border-radius: 4px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #333;
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.02);
        }
        .current-code {
          font-family: "Courier New", monospace;
          font-size: 28px;
          color: var(--gold-leaf);
          letter-spacing: 6px;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
          font-weight: bold;
        }
        .status-led {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-family: monospace;
          color: #555;
          letter-spacing: 1px;
        }
        .led-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #333;
        }
        .status-led.verified {
          color: var(--gold-leaf);
        }
        .status-led.verified .led-dot {
          background: var(--gold-leaf);
          box-shadow: 0 0 8px var(--gold-leaf);
        }

        .dials-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dial-row-wrapper {
          position: relative;
          background: #0f0f0f;
          border-radius: 4px;
          overflow: hidden;
          height: 54px;
          border: 1px solid #333;
        }
        .glass-highlight {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 54px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.05),
            transparent 40%,
            transparent 60%,
            rgba(255, 255, 255, 0.05)
          );
          border-left: 1px solid var(--gold-dim);
          border-right: 1px solid var(--gold-dim);
          pointer-events: none;
          z-index: 5;
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
        }

        .dial-row {
          height: 100%;
        }
        .dial-cell {
          width: 65px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #444;
        }
        .dial-text {
          font-family: "Playfair Display", serif;
          font-size: 22px;
          transition: all 0.3s;
          transform: scale(0.8);
        }
        .is-selected .dial-text {
          color: #fff;
          font-weight: bold;
          transform: scale(1.2);
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        }

        .moon-lantern {
          position: absolute;
          top: -90px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #000;
          border: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
          animation: float 4s ease-in-out infinite;
        }
        .moon-text {
          color: var(--gold-leaf);
          font-size: 20px;
          font-family: serif;
        }
        .guide-text {
          color: #666;
          font-style: italic;
          font-size: 11px;
          letter-spacing: 2px;
          margin-top: 15px;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .inner-sanctuary {
          position: fixed;
          inset: 0;
          z-index: 50; /* Thấp hơn Shoji/Lock khi ẩn */
          opacity: 0;
          pointer-events: none;
          transition: opacity 2s ease 1s;
          background: #050505;
          overflow-y: auto;
        }
        .inner-sanctuary.visible {
          z-index: 130; /* Khi mở khóa, đưa nội dung lên trên */
          opacity: 1;
          pointer-events: auto;
        }

        .starry-night-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          background: radial-gradient(circle at 50% 10%, #1a1a2e 0%, #000 70%);
        }

        .zen-layout {
          display: flex;
          min-height: 100vh;
          padding: 100px 40px 40px; /* tăng padding-top để đẩy khung xuống dưới nav */
          gap: 40px;
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .main-altar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scroll-message {
          width: 100%;
          max-width: 700px;
          margin-bottom: 60px;
          animation: unfold 1.5s ease 1.5s backwards;
        }

        .cards-shrine {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          width: 100%;
          perspective: 1000px;
        }
        .ema-card-placeholder {
          transition: transform 0.5s;
        }
        .ema-card-placeholder:hover {
          transform: translateY(-10px);
        }

        @media (max-width: 1024px) {
          .cards-shrine {
            flex-direction: column;
          }
          .lock-mechanism {
            transform: scale(0.9);
            width: 320px;
          }
        }
      `}</style>
    </>
  );
}
