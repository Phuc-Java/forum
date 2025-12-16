"use client";

import { useEffect, useRef } from "react";

export default function PhimClient() {
  const cursorRoot = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const pointsRef = useRef<Array<{ el: HTMLDivElement; ts: number }>>([]);

  useEffect(() => {
    // Create cursor container
    const root = document.createElement("div");
    root.className = "pointer-events-none fixed inset-0 z-[9999]";
    document.body.appendChild(root);
    cursorRoot.current = root;

    const LIFESPAN = 700;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cursorRoot.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const now = Date.now();
        const el = document.createElement("div");
        el.className = "absolute rounded-full bg-[#fbbf24] blur-[3px]";
        const size = 12;
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.opacity = `1`;
        el.style.transform = "translate(-50%, -50%)";
        el.style.transition = "opacity 200ms linear, transform 150ms linear";
        el.style.boxShadow = `0 0 ${Math.round(size / 2)}px #b45309`;
        cursorRoot.current!.appendChild(el);

        pointsRef.current.push({ el, ts: now });
        // keep bounded length
        if (pointsRef.current.length > 24) {
          const removed = pointsRef.current.shift();
          if (removed) removed.el.remove();
        }
      });
    };

    const prune = () => {
      const now = Date.now();
      pointsRef.current = pointsRef.current.filter((p) => {
        if (now - p.ts > LIFESPAN) {
          p.el.remove();
          return false;
        }
        const ageRatio = Math.max(0, 1 - (now - p.ts) / LIFESPAN);
        const size = Math.max(2, Math.min(18, Math.round(ageRatio * 18)));
        p.el.style.width = `${size}px`;
        p.el.style.height = `${size}px`;
        p.el.style.opacity = `${ageRatio}`;
        return true;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", prune);
    const interval = setInterval(prune, 100);

    // Scroll + cultivation bar updates
    const updateScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const pct = Math.min(
        100,
        Math.max(0, (currentScroll / Math.max(1, totalHeight)) * 100)
      );

      const fill = document.querySelector<HTMLElement>("[data-phim-fill]");
      const nameEl = document.querySelector<HTMLElement>(
        "[data-phim-current-name]"
      );
      const pctEl = document.querySelector<HTMLElement>(
        "[data-phim-current-pct]"
      );
      const realms = Array.from(
        document.querySelectorAll<HTMLElement>("[data-phim-realm]")
      );

      if (fill) fill.style.height = `${pct}%`;
      if (pctEl) pctEl.textContent = `${pct.toFixed(1)}% Thiên Đạo`;

      realms.forEach((r) => {
        const threshold = Number(r.dataset.threshold || 0);
        const color = r.dataset.color || "#333";
        const dot = r.querySelector<HTMLElement>("div");
        if (pct >= threshold) {
          r.style.borderColor = color;
          r.style.backgroundColor = "#000";
          r.style.boxShadow = `0 0 10px ${color}`;
          if (dot) dot.style.backgroundColor = "#fff";
          if (nameEl) nameEl.style.color = color;
        } else {
          r.style.borderColor = "#333";
          r.style.backgroundColor = "transparent";
          r.style.boxShadow = "none";
          if (dot) dot.style.backgroundColor = "transparent";
        }
      });

      // set nearest current realm name
      const active = realms
        .slice()
        .reverse()
        .find((r) => pct >= Number(r.dataset.threshold || 0));
      if (nameEl && active)
        nameEl.textContent = active.dataset.name || nameEl.textContent;

      // nav background toggle
      const nav = document.querySelector<HTMLElement>("[data-phim-nav]");
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

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    // Filter handling (delegated)
    const navRoot = document.querySelector("[data-phim-nav]");
    const gridRoot = document.querySelector("[data-phim-grid]");
    const countEl = document.querySelector<HTMLElement>("[data-phim-count]");

    // Global delegated click handler for scroll actions and filters
    const handleDocumentClick = (e: Event) => {
      const target = e.target as HTMLElement;

      // smooth scroll buttons: data-scroll-to="next"
      const scrollBtn = target.closest(
        "[data-scroll-to]"
      ) as HTMLElement | null;
      if (scrollBtn) {
        const action = scrollBtn.dataset.scrollTo;
        if (action === "next") {
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        }
        return;
      }

      // delegate to filter handler if clicked inside nav
      const filterBtn = target.closest("[data-filter]") as HTMLElement | null;
      if (filterBtn && navRoot && gridRoot) {
        // reuse existing logic by simulating a click on navRoot
        // (call the same handler used below)
        // Note: we handle filter below via navRoot click listener, so return here
        return;
      }
    };

    document.addEventListener("click", handleDocumentClick);

    const handleFilterClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("[data-filter]") as HTMLElement | null;
      if (!btn || !gridRoot) return;
      const name = btn.dataset.filter || "Tất Cả";

      // toggle button visuals
      navRoot
        ?.querySelectorAll("[data-filter]")
        .forEach((b) =>
          b.classList.remove(
            "border-[#ffd700]",
            "bg-[#ffd700]/5",
            "text-[#ffd700]"
          )
        );
      btn.classList.add("border-[#ffd700]", "bg-[#ffd700]/5", "text-[#ffd700]");

      const cards = Array.from(
        gridRoot.querySelectorAll<HTMLElement>("[data-element]")
      );
      let visible = 0;
      cards.forEach((c) => {
        const el = c.dataset.element || "";
        const shouldShow = name === "Tất Cả" || el === name;
        const isHidden = c.style.display === "none";
        if (shouldShow) {
          if (isHidden) c.style.display = "";
          visible++;
        } else {
          if (!isHidden) c.style.display = "none";
        }
      });

      if (countEl) countEl.textContent = String(visible);
    };

    navRoot?.addEventListener("click", handleFilterClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", prune);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
      window.removeEventListener("scroll", updateScroll);
      navRoot?.removeEventListener("click", handleFilterClick);
      document.removeEventListener("click", handleDocumentClick);
      // cleanup cursor
      cursorRoot.current?.remove();
      pointsRef.current.forEach((p) => p.el.remove());
      pointsRef.current = [];
    };
  }, []);

  return null;
}
