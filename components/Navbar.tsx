"use client";

import { useState } from "react";

export default function Navbar() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnected(!isConnected);
    console.log(
      isConnected ? "🔌 Disconnected from network" : "🔗 Connected to network"
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b-2 border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {/* Animated Logo Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse"></div>
              <svg
                className="w-6 h-6 text-primary relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Brand Name */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-primary text-glow-primary">Hacker</span>
                <span className="text-secondary text-glow-secondary">
                  Forum
                </span>
              </h1>
              <p className="text-[10px] text-accent font-mono tracking-widest opacity-60">
                SECURE • DECENTRALIZED • ANONYMOUS
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full border border-border">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-primary animate-pulse" : "bg-foreground/30"
                }`}
              ></div>
              <span className="text-xs font-mono text-foreground/60">
                {isConnected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              className={`
                relative px-6 py-2 font-mono font-bold uppercase tracking-wider text-sm
                rounded-lg transition-all duration-300 overflow-hidden group
                ${
                  isConnected
                    ? "bg-gradient-to-r from-danger to-warning text-background border-2 border-danger hover:shadow-[0_0_20px_rgba(255,0,85,0.6)]"
                    : "bg-gradient-to-r from-primary to-accent text-background border-2 border-primary hover:shadow-[0_0_20px_rgba(0,255,159,0.6)]"
                }
              `}
            >
              {/* Animated background */}
              <span
                className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${
                  isConnected
                    ? "bg-gradient-to-r from-warning to-danger"
                    : "bg-gradient-to-r from-accent to-secondary"
                }
              `}
              ></span>

              <span className="relative flex items-center gap-2">
                {isConnected ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Disconnect
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Connect
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom scan line effect */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse"></div>
    </nav>
  );
}
