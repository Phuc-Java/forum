// app/music-sanctuary/_components/AudioEngine.tsx
// Core Audio Engine với Web Audio API - Phân tích âm thanh real-time

"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { AudioAnalysis, MusicTrack } from "../types";

interface AudioEngineProps {
  track: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onAnalysis: (data: AudioAnalysis) => void;
  onError: (error: string) => void;
  onLoaded: () => void;
  seekTo?: number;
}

export function useAudioEngine({
  track,
  isPlaying,
  volume,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  onAnalysis,
  onError,
  onLoaded,
  seekTo,
}: AudioEngineProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isConnectedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Khởi tạo Audio Context
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();

      // Tạo Analyser Node với độ phân giải vừa đủ (giảm từ 2048 để tối ưu performance)
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 1024; // Giảm để tối ưu performance, vẫn đủ cho visualization
      analyser.smoothingTimeConstant = 0.75; // Làm mượt transitions
      analyserRef.current = analyser;

      // Buffer cho dữ liệu tần số
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      console.log("[AudioEngine] Audio Context initialized");
    } catch (error) {
      console.error("[AudioEngine] Failed to create AudioContext:", error);
      onError("Failed to initialize audio engine");
    }
  }, [onError]);

  // Kết nối audio element với analyser
  const connectSource = useCallback(() => {
    if (!audioRef.current || !audioContextRef.current || !analyserRef.current)
      return;
    if (isConnectedRef.current) return;

    try {
      // Tạo source từ audio element
      const source = audioContextRef.current.createMediaElementSource(
        audioRef.current
      );
      sourceRef.current = source;

      // Kết nối: source -> analyser -> destination
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      isConnectedRef.current = true;
      console.log("[AudioEngine] Audio source connected");
    } catch (error) {
      console.error("[AudioEngine] Failed to connect source:", error);
    }
  }, []);

  // Phân tích audio real-time
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const data = dataArrayRef.current;
    const bufferLength = data.length;

    // Chia dải tần số (với FFT 1024 -> 512 bins)
    // Bass: 20-250Hz (bins 0-15)
    // Mid: 250-4000Hz (bins 15-160)
    // Treble: 4000-20000Hz (bins 160+)

    const bassRange = data.slice(0, 20);
    const midRange = data.slice(20, 120);
    const trebleRange = data.slice(120, 256);

    const getAverage = (arr: Uint8Array<ArrayBuffer>) => {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum / arr.length / 255;
    };

    const getPeak = (arr: Uint8Array<ArrayBuffer>) => {
      let max = 0;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
      }
      return max / 255;
    };

    // Tính RMS (Root Mean Square) cho energy - optimized
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = data[i] / 255;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);

    // Spectral Centroid - simplified for performance
    let numerator = 0;
    let denominator = 0;
    // Sample every 4th bin for performance
    for (let i = 0; i < bufferLength; i += 4) {
      numerator += i * data[i];
      denominator += data[i];
    }
    const spectralCentroid =
      denominator > 0 ? numerator / denominator / bufferLength : 0;

    const analysis: AudioAnalysis = {
      bass: getAverage(bassRange),
      mid: getAverage(midRange),
      treble: getAverage(trebleRange),
      average: getAverage(data),
      peak: getPeak(data),
      energy: rms,
      spectralCentroid,
      rms,
    };

    onAnalysis(analysis);
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [onAnalysis]);

  // Track retry state
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Khởi tạo audio element
  useEffect(() => {
    const audio = new Audio();
    // Don't set crossOrigin initially - will set it only when needed for analyser
    audio.preload = "auto";
    audioRef.current = audio;

    // Event handlers
    const handleLoadedMetadata = () => {
      console.log("[AudioEngine] Metadata loaded, duration:", audio.duration);
      retryCountRef.current = 0; // Reset retry count on success
      onDurationChange(audio.duration);
      onLoaded();
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      onTimeUpdate(audio.currentTime);
    };

    const handleEnded = () => {
      console.log("[AudioEngine] Track ended");
      onEnded();
    };

    const handleError = (e: Event) => {
      const audioEl = e.target as HTMLAudioElement;
      const error = audioEl.error;
      console.error(
        "[AudioEngine] Audio error:",
        error?.code,
        error?.message,
        "src:",
        audioEl.src
      );

      // Don't show error for empty src
      if (!audioEl.src || audioEl.src === window.location.href) {
        console.log("[AudioEngine] Ignoring error for empty src");
        return;
      }

      // Retry logic - sometimes first load fails due to network
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(
          `[AudioEngine] Retrying... (${retryCountRef.current}/${maxRetries})`
        );
        setTimeout(() => {
          audioEl.load();
        }, 500);
        return;
      }

      onError("Failed to load audio file. Please try another track.");
    };

    const handleCanPlay = () => {
      console.log("[AudioEngine] Can play");
      retryCountRef.current = 0;
      // Only init audio context for local files or CORS-enabled sources
      // Try to connect, but don't fail if CORS blocks it
      try {
        initAudioContext();
        if (audio.crossOrigin === "anonymous") {
          connectSource();
        }
      } catch (err) {
        console.warn("[AudioEngine] Could not connect analyser:", err);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);

      audio.pause();
      audio.src = "";

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load track mới
  useEffect(() => {
    if (!audioRef.current || !track) return;

    console.log("[AudioEngine] Loading track:", track.title, track.src);
    setIsReady(false);

    const audio = audioRef.current;

    // Check if it's a local file or external URL
    const isLocalFile = track.src.startsWith("/") || track.src.startsWith("./");

    // For local files, use crossOrigin for analyser support
    // For external URLs, don't use crossOrigin to avoid CORS issues
    if (isLocalFile) {
      audio.crossOrigin = "anonymous";
    } else {
      // Remove crossOrigin for external URLs - audio will play without visualization
      audio.crossOrigin = "";
    }

    audio.src = track.src;
    audio.load();
  }, [track?.id, track?.src, track?.title]);

  // Play/Pause
  useEffect(() => {
    if (!audioRef.current || !isReady) return;

    if (isPlaying) {
      // Resume AudioContext nếu bị suspended
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }

      audioRef.current.play().catch((error) => {
        console.error("[AudioEngine] Play failed:", error);
        onError("Playback failed. Please interact with the page first.");
      });

      // Bắt đầu phân tích
      if (!animationFrameRef.current) {
        analyzeAudio();
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isReady, analyzeAudio, onError]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Seek control
  useEffect(() => {
    if (audioRef.current && seekTo !== undefined) {
      audioRef.current.currentTime = seekTo;
    }
  }, [seekTo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioElement: audioRef.current,
    audioContext: audioContextRef.current,
    analyser: analyserRef.current,
    isReady,
  };
}

export default useAudioEngine;
