"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  isMobile?: boolean;
};

export default function LazyModelLoader({ isMobile }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [Loaded, setLoaded] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // dynamically import the heavy client component when visible
            import("./ComputersModel.client").then((mod) => {
              setLoaded(() => mod.default);
            });
            obs.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", minHeight: 480 }}>
      {Loaded ? (
        <Loaded isMobile={isMobile} />
      ) : (
        <div className="w-full h-[480px] bg-surface/20 rounded-lg" />
      )}
    </div>
  );
}
