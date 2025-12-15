// @/components/InteractiveDemoSection.tsx (HOẶC path cũ của bạn)
import React from "react";
import { DEMO_CONFIGS } from "./data/demo-data"; // Import data từ file config
import DemoFactory from "@/components/demo/DemoFactory"; // Import component factory

// SERVER COMPONENT (Mặc định trong Next 13+)
export default function InteractiveDemoSection() {
  return (
    <section className="relative w-full py-24 bg-[#08080a] border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-6">
            Live Code Playground
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Minh chứng thực tế về khả năng xử lý DOM, 3D Physics và Animation
            phức tạp ngay trên trình duyệt.
          </p>
        </div>

        {/* --- DYNAMIC RENDERER --- */}
        <div className="flex flex-col gap-8">
          {DEMO_CONFIGS.map((demo, index) => (
            <React.Fragment key={demo.id}>
              {/* Nếu muốn chèn title giữa các demo như bản cũ (PHYSICS SIMULATION), 
                  bạn có thể check index hoặc thêm field 'sectionHeader' vào config */}

              {demo.componentKey === "lanyard" && (
                <div className="mb-6 flex items-center gap-4 mt-10">
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                  <h3 className="text-xl font-mono text-purple-400 font-bold">
                    PHYSICS SIMULATION
                  </h3>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>
              )}

              <DemoFactory config={demo} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
