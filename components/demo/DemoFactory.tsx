"use client";

import React from "react";
import HtmlCodeTabs from "@/components/ui/html-code-tabs"; // Đảm bảo đường dẫn đúng đến file bạn đã có
import { ImageSwiper } from "@/components/demo/ImageSwiper";
import Lanyard from "@/components/ui/Lanyard";
import { DemoItemConfig } from "../data/demo-data";
import ProfilePage from "../portfoliooooo";
import DecayCard from "@/components/DecayCard";
import LazyModelDemo from "./LazyModelDemo";
import SplineCalculator from "./SplineCalculator";
import NotFoundPage from "./NotFoundPage";
// --- REGISTER COMPONENTS HERE ---
// Nơi bạn khai báo component React tương ứng với key
const DEMO_CARDS_DATA = [
  {
    id: 1,
    imageUrl:
      "https://i.pinimg.com/736x/d6/8a/12/d68a121e960094f99ad8acd37505fb7d.jpg",
    title: "Crimson Forest",
  },
  {
    id: 2,
    imageUrl:
      "https://i.pinimg.com/736x/21/16/f7/2116f71f9d51d875e44d809f074ff079.jpg",
    title: "Misty Mountains",
  },
  {
    id: 3,
    imageUrl:
      "https://i.pinimg.com/1200x/fe/c2/0d/fec20d2958059b8463bffb138d4eaac6.jpg",
    title: "Floating Islands",
  },
];

const COMPONENT_REGISTRY: Record<string, React.ReactNode> = {
  "3d-carousel": <ImageSwiper cards={DEMO_CARDS_DATA} />,
  lanyard: (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <Lanyard />
    </div>
  ),
  "portfolio-ui": (
    <div className="relative w-full h-[600px] overflow-y-auto bg-[#060010] rounded-lg">
      {/* Scale nhỏ lại một chút để vừa khung preview nếu cần */}
      <div className="scale-90 origin-top">
        <ProfilePage />
      </div>
    </div>
  ),
  "decay-card": <DecayCard />,
  "lazy-model": <LazyModelDemo />,
  "spline-calc": <SplineCalculator />,
  "not-found-page": <NotFoundPage />,
};

interface DemoFactoryProps {
  config: DemoItemConfig;
}

export default function DemoFactory({ config }: DemoFactoryProps) {
  const PreviewComponent = COMPONENT_REGISTRY[config.componentKey] || null;

  return (
    <div className="w-full shadow-2xl shadow-purple-900/10 rounded-xl overflow-hidden border border-white/10 mb-20 last:mb-0">
      <HtmlCodeTabs
        activeID={config.id}
        htmlContent={config.htmlContent}
        title={config.title}
        fileName={config.fileName}
        className="bg-[#0c0c0e]"
        previewComponent={PreviewComponent}
      />
    </div>
  );
}
