"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Terminal, Circle, Minimize, Maximize } from "lucide-react";

const coderData = {
  name: "Nguyễn Tuấn Phúc",
  role: "Fullstack Architect", // Nâng tầm role lên chút cho ngầu
  level: "junior",
  location: "Ho Chi Minh City, VN", // Update theo vị trí bạn
  skills: [
    "Next.js 16",
    "React Server Components",
    "Three.js",
    "Tailwind v4",
    "VPS + Coolify hosting",
    "Appwrite",
  ],
};

export const CoderProfileCard = () => {
  const ref = useRef<HTMLDivElement>(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-full max-w-lg mx-auto perspective-1000"
    >
      {/* Glow Effect behind */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyber-500 to-cyber-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

      {/* Main Card */}
      <div className="relative h-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <Terminal size={12} />
            <span>developer_profile.json</span>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
          <div className="grid grid-cols-[20px_1fr] gap-4">
            {/* Line Numbers */}
            <div className="text-slate-600 text-right select-none flex flex-col">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>

            {/* Code */}
            <div className="text-slate-300">
              <p>
                <span className="text-purple-400">const</span>{" "}
                <span className="text-blue-400">User</span> ={" "}
                <span className="text-yellow-400">{`{`}</span>
              </p>
              <p className="pl-4">
                name: <span className="text-green-400">'{coderData.name}'</span>
                ,
              </p>
              <p className="pl-4">
                role: <span className="text-green-400">'{coderData.role}'</span>
                ,
              </p>
              <p className="pl-4">
                status: <span className="text-orange-400">Rãnh Rỗi</span>,
              </p>
              <p className="pl-4">
                stats: <span className="text-yellow-400">{`{`}</span>
              </p>
              <p className="pl-8">
                level: <span className="text-cyan-400">Chí Tôn Nhân Tộc</span>,
              </p>
              <p className="pl-8">
                coffee_consumed: <span className="text-cyan-400">Infinity</span>
                ,
              </p>
              <p className="pl-4">
                <span className="text-yellow-400">{`}`}</span>,
              </p>
              <p className="pl-4">
                tech_stack: <span className="text-blue-400">[</span>
              </p>
              <div className="pl-8 flex flex-wrap gap-1">
                {coderData.skills.map((skill, i) => (
                  <span key={skill}>
                    <span className="text-green-400">'{skill}'</span>
                    {i < coderData.skills.length - 1 && (
                      <span className="text-slate-500">, </span>
                    )}
                  </span>
                ))}
              </div>
              <p className="pl-4">
                <span className="text-blue-400">]</span>
              </p>
              <p className="pl-4">
                execute: <span className="text-purple-400">()</span>{" "}
                <span className="text-purple-400">=&gt;</span>{" "}
                <span className="text-yellow-400">{`{`}</span>
              </p>
              <p className="pl-8">
                <span className="text-cyan-400">return</span>{" "}
                <span className="text-green-400">
                  Xây Dựng Một Thứ Thỏa Mãn Cái Tôi
                </span>
                ;
              </p>
              <p className="pl-4">
                <span className="text-yellow-400">{`}`}</span>
              </p>
              <p>
                <span className="text-yellow-400">{`}`}</span>;
              </p>
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="bg-slate-900/80 px-4 py-1 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>TypeScript React</span>
          <span>UTF-8</span>
          <span>Ready</span>
        </div>
      </div>
    </motion.div>
  );
};
