// app/music-sanctuary/_components/PremiumPlayer.tsx
// Ultimate music player interface with premium features

"use client";

import React, {
  useState,
  useRef,
  useEffect,
  memo,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  Music,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Mic2,
  Share2,
  Clock,
  ListMusic,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MusicTrack, AudioAnalysis } from "../types";

// ============================================================================
// UTILITIES
// ============================================================================

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// ============================================================================
// INTERFACES
// ============================================================================

interface PremiumPlayerProps {
  currentTrack: MusicTrack | null;
  tracks: MusicTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: "off" | "one" | "all";
  isShuffled: boolean;
  audioData: AudioAnalysis;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onRepeatToggle: () => void;
  onShuffleToggle: () => void;
  onTrackSelect: (track: MusicTrack) => void;
}

// ============================================================================
// LIVE AUDIO BARS
// ============================================================================

const AudioBars = memo(
  ({ isPlaying, small = false }: { isPlaying: boolean; small?: boolean }) => {
    const bars = small ? 4 : 5;

    // Pre-generate stable values
    const barData = useMemo(
      () =>
        Array.from({ length: bars }, (_, i) => ({
          height: 0.3 + (Math.sin(i * 2.5) * 0.5 + 0.5) * 0.4,
          duration: 0.4 + (i % 3) * 0.1,
        })),
      [bars]
    );

    return (
      <div className={`flex items-end gap-0.5 ${small ? "h-3" : "h-4"}`}>
        {barData.map((bar, i) => (
          <motion.div
            key={i}
            className={`${small ? "w-0.5" : "w-1"} bg-emerald-500 rounded-full`}
            animate={
              isPlaying
                ? {
                    height: [
                      `${20 + bar.height * 30}%`,
                      `${60 + bar.height * 40}%`,
                      `${20 + bar.height * 30}%`,
                    ],
                  }
                : { height: "30%" }
            }
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
);

AudioBars.displayName = "AudioBars";

// ============================================================================
// PROGRESS BAR WITH WAVEFORM - GPU OPTIMIZED
// ============================================================================

const WaveformProgress = memo(
  ({
    currentTime,
    duration,
    onSeek,
  }: {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    audioData: AudioAnalysis;
    isPlaying: boolean;
  }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hoverPosition, setHoverPosition] = useState(0);
    const progressRef = useRef<HTMLDivElement>(null);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleClick = (e: React.MouseEvent) => {
      if (!progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      onSeek(percentage * duration);
    };

    // Throttle mouse move for performance
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // Use requestAnimationFrame to throttle updates
      requestAnimationFrame(() => {
        setHoverPosition(x / rect.width);
      });
    }, []);

    // Pre-generate static waveform (memoized)
    const waveform = useMemo(() => {
      return Array.from({ length: 80 }, (_, i) => {
        const seed = Math.sin(i * 0.5) * 0.5 + 0.5;
        return 0.2 + seed * 0.8;
      });
    }, []);

    return (
      <div className="w-full gpu-accelerated">
        {/* Time display */}
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span className="font-mono">{formatTime(currentTime)}</span>
          <span className="font-mono">{formatDuration(duration)}</span>
        </div>

        {/* Waveform container - GPU accelerated */}
        <div
          ref={progressRef}
          className="relative h-14 cursor-pointer gpu-accelerated"
          onClick={handleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          style={{
            contain: "layout style paint",
            willChange: "transform",
          }}
        >
          {/* Background waveform - using CSS instead of framer-motion */}
          <div
            className="absolute inset-0 flex items-center gap-[2px]"
            style={{ transform: "translateZ(0)" }}
          >
            {waveform.map((height, i) => {
              const barProgress = (i / 80) * 100;
              const isPlayed = barProgress < progress;
              const isHovered = isHovering && barProgress < hoverPosition * 100;

              return (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: `${height * 100}%`,
                    maxHeight: "100%",
                    backgroundColor: isPlayed
                      ? "#10b981"
                      : isHovered
                      ? "rgba(255, 255, 255, 0.4)"
                      : "rgba(255, 255, 255, 0.15)",
                    transition: "background-color 0.1s ease-out",
                    transform: "translateZ(0)",
                  }}
                />
              );
            })}
          </div>

          {/* Progress indicator - simple CSS */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-emerald-400 rounded-full"
            style={{
              left: `${progress}%`,
              opacity: isHovering ? 1 : 0.6,
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
              transition: "opacity 0.15s ease-out",
              transform: "translateZ(0)",
            }}
          />

          {/* Hover time preview - only show when hovering */}
          {isHovering && (
            <div
              className="absolute -top-8 px-2 py-1 rounded bg-white/10 backdrop-blur-sm text-xs text-white font-mono pointer-events-none"
              style={{
                left: `${hoverPosition * 100}%`,
                transform: "translateX(-50%) translateZ(0)",
              }}
            >
              {formatTime(hoverPosition * duration)}
            </div>
          )}
        </div>
      </div>
    );
  }
);

WaveformProgress.displayName = "WaveformProgress";

// ============================================================================
// CONTROL BUTTON
// ============================================================================

const ControlButton = memo(
  ({
    icon: Icon,
    onClick,
    active = false,
    size = "md",
    primary = false,
    disabled = false,
    tooltip,
  }: {
    icon: LucideIcon;
    onClick: () => void;
    active?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    primary?: boolean;
    disabled?: boolean;
    tooltip?: string;
  }) => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-14 h-14",
      xl: "w-16 h-16",
    };

    const iconSizes = {
      sm: 14,
      md: 18,
      lg: 24,
      xl: 28,
    };

    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative flex items-center justify-center rounded-full
          transition-all duration-200 group
          ${sizeClasses[size]}
          ${
            primary
              ? "bg-white text-black shadow-lg shadow-white/20 hover:shadow-white/30"
              : active
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }
          ${disabled ? "opacity-30 cursor-not-allowed" : ""}
        `}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Icon size={iconSizes[size]} />

        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0, opacity: 1 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-white/10 backdrop-blur-sm text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {tooltip}
          </div>
        )}
      </motion.button>
    );
  }
);

ControlButton.displayName = "ControlButton";

// ============================================================================
// VOLUME CONTROL
// ============================================================================

const VolumeControl = memo(
  ({
    volume,
    isMuted,
    onVolumeChange,
    onMuteToggle,
  }: {
    volume: number;
    isMuted: boolean;
    onVolumeChange: (vol: number) => void;
    onMuteToggle: () => void;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleSliderClick = (e: React.MouseEvent) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = 1 - y / rect.height;
      onVolumeChange(Math.max(0, Math.min(1, percentage)));
    };

    const VolumeIcon = isMuted
      ? VolumeX
      : volume > 0.5
      ? Volume2
      : volume > 0
      ? Volume1
      : VolumeX;

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <ControlButton
          icon={VolumeIcon}
          onClick={onMuteToggle}
          active={isMuted}
        />

        {/* Vertical volume slider */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-3 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
            >
              <div
                ref={sliderRef}
                className="relative w-2 h-28 bg-white/10 rounded-full cursor-pointer"
                onClick={handleSliderClick}
              >
                {/* Volume level */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full"
                  style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                />

                {/* Thumb */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                  style={{
                    bottom: `calc(${(isMuted ? 0 : volume) * 100}% - 8px)`,
                  }}
                />
              </div>

              {/* Volume percentage */}
              <div className="mt-3 text-center text-xs text-white/60 font-mono">
                {isMuted ? "Mute" : `${Math.round(volume * 100)}%`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

VolumeControl.displayName = "VolumeControl";

// ============================================================================
// TRACK ITEM
// ============================================================================

const TrackItem = memo(
  ({
    track,
    index,
    isActive,
    isPlaying,
    onSelect,
  }: {
    track: MusicTrack;
    index: number;
    isActive: boolean;
    isPlaying: boolean;
    onSelect: () => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex items-center gap-4 p-3 rounded-xl cursor-pointer
          transition-all duration-200 group
          ${isActive ? "bg-emerald-500/15" : "hover:bg-white/5"}
        `}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ x: 4 }}
      >
        {/* Track number / Play indicator */}
        <div className="w-6 flex items-center justify-center">
          {isActive && isPlaying ? (
            <AudioBars isPlaying={isPlaying} small />
          ) : isHovered ? (
            <Play size={14} className="text-white" fill="white" />
          ) : (
            <span className="text-sm text-white/30 font-mono">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Album art */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative group">
          {track.cover ? (
            <img
              src={track.cover}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
              <Music size={18} className="text-white/40" />
            </div>
          )}

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <Play size={20} className="text-white" fill="white" />
          </motion.div>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isActive ? "text-emerald-400" : "text-white"
            }`}
          >
            {track.title}
          </p>
          <p className="text-xs text-white/40 truncate">{track.artist}</p>
        </div>

        {/* Duration */}
        <span className="text-xs text-white/30 font-mono">
          {formatDuration(track.duration || 0)}
        </span>

        {/* Like button */}
        <motion.button
          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={16} className="text-white/40 hover:text-pink-500" />
        </motion.button>
      </motion.div>
    );
  }
);

TrackItem.displayName = "TrackItem";

// ============================================================================
// PLAYLIST SIDEBAR
// ============================================================================

const PlaylistSidebar = memo(
  ({
    tracks,
    currentTrack,
    isPlaying,
    onTrackSelect,
    isOpen,
    onClose,
  }: {
    tracks: MusicTrack[];
    currentTrack: MusicTrack | null;
    isPlaying: boolean;
    onTrackSelect: (track: MusicTrack) => void;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const filteredTracks = useMemo(() => {
      if (!searchQuery.trim()) return tracks;
      const query = searchQuery.toLowerCase();
      return tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query)
      );
    }, [tracks, searchQuery]);

    return (
      <motion.div
        className="fixed left-0 top-0 bottom-0 w-96 bg-zinc-950/95 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col"
        initial={{ x: -400 }}
        animate={{ x: isOpen ? 0 : -400 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <ListMusic size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Playlist</h2>
                <p className="text-xs text-white/40">{tracks.length} bài hát</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-white/5"
            />
          </div>

          {/* View toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/40 hover:text-white"
              }`}
            >
              <List size={16} />
              Danh sách
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/40 hover:text-white"
              }`}
            >
              <LayoutGrid size={16} />
              Lưới
            </button>
          </div>
        </div>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {viewMode === "list" ? (
            <div className="space-y-1">
              {filteredTracks.map((track, index) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  isActive={currentTrack?.id === track.id}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  onSelect={() => onTrackSelect(track)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  onClick={() => onTrackSelect(track)}
                  className={`
                    p-3 rounded-xl cursor-pointer group
                    ${
                      currentTrack?.id === track.id
                        ? "bg-emerald-500/15"
                        : "bg-white/5 hover:bg-white/10"
                    }
                  `}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                    {track.cover ? (
                      <img
                        src={track.cover}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                        <Music size={32} className="text-white/40" />
                      </div>
                    )}

                    {/* Play overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <AudioBars isPlaying />
                      ) : (
                        <Play size={32} className="text-white" fill="white" />
                      )}
                    </motion.div>
                  </div>

                  <p className="text-sm font-medium text-white truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {track.artist}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-around text-xs text-white/30">
            <div className="flex items-center gap-2">
              <Music size={14} />
              <span>{tracks.length} bài</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>
                {formatTime(
                  tracks.reduce((acc, t) => acc + (t.duration || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

PlaylistSidebar.displayName = "PlaylistSidebar";

// ============================================================================
// NOW PLAYING INFO
// ============================================================================

const NowPlayingInfo = memo(
  ({ track, isPlaying }: { track: MusicTrack | null; isPlaying: boolean }) => {
    if (!track) return null;

    return (
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Mini album art - static, no rotation */}
        <div
          className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl relative"
          style={{
            boxShadow: isPlaying
              ? "0 0 20px rgba(16, 185, 129, 0.3), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(0,0,0,0.4)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {track.cover ? (
            <img
              src={track.cover}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Music size={24} className="text-white" />
            </div>
          )}
          {/* Playing glow effect overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent pointer-events-none" />
          )}
        </div>

        <div className="min-w-0">
          <motion.h2
            className="text-xl font-bold text-white truncate"
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {track.title}
          </motion.h2>
          <motion.p
            className="text-sm text-white/50 truncate"
            key={`${track.id}-artist`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {track.artist}
          </motion.p>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <motion.div
            className="ml-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AudioBars isPlaying />
          </motion.div>
        )}
      </motion.div>
    );
  }
);

NowPlayingInfo.displayName = "NowPlayingInfo";

// ============================================================================
// MAIN PREMIUM PLAYER
// ============================================================================

const PremiumPlayer = memo((props: PremiumPlayerProps) => {
  const {
    currentTrack,
    tracks,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    audioData,
    onPlayPause,
    onNext,
    onPrev,
    onSeek,
    onVolumeChange,
    onMuteToggle,
    onRepeatToggle,
    onShuffleToggle,
    onTrackSelect,
  } = props;

  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowRight":
          if (e.shiftKey) onNext();
          else onSeek(Math.min(currentTime + 10, duration));
          break;
        case "ArrowLeft":
          if (e.shiftKey) onPrev();
          else onSeek(Math.max(currentTime - 10, 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          onVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          onVolumeChange(Math.max(volume - 0.1, 0));
          break;
        case "m":
          onMuteToggle();
          break;
        case "r":
          onRepeatToggle();
          break;
        case "s":
          onShuffleToggle();
          break;
        case "l":
          setShowPlaylist((p) => !p);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onPlayPause,
    onNext,
    onPrev,
    onSeek,
    onVolumeChange,
    onMuteToggle,
    onRepeatToggle,
    onShuffleToggle,
    currentTime,
    duration,
    volume,
  ]);

  return (
    <>
      {/* Playlist Sidebar */}
      <PlaylistSidebar
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTrackSelect={onTrackSelect}
        isOpen={showPlaylist}
        onClose={() => setShowPlaylist(false)}
      />

      {/* Main Player Interface */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ marginLeft: showPlaylist ? "384px" : 0 }}
        animate={{ marginLeft: showPlaylist ? "384px" : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/95 to-transparent backdrop-blur-xl" />

        {/* Content */}
        <div className="relative px-8 py-6">
          {/* Progress bar at top */}
          <div className="mb-6">
            <WaveformProgress
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
              audioData={audioData}
              isPlaying={isPlaying}
            />
          </div>

          {/* Main controls row */}
          <div className="flex items-center justify-between">
            {/* Left: Now playing info */}
            <div className="flex-1">
              <NowPlayingInfo track={currentTrack} isPlaying={isPlaying} />
            </div>

            {/* Center: Main controls */}
            <div className="flex items-center gap-4">
              <ControlButton
                icon={Shuffle}
                onClick={onShuffleToggle}
                active={isShuffled}
                tooltip="Shuffle (S)"
              />

              <ControlButton
                icon={SkipBack}
                onClick={onPrev}
                size="lg"
                tooltip="Previous (Shift+←)"
              />

              <ControlButton
                icon={isPlaying ? Pause : Play}
                onClick={onPlayPause}
                size="xl"
                primary
                tooltip="Play/Pause (Space)"
              />

              <ControlButton
                icon={SkipForward}
                onClick={onNext}
                size="lg"
                tooltip="Next (Shift+→)"
              />

              <ControlButton
                icon={repeatMode === "one" ? Repeat1 : Repeat}
                onClick={onRepeatToggle}
                active={repeatMode !== "off"}
                tooltip={`Repeat: ${
                  repeatMode === "off"
                    ? "Off"
                    : repeatMode === "one"
                    ? "One"
                    : "All"
                } (R)`}
              />
            </div>

            {/* Right: Additional controls */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={onVolumeChange}
                onMuteToggle={onMuteToggle}
              />

              <ControlButton
                icon={ListMusic}
                onClick={() => setShowPlaylist((p) => !p)}
                active={showPlaylist}
                tooltip="Playlist (L)"
              />

              <ControlButton
                icon={Mic2}
                onClick={() => setShowLyrics((p) => !p)}
                active={showLyrics}
                tooltip="Lyrics"
              />

              <ControlButton icon={Heart} onClick={() => {}} tooltip="Like" />

              <ControlButton icon={Share2} onClick={() => {}} tooltip="Share" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toggle playlist button when closed */}
      <AnimatePresence>
        {!showPlaylist && (
          <motion.button
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setShowPlaylist(true)}
          >
            <ChevronDown className="rotate-[-90deg]" size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
});

PremiumPlayer.displayName = "PremiumPlayer";

export default PremiumPlayer;
