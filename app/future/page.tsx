"use client";

import { useState } from "react";
import PongGame from "./PongGame";
import TubesBackground from "./TubesBackground";
import CardStream from "./CardStream";
import SakuraOverlay from "./SakuraOverlay";
import PersistentAudio from "./PersistentAudio.client"; // Overlay nằm trong này
import { montserrat, pressStart2P } from "./fonts";
import { Maximize2 } from "lucide-react"; // Icon nút thoát ra lại Overlay

export default function CombinedEffectPage() {
  // Trạng thái: True = Đang hiện Intro Overlay, False = Đang chơi (Vào trong)
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden bg-black touch-none ${montserrat.variable} ${pressStart2P.variable} font-sans`}
    >
      {/* --- LOGIC QUAN TRỌNG NHẤT --- 
         Dùng Conditional Rendering (&&) thay vì CSS hidden.
         Khi showIntro = true, đoạn code dưới KHÔNG TỒN TẠI trong DOM -> GPU về 0%.
      */}
      {!showIntro && (
        <>
          {/* LỚP 0: TUBES CANVAS */}
          <TubesBackground />

          {/* LỚP 1: PONG GAME */}
          <PongGame />

          {/* LỚP 2: CARD STREAM */}
          <CardStream />

          {/* LỚP 3: SAKURA */}
          <SakuraOverlay />
        </>
      )}

      {/* --- PERSISTENT AUDIO (CHỨA OVERLAY) ---
          Truyền state xuống để nó biết khi nào hiện to (Overlay), khi nào thu nhỏ.
      */}
      <PersistentAudio
        isOverlayMode={showIntro}
        onEnter={() => setShowIntro(false)}
      />
    </div>
  );
}
