"use client";

import LaserFlow from "@/components/ui/LaserFlow";
import ProfileCard from "@/components/ui/ProfileCard-demo";
import { useRef, useState } from "react";
import Image from "next/image";
import GradientText from "@/components/ui/GradientText";
import DecryptedText from "@/components/ui/DecryptedText";
import { LayoutTextFlip } from "./ui/layout-text-flip";
import { motion } from "motion/react";
import { LiaSmileWink } from "react-icons/lia";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const revealImgRef = useRef<HTMLElement | null>(null); // Thêm ref để xử lý hiệu ứng chuột nếu cần
  const [open, setOpen] = useState(false);

  return (
    // SỬA: Thêm 'flex-col' để xếp dọc, 'overflow-hidden' để tránh thanh cuộn thừa trong tab
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-[#060010]">
      {/* Container chứa LaserFlow */}
      <div
        style={{
          height: "600px",
          width: "100%", // Đảm bảo chiếm full chiều rộng
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#060010",
          flexShrink: 0, // Không cho phép khối này bị co lại
        }}
        // Giữ nguyên logic mouse move từ bản gốc để laser tương tác (nếu muốn)
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const el = revealImgRef.current;
          if (el) {
            el.style.setProperty("--mx", `${x}px`);
            el.style.setProperty("--my", `${y + rect.height * 0.5}px`);
          }
        }}
      >
        <LaserFlow
          horizontalBeamOffset={0.17}
          verticalBeamOffset={0.0}
          color="#9333ea"
          verticalSizing={2.0}
          horizontalSizing={0.8}
          decay={1.0}
          falloffStart={1.6}
        />
      </div>

      {/* Container chứa nội dung chính */}
      <div
        style={{
          position: "relative",
          margin: "-300px auto 0 auto", // Margin âm để kéo nội dung đè lên Laser
          width: "86%",
          maxWidth: "1400px",
          backgroundColor: "#060010",
          borderRadius: "20px",
          border: "2px solid #9333ea",
          padding: "3rem 2rem",
          zIndex: 10,
        }}
      >
        {/* Profile Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Section - Profile Info */}
          <div className="space-y-6">
            {/* Quote Badge */}
            <div className="inline-flex items-center gap-3 backdrop-blur-md bg-black/30 border border-white/10 rounded-full px-4 py-2">
              <div className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden bg-transparent">
                <Image
                  src="/vest1-removebg-preview.png"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-white/80 text-xs">
                &quot;Có chí thì nên&quot;
              </span>
            </div>

            {/* Main Title */}
            <div className="leading-tight">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#9333ea", "#4079ff", "#40ffaa"]}
                animationSpeed={5}
                showBorder={false}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
              >
                Xin chào, Mình là Nguyễn Tuấn Phúc!
              </GradientText>
            </div>
            {/* Description */}
            <div className="space-y-3 text-sm sm:text-base text-white/70 leading-relaxed">
              <div className="flex items-start gap-2">
                <span>•</span>
                <DecryptedText
                  text="Tôi là sinh viên năm nhất Đại học Công nghiệp IUH"
                  speed={50}
                  maxIterations={50}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                  className="text-white/70"
                  animateOn="both"
                  revealDirection="center"
                />
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <DecryptedText
                  text="Tôi đã bắt đầu viết website cá nhân đầu tiên vào ngày 17/10/2025"
                  speed={50}
                  maxIterations={50}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/"
                  className="text-white/70"
                  animateOn="both"
                  revealDirection="center"
                />
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <DecryptedText
                  text="Công nghệ tôi biết: ReactJS, NextJS, TailwindCSS, HTML, CSS, JavaScript, Python, Java, C"
                  speed={50}
                  maxIterations={50}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,:"
                  className="text-white/70"
                  animateOn="both"
                  revealDirection="center"
                />
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <DecryptedText
                  text="Công nghệ đang học: Đám mây, Mạng máy tính, Linux, Hacking Basic, AI"
                  speed={50}
                  maxIterations={50}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,:"
                  className="text-white/70"
                  animateOn="both"
                  revealDirection="center"
                />
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <DecryptedText
                  text="Tôi thích làm việc với các công cụ AI và công nghệ mạnh mẽ, học nhanh và sẵn sàng tiếp thu kiến thức mới. Luôn tôn trọng tiền bối trong ngành."
                  speed={50}
                  maxIterations={50}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,."
                  className="text-white/70"
                  animateOn="both"
                  revealDirection="center"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-full px-6 py-3 text-sm text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                Download CV
              </button>
              <button className="backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-full px-6 py-3 text-sm text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                Projects
              </button>
            </div>
          </div>

          {/* Right Section - Profile Card */}
          <div className="flex justify-center lg:justify-end">
            <ProfileCard
              name="Nguyễn Tuấn Phúc"
              title="Full Stack Developer"
              handle="NguyenTuanPhuc"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/vest1-removebg-preview.png"
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => {}}
            />
          </div>
        </div>

        {/* Professional Footer Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <motion.div
            className="relative mx-4 mb-8 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LayoutTextFlip
              text="Website được tạo ra bằng công nghệ: "
              words={[
                "ReactJS",
                "NextJS",
                "TailwindCSS",
                "TypeScript",
                "Framer Motion",
                "Aceternity UI",
              ]}
            />
          </motion.div>

          <div className="flex items-center justify-center gap-3 my-8">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <p className="text-base sm:text-lg text-white/70">
                Trải nghiệm Website sáng tạo của mình và chúc bạn có một ngày
                vui vẻ
              </p>
              <LiaSmileWink className="text-3xl text-purple-400 animate-bounce" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-white/50">
              <span>© 2025 Nguyễn Tuấn Phúc.</span>
              <span className="hidden sm:inline">•</span>
              <span>Crafted with 💜 and ☕</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
