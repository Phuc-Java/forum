import React from "react";
import LockScreen from "@/components/events/LockScreen.client";
import type { Metadata } from "next";

// --- METADATA (SEO tối ưu cho lãng mạn) ---
export const metadata: Metadata = {
  title: "Vườn Địa Đàng Của Riêng Em | My Secret Universe",
  description:
    "Nơi những cánh hoa rơi 5cm/s, nơi anh cất giữ những điều chưa nói.",
  openGraph: {
    title: "Gửi người đặc biệt...",
    description: "Một chút bình yên giữa thế giới vội vã.",
    images: ["/sakura-cover.jpg"], // Giả định
  },
};

export default function Page() {
  return (
    <main className="japanese-theme-wrapper">
      {/* ===========================================
        LỚP NỀN SERVER-SIDE (VẼ BẰNG CSS THUẦN) 
        Tối ưu Performance vì không cần fetch ảnh
        ===========================================
      */}
      <div className="scenery-layer">
        <div className="moon-glow" />
        <div className="mount-fuji" />
        <div className="lake-reflection" />
        <div className="bamboo-forest" />
        <div className="fog-layer" />
      </div>

      {/* ===========================================
        LỚP HẠT TĨNH (STATIC NOISE TEXTURE)
        Tạo cảm giác giấy Washi cổ điển
        ===========================================
      */}
      <div className="washi-paper-texture" />

      {/* ===========================================
        CONTENT CHÍNH (ĐƯỢC BỌC TRONG LOCKSCREEN)
        ===========================================
      */}
      <LockScreen>
        <div className="secret-content-container">
          {/* Tiêu đề dọc theo phong cách Haiku */}
          <div className="vertical-writing-container">
            <h3 className="secret-title">
              <span className="char">G</span>
              <span className="char">ử</span>
              <span className="char">i</span>
              <span className="space" />
              <span className="char highlight">E</span>
              <span className="char highlight">m</span>
            </h3>
          </div>

          <div className="message-body">
            <p className="secret-text">
              Nếu vận tốc của hoa anh đào không phải là 5cm/s thì có lẽ nó đã
              không đẹp đến thế. Và nếu khoảng cách giữa chúng ta không phải là
              những con số này, có lẽ tôi đã không trân trọng em nhiều đến vậy.
            </p>
            <div className="separator-line">
              <span className="flower-icon">🌸</span>
            </div>
            <p className="secret-text sub-text">
              Nhập mật mã để mở cửa trái tim tôi.
            </p>
          </div>

          <div className="secret-signature">
            — Nguyễn Tuấn Phúc —<div className="seal-stamp">福</div>{" "}
            {/* Chữ Phúc triện đỏ */}
          </div>
        </div>
      </LockScreen>

      {/* ===========================================
        GLOBAL STYLES (INJECTED SERVER SIDE)
        ===========================================
      */}
      <style>{`
        /* --- FONTS IMPORT --- */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;500;700&family=Playfair+Display:ital,wght@1,400;1,600&family=Dancing+Script:wght@500&display=swap');

        :root {
          --jp-red: #d63031;
          --jp-pink: #fd79a8;
          --jp-soft-pink: #fab1a0;
          --jp-dark: #2d3436;
          --jp-paper: #f1f2f6;
          --jp-gold: #e1b12c;
          --jp-indigo: #192a56;
        }

        /* --- LAYOUT CHÍNH --- */
        .japanese-theme-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: radial-gradient(circle at 50% 20%, #2c3e50 0%, #000000 100%);
          font-family: 'Noto Serif JP', serif;
          color: white;
        }

        /* --- TEXTURE GIẤY WASHI --- */
        .washi-paper-texture {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
          opacity: 0.4;
          z-index: 2;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* --- VẼ PHONG CẢNH (CSS PAINTING) --- */
        .scenery-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        /* Ánh trăng */
        .moon-glow {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(255,234,234,0.1) 0%, rgba(255,105,180,0.05) 30%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          animation: moonPulse 10s ease-in-out infinite alternate;
        }

        /* Núi Phú Sĩ cách điệu */
        .mount-fuji {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120vw;
          height: 40vh;
          background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, #a29bfe 20%, #2d3436 100%);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          opacity: 0.3;
        }

        /* Sương mù */
        .fog-layer {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 30vh;
          background: linear-gradient(to top, #000 0%, transparent 100%);
          opacity: 0.8;
        }

        /* --- CONTENT STYLING --- */
        .secret-content-container {
          position: relative;
          z-index: 10;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Tiêu đề dọc (Vertical Writing) */
        .vertical-writing-container {
          position: absolute;
          right: -50px;
          top: 0;
          writing-mode: vertical-rl;
          text-orientation: upright;
          display: none; /* Hiện trên màn hình lớn */
        }
        @media(min-width: 1024px) {
          .vertical-writing-container { display: block; }
        }

        .secret-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          color: var(--jp-soft-pink);
          margin-bottom: 2rem;
          text-shadow: 0 0 20px rgba(253, 121, 168, 0.6);
          letter-spacing: 0.2em;
        }
        .secret-title .highlight {
          color: #fff;
          font-weight: bold;
        }

        .message-body {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          padding: 3rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; /* Bo góc ít theo phong cách giấy */
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          max-width: 600px;
          position: relative;
        }
        /* Họa tiết 4 góc khung */
        .message-body::before, .message-body::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid var(--jp-soft-pink);
          transition: all 0.5s ease;
        }
        .message-body::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .message-body::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        .secret-text {
          font-family: 'Noto Serif JP', serif;
          font-size: 1.1rem;
          line-height: 2;
          color: rgba(255, 255, 255, 0.9);
          text-align: justify;
          text-align-last: center;
          font-weight: 300;
        }

        .sub-text {
          font-size: 0.9rem;
          color: var(--jp-soft-pink);
          margin-top: 1rem;
          font-style: italic;
        }

        .separator-line {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.5rem 0;
          opacity: 0.5;
        }
        .separator-line::before, .separator-line::after {
          content: '';
          height: 1px;
          width: 50px;
          background: linear-gradient(90deg, transparent, #fff, transparent);
        }
        .flower-icon {
          margin: 0 10px;
          font-size: 1.2rem;
          animation: spinSlow 10s linear infinite;
        }

        .secret-signature {
          margin-top: 3rem;
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          letter-spacing: 3px;
          display: flex;
          align-items: center;
          gap: 15px;
          opacity: 0.8;
        }

        /* Triện đỏ (Seal Stamp) */
        .seal-stamp {
          width: 36px;
          height: 36px;
          background-color: #b33939; /* Màu đỏ mực tàu */
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Noto Serif JP', serif;
          font-weight: bold;
          font-size: 18px;
          border: 2px solid #eebbww;
          box-shadow: 0 0 10px rgba(179, 57, 57, 0.5);
          transform: rotate(-10deg);
        }

        /* --- ANIMATIONS --- */
        @keyframes moonPulse {
          from { opacity: 0.8; transform: translateX(-50%) scale(1); }
          to { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .secret-title { font-size: 2rem; }
          .message-body { padding: 1.5rem; }
          .mount-fuji { height: 20vh; }
        }
      `}</style>
    </main>
  );
}
