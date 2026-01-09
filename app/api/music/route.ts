// app/api/music/route.ts
// Server-side Music Scanner API - Quét và trả về danh sách nhạc từ public/Music

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration?: number;
  cover: string;
  genre?: string;
  album?: string;
  bpm?: number;
  waveform?: number[];
}

// Danh sách cover mặc định theo thể loại/mood
const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", // Concert
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80", // Headphones
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", // Party lights
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80", // DJ Setup
  "https://images.unsplash.com/photo-1571974599782-87624638275e?w=800&q=80", // Vinyl
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80", // Festival
  "https://images.unsplash.com/photo-1598387846148-47e82ee120cc?w=800&q=80", // Studio
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80", // DJ Turntable
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80", // Music crowd
  "https://images.unsplash.com/photo-1629276301820-0f3f6e1b2b0c?w=800&q=80", // Neon music
];

// Gradient covers cho variety
const GRADIENT_COVERS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
];

// Phân tích tên file để trích xuất thông tin
function parseFileName(fileName: string): { title: string; artist: string } {
  // Remove extension
  const nameWithoutExt = fileName.replace(
    /\.(mp3|wav|ogg|flac|m4a|aac|webm)$/i,
    ""
  );

  // Các pattern phổ biến
  // Pattern 1: "Title - Artist - Extra.mp3"
  // Pattern 2: "Artist - Title.mp3"
  // Pattern 3: "Title (Remix) - Artist - Source.mp3"

  const parts = nameWithoutExt.split(" - ").map((p) => p.trim());

  if (parts.length >= 3) {
    // Format: Title - Artist - Source
    return {
      title: parts[0],
      artist: parts[1],
    };
  } else if (parts.length === 2) {
    // Format: Title - Artist hoặc Artist - Title
    return {
      title: parts[0],
      artist: parts[1],
    };
  } else {
    // Chỉ có tên
    return {
      title: nameWithoutExt,
      artist: "Unknown Artist",
    };
  }
}

// Generate waveform giả lập cho visualization
function generateFakeWaveform(seed: string): number[] {
  const waveform: number[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }

  for (let i = 0; i < 100; i++) {
    const pseudo = Math.sin(hash * i * 0.1) * 0.5 + 0.5;
    const wave = Math.abs(Math.sin(i * 0.3) * pseudo + Math.cos(i * 0.5) * 0.3);
    waveform.push(Math.min(1, Math.max(0.1, wave)));
  }

  return waveform;
}

// Hash function để tạo ID unique
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function GET(request: NextRequest) {
  try {
    const musicDir = path.join(process.cwd(), "public", "Music");

    // Kiểm tra thư mục tồn tại
    try {
      await fs.access(musicDir);
    } catch {
      // Tạo thư mục nếu chưa có
      await fs.mkdir(musicDir, { recursive: true });
      return NextResponse.json({
        tracks: [],
        total: 0,
        message:
          "Music directory created. Add your music files to public/Music/",
      });
    }

    // Đọc tất cả file trong thư mục
    const files = await fs.readdir(musicDir);

    // Lọc chỉ file nhạc
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

    // Tạo danh sách track
    const tracks: MusicTrack[] = await Promise.all(
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
          waveform: generateFakeWaveform(file),
          // Metadata có thể mở rộng sau
          genre: "Electronic",
          album: "Collection",
        };
      })
    );

    // Sắp xếp theo tên
    tracks.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json(
      {
        tracks,
        total: tracks.length,
        scannedAt: new Date().toISOString(),
        directory: "/Music",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Music scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan music directory", details: String(error) },
      { status: 500 }
    );
  }
}

// POST endpoint để refresh cache hoặc thêm metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "refresh") {
      // Force refresh - có thể implement cache invalidation ở đây
      return NextResponse.json({
        message: "Cache invalidated",
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
