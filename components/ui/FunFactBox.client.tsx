"use client";

import { useState } from "react";

interface Props {
  facts: string[];
  initialIndex?: number;
}

export default function FunFactBoxClient({ facts, initialIndex }: Props) {
  const len = facts.length;
  const [index, setIndex] = useState<number>(
    typeof initialIndex === "number" ? initialIndex : 0
  );
  const [isFading, setIsFading] = useState(false);

  // We intentionally do not synchronously clamp `index` in an effect to avoid
  // cascading renders. Instead compute a safe index for display below.
  const safeIndex = len > 0 ? ((index % len) + len) % len : 0;

  const changeTo = (nextIndex: number) => {
    setIsFading(true);
    window.setTimeout(() => {
      setIndex(((nextIndex % len) + len) % len);
      setIsFading(false);
    }, 220);
  };

  const next = () => changeTo(index + 1);
  const prev = () => changeTo(index - 1);

  return (
    <div>
      <div className="min-h-[120px] sm:min-h-[140px] relative">
        <div className="absolute inset-0 p-3" key={index}>
          <div className="h-full p-4 rounded-lg bg-background/30 border border-border/30 text-foreground/80 font-mono text-sm">
            {/** animate only the text content */}
            <div
              className={`transition-all duration-300 ease-[cubic-bezier(.2,.9,.2,1)] transform ${
                isFading
                  ? "opacity-0 -translate-y-2"
                  : "opacity-100 translate-y-0"
              } whitespace-pre-wrap wrap-break-word pb-12`}
            >
              {facts[safeIndex]}
            </div>
          </div>
        </div>

        {/* Overlayed controls inside the fact box for desktop (no animation)
          On small screens we show controls below the box to avoid overlap. */}
        <div className="absolute left-3 right-3 bottom-3 hidden sm:flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="px-3 py-2 bg-background/20 border border-border rounded-lg text-xs font-mono hover:bg-background/30 transition"
            >
              ‹ Trước
            </button>
            <button
              onClick={next}
              className="px-3 py-2 bg-primary/20 border border-primary/50 rounded-lg text-xs font-mono hover:bg-primary/30 transition"
            >
              Kế Tiếp ›
            </button>
          </div>

          <div className="text-xs text-foreground/50 font-mono">
            {safeIndex + 1}/{len}
          </div>
        </div>

        {/* Mobile controls: visible only on small screens, placed below content */}
      </div>

      <div className="mt-3 sm:hidden flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="px-3 py-2 bg-background/20 border border-border rounded-lg text-xs font-mono hover:bg-background/30 transition"
          >
            ‹ Trước
          </button>
          <button
            onClick={next}
            className="px-3 py-2 bg-primary/20 border border-primary/50 rounded-lg text-xs font-mono hover:bg-primary/30 transition"
          >
            Kế Tiếp ›
          </button>
        </div>

        <div className="text-xs text-foreground/50 font-mono">
          {safeIndex + 1}/{len}
        </div>
      </div>
    </div>
  );
}
