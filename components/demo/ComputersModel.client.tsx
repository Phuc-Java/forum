"use client";

import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Html } from "@react-three/drei";
import CanvasLoader from "../../app/3Dtest/loader";

type ComputersProps = {
  isMobile?: boolean;
};

// Simple ErrorFallback for client-side
function ErrorFallback() {
  return (
    <Html center>
      <div className="p-3 bg-background/90 border border-border rounded-md text-sm">
        Không thể tải model 3D. Vui lòng kiểm tra assets trên server.
      </div>
    </Html>
  );
}

function ComputersInner({ isMobile = false }: ComputersProps) {
  const computer = useGLTF("/desktop_pc/scene.gltf");

  // 1. GIẢM SCALE: Giảm từ 0.8 xuống 0.65 để vừa vặn hơn trong khung 390px
  const scale = isMobile ? 0.4 : 0.75;

  // 2. NÂNG VỊ TRÍ Y: Đổi từ -3.25 thành -2.2 để kéo toàn bộ bàn lên cao hơn (hiện chân bàn)
  // [x, y, z] -> Y càng lớn thì càng lên cao
  const position = isMobile ? [0, -2.5, -1.0] : [0, -2.2, -1.5];

  return (
    <group>
      <hemisphereLight intensity={0.6} groundColor="#222" />
      <directionalLight intensity={0.9} position={[5, 10, 5]} />
      <ambientLight intensity={0.4} />

      <primitive
        object={computer.scene}
        scale={scale}
        position={position}
        rotation={[-0.01, -0.2, -0.1]}
        dispose={null}
      />
    </group>
  );
}

export default function ComputersModelClient({ isMobile }: ComputersProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      useGLTF.preload("/desktop_pc/scene.gltf");
    } catch {}
  }, []);

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{
        preserveDrawingBuffer: true,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      }}
      // 3. DỜI CAMERA RA XA: Tăng X từ 14 lên 20 để góc nhìn rộng hơn (Zoom out)
      camera={{ position: [20, 3, 5], fov: 25 }}
      style={{ width: "100%", height: "390px" }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <ComputersInner isMobile={!!isMobile} />
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Suspense>
      <Preload all />
    </Canvas>
  );
}
