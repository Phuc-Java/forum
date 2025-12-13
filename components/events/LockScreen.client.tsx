"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import "flickity/css/flickity.css";
import { useRouter } from "next/navigation";
import ProfileCard from "../ui/ProfileCard"; // Giả định path này đúng
import dynamic from "next/dynamic";

// Dynamic imports để tối ưu Performance
const HeartCanvas = dynamic(() => import("./HeartCanvas.client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-pink-500/50">
      Loading Heart...
    </div>
  ),
});

const LeftSidebar = dynamic(() => import("./LeftSidebar.client"), {
  ssr: false,
});

export default function LockScreen({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [code, setCode] = useState("0000");
  const [isVerified, setIsVerified] = useState(false);

  // States cho lazy load UI components khi unlock
  const heartRef = useRef<HTMLDivElement | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // --- LOGIC Ổ KHÓA (GIỮ NGUYÊN CORE LOGIC) ---
  useEffect(() => {
    if (!rootRef.current) return;

    (async () => {
      const FlickityModule = (await import("flickity")).default;
      const HowlModule = (await import("howler")).Howl;

      const dom = {
        lock: rootRef.current!.querySelector(".lock") as HTMLElement,
        rows: Array.from(
          rootRef.current!.querySelectorAll(".row")
        ) as HTMLElement[],
      };

      // Sound setup (Giữ nguyên)
      const sounds: Record<string, any> = {
        select: new HowlModule({
          src: ["https://jackrugile.com/sounds/misc/lock-button-1.mp3"],
          volume: 0.5,
          rate: 1.4,
        }),
        prev: new HowlModule({
          src: ["https://jackrugile.com/sounds/misc/lock-button-4.mp3"],
          volume: 0.5,
          rate: 1,
        }),
        next: new HowlModule({
          src: ["https://jackrugile.com/sounds/misc/lock-button-4.mp3"],
          volume: 0.5,
          rate: 1.2,
        }),
        hover: new HowlModule({
          src: ["https://jackrugile.com/sounds/misc/lock-button-1.mp3"],
          volume: 0.2,
          rate: 3,
        }),
        success: new HowlModule({
          src: ["https://jackrugile.com/sounds/misc/lock-online-1.mp3"],
          volume: 0.5,
          rate: 1,
        }),
        fail: new HowlModule({
          src: ["https://jackrugile.com/sounds/misc/lock-fail-1.mp3"],
          volume: 0.6,
          rate: 1,
        }),
      };

      const pin = "8844";
      let verified = false;

      function getCode() {
        let code = "";
        for (let i = 0; i < dom.rows.length; i++) {
          const sel = dom.rows[i].querySelector(".is-selected .text");
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
          // Delay nhẹ để hiệu ứng âm thanh khớp với visual
          setTimeout(() => setIsVerified(true), 300);
        } else {
          if (verified) sounds.fail.play();
          verified = false;
          setIsVerified(false);
        }
      }

      // Flickity Setup
      type FlktyLike = {
        selectedIndex?: number;
        on?: (ev: string, cb: () => void) => void;
        destroy?: () => void;
      };
      const flktys: any[] = [];
      const lastIndexMap = new WeakMap<object, number>();

      dom.rows.forEach((row) => {
        const flkty = new FlickityModule(row as Element, {
          selectedAttraction: 0.25,
          friction: 0.9,
          cellAlign: "center",
          pageDots: false,
          wrapAround: true,
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

      // Buttons
      const prevNextBtns = dom.lock.querySelectorAll(
        ".flickity-prev-next-button"
      );
      prevNextBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.classList.contains("previous")) sounds.prev.play();
          else sounds.next.play();
        });
      });

      function onResize() {
        if (!dom.lock) return;
        dom.lock.style.marginLeft = window.innerWidth % 2 === 0 ? "0px" : "1px";
      }
      window.addEventListener("resize", onResize);
      onResize();
      onChange();

      return () => {
        window.removeEventListener("resize", onResize);
        flktys.forEach((f) => f?.destroy?.());
        Object.values(sounds).forEach((s) => s.unload && s.unload());
      };
    })();
  }, []);

  // Observers (Giữ nguyên logic tối ưu render)
  useEffect(() => {
    if (!isVerified) return; // Chỉ observe khi đã unlock

    // Tự động kích hoạt sau 1s nếu observer fail hoặc để mượt hơn
    const timer = setTimeout(() => {
      setShowHeart(true);
      setShowSidebar(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isVerified]);

  return (
    <>
      {/* BACKGROUND VŨ TRỤ (Dùng chung cho cả Locked và Unlocked) */}
      <div className="universe-bg" aria-hidden="true">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      {/* --- PHẦN 1: MÀN HÌNH KHÓA --- */}
      <main
        className={`lock-wrapper ${isVerified ? "unlocked-anim" : ""}`}
        ref={rootRef}
      >
        {/* Hint Box (Đẹp hơn, Glassmorphism) */}
        <div className="floating-hint">
          <div className="hint-icon">🔒</div>
          <div className="hint-text">MẬT MÃ TRÁI TIM</div>
        </div>

        <div className={`lock ${isVerified ? "verified" : ""}`}>
          <div className="screen">
            <div className="code">{code}</div>
            <div className="status">
              {isVerified ? "ACCESS GRANTED" : "LOCKED"}
            </div>
            <div className="scanlines"></div>
          </div>
          <div className="rows">
            {Array.from({ length: 4 }).map((_, r) => (
              <div className="row" key={r}>
                {Array.from({ length: 10 }).map((_, n) => (
                  <div className="cell" key={n}>
                    <div className="text">{n}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- PHẦN 2: NỘI DUNG ĐÃ MỞ KHÓA --- */}
      <div className={`unlocked-content ${isVerified ? "visible" : ""}`}>
        {/* SIDEBAR NHIỆT KẾ (Bên trái) */}
        <div className="sidebar-zone" ref={sidebarRef}>
          {showSidebar && <LeftSidebar />}
        </div>

        <div className="main-stage">
          {/* LỜI NHẮN BÍ MẬT */}
          <div className="secret-message-box">{children}</div>

          {/* KHU VỰC ROMANCE (Profile Cards + Heart) */}
          <div className="romance-stage">
            {/* User Card (Trái) */}
            <div className="card-wrapper left-card">
              <ProfileCard
                name="Nguyễn Tuấn Phúc"
                title="Hacker Lỏ / Developer"
                handle="@NguyenTuanPhuc"
                status="Online"
                contactText="Info"
                avatarUrl="/vest1-removebg-preview.png"
                showUserInfo={true}
                enableTilt={true}
              />
            </div>

            {/* Trái tim 3D (Giữa) */}
            <div className="heart-wrapper" ref={heartRef}>
              {showHeart && <HeartCanvas />}
            </div>

            {/* Crush Card (Phải) */}
            <div className="card-wrapper right-card">
              <ProfileCard
                name="Người Ấy"
                title="My Universe"
                handle="@MyCrush"
                status="Sleepy"
                contactText="Message"
                avatarUrl="/unnamed__25_-removebg-preview.png"
                showUserInfo={true}
                enableTilt={true}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* --- GLOBAL & FONTS --- */
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Share+Tech+Mono&family=Playfair+Display:ital,wght@1,600&display=swap");

        /* --- BACKGROUND VŨ TRỤ --- */
        .universe-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000
            url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png")
            repeat top center;
          z-index: 0;
          overflow: hidden;
        }
        .twinkling {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent
            url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/twinkling.png")
            repeat top center;
          z-index: 1;
          animation: move-twink-back 200s linear infinite;
          opacity: 0.4;
        }
        @keyframes move-twink-back {
          from {
            background-position: 0 0;
          }
          to {
            background-position: -10000px 5000px;
          }
        }

        /* --- LOCK SCREEN WRAPPER --- */
        .lock-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 50;
          transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55),
            opacity 0.6s ease;
        }
        .lock-wrapper.unlocked-anim {
          transform: translateY(-150vh) scale(0.8); /* Bay lên trời khi mở */
          opacity: 0;
          pointer-events: none;
        }

        /* --- LOCK UI (Tối ưu từ code cũ) --- */
        .lock {
          position: relative;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);
          max-width: 300px;
          width: 90%;
        }
        /* Gradient viền */
        .lock:before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #ff00cc, #333399, #00d4ff);
          z-index: -1;
          border-radius: 18px;
          opacity: 0.5;
          filter: blur(10px);
        }

        /* Hint Box */
        .floating-hint {
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 24px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-family: "Share Tech Mono", monospace;
          box-shadow: 0 0 15px rgba(25, 255, 176, 0.2);
          animation: pulse-hint 2s infinite;
        }
        @keyframes pulse-hint {
          0% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(25, 255, 176, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(25, 255, 176, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(25, 255, 176, 0.2);
          }
        }

        .screen {
          background: #050505;
          height: 50px;
          border-radius: 8px;
          position: relative;
          margin-bottom: 15px;
          overflow: hidden;
          border: 1px solid #222;
        }
        .code {
          position: absolute;
          left: 15px;
          line-height: 50px;
          color: #19ffb0;
          font-family: "Orbitron", sans-serif;
          font-size: 1.5rem;
          letter-spacing: 4px;
          text-shadow: 0 0 10px rgba(25, 255, 176, 0.6);
        }
        .status {
          position: absolute;
          right: 15px;
          line-height: 50px;
          color: #ff3333;
          font-family: "Share Tech Mono", monospace;
          font-size: 0.9rem;
        }
        .verified .status {
          color: #19ffb0;
          text-shadow: 0 0 8px #19ffb0;
        }
        .verified .code {
          color: #fff;
          text-shadow: 0 0 15px #fff;
        }

        /* Scanlines Effect */
        .scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.2)
          );
          background-size: 100% 4px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .rows {
          margin: 0 auto;
          width: 220px;
        }
        .row {
          height: 60px;
          position: relative;
          margin-bottom: 4px;
        }
        /* Gradient mờ 2 bên row */
        .row:before,
        .row:after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 30%;
          z-index: 2;
          pointer-events: none;
        }
        .row:before {
          left: 0;
          background: linear-gradient(90deg, #0a0a0f, transparent);
        }
        .row:after {
          right: 0;
          background: linear-gradient(-90deg, #0a0a0f, transparent);
        }

        .cell {
          width: 70px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          /* Không dùng float nữa để tương thích flickity hiện đại */
        }
        .text {
          font-family: "Orbitron", monospace;
          font-size: 1.8rem;
          color: #555;
          transition: all 0.3s ease;
          transform: scale(0.6);
        }
        .is-selected .text {
          color: #fff;
          transform: scale(1.1);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }
        .verified .is-selected .text {
          color: #19ffb0;
          text-shadow: 0 0 15px #19ffb0;
        }

        /* Custom Flickity Arrows */
        .flickity-prev-next-button {
          width: 30px;
          height: 30px;
          background: transparent;
        }
        .flickity-prev-next-button svg {
          fill: rgba(255, 255, 255, 0.3);
        }
        .flickity-prev-next-button:hover svg {
          fill: #19ffb0;
        }

        /* --- UNLOCKED UI --- */
        .unlocked-content {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 40;
          display: flex;
          flex-direction: column;
          opacity: 0;
          visibility: hidden;
          transition: opacity 1s ease 0.5s, visibility 0s 0.5s; /* Delay để đợi lock bay đi */
          overflow-y: auto; /* Cho phép scroll nếu nội dung dài */
          padding-bottom: 50px;
        }
        .unlocked-content.visible {
          opacity: 1;
          visibility: visible;
        }

        /* Message Box */
        .secret-message-box {
          margin-top: 80px; /* Tránh navbar nếu có */
          margin-bottom: 40px;
          padding: 0 20px;
          animation: fadeInDown 1s ease 1s backwards;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Romance Stage: Layout chính */
        .romance-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap; /* Responsive */
        }

        .card-wrapper {
          flex: 1;
          min-width: 300px;
          max-width: 350px;
          animation: fadeInUp 1s ease 1.2s backwards;
        }
        .card-wrapper.right-card {
          animation-delay: 1.4s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Heart Container */
        .heart-wrapper {
          width: 300px;
          height: 300px;
          position: relative;
          flex-shrink: 0;
          animation: zoomIn 1s ease 1.6s backwards;
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .romance-stage {
            gap: 20px;
          }
          .heart-wrapper {
            order: -1;
            width: 200px;
            height: 200px;
            margin-bottom: -20px;
          }
        }
        @media (max-width: 768px) {
          .lock-wrapper {
            padding-top: 0;
          }
          .romance-stage {
            flex-direction: column;
          }
          .card-wrapper {
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
