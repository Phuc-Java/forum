"use client";

import { useEffect, useRef } from "react";

export default function PhimClient() {
  const cursorRoot = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const pointsRef = useRef<Array<{ el: HTMLDivElement; ts: number }>>([]);

  useEffect(() => {
    // --- 1. SETUP DOM CACHE (Tối ưu cực quan trọng) ---
    // Tìm element 1 lần duy nhất, tránh tìm lại khi scroll
    const domCache = {
      fill: document.querySelector<HTMLElement>("[data-phim-fill]"),
      nameEl: document.querySelector<HTMLElement>("[data-phim-current-name]"),
      pctEl: document.querySelector<HTMLElement>("[data-phim-current-pct]"),
      nav: document.querySelector<HTMLElement>("[data-phim-nav]"),
      countEl: document.querySelector<HTMLElement>("[data-phim-count]"),
      gridRoot: document.querySelector("[data-phim-grid]"),
      realms: Array.from(
        document.querySelectorAll<HTMLElement>("[data-phim-realm]")
      ),
    };

    // Chuẩn bị CSS cho thanh fill để dùng GPU Scale
    if (domCache.fill) {
      domCache.fill.style.transformOrigin = "bottom"; // Neo ở đáy
      domCache.fill.style.willChange = "transform"; // Báo trước cho GPU
    }

    // --- 2. CURSOR LOGIC (GPU OPTIMIZED) ---
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
        // OPTIMIZATION: will-change để tối ưu animation
        el.className =
          "absolute rounded-full bg-[#fbbf24] blur-[3px] will-change-[transform,opacity]";
        const size = 12;

        // OPTIMIZATION: Dùng translate3d thay vì top/left để tránh Reflow
        // translate3d(x, y, 0) kích hoạt Hardware Acceleration
        el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.opacity = `1`;
        // Transition opacity thôi, transform do JS lo
        el.style.transition = "opacity 200ms linear";
        el.style.boxShadow = `0 0 ${Math.round(size / 2)}px #b45309`;

        cursorRoot.current!.appendChild(el);

        pointsRef.current.push({ el, ts: now });
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

        // Cập nhật size & opacity
        p.el.style.width = `${size}px`;
        p.el.style.height = `${size}px`;
        p.el.style.opacity = `${ageRatio}`;
        return true;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", prune);
    const interval = setInterval(prune, 100);

    // --- 3. SCROLL LOGIC (THROTTLED & CACHED) ---
    let ticking = false; // Biến cờ để throttle scroll event

    const updateScrollLogic = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const pct = Math.min(
        100,
        Math.max(0, (currentScroll / Math.max(1, totalHeight)) * 100)
      );

      // OPTIMIZATION: Dùng transform scaleY thay vì height
      // scaleY(0.5) tương đương 50% height nhưng mượt hơn nhiều
      if (domCache.fill) {
        domCache.fill.style.transform = `scaleY(${pct / 100})`;
      }

      if (domCache.pctEl) {
        // Chỉ update text nếu cần thiết (React lo việc này tốt hơn, nhưng vanilla thì nên check)
        domCache.pctEl.textContent = `${pct.toFixed(1)}% Thiên Đạo`;
      }

      // Realm updates (Dùng cache, không query lại)
      domCache.realms.forEach((r) => {
        const threshold = Number(r.dataset.threshold || 0);
        const color = r.dataset.color || "#333";
        // Query bên trong realm con thì ok vì số lượng ít và đã cached realm cha
        const dot = r.querySelector<HTMLElement>("div");

        if (pct >= threshold) {
          // Chỉ set style nếu chưa active để tránh paint lại (Browser optimize cái này rồi nhưng code rõ ràng hơn)
          if (r.style.borderColor !== color) {
            r.style.borderColor = color;
            r.style.backgroundColor = "#000";
            r.style.boxShadow = `0 0 10px ${color}`;
            if (dot) dot.style.backgroundColor = "#fff";
            if (domCache.nameEl) domCache.nameEl.style.color = color;
          }
        } else {
          if (
            r.style.borderColor !== "rgb(51, 51, 51)" &&
            r.style.borderColor !== "#333"
          ) {
            r.style.borderColor = "#333";
            r.style.backgroundColor = "transparent";
            r.style.boxShadow = "none";
            if (dot) dot.style.backgroundColor = "transparent";
          }
        }
      });

      // Nearest Realm
      const active = domCache.realms
        .slice()
        .reverse()
        .find((r) => pct >= Number(r.dataset.threshold || 0));

      if (domCache.nameEl && active) {
        const newName = active.dataset.name || "";
        if (domCache.nameEl.textContent !== newName) {
          domCache.nameEl.textContent = newName;
        }
      }

      // Nav background
      if (domCache.nav) {
        if (currentScroll > window.innerHeight) {
          if (!domCache.nav.classList.contains("shadow-lg")) {
            domCache.nav.classList.add(
              "bg-[#050505]/95",
              "backdrop-blur-md",
              "shadow-lg"
            );
          }
        } else {
          if (domCache.nav.classList.contains("shadow-lg")) {
            domCache.nav.classList.remove(
              "bg-[#050505]/95",
              "backdrop-blur-md",
              "shadow-lg"
            );
          }
        }
      }

      ticking = false; // Reset cờ
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollLogic);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Chạy 1 lần đầu
    updateScrollLogic();

    // --- 4. CLICK HANDLERS (Delegated) ---
    // Global delegated click handler
    const handleDocumentClick = (e: Event) => {
      const target = e.target as HTMLElement;

      // Scroll To
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

      // Delegate to filter handler if clicked inside nav
      const filterBtn = target.closest("[data-filter]") as HTMLElement | null;
      if (filterBtn && domCache.nav && domCache.gridRoot) {
        // Handle filter logic directly here
        const name = filterBtn.dataset.filter || "Tất Cả";

        // Toggle Visuals
        domCache.nav
          .querySelectorAll("[data-filter]")
          .forEach((b) =>
            b.classList.remove(
              "border-[#ffd700]",
              "bg-[#ffd700]/5",
              "text-[#ffd700]"
            )
          );
        filterBtn.classList.add(
          "border-[#ffd700]",
          "bg-[#ffd700]/5",
          "text-[#ffd700]"
        );

        // Filter Grid
        const cards = Array.from(
          domCache.gridRoot.querySelectorAll<HTMLElement>("[data-element]")
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

        if (domCache.countEl) domCache.countEl.textContent = String(visible);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", prune);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", handleDocumentClick);

      cursorRoot.current?.remove();
      pointsRef.current.forEach((p) => p.el.remove());
      pointsRef.current = [];
    };
  }, []);

  return null;
}
