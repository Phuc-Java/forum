"use client";

import React, { useEffect, useRef, useState } from "react";

type LoaderResult =
  | { default: React.ComponentType<any> }
  | { [k: string]: any };

export default function LazyLoadOnView({
  loader,
  placeholder = null,
  componentProps = {},
  rootMargin = "0px",
  threshold = 0,
}: {
  loader: () => Promise<LoaderResult>;
  placeholder?: React.ReactNode;
  componentProps?: Record<string, unknown>;
  rootMargin?: string;
  threshold?: number | number[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mounted = true;
    if (ref.current && !Comp) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loader()
                .then((m) => {
                  if (!mounted) return;
                  const C = (m as any).default || (m as any);
                  setComp(() => C);
                })
                .catch(() => {
                  // ignore loader errors
                });
              observer?.disconnect();
            }
          });
        },
        { root: null, rootMargin, threshold }
      );
      observer.observe(ref.current);
    }
    return () => {
      mounted = false;
      observer?.disconnect();
    };
  }, [ref.current]);

  return (
    <div ref={ref}>{Comp ? <Comp {...componentProps} /> : placeholder}</div>
  );
}
