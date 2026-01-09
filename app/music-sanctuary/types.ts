// app/music-sanctuary/types.ts
// Type definitions cho Music Sanctuary

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
  gradient?: string;
}

export interface AudioAnalysis {
  bass: number;
  mid: number;
  treble: number;
  average: number;
  peak: number;
  energy: number;
  // Advanced metrics
  spectralCentroid?: number;
  zeroCrossingRate?: number;
  rms?: number;
}

export interface PlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "one" | "all";
  isLoading: boolean;
  error: string | null;
}

export interface VisualizerTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  particleColor: string;
  glowColor: string;
}

export const VISUALIZER_THEMES: Record<string, VisualizerTheme> = {
  aurora: {
    name: "Aurora Borealis",
    primary: "#00ff87",
    secondary: "#60efff",
    accent: "#ff00ff",
    background: "#0a0a0f",
    particleColor: "#00ff87",
    glowColor: "rgba(0, 255, 135, 0.5)",
  },
  sunset: {
    name: "Sunset Dreams",
    primary: "#ff6b6b",
    secondary: "#feca57",
    accent: "#ff9ff3",
    background: "#1a0a0a",
    particleColor: "#ff6b6b",
    glowColor: "rgba(255, 107, 107, 0.5)",
  },
  cosmic: {
    name: "Cosmic Void",
    primary: "#a855f7",
    secondary: "#3b82f6",
    accent: "#ec4899",
    background: "#050510",
    particleColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)",
  },
  neon: {
    name: "Neon City",
    primary: "#00ffff",
    secondary: "#ff00ff",
    accent: "#ffff00",
    background: "#0a0a12",
    particleColor: "#00ffff",
    glowColor: "rgba(0, 255, 255, 0.5)",
  },
  ocean: {
    name: "Deep Ocean",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    accent: "#14b8a6",
    background: "#020617",
    particleColor: "#0ea5e9",
    glowColor: "rgba(14, 165, 233, 0.5)",
  },
};

export interface QueueItem extends MusicTrack {
  queueId: string;
  addedAt: number;
}

export type ViewMode = "player" | "playlist" | "visualizer" | "lyrics";
