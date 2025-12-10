"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { createPortal } from "react-dom";

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

const tracks: Track[] = [
  {
    id: "1",
    title: "05 (Không Phai)",
    artist: "Masew Remix",
    src: "/Music/05 (Khong Phai) (Masew Remix) - Nhieu nghe si - NhacHayVN.mp3",
  },
  {
    id: "2",
    title: "Có Một Người Vẫn Đợi",
    artist: "Viet Lee Remix",
    src: "/Music/Co Mot Nguoi Van Doi (Remix) - Viet Lee, BConcept - NhacHayVN.mp3",
  },
  {
    id: "3",
    title: "Don't Coi Ver2",
    artist: "Anhvu Remix",
    src: "/Music/Don't Coi Ver2 Remix ( Anhvu Remix ) - Minh TienL - NhacHayVN.mp3",
  },
  {
    id: "4",
    title: "Em Là Ai",
    artist: "Dai Meo Remix",
    src: "/Music/Em La Ai (Dai Meo Remix) - Keyo - NhacHayVN.mp3",
  },
  {
    id: "5",
    title: "Rước Nắng",
    artist: "Air Remix",
    src: "/Music/Ruoc Nang (Air Remix) - BIN - NhacHayVN.mp3",
  },
];

// Singleton audio element
let globalAudio: HTMLAudioElement | null = null;

function getAudioElement(): HTMLAudioElement {
  if (typeof window === "undefined") {
    return {} as HTMLAudioElement;
  }
  if (!globalAudio) {
    globalAudio = document.createElement("audio");
    globalAudio.id = "music-player-audio";
    globalAudio.preload = "metadata";
    document.body.appendChild(globalAudio);
  }
  return globalAudio;
}

// Track Item Component
const TrackItem = memo<{
  track: Track;
  index: number;
  isPlaying: boolean;
  isCurrent: boolean;
  onSelect: (index: number) => void;
}>(({ track, index, isPlaying, isCurrent, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(index)}
    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
      isCurrent
        ? "bg-primary/20 border border-primary/30"
        : "hover:bg-white/5 border border-transparent"
    }`}
  >
    {/* Track Number / Playing Indicator */}
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
        isCurrent
          ? "bg-primary/30 text-primary"
          : "bg-white/5 text-foreground/50 group-hover:bg-primary/20 group-hover:text-primary"
      }`}
    >
      {isCurrent && isPlaying ? (
        <div className="flex items-center gap-0.5">
          <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
          <span
            className="w-0.5 h-4 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-0.5 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      ) : (
        <span>{index + 1}</span>
      )}
    </div>

    {/* Track Info */}
    <div className="flex-1 text-left min-w-0">
      <p
        className={`text-sm font-medium truncate ${
          isCurrent ? "text-primary" : "text-foreground/90"
        }`}
      >
        {track.title}
      </p>
      <p className="text-xs text-foreground/50 truncate">{track.artist}</p>
    </div>

    {/* Play Icon */}
    {!isCurrent && (
      <svg
        className="w-4 h-4 text-foreground/30 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )}
  </button>
));
TrackItem.displayName = "TrackItem";

