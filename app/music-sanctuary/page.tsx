// app/music-sanctuary/page.tsx
// Ultimate Music Sanctuary - Server-Side Rendered with Auto Music Detection

import { Suspense } from "react";
import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import MusicSanctuaryClient from "./_components/MusicSanctuary.client";
import { MusicTrack } from "./types";
import { ONLINE_TRACKS } from "./online-tracks";
import "./styles.css";

// Metadata cho SEO
export const metadata: Metadata = {
  title: "Music Sanctuary | Immersive Audio Experience",
  description:
    "Trải nghiệm nghe nhạc tuyệt vời với hình ảnh 3D phản ứng theo âm thanh",
  keywords: ["music", "visualizer", "audio", "sanctuary", "immersive"],
};

// Cover images preset
const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
  "https://images.unsplash.com/photo-1571974599782-87624638275e?w=800&q=80",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
  "https://images.unsplash.com/photo-1598387846148-47e82ee120cc?w=800&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
  "https://images.unsplash.com/photo-1629276301820-0f3f6e1b2b0c?w=800&q=80",
];

// Phân tích tên file
function parseFileName(fileName: string): { title: string; artist: string } {
  const nameWithoutExt = fileName.replace(
    /\.(mp3|wav|ogg|flac|m4a|aac|webm)$/i,
    ""
  );
  const parts = nameWithoutExt.split(" - ").map((p) => p.trim());

  if (parts.length >= 3) {
    return { title: parts[0], artist: parts[1] };
  } else if (parts.length === 2) {
    return { title: parts[0], artist: parts[1] };
  }
  return { title: nameWithoutExt, artist: "Unknown Artist" };
}

// Generate waveform
function generateWaveform(seed: string): number[] {
  const waveform: number[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }

  for (let i = 0; i < 80; i++) {
    const pseudo = Math.sin(hash * i * 0.1) * 0.5 + 0.5;
    const wave = Math.abs(Math.sin(i * 0.3) * pseudo + Math.cos(i * 0.5) * 0.3);
    waveform.push(Math.min(1, Math.max(0.15, wave)));
  }

  return waveform;
}

// Hash function
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Server-side music scanning
async function getMusicTracks(): Promise<MusicTrack[]> {
  const musicDir = path.join(process.cwd(), "public", "Music");
  let localTracks: MusicTrack[] = [];

  try {
    await fs.access(musicDir);
    const files = await fs.readdir(musicDir);
    const audioExtensions = [
      ".mp3",
      ".wav",
      ".ogg",
      ".flac",
      ".m4a",
      ".aac",
      ".webm",
    ];
    const audioFiles = files.filter((file) =>
      audioExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );

    localTracks = await Promise.all(
      audioFiles.map(async (file, index) => {
        const filePath = path.join(musicDir, file);
        const stats = await fs.stat(filePath);
        const { title, artist } = parseFileName(file);
        const id = hashString(file + stats.mtimeMs.toString());

        return {
          id,
          title,
          artist,
          src: `/Music/${encodeURIComponent(file)}`,
          cover: COVER_PRESETS[index % COVER_PRESETS.length],
          waveform: generateWaveform(file),
          genre: "Local",
          album: "My Collection",
        };
      })
    );

    // Sort local tracks by title
    localTracks.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    // No local music folder, just use online tracks
    console.log("No local music folder found, using online tracks only");
  }

  // Combine local tracks with online tracks
  // Local tracks come first, then online tracks
  return [...localTracks, ...ONLINE_TRACKS];
}

// Loading component
function LoadingScreen() {
  return (
    <div className="music-sanctuary-loading">
      <div className="loading-content">
        <div className="loading-orb">
          <div className="orb-ring orb-ring-1" />
          <div className="orb-ring orb-ring-2" />
          <div className="orb-ring orb-ring-3" />
          <div className="orb-core" />
        </div>
        <div className="loading-text">
          <h2>Music Sanctuary</h2>
          <p>Đang tải trải nghiệm âm thanh...</p>
        </div>
        <div className="loading-bars">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="loading-bar"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main page component (Server Component)
export default async function MusicSanctuaryPage() {
  // Fetch tracks on server
  const tracks = await getMusicTracks();

  return (
    <main className="music-sanctuary">
      <Suspense fallback={<LoadingScreen />}>
        <MusicSanctuaryClient initialTracks={tracks} />
      </Suspense>
    </main>
  );
}
