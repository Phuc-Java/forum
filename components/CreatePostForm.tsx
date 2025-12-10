"use client";

import { useState, FormEvent } from "react";

interface CreatePostFormProps {
  onPostCreated?: (post: { title: string; content: string }) => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the parent callback to create the post
      if (onPostCreated) {
        await onPostCreated({ title, content });
      }

      // Reset form on success
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("❌ Failed to broadcast:", error);
      alert("Failed to broadcast message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-6 shadow-xl"
    >
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold text-primary text-glow-primary font-mono">
          {">"} New Transmission
        </h2>
        <p className="text-sm text-foreground/60 mt-1 font-mono">
          Broadcast your message to the network
        </p>
      </div>

      {/* Title Input */}
      <div className="mb-6 relative">
        <label
          htmlFor="title"
          className="block text-sm font-mono text-accent mb-2 uppercase tracking-wider"
        >
          {">"} Subject
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
          placeholder="Enter transmission title..."
          className="w-full bg-background/50 border-2 border-border focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,159,0.3)] rounded px-4 py-3 text-foreground placeholder-foreground/30 transition-all duration-300 outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Content Textarea */}
      <div className="mb-6 relative">
        <label
          htmlFor="content"
          className="block text-sm font-mono text-accent mb-2 uppercase tracking-wider"
        >
          {">"} Message
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isLoading}
          placeholder="Compose your message..."
          rows={6}
          className="w-full bg-background/50 border-2 border-border focus:border-secondary focus:shadow-[0_0_15px_rgba(189,0,255,0.3)] rounded px-4 py-3 text-foreground placeholder-foreground/30 transition-all duration-300 outline-none font-mono resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="absolute bottom-3 right-3 text-xs text-foreground/40 font-mono">
          {content.length} chars
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !title.trim() || !content.trim()}
        className="w-full bg-linear-to-r from-primary to-accent text-background font-bold py-3 px-6 rounded font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,159,0.6)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden group"
      >
        {/* Animated background on hover */}
        <span className="absolute inset-0 bg-linear-to-r from-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Broadcasting...
            </>
          ) : (
            <>
              <span>{">"} Broadcast</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </>
          )}
        </span>
      </button>

      {/* Info Text */}
      <p className="mt-4 text-xs text-center text-foreground/40 font-mono">
        Press ENTER to submit • ESC to clear
      </p>
    </form>
  );
}
