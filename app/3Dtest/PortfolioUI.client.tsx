"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamic-load the heavy `PortfolioUI` on the client only (ssr: false)
const DynamicPortfolioUI = dynamic(
  () => import("@/components/ui/portfolio-ui").then((mod) => mod.PortfolioUI),
  { ssr: false, loading: () => <div className="w-full h-[400px]" /> }
);

export default function PortfolioUIClient() {
  return <DynamicPortfolioUI />;
}
