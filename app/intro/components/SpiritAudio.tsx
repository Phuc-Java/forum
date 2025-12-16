"use client";

import React, { useRef, useState } from "react";

export default function SpiritAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex items-center gap-4 group">
      <audio
        ref={audioRef}
        loop
        src="https://example.com/your-cultivation-music.mp3"
      />

      <button
        onClick={togglePlay}
        className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md transition-all duration-500 ${
          isPlaying
            ? "bg-yellow-500/20 border-yellow-500 animate-[spin_4s_linear_infinite]"
            : "bg-black/50 hover:bg-white/10"
        }`}
      >
        {isPlaying ? (
          <span className="text-yellow-500 text-xs font-bold">||</span>
        ) : (
          <span className="text-white text-xs font-bold">▶</span>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ${
          isPlaying ? "w-32 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="h-[2px] w-full bg-white/10 overflow-hidden flex items-center gap-[2px]">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-[3px] bg-yellow-500 animate-[pulse_0.5s_infinite]"
              style={{
                height: Math.random() * 20 + 5 + "px",
                animationDelay: i * 0.1 + "s",
              }}
            />
          ))}
        </div>
        <p className="text-[9px] text-yellow-500/80 mt-1 uppercase tracking-widest truncate">
          Đang phát: Tiên Kiếm Kỳ Hiệp
        </p>
      </div>
    </div>
  );
}