function MusicPlayer() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(
    null
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize audio
  useEffect(() => {
    setMounted(true);
    audioRef.current = getAudioElement();

    // Create portal container
    let portal = document.getElementById(
      "music-player-portal"
    ) as HTMLDivElement | null;
    if (!portal) {
      portal = document.createElement("div");
      portal.id = "music-player-portal";
      portal.style.cssText =
        "position:fixed;inset:0;z-index:99999;pointer-events:none;";
      document.body.appendChild(portal);
    }
    setPortalElement(portal);

    return () => {
      if (progressIntervalRef.current) {
        cancelAnimationFrame(progressIntervalRef.current);
      }
    };
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Auto play next track
      if (currentTrack !== null) {
        const nextTrack = (currentTrack + 1) % tracks.length;
        setCurrentTrack(nextTrack);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentTrack]);

  // Update progress
  useEffect(() => {
    if (!isPlaying) {
      if (progressIntervalRef.current) {
        cancelAnimationFrame(progressIntervalRef.current);
      }
      return;
    }

    const updateProgress = () => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
      progressIntervalRef.current = requestAnimationFrame(updateProgress);
    };

    progressIntervalRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressIntervalRef.current) {
        cancelAnimationFrame(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Handle track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrack === null) return;

    const track = tracks[currentTrack];
    const encodedSrc = track.src
      .split("/")
      .map((p, i) => (i === 0 && p === "" ? "" : encodeURIComponent(p)))
      .join("/");

    audio.src = encodedSrc;
    audio.volume = isMuted ? 0 : volume;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrack === null) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Handle volume change
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectTrack = useCallback(
    (index: number) => {
      if (currentTrack === index) {
        setIsPlaying((p) => !p);
      } else {
        setCurrentTrack(index);
        setIsPlaying(true);
      }
    },
    [currentTrack]
  );

  const handlePlayPause = useCallback(() => {
    if (currentTrack === null) {
      setCurrentTrack(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [currentTrack]);

  const handlePrev = useCallback(() => {
    if (currentTrack === null) return;
    const prev = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    setIsPlaying(true);
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    if (currentTrack === null) {
      setCurrentTrack(0);
    } else {
      setCurrentTrack((currentTrack + 1) % tracks.length);
    }
    setIsPlaying(true);
  }, [currentTrack]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
    setProgress(percent * 100);
  }, []);

  const currentTrackInfo = currentTrack !== null ? tracks[currentTrack] : null;

  const widget = (
    <div
      ref={widgetRef}
      className="fixed bottom-6 right-6 z-99999 pointer-events-auto"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Expanded Panel */}
      <div
        className={`absolute bottom-20 right-0 w-80 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-linear-to-r from-primary/10 to-secondary/10 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-mono">
                Music Player
              </h3>
              <p className="text-[10px] text-foreground/50">
                {tracks.length} bài hát
              </p>
            </div>
          </div>
        </div>

        {/* Now Playing */}
        {currentTrackInfo && (
          <div className="px-4 py-3 border-b border-border/50 bg-background/30">
            <div className="flex items-center gap-3">
              {/* Vinyl Animation */}
              <div
                className={`w-12 h-12 rounded-full bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0 ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "3s" }}
              >
                <div className="w-4 h-4 rounded-full bg-surface" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {currentTrackInfo.title}
                </p>
                <p className="text-xs text-foreground/50 truncate">
                  {currentTrackInfo.artist}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className="mt-3 h-1 bg-border rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <button
                onClick={handlePrev}
                className="p-2 text-foreground/60 hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary transition-all hover:scale-105"
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-foreground/60 hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 text-foreground/50 hover:text-primary transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </div>
        )}

        {/* Playlist */}
        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
          {tracks.map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
              isPlaying={isPlaying}
              isCurrent={currentTrack === index}
              onSelect={handleSelectTrack}
            />
          ))}
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full bg-surface/90 backdrop-blur-lg border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group ${
          isPlaying
            ? "border-primary shadow-primary/30"
            : "border-border hover:border-primary/50"
        }`}
      >
        {/* Pulse ring when playing */}
        {isPlaying && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <span
              className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}

        {/* Icon */}
        <div
          className={`relative z-10 transition-transform ${
            isPlaying ? "animate-pulse" : ""
          }`}
        >
          {isPlaying ? (
            <svg
              className="w-6 h-6 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        {/* Now playing indicator */}
        {currentTrackInfo && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            {isPlaying ? (
              <div className="flex items-center gap-px">
                <span className="w-0.5 h-2 bg-background rounded-full animate-pulse" />
                <span
                  className="w-0.5 h-1.5 bg-background rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            ) : (
              <svg
                className="w-2 h-2 text-background"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </div>
        )}
      </button>
    </div>
  );

  if (!mounted || !portalElement) return null;
  return createPortal(widget, portalElement);
}

export default memo(MusicPlayer);
