"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Github, Twitter, Linkedin, Sparkles } from "lucide-react";
import { CoderProfileCard } from "./code-card"; // Import card vừa tạo

export const PortfolioUI = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mt-10 lg:mt-0">
        {/* Left Column: Text & Call to Action */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 w-fit backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase">
              Open for Work
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Coding The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse-glow">
              Next Reality
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            Tôi tạo ra các trải nghiệm web hiệu năng cao với{" "}
            <strong className="text-white">Next.js 16</strong> và kiến trúc
            Server-First. Kết hợp sức mạnh của 3D và Clean Code.
          </p>
          <div className="flex items-center gap-6 mt-8 text-slate-500">
            <Github className="w-6 h-6 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-6 h-6 hover:text-cyan-400 cursor-pointer transition-colors" />
            <Linkedin className="w-6 h-6 hover:text-blue-500 cursor-pointer transition-colors" />
          </div>
        </motion.div>

        {/* Right Column: Code Card (Floating) */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Đây là nơi đặt Code Card, nó sẽ nằm đè lên layer 3D nếu cần */}
          <CoderProfileCard />
        </div>
      </div>
    </div>
  );
};
