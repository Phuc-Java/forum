"use client";

import { useEffect, useRef } from "react";

// Helper Colors (Duplicate here to keep it independent)
function randomColors(count: number) {
  return new Array(count).fill(0).map(
    () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
  );
}

const TubesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    const initEffect = async () => {
      try {
        // Load remote module via eval-import to avoid TypeScript resolving the URL
        // @ts-ignore
        const module = await (0, eval)(
          "import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')"
        );
        const TubesCursor = module.default;
        appRef.current = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#f967fb", "#53bc28", "#6958d5"],
            lights: {
              intensity: 200,
              colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
            },
          },
        });
      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };
    initEffect();

    return () => {
      appRef.current = null;
    };
  }, []);

  const handleBgClick = (e: React.MouseEvent) => {
    // Logic check vùng click để tránh conflict với game và card
    if (
      !(e.target as HTMLElement).closest(".card-line") &&
      !(e.target as HTMLElement).closest(".pong-container")
    ) {
      if (appRef.current) {
        const colors = randomColors(3);
        const lightsColors = randomColors(4);
        appRef.current.tubes.setColors(colors);
        appRef.current.tubes.setLightsColors(lightsColors);
      }
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute inset-0 w-full h-full block z-0"
        style={{ pointerEvents: "auto" }} // Cần auto để nhận click
      />
      {/* Invisible overlay để bắt sự kiện click cho toàn màn hình nhưng nằm dưới các layer khác */}
      <div className="absolute inset-0 z-0" onClick={handleBgClick}></div>

      <style jsx>{`
        #canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </>
  );
};

export default TubesBackground;
