"use client";

import dynamic from "next/dynamic";

// Lazy load MusicPlayer - client-side only
const MusicPlayer = dynamic(() => import("@/components/ui/MusicPlayer"), {
  ssr: false,
});

export default function ClientMusicPlayer() {
  return <MusicPlayer />;
}
