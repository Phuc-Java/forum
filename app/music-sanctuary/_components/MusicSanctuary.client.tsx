// app/music-sanctuary/_components/MusicSanctuary.client.tsx
// Ultimate Music Player - Main Orchestrator Component

"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { AnimatePresence } from "framer-motion";
import { MusicTrack, AudioAnalysis } from "../types";
import useAudioEngine from "./AudioEngine";
import WelcomeScreen from "./WelcomeScreen";
import PremiumVisualizer from "./PremiumVisualizer";
import PremiumPlayer from "./PremiumPlayer";

interface MusicSanctuaryClientProps {
  initialTracks: MusicTrack[];
}

export default function MusicSanctuaryClient({
  initialTracks,
}: MusicSanctuaryClientProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [tracks] = useState<MusicTrack[]>(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const [audioData, setAudioData] = useState<AudioAnalysis>({
    bass: 0,
    mid: 0,
    treble: 0,
    average: 0,
    peak: 0,
    energy: 0,
  });

  const shuffleHistoryRef = useRef<number[]>([]);
  const currentTrack = tracks[currentTrackIndex] || null;

  // Get accent color from current track or default
  const accentColor = useMemo(() => {
    // Could extract from album art in future
    return "#10b981";
  }, []);

  // ============================================================================
  // AUDIO ENGINE
  // ============================================================================

  useAudioEngine({
    track: currentTrack,
    isPlaying: isPlaying && hasInteracted,
    volume: isMuted ? 0 : volume,
    onTimeUpdate: setCurrentTime,
    onDurationChange: setDuration,
    onEnded: handleTrackEnd,
    onAnalysis: setAudioData,
    onError: setError,
    onLoaded: () => {},
    seekTo,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const getNextTrackIndex = useCallback((): number => {
    if (tracks.length === 0) return 0;

    if (isShuffled) {
      const available = tracks
        .map((_, i) => i)
        .filter(
          (i) =>
            !shuffleHistoryRef.current.includes(i) && i !== currentTrackIndex
        );

      if (available.length === 0) {
        shuffleHistoryRef.current = [currentTrackIndex];
        return Math.floor(Math.random() * tracks.length);
      }

      const nextIndex = available[Math.floor(Math.random() * available.length)];
      shuffleHistoryRef.current.push(nextIndex);

      if (shuffleHistoryRef.current.length > Math.min(10, tracks.length - 1)) {
        shuffleHistoryRef.current.shift();
      }

      return nextIndex;
    }

    return (currentTrackIndex + 1) % tracks.length;
  }, [currentTrackIndex, isShuffled, tracks]);

  const getPrevTrackIndex = useCallback((): number => {
    if (tracks.length === 0) return 0;

    if (isShuffled && shuffleHistoryRef.current.length > 1) {
      shuffleHistoryRef.current.pop();
      return shuffleHistoryRef.current.pop() || 0;
    }

    return (currentTrackIndex - 1 + tracks.length) % tracks.length;
  }, [currentTrackIndex, isShuffled, tracks]);

  function handleTrackEnd() {
    if (repeatMode === "one") {
      setSeekTo(0);
      setIsPlaying(true);
    } else if (repeatMode === "all" || currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(getNextTrackIndex());
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  const handlePlayPause = useCallback(() => {
    if (!hasInteracted) setHasInteracted(true);
    setIsPlaying((prev) => !prev);
  }, [hasInteracted]);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex(getNextTrackIndex());
    if (!isPlaying) setIsPlaying(true);
  }, [getNextTrackIndex, isPlaying]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) {
      setSeekTo(0);
    } else {
      setCurrentTrackIndex(getPrevTrackIndex());
    }
    if (!isPlaying) setIsPlaying(true);
  }, [currentTime, getPrevTrackIndex, isPlaying]);

  const handleSeek = useCallback((time: number) => {
    setSeekTo(time);
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback(
    (vol: number) => {
      setVolume(vol);
      if (vol > 0 && isMuted) setIsMuted(false);
    },
    [isMuted]
  );

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleRepeatToggle = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const handleShuffleToggle = useCallback(() => {
    setIsShuffled((prev) => !prev);
    if (!isShuffled) shuffleHistoryRef.current = [currentTrackIndex];
  }, [currentTrackIndex, isShuffled]);

  const handleTrackSelect = useCallback(
    (track: MusicTrack) => {
      const index = tracks.findIndex((t) => t.id === track.id);
      if (index !== -1) {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        if (!hasInteracted) setHasInteracted(true);
      }
    },
    [tracks, hasInteracted]
  );

  const handleStart = useCallback(() => {
    setHasInteracted(true);
    if (tracks.length > 0) setIsPlaying(true);
  }, [tracks.length]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Clear seek after applying
  useEffect(() => {
    if (seekTo !== undefined) {
      const timeout = setTimeout(() => setSeekTo(undefined), 100);
      return () => clearTimeout(timeout);
    }
  }, [seekTo]);

  // Keyboard shortcut for starting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasInteracted && e.key === " ") {
        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasInteracted, handleStart]);

  // Update document title
  useEffect(() => {
    if (currentTrack && isPlaying) {
      document.title = `${currentTrack.title} - ${currentTrack.artist} | Music Sanctuary`;
    } else {
      document.title = "Music Sanctuary";
    }
  }, [currentTrack, isPlaying]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Welcome screen
  if (!hasInteracted && tracks.length > 0) {
    return <WelcomeScreen trackCount={tracks.length} onStart={handleStart} />;
  }

  // Error state
  if (error) {
    return (
      <div className="music-sanctuary">
        <div className="fixed inset-0 flex items-center justify-center bg-[#05050f]">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Đã xảy ra lỗi
            </h2>
            <p className="text-white/50 mb-6 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (tracks.length === 0) {
    return (
      <div className="music-sanctuary">
        <div className="fixed inset-0 flex items-center justify-center bg-[#05050f]">
          <div className="text-center p-8 max-w-md">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-white mb-4">
              Chưa có nhạc
            </h2>
            <p className="text-white/40 mb-8 text-sm leading-relaxed">
              Thêm file nhạc (.mp3, .wav, .ogg, .flac) vào thư mục
            </p>
            <code className="inline-block px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-mono border border-emerald-500/20">
              public/Music
            </code>
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 text-left">
              <p className="text-white/60 text-sm font-medium mb-2">💡 Mẹo:</p>
              <p className="text-white/40 text-sm">
                Đặt tên file theo format: <br />
                <code className="text-emerald-400/80">
                  Tên bài - Nghệ sĩ.mp3
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main player
  return (
    <div className="music-sanctuary">
      {/* Premium Visualizer Background */}
      <PremiumVisualizer
        audioData={audioData}
        isPlaying={isPlaying}
        albumArt={currentTrack?.cover}
        accentColor={accentColor}
      />

      {/* Premium Player Interface */}
      <AnimatePresence mode="wait">
        <PremiumPlayer
          currentTrack={currentTrack}
          tracks={tracks}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          repeatMode={repeatMode}
          isShuffled={isShuffled}
          audioData={audioData}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onRepeatToggle={handleRepeatToggle}
          onShuffleToggle={handleShuffleToggle}
          onTrackSelect={handleTrackSelect}
        />
      </AnimatePresence>
    </div>
  );
}
