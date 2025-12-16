"use client";

import { useEffect, useRef, useState } from "react";

import { Crown } from "lucide-react";

// Local REALMS copy used for client indicator
const REALMS = [
  { name: "Phàm Nhân", color: "#78716c", threshold: 0 },
  { name: "Luyện Khí", color: "#bfdbfe", threshold: 10 },
  { name: "Trúc Cơ", color: "#86efac", threshold: 25 },
  { name: "Kim Đan", color: "#fcd34d", threshold: 45 },
  { name: "Nguyên Anh", color: "#f472b6", threshold: 60 },
  { name: "Hóa Thần", color: "#c084fc", threshold: 75 },
  { name: "Luyện Hư", color: "#818cf8", threshold: 85 },
  { name: "Đại Thừa", color: "#ef4444", threshold: 95 },
  { name: "Độ Kiếp", color: "#fbbf24", threshold: 100 },
];

// SpiritCursor (optimized using rAF and limited trail length)
function SpiritCursor() {
  type TrailPoint = { x: number; y: number; id: number; ts: number };

  const [trail, setTrail] = useState<TrailPoint[]>([]);

  const rafRef = useRef<number | null>(null);
  const idRef = useRef(1);

  useEffect(() => {
    const LIFESPAN = 700;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const now = Date.now();
        setTrail((prev) => {
          const next = [
            ...prev,
            { x: e.clientX, y: e.clientY, id: idRef.current++, ts: now },
          ];
          return next.slice(-20);
        });
      });
    };

    const prune = () => {
      const now = Date.now();
      setTrail((prev) => prev.filter((p) => now - p.ts < LIFESPAN));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", prune);
    const interval = setInterval(prune, 120);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", prune);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {trail.map((point) => {
        const age = Date.now() - point.ts;
        const ageRatio = Math.max(0, 1 - age / 700);
        const size = Math.max(2, Math.min(18, Math.round(ageRatio * 18)));
        const opacity = ageRatio;

        return (
          <div
            key={point.id}
            className="absolute rounded-full bg-[#fbbf24] blur-[3px]"
            style={{
              left: point.x,
              top: point.y,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              transform: "translate(-50%, -50%)",
              transition: "opacity 200ms linear, transform 150ms linear",
              boxShadow: `0 0 ${Math.round(size / 2)}px #b45309`,
            }}
          />
        );
      })}
    </div>
  );
}

function CultivationBar({ scrollPercent }: { scrollPercent: number }) {
  const currentRealm =
    REALMS.slice()
      .reverse()
      .find((r) => scrollPercent >= r.threshold) || REALMS[0];

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 h-[50vh] w-16 flex flex-col items-center z-50 hidden xl:flex select-none">
      <div className="absolute inset-0 w-[1px] bg-gradient-to-b from-transparent via-stone-700 to-transparent left-1/2 -translate-x-1/2" />

      <div className="absolute top-[-60px] right-0 flex flex-col items-end w-48 transition-all duration-300">
        <span className="text-[9px] text-stone-500 uppercase tracking-widest mb-1">
          Cảnh Giới Hiện Tại
        </span>

        <div className="relative px-4 py-2 bg-black/80 border border-stone-800 rounded-l-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <span
            className="text-xl font-black font-serif uppercase"
            style={{
              color: currentRealm.color,
              textShadow: `0 0 10px ${currentRealm.color}40`,
            }}
          >
            {currentRealm.name}
          </span>

          <div className="absolute right-0 top-full h-[1px] w-full bg-gradient-to-l from-transparent to-stone-500 mt-1" />

          <div className="text-[10px] text-stone-400 mt-1 text-right font-mono">
            {scrollPercent.toFixed(1)}% Thiên Đạo
          </div>
        </div>
      </div>

      <div className="relative w-full h-full">
        {REALMS.map((r, i) => {
          const isActive = scrollPercent >= r.threshold;

          return (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border transition-all duration-500 flex items-center justify-center group"
              style={{
                bottom: `${r.threshold}%`,
                borderColor: isActive ? r.color : "#333",
                backgroundColor: isActive ? "#000" : "transparent",
                boxShadow: isActive ? `0 0 10px ${r.color}` : "none",
              }}
            >
              <div
                className={`w-1 h-1 rounded-full ${
                  isActive ? "bg-white" : "bg-transparent"
                }`}
              />

              <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-stone-400 whitespace-nowrap px-2 py-1 bg-black border border-stone-800">
                {r.name}
              </span>
            </div>
          );
        })}

        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-t from-stone-900 via-amber-500 to-white shadow-[0_0_15px_#fbbf24] transition-all duration-100 ease-linear rounded-full"
          style={{ height: `${scrollPercent}%` }}
        />
      </div>
    </div>
  );
}

export default function Interactive() {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    // mark mounted (for CSS transitions if needed)
    document.documentElement.classList.add("phim-mounted");

    const nav = document.querySelector("[data-phim-nav]");
    const grid = document.querySelectorAll("[data-phim-grid] .card-item");
    const buttons = Array.from(document.querySelectorAll("[data-filter]"));

    const applyFilter = (name: string) => {
      buttons.forEach((b) => {
        if ((b as HTMLElement).dataset.filter === name) {
          b.classList.add(
            "border-[#ffd700]",
            "bg-[#ffd700]/5",
            "text-[#ffd700]"
          );
        } else {
          b.classList.remove(
            "border-[#ffd700]",
            "bg-[#ffd700]/5",
            "text-[#ffd700]"
          );
        }
      });

      grid.forEach((card) => {
        const el = (card as HTMLElement).dataset.element;
        if (!el) return;
        if (name === "Tất Cả" || el === name) {
          (card as HTMLElement).style.display = "";
        } else {
          (card as HTMLElement).style.display = "none";
        }
      });
    };

    // initial filter = Tất Cả
    applyFilter("Tất Cả");

    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const name = (btn as HTMLElement).dataset.filter || "Tất Cả";
        applyFilter(name);
      });
    });

    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const pct = Math.min(
        100,
        Math.max(0, (currentScroll / Math.max(1, totalHeight)) * 100)
      );
      setScrollPercent(pct);

      if (nav) {
        if (currentScroll > window.innerHeight)
          nav.classList.add("bg-[#050505]/95", "backdrop-blur-md", "shadow-lg");
        else
          nav.classList.remove(
            "bg-[#050505]/95",
            "backdrop-blur-md",
            "shadow-lg"
          );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      buttons.forEach((btn) => btn.replaceWith(btn.cloneNode(true)));
    };
  }, []);

  return (
    <>
      <SpiritCursorWrapper />
      <CultivationBar scrollPercent={scrollPercent} />
    </>
  );
}

function SpiritCursorWrapper() {
  return <SpiritCursor />;
}
