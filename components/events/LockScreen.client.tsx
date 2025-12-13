"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import "flickity/css/flickity.css";
import { useRouter } from "next/navigation";
import ProfileCard from "../ui/ProfileCard";
import dynamic from "next/dynamic";

const HeartCanvas = dynamic(() => import("./HeartCanvas.client"), {
  ssr: false,
  loading: () => null,
});

const LeftSidebar = dynamic(() => import("./LeftSidebar.client"), {
  ssr: false,
  loading: () => null,
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
  const heartRef = useRef<HTMLDivElement | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;

    (async () => {
      // dynamic import browser-only libs at runtime to avoid SSR evaluation
      const FlickityModule = (await import("flickity")).default;
      const HowlModule = (await import("howler")).Howl;

      const dom = {
        lock: rootRef.current!.querySelector(".lock") as HTMLElement,
        rows: Array.from(
          rootRef.current!.querySelectorAll(".row")
        ) as HTMLElement[],
      };

      const sounds: Record<string, any> = {
        select: new HowlModule({
          src: [
            "https://jackrugile.com/sounds/misc/lock-button-1.mp3",
            "https://jackrugile.com/sounds/misc/lock-button-1.ogg",
          ],
          volume: 0.5,
          rate: 1.4,
        }),
        prev: new HowlModule({
          src: [
            "https://jackrugile.com/sounds/misc/lock-button-4.mp3",
            "https://jackrugile.com/sounds/misc/lock-button-4.ogg",
          ],
          volume: 0.5,
          rate: 1,
        }),
        next: new HowlModule({
          src: [
            "https://jackrugile.com/sounds/misc/lock-button-4.mp3",
            "https://jackrugile.com/sounds/misc/lock-button-4.ogg",
          ],
          volume: 0.5,
          rate: 1.2,
        }),
        hover: new HowlModule({
          src: [
            "https://jackrugile.com/sounds/misc/lock-button-1.mp3",
            "https://jackrugile.com/sounds/misc/lock-button-1.ogg",
          ],
          volume: 0.2,
          rate: 3,
        }),
        success: new HowlModule({
          src: [
            "https://jackrugile.com/sounds/misc/lock-online-1.mp3",
            "https://jackrugile.com/sounds/misc/lock-online-1.ogg",
          ],
          volume: 0.5,
          rate: 1,
        }),
        fail: new HowlModule({
          src: [
            "https://jackrugile.com/sounds/misc/lock-fail-1.mp3",
            "https://jackrugile.com/sounds/misc/lock-fail-1.ogg",
          ],
          volume: 0.6,
          rate: 1,
        }),
      };

      const pin = "2007";
      let verified = false;

      function getCode() {
        let code = "";
        for (let i = 0; i < dom.rows.length; i++) {
          const sel = dom.rows[i].querySelector(".is-selected .text");
          const num = sel ? sel.textContent : "0";
          code += num;
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
          setIsVerified(true);
        } else {
          if (verified) sounds.fail.play();
          verified = false;
          setIsVerified(false);
        }
      }

      // initialize Flickity on each row
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
          if (selected !== last) {
            onChange();
          }
          lastIndexMap.set(flkty as object, selected);
        });

        row.addEventListener("mouseenter", () => sounds.hover.play());
        flktys.push(flkty);
      });

      // prev/next buttons play sounds
      const prevNextBtns = dom.lock.querySelectorAll(
        ".flickity-prev-next-button"
      );
      prevNextBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.classList.contains("previous")) sounds.prev.play();
          else sounds.next.play();
        });
      });

      // responsive margin fix
      function onResize() {
        if (!dom.lock) return;
        if (window.innerWidth % 2 === 0) dom.lock.style.marginLeft = "0px";
        else dom.lock.style.marginLeft = "1px";
      }
      window.addEventListener("resize", onResize);
      onResize();

      // initial update
      onChange();

      return () => {
        window.removeEventListener("resize", onResize);
        flktys.forEach((f) => {
          try {
            if (f && typeof (f as FlktyLike).destroy === "function")
              (f as FlktyLike).destroy?.();
          } catch {
            // ignore
          }
        });
        prevNextBtns.forEach((btn) => {
          const clone = btn.cloneNode(true) as Element;
          btn.parentNode?.replaceChild(clone, btn);
        });
        // unload sounds
        Object.values(sounds).forEach((s) => s.unload && s.unload());
      };
    })();
  }, []);

  // Intersection observers: only mount heavy components when visible
  useEffect(() => {
    let hObserver: IntersectionObserver | null = null;
    let sObserver: IntersectionObserver | null = null;
    if (heartRef.current) {
      hObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              setShowHeart(true);
              hObserver?.disconnect();
            }
          });
        },
        { root: null, threshold: 0.1 }
      );
      hObserver.observe(heartRef.current);
    }
    if (sidebarRef.current) {
      sObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              setShowSidebar(true);
              sObserver?.disconnect();
            }
          });
        },
        { root: null, threshold: 0.01 }
      );
      sObserver.observe(sidebarRef.current);
    }
    return () => {
      hObserver?.disconnect();
      sObserver?.disconnect();
    };
  }, [isVerified]);

  return (
    <>
      <main className={`lock-main ${isVerified ? "hidden" : ""}`} ref={rootRef}>
        <div className="loader" aria-hidden="true"></div>
        <div className={`lock ${isVerified ? "verified" : ""}`}>
          <div className="screen">
            <div className="code">{code}</div>
            <div className="status">{isVerified ? "UNLOCKED" : "LOCKED"}</div>
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

      <div className={`page-content ${isVerified ? "visible" : "hidden"}`}>
        {isVerified ? (
          <>
            <div className="secret-box">
              <h2>Người ấy của tôi...</h2>
              <p>Đây là lời thầm kín — chỉ hiện sau khi mở khóa.</p>
            </div>
          </>
        ) : (
          children
        )}
        {isVerified && (
          <div className="connector" aria-hidden="true">
            <span className="connector-heart">❤</span>
          </div>
        )}
      </div>

      {isVerified && (
        <div className={`romance-area ${isVerified ? "visible" : ""}`}>
          <div className={`romance-wrapper ${isVerified ? "visible" : ""}`}>
            <div className="romance-box">
              <div className="romance-inner">
                <div className="romance-grid">
                  <div className="romance-col romance-left">
                    <ProfileCard
                      name="Nguyễn Tuấn Phúc"
                      title="Full Stack Developer"
                      handle="NguyenTuanPhuc"
                      status="Online"
                      contactText="Contact Me"
                      avatarUrl="/vest1-removebg-preview.png"
                      showUserInfo={true}
                      enableTilt={true}
                      enableMobileTilt={false}
                      onContactClick={() => router.push("/contact")}
                    />
                  </div>

                  <div className="romance-col romance-center">
                    <div
                      className="heart-link"
                      role="img"
                      aria-label="heart-canvas"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{ width: 72, height: 72, maxWidth: "100%" }}
                        ref={heartRef}
                      >
                        {showHeart ? <HeartCanvas /> : null}
                      </div>
                    </div>
                  </div>

                  <div className="romance-col romance-right">
                    <ProfileCard
                      name="Người Ấy"
                      title="Special Someone"
                      handle="MyCrush"
                      status="Offline"
                      contactText="View Profile"
                      avatarUrl="/unnamed__25_-removebg-preview.png"
                      showUserInfo={true}
                      enableTilt={true}
                      enableMobileTilt={false}
                      onContactClick={() => router.push("/profile")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isVerified && (
        <div ref={sidebarRef}>{showSidebar ? <LeftSidebar /> : null}</div>
      )}

      {isVerified && (
        <div className="hearts-overlay" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="heart"
              style={{
                left: `${(8 + i * 11) % 88}%`,
                top: `${(6 + i * 7) % 64}%`,
                animationDelay: `${(i * 0.18).toFixed(2)}s`,
                animationDuration: `${4 + (i % 4) * 0.8}s`,
                opacity: 0.08 + (i % 4) * 0.02,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        /* Sidebar styles — only active when unlocked */
        .mycrush-sidebar {
          position: fixed;
          left: 20px;
          top: 92px;
          width: 64px; /* narrow sidebar */
          height: calc(100vh - 112px);
          box-sizing: border-box;
          padding: 8px;
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
          pointer-events: none; /* empty sidebar, non-interactive */
        }
        @media (max-width: 980px) {
          .mycrush-sidebar {
            display: none;
          }
        }

        .lock-root {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
          /* leave space for top navbar without touching it */
          min-height: calc(100vh - 120px);
          padding: 40px 16px;
        }

        .lock {
          background: #000;
          border-bottom: 1px solid hsla(0, 0%, 15%, 1);
          border-left: 1px solid hsla(0, 0%, 15%, 1);
          box-shadow: -1px 1px 0 hsla(0, 0%, 6%, 1),
            -2px 2px 0 hsla(0, 0%, 5%, 1), -3px 3px 0 hsla(0, 0%, 4%, 1),
            -4px 4px 0 hsla(0, 0%, 3%, 1), -8px 8px 16px hsla(0, 0%, 0%, 0.5);
          position: relative;
          z-index: 2;
          max-width: 230px;
          width: min(230px, 90%);
          margin: 0 auto;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px;
          border-radius: 4px;
        }
        .lock:before {
          background: linear-gradient(
            90deg,
            hsla(0, 0%, 15%, 1) 0%,
            hsla(0, 0%, 35%, 1) 100%
          );
          content: "";
          height: 1px;
          left: 0;
          pointer-events: none;
          position: absolute;
          top: 0;
          width: 100%;
          z-index: 1;
        }
        .lock:after {
          background: linear-gradient(
            0deg,
            hsla(0, 0%, 15%, 1) 0%,
            hsla(0, 0%, 35%, 1) 100%
          );
          bottom: 0;
          content: "";
          height: 100%;
          pointer-events: none;
          position: absolute;
          right: 0;
          top: 0;
          width: 1px;
        }

        .screen {
          background: #000;
          height: 40px;
          position: relative;
        }
        .screen:before {
          background: linear-gradient(
            45deg,
            hsla(0, 0%, 100%, 0) 40%,
            hsla(0, 0%, 100%, 0.2) 100%
          );
          bottom: 0;
          content: "";
          left: 0;
          pointer-events: none;
          position: absolute;
          right: 0;
          top: 0;
          z-index: 1;
        }
        .screen:after {
          background: linear-gradient(
            90deg,
            hsla(0, 0%, 15%, 1) 0%,
            hsla(0, 0%, 35%, 1) 100%
          );
          bottom: 0;
          content: "";
          height: 1px;
          left: 0;
          position: absolute;
          width: 100%;
        }

        .code,
        .status {
          font-family: "Share Tech Mono", monospace;
          font-size: 1em;
          height: 40px;
          line-height: 42px;
          padding: 0 0.75em;
          position: absolute;
        }
        .code {
          color: #fff;
          left: 0;
          text-shadow: 0 0 15px #fff;
        }
        .verified .code {
          color: #0f0;
          text-shadow: 0 0 15px #0f0;
        }

        .status {
          animation: pulse 1000ms infinite alternate;
          color: #f00;
          right: 0;
          text-shadow: 0 0 15px #f00;
        }
        .verified .status {
          animation: pulse 300ms infinite alternate;
          color: #0f0;
          text-shadow: 0 0 15px #0f0;
        }
        @keyframes pulse {
          0% {
            opacity: 0.25;
          }
          100% {
            opacity: 1;
          }
        }

        .scanlines {
          background: linear-gradient(
            hsla(0, 0%, 100%, 0.04) 50%,
            hsla(0, 0%, 0%, 0.1) 50%
          );
          background-size: 100% 2px;
          bottom: 1px;
          left: 0;
          pointer-events: none;
          position: absolute;
          right: 1px;
          top: 1px;
          z-index: 1;
        }

        .rows {
          padding: 1px 2px 1px 1px;
          width: 210px;
          margin: 0 auto; /* center the rows inside the lock */
        }
        .row {
          height: 50px;
          width: 210px;
          position: relative;
        }
        .row:before,
        .row:after {
          bottom: 0;
          content: "";
          pointer-events: none;
          position: absolute;
          top: 0;
          width: 35%;
          z-index: 1;
        }
        .row:before {
          background: linear-gradient(
            90deg,
            hsla(0, 0%, 0%, 0.5),
            hsla(0, 0%, 0%, 0)
          );
          left: 0;
        }
        .row:after {
          background: linear-gradient(
            90deg,
            hsla(0, 0%, 0%, 0),
            hsla(0, 0%, 0%, 0.5)
          );
          right: 0;
        }

        .cell {
          background: linear-gradient(
            45deg,
            hsla(0, 0%, 5%, 1),
            hsla(0, 0%, 15%, 1)
          );
          box-shadow: inset 0 0 0 1px #000, inset 0 0 0 2px #383838;
          display: flex;
          height: 50px;
          position: relative;
          justify-content: center;
          width: 70px;
          float: left;
        }
        .cell:before {
          background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/836/noise.jpg);
          background-size: 256px 256px;
          bottom: 0;
          content: "";
          left: 0;
          opacity: 0.08;
          position: absolute;
          right: 0;
          top: 0;
          z-index: 1;
        }
        .cell:after {
          background: radial-gradient(
            hsla(0, 0%, 100%, 0.1),
            hsla(0, 0%, 100%, 0)
          );
          bottom: 0;
          content: "";
          left: 0;
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          transition-duration: 200ms;
          transition-property: opacity;
          z-index: 2;
        }
        .row:hover .cell:after {
          opacity: 1;
          transition-duration: 64ms;
        }

        .text {
          color: #fff;
          font-family: "Orbitron", monospace;
          font-size: 1.25em;
          font-weight: 500;
          line-height: 50px;
          opacity: 0.3;
          transform: scale(0.55);
          transition-duration: 150ms;
          transition-property: color, opacity, text-shadow, transform;
        }
        .is-selected .text {
          opacity: 1;
          transform: scale(1);
        }
        .verified .is-selected .text {
          color: #0f0;
        }

        /* flickity buttons */
        .flickity-prev-next-button {
          width: 60px;
          height: 50px;
          border: none;
          border-radius: 0;
          background: none;
        }
        .flickity-prev-next-button:before {
          background: linear-gradient(
            135deg,
            hsla(0, 0%, 55%, 1),
            hsla(0, 0%, 20%, 1)
          );
          bottom: 0;
          box-shadow: inset 0 1px 0 0 hsla(0, 0%, 100%, 0.3),
            inset 0 0 0 1px hsla(0, 0%, 100%, 0.2);
          content: "";
          height: 12px;
          left: 0;
          margin: auto;
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          transform: scale(1) rotate(45deg);
          transition-duration: 200ms;
          transition-property: background, box-shadow, opacity, transform;
          width: 12px;
          z-index: 1;
        }
        .flickity-prev-next-button:after {
          background: linear-gradient(
            135deg,
            hsla(0, 0%, 25%, 1),
            hsla(0, 0%, 10%, 1)
          );
          box-shadow: inset 0 1px 0 0 hsla(0, 0%, 100%, 0.15),
            inset 0 0 0 1px hsla(0, 0%, 100%, 0.1), 0 1px 0 hsla(0, 0%, 13%, 1),
            0 2px 0 hsla(0, 0%, 10%, 1), 0 3px 0 hsla(0, 0%, 8%, 1),
            0 4px 0 hsla(0, 0%, 6%, 1), 0 5px 16px hsla(0, 0%, 0%, 0.75);
          bottom: 0;
          content: "";
          height: 12px;
          left: 0;
          margin: auto;
          position: absolute;
          right: 0;
          top: 0;
          transform: scale(1) rotate(45deg);
          transition-duration: 200ms;
          transition-property: background, box-shadow, opacity, transform;
          width: 12px;
        }
        .flickity-prev-next-button:hover:before {
          opacity: 1;
          transform: scale(1) rotate(45deg);
          transition-duration: 64ms;
        }
        .flickity-prev-next-button:focus {
          outline: none;
          box-shadow: none;
        }
        .flickity-prev-next-button:active:before {
          transform: scale(1) translateX(-1px) translateY(3px) rotate(45deg);
          transition-duration: 64ms;
        }
        .flickity-prev-next-button.previous {
          left: -60px;
        }
        .flickity-prev-next-button.next {
          right: -60px;
        }
        .flickity-prev-next-button svg {
          display: none;
        }

        .info {
          color: #666;
          font-family: "Share Tech Mono", monospace;
          font-size: 0.75em;
          line-height: 1;
          padding-top: 24px;
          text-align: center;
          text-transform: uppercase;
          max-width: 760px;
          width: 96%;
          margin: 28px auto 0 auto;
        }
        .info p {
          margin-bottom: 10px;
        }
        .info a {
          color: #fff;
          text-decoration: none;
        }

        /* main overlay that contains only the lock */
        .lock-main {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          background: rgba(0, 0, 0, 0);
          pointer-events: auto;
          padding: 0;
          box-sizing: border-box;
        }
        .lock-main.hidden {
          opacity: 0;
          pointer-events: none;
          transition: opacity 360ms ease;
        }

        /* Page content remains hidden until verified */
        .page-content.hidden {
          opacity: 0;
          visibility: hidden;
          transform: translateY(8px);
          transition: opacity 420ms ease, transform 420ms ease,
            visibility 0s linear 420ms;
        }
        .page-content.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          transition: opacity 420ms ease, transform 420ms ease;
        }

        /* responsive tweaks */
        @media (max-width: 640px) {
          .lock-root {
            min-height: calc(100vh - 96px);
            padding: 24px 12px;
          }
          .lock {
            width: 100%;
          }
          .rows {
            width: 100%;
          }
          .row {
            width: 100%;
          }
        }

        /* reveal content area */
        .lock-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 480ms ease, opacity 360ms ease,
            transform 360ms ease;
          transform: translateY(8px);
        }
        /* secret box shown after unlock */
        .page-content {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          box-sizing: border-box;
        }
        .secret-box {
          /* larger romantic translucent panel */
          background: linear-gradient(
            180deg,
            rgba(255, 153, 204, 0.12),
            rgba(255, 102, 178, 0.08)
          );
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 2px solid rgba(255, 102, 178, 0.9);
          color: #fff;
          width: min(780px, 94%);
          max-width: 780px;
          padding: 40px 48px;
          border-radius: 18px;
          box-shadow: 0 30px 60px rgba(15, 6, 20, 0.55),
            0 6px 18px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          text-align: center;
          opacity: 0;
          transform: translateY(18px) scale(0.985);
          position: relative;
          overflow: hidden;
        }
        .secret-box:before {
          content: "❤";
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 18px;
          color: rgba(255, 255, 255, 0.18);
          filter: blur(0.3px);
          pointer-events: none;
        }
        .page-content.visible .secret-box {
          animation: revealSecret 560ms cubic-bezier(0.22, 0.9, 0.35, 1)
            forwards 120ms;
        }
        .secret-box h2 {
          margin: 0 0 12px 0;
          font-family: "Playfair Display", serif;
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: 0.6px;
          color: #fff;
          text-shadow: 0 6px 20px rgba(255, 102, 178, 0.12),
            0 2px 6px rgba(0, 0, 0, 0.4);
        }
        .secret-box p {
          margin: 0;
          margin-top: 6px;
          font-family: "Share Tech Mono", monospace;
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.05rem;
          line-height: 1.6;
          letter-spacing: 0.8px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
        /* wrapper for romantic paragraph placed under the secret box */
        .romance-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-top: 0px; /* bring boxes closer */
        }

        /* romantic paragraph box below the secret box */
        .romance-box {
          /* increase max size so tilted/offset profile cards don't get clipped */
          width: min(1160px, 96%);
          max-width: 1160px;
          margin-top: 8px;
          border-radius: 16px;
          padding: 0;
          position: relative;
          opacity: 0;
          transform: translateY(18px) scale(0.995);
          overflow: visible;
        }

        /* connector between secret-box and romance-box */
        .connector {
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          margin-top: 6px;
          margin-bottom: 6px;
        }
        .connector-heart {
          display: inline-block;
          font-size: 20px;
          color: rgba(255, 102, 178, 0.98);
          background: radial-gradient(
            circle at 50% 40%,
            rgba(255, 102, 178, 0.12),
            rgba(255, 102, 178, 0.02)
          );
          padding: 6px 10px;
          border-radius: 999px;
          box-shadow: 0 10px 30px rgba(255, 102, 178, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.35);
          transform-origin: center;
          animation: connectorBob 2400ms ease-in-out infinite;
        }
        @keyframes connectorBob {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-6px) scale(1.06);
            opacity: 0.95;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .romance-inner {
          background: linear-gradient(
            180deg,
            rgba(255, 102, 178, 0.08),
            rgba(255, 153, 204, 0.06)
          );
          border: 1px solid rgba(255, 102, 178, 0.32);
          box-shadow: 0 24px 48px rgba(10, 6, 12, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          /* more padding to give space around tilted cards */
          padding: 36px 48px;
          border-radius: 14px;
          text-align: center;
        }
        .romance-grid {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 36px;
        }
        /* give each profile column a fixed comfortable width so cards don't get squeezed */
        .romance-col {
          flex: 0 0 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .romance-center {
          flex: 0 0 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 980px) {
          .romance-grid {
            flex-direction: column;
            gap: 18px;
            align-items: center;
          }
          .romance-col {
            flex: 0 0 auto;
            width: min(92%, 420px);
          }
          .romance-center {
            flex: 0 0 auto;
            width: auto;
          }
          .romance-box {
            width: min(940px, 96%);
            max-width: 940px;
          }
        }
        .heart-link {
          display: inline-block;
          font-size: 34px;
          color: rgba(255, 102, 178, 0.98);
          background: radial-gradient(
            circle at 50% 40%,
            rgba(255, 102, 178, 0.12),
            rgba(255, 102, 178, 0.02)
          );
          padding: 10px 14px;
          border-radius: 999px;
          box-shadow: 0 10px 30px rgba(255, 102, 178, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.35);
          text-decoration: none;
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .heart-link:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 18px 40px rgba(255, 102, 178, 0.12),
            0 6px 18px rgba(0, 0, 0, 0.45);
        }
        .romance-area {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px 40px 16px;
          box-sizing: border-box;
          width: 100%;
          margin-top: 6px;
        }
        .romance-inner p {
          margin: 0;
          font-family: "Playfair Display", serif;
          color: rgba(255, 235, 245, 0.98);
          font-size: 1.12rem;
          line-height: 1.9;
          letter-spacing: 0.4px;
          font-style: italic;
          text-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
        }
        .romance-inner p + p {
          margin-top: 18px;
        }
        /* floating faint purple hearts overlay (replaces romance box) */
        .hearts-overlay {
          position: relative;
          width: 100%;
          height: 200px;
          margin-top: 8px;
          pointer-events: none;
          overflow: visible;
        }
        .heart {
          position: absolute;
          width: 18px;
          height: 18px;
          transform: rotate(-45deg) scale(1);
          background: rgba(170, 80, 170, 0.12);
          border-radius: 3px;
          box-shadow: 0 8px 22px rgba(130, 40, 130, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          will-change: transform, opacity, top;
          z-index: 3;
          animation-name: floatHeart;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .heart:before,
        .heart:after {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          background: rgba(170, 80, 170, 0.12);
          border-radius: 50%;
        }
        .heart:before {
          top: -9px;
          left: 0;
        }
        .heart:after {
          left: 9px;
          top: 0;
        }
        @keyframes floatHeart {
          0% {
            transform: translateY(0) rotate(-45deg) scale(1);
            opacity: 0.12;
          }
          50% {
            transform: translateY(-22px) rotate(-38deg) scale(1.06);
            opacity: 0.18;
          }
          100% {
            transform: translateY(0) rotate(-45deg) scale(1);
            opacity: 0.12;
          }
        }
        /* decorative soft glow */
        .romance-box:before {
          content: "";
          position: absolute;
          left: 8%;
          right: 8%;
          top: -6px;
          bottom: -6px;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 102, 178, 0.06),
            rgba(0, 0, 0, 0)
          );
          z-index: -1;
          filter: blur(18px);
          pointer-events: none;
        }
        /* floating sparkles */
        .romance-box:after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -30px;
          top: -40px;
          background: radial-gradient(
              circle at 20% 20%,
              rgba(255, 200, 230, 0.18),
              rgba(255, 200, 230, 0) 30%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(255, 145, 190, 0.12),
              rgba(255, 145, 190, 0) 30%
            );
          transform: rotate(12deg);
          z-index: 0;
          opacity: 0.9;
          animation: floatSpark 4200ms ease-in-out infinite;
          pointer-events: none;
        }
        .romance-wrapper.visible .romance-box {
          animation: revealRomance 720ms cubic-bezier(0.22, 0.9, 0.35, 1)
            forwards 420ms;
        }
        @keyframes revealRomance {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.995);
          }
          60% {
            opacity: 1;
            transform: translateY(-8px) scale(1.005);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes floatSpark {
          0% {
            transform: translateY(0) rotate(12deg);
          }
          50% {
            transform: translateY(-8px) rotate(8deg);
          }
          100% {
            transform: translateY(0) rotate(12deg);
          }
        }
        @keyframes revealSecret {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          60% {
            opacity: 1;
            transform: translateY(-6px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .lock.verified + .info + .lock-content {
          max-height: 800px;
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
