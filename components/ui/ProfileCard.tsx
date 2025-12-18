/* eslint-disable react/no-unknown-property */
import React, { useRef, useCallback } from "react";

// --- CẤU HÌNH ---
const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 400, // Ms
};

const clamp = (value: number, min = 0, max = 100): number =>
  Math.min(Math.max(value, min), max);

interface ProfileCardProps {
  avatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  className?: string;
  enableTilt?: boolean;
  emaTop?: string;
  emaRight?: string;
  emaZ?: number;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl,
  name = "Vô Danh",
  title = "Lãng Khách",
  handle = "@unknown",
  className = "",
  enableTilt = true,
  emaTop,
  emaRight,
  emaZ,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  // --- LOGIC TILT 3D ---
  const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;

    const wrap = wrapRef.current;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Tính % vị trí chuột
    const pX = clamp((x / rect.width) * 100);
    const pY = clamp((y / rect.height) * 100);

    // Tính góc nghiêng
    const rX = -((pY - 50) / 3);
    const rY = (pX - 50) / 3;

    wrap.style.setProperty("--px", `${pX}%`);
    wrap.style.setProperty("--py", `${pY}%`);
    wrap.style.setProperty("--rx", `${rX}deg`);
    wrap.style.setProperty("--ry", `${rY}deg`);
    wrap.style.setProperty("--opacity", "1");
  }, []);

  const handleLeave = useCallback(() => {
    if (!wrapRef.current) return;
    const wrap = wrapRef.current;

    wrap.style.transition = `transform ${ANIMATION_CONFIG.SMOOTH_DURATION}ms ease-out`;
    wrap.style.setProperty("--rx", "0deg");
    wrap.style.setProperty("--ry", "0deg");
    wrap.style.setProperty("--opacity", "0");

    setTimeout(() => {
      wrap.style.transition = "";
    }, ANIMATION_CONFIG.SMOOTH_DURATION);
  }, []);

  // If avatarUrl provided and not an absolute URL, treat it as a public path
  let avatarSrc: string | undefined = avatarUrl;
  if (avatarUrl) {
    if (!avatarUrl.startsWith("http") && !avatarUrl.startsWith("/")) {
      // strip leading `public/` if someone passed that
      avatarSrc = avatarUrl.replace(/^public\//, "");
      avatarSrc = `/${avatarSrc}`;
    }
  }

  const safeAvatar =
    avatarSrc ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=000&color=fff&size=512`;

  // CSS variables for ema position so callers can override via props or inline style
  const emaStyle = {
    ["--ema-top" as any]: emaTop ?? "100px",
    ["--ema-right" as any]: emaRight ?? "-17px",
    ["--ema-z" as any]: String(emaZ ?? 60),
  } as React.CSSProperties;

  return (
    <div
      ref={wrapRef}
      className={`omamori-wrapper ${className}`}
      onPointerMove={enableTilt ? handleMove : undefined}
      onPointerLeave={enableTilt ? handleLeave : undefined}
      style={emaStyle}
    >
      <section ref={cardRef} className="omamori-pivot">
        {/* --- TÚI BÙA CHÍNH --- */}
        <div className="omamori-bag">
          <div className="knot-system">
            <div className="string-loop"></div>
            <div className="knot-center"></div>
            <div className="tassel-strings"></div>
          </div>
          <div className="fabric-pattern"></div>
          <div className="noise-texture"></div>
          <div className="shimmer-layer"></div>
          <div className="content-container">
            <div className="portal-avatar">
              <div className="rune-ring"></div>
              <div className="avatar-mask">
                <img src={safeAvatar} alt={name} className="avatar-img" />
              </div>
            </div>
            <div className="info-block">
              <h2 className="name-display">{name}</h2>
              <div className="separator">
                <span className="diamond">◆</span>
              </div>
              <p className="title-display">{title}</p>
              <div className="cyber-tag">
                <span className="handle-text">{handle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- THẺ GỖ EMA (Nằm trên cùng, lắc lư) --- */}
        <div className="ema-charm">
          <div className="ema-rope"></div>
          <div className="ema-wood">
            <div className="wood-grain"></div>
            <span className="ema-text">縁</span>
          </div>
        </div>
      </section>

      <style jsx>{`
        .ema-charm {
          position: absolute;
          top: var(--ema-top, 12px); /* đặt nằm trên cạnh */
          right: var(--ema-right, -20px); /* hơi lòi ra ngoài */
          width: 40px;
          height: 62px;
          background: #8b5a2b; /* Màu gỗ */
          border: 2px solid #5c3a1b;
          border-radius: 4px 4px 10px 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-origin: top center;
          animation: swingCharm 3s ease-in-out infinite;
          z-index: var(--ema-z, 60); /* nổi trên thẻ */
          transform: translateZ(40px);
          box-shadow: 5px 8px 22px rgba(0, 0, 0, 0.6);
          transition: transform 300ms ease, box-shadow 300ms ease;
        }

        /* Khi thẻ được hover hoặc tilt, khiến thẻ gỗ lắc và bật ra ngoài hơn */
        .omamori-wrapper:hover .ema-charm,
        .omamori-wrapper:active .ema-charm {
          transform: translateZ(80px) translateX(8px) rotate(6deg);
          box-shadow: 8px 12px 32px rgba(0, 0, 0, 0.7);
        }
        /* --- CẤU TRÚC CHÍNH --- */
        .omamori-wrapper {
          width: 300px;
          height: 480px;
          perspective: 1000px;
          z-index: 10;
          --rx: 0deg;
          --ry: 0deg;
          --px: 50%;
          --py: 50%;
          --opacity: 0;
          --theme-main: #d4af37;
          --theme-accent: #fff;
          --theme-bg: #111;
          --theme-glow: rgba(212, 175, 55, 0.5);
        }
        .ronin-style {
          --theme-main: #ff3333;
          --theme-accent: #ffcc00;
          --theme-bg: #1a0505;
          --theme-glow: rgba(255, 51, 51, 0.6);
        }
        .muse-style {
          --theme-main: #ff00cc;
          --theme-accent: #00ffff;
          --theme-bg: #1a051a;
          --theme-glow: rgba(255, 0, 204, 0.6);
        }

        .omamori-pivot {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(var(--rx)) rotateY(var(--ry));
          transition: transform 0.1s;
        }

        .omamori-bag {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
          clip-path: polygon(
            20% 0%,
            80% 0%,
            100% 12%,
            100% 100%,
            0% 100%,
            0% 12%
          );
          background-color: var(--theme-bg);
          box-shadow: inset 0 0 0 4px var(--theme-main),
            inset 0 0 40px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 40px;
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8));
        }

        .fabric-pattern {
          position: absolute;
          inset: 4px;
          background-image: repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 10px
            ),
            repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 10px
            );
          z-index: 0;
          pointer-events: none;
        }
        .noise-texture {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          z-index: 1;
        }
        .shimmer-layer {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at var(--px) var(--py),
            rgba(255, 255, 255, 0.2) 0%,
            transparent 60%
          );
          opacity: var(--opacity);
          mix-blend-mode: overlay;
          z-index: 10;
          pointer-events: none;
        }

        .knot-system {
          position: absolute;
          top: 15px;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 20;
          transform: translateZ(30px);
        }
        .knot-center {
          width: 24px;
          height: 24px;
          background: var(--theme-accent);
          border-radius: 50%;
          border: 4px solid var(--theme-main);
          box-shadow: 0 0 15px var(--theme-glow);
          z-index: 2;
        }
        .string-loop {
          position: absolute;
          top: -10px;
          width: 80px;
          height: 40px;
          border: 4px solid var(--theme-main);
          border-bottom: none;
          border-radius: 50px 50px 0 0;
          z-index: 1;
        }
        .tassel-strings {
          position: absolute;
          top: 12px;
          width: 4px;
          height: 380px;
          background: var(--theme-main);
          z-index: 0;
          opacity: 0.8;
          box-shadow: 0 0 10px var(--theme-glow);
        }

        .content-container {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          transform: translateZ(20px);
        }
        .portal-avatar {
          position: relative;
          width: 140px;
          height: 140px;
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .rune-ring {
          position: absolute;
          inset: -10px;
          border: 2px dashed var(--theme-main);
          border-radius: 50%;
          animation: rotateSlow 20s linear infinite;
          opacity: 0.5;
        }
        .avatar-mask {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid var(--theme-accent);
          overflow: hidden;
          box-shadow: 0 0 20px var(--theme-glow);
          background: #000;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .info-block {
          text-align: center;
          color: var(--theme-accent);
          width: 85%;
        }
        .name-display {
          font-family: "Playfair Display", serif;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: var(--theme-main);
          text-shadow: 0 0 10px var(--theme-glow);
          letter-spacing: 1px;
        }
        .separator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px 0;
          opacity: 0.7;
        }
        .separator::before,
        .separator::after {
          content: "";
          width: 40px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--theme-accent),
            transparent
          );
        }
        .diamond {
          margin: 0 10px;
          font-size: 10px;
          color: var(--theme-main);
        }
        .title-display {
          font-family: "Share Tech Mono", monospace;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        .cyber-tag {
          display: inline-block;
          padding: 6px 16px;
          border: 1px solid var(--theme-main);
          background: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        }
        .handle-text {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--theme-accent);
        }

        /* --- EMA CHARM (THẺ GỖ) - Nằm NỔI trên túi bùa --- */
        .ema-charm {
          position: absolute;
          top: var(
            --ema-top,
            80px
          ); /* Vị trí trên thẻ (override via --ema-top) */
          right: var(
            --ema-right,
            20px
          ); /* Vị trí trên thẻ (override via --ema-right) */
          z-index: var(--ema-z, 30); /* Z-index (override via --ema-z) */
          transform-origin: top center;
          animation: swingCharm 3s ease-in-out infinite;
          transform-style: preserve-3d;
          /* Tạo bóng đổ xuống thẻ chính để tăng cảm giác nổi */
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.6));
        }
        .ema-rope {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 20px;
          background: #a53333;
        }
        .ema-wood {
          position: relative;
          width: 36px;
          height: 55px;
          background: #8b5a2b;
          border: 2px solid #5c3a1b;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .wood-grain {
          position: absolute;
          inset: 0;
          opacity: 0.3;
          background: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 2px,
            rgba(0, 0, 0, 0.2) 4px
          );
        }
        .ema-text {
          position: relative;
          z-index: 2;
          font-family: "Noto Serif JP", serif;
          color: #3e2723;
          font-weight: 900;
          font-size: 18px;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        @keyframes rotateSlow {
          100% {
            transform: rotate(360deg);
          }
        }
        /* Thêm translateZ nhẹ để tạo cảm giác nổi khối khi lắc */
        @keyframes swingCharm {
          0%,
          100% {
            transform: rotate(4deg) translateZ(10px);
          }
          50% {
            transform: rotate(-4deg) translateZ(10px);
          }
        }

        @media (max-width: 768px) {
          .omamori-wrapper {
            width: 260px;
            height: 420px;
          }
          .name-display {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
