"use client";

import React, { useEffect, useRef, useState } from "react";

export default function LazyGreeting({
  placeholder = null,
}: {
  placeholder?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [Comp, setComp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let obs: IntersectionObserver | null = null;
    let mounted = true;
    if (ref.current && !Comp) {
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              import("../app/giang-sinh/GreetingCard.client")
                .then((m) => {
                  if (!mounted) return;
                  const C = (m as any).default || m;
                  setComp(() => C as any);
                })
                .catch(() => {});
              obs?.disconnect();
            }
          });
        },
        { root: null, threshold: 0.01 }
      );
      obs.observe(ref.current);
    }
    return () => {
      mounted = false;
      obs?.disconnect();
    };
  }, [ref.current]);

  return <div ref={ref}>{Comp ? <Comp /> : placeholder}</div>;
}
