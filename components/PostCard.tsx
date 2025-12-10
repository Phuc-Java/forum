"use client";

import { useState } from "react";

interface PostCardProps {
  title: string;
  content: string;
  createdAt: string;
}

export default function PostCard({ title, content, createdAt }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200;
  const shouldTruncate = content.length > MAX_LENGTH;
  const displayContent = isExpanded ? content : content.slice(0, MAX_LENGTH);

  return (
    <div className="group relative bg-surface/40 backdrop-blur-md border border-border rounded-lg p-6 transition-all duration-300 hover:border-primary hover:shadow-[0_0_20px_rgba(0,255,159,0.3)] hover:bg-surface/60">
      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-primary group-hover:text-glow-primary transition-all duration-300">
          {title}
        </h3>
        <span className="text-xs text-accent font-mono opacity-60">
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="relative">
        <p className="text-foreground/90 leading-relaxed font-mono text-sm whitespace-pre-wrap">
          {displayContent}
          {!isExpanded && shouldTruncate && "..."}
        </p>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-xs text-secondary hover:text-accent transition-colors duration-200 font-mono uppercase tracking-wider hover:underline"
          >
            {isExpanded ? "▲ Collapse" : "▼ Read More"}
          </button>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary via-accent to-secondary group-hover:w-full transition-all duration-500"></div>
    </div>
  );
}
