"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  memo,
  useCallback,
} from "react";
import { IRole } from "../data";

// =============================================================================
// PHẦN 1: ISOLATED COMPONENTS (Tách State để tránh Re-render cha)
// =============================================================================

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

// OPTIMIZATION: Dùng requestAnimationFrame thay vì setInterval để không block main thread
const ScrambledTitle = memo(
  ({
    text,
    active,
    color,
    isSupreme,
  }: {
    text: string;
    active: boolean;
    color: string;
    isSupreme: boolean;
  }) => {
    const [display, setDisplay] = useState(text);
    const frameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
      if (!active) {
        setDisplay(text);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        return;
      }

      startTimeRef.current = Date.now();

      const update = () => {
        const elapsed = Date.now() - startTimeRef.current;
        // Text chạy xong trong 1000ms (1s)
        const progress = Math.min(elapsed / 1000, 1);

        const iterations = Math.floor(progress * text.length);

        setDisplay(
          text
            .split("")
            .map((char, index) => {
              if (index < iterations) return text[index];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(update);
        }
      };

      frameRef.current = requestAnimationFrame(update);

      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [text, active]);

    return (
      <h3
        className="text-3xl md:text-4xl font-black font-dao mb-2 uppercase tracking-wide min-h-[48px] transition-colors duration-300"
        style={{
          color: isSupreme ? "#fbbf24" : "white",
          // Thay textShadow nặng bằng CSS drop-shadow nhẹ hơn hoặc tắt bớt blur
          textShadow: active ? `0 0 20px ${color}` : "none",
        }}
      >
        {display}
      </h3>
    );
  }
);
ScrambledTitle.displayName = "ScrambledTitle";

// =============================================================================
// PHẦN 2: SUB-COMPONENTS (OPTIMIZED - GPU ACCELERATED)
// =============================================================================

// 1. Viền Rồng - FIX LAG: Tách lớp Glow (Tĩnh) và Lớp Chạy (Động)
const DragonBorderFixed = memo(
  ({
    color = "#eab308",
    active = false,
  }: {
    color?: string;
    active?: boolean;
  }) => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      <style jsx>{`
        @keyframes dash-draw {
          to {
            stroke-dashoffset: -200;
          }
        }
        .animate-dash {
          animation: dash-draw 4s linear infinite;
          will-change: stroke-dashoffset;
        }
      `}</style>

      <svg
        className="w-full h-full"
        viewBox="0 0 400 600"
        preserveAspectRatio="none"
        // Tối ưu render vector
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient
            id={`grad-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>

          <pattern
            id="grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
        </defs>

        {/* Nền Grid */}
        <rect
          x="10"
          y="10"
          width="380"
          height="580"
          fill="url(#grid-pattern)"
          opacity={active ? 1 : 0}
          className="transition-opacity duration-1000"
        />

        {/* --- LỚP 1: TĨNH (STATIC) --- 
            Chứa các phần tử CÓ FILTER/GLOW nhưng KHÔNG CHUYỂN ĐỘNG.
            GPU sẽ cache lớp này thành bitmap.
        */}
        <g
          opacity={active ? 1 : 0.5}
          className="transition-opacity duration-500"
          // Dùng drop-shadow thay vì filter SVG phức tạp, nhẹ hơn nhiều
          style={{ filter: active ? `drop-shadow(0 0 8px ${color})` : "none" }}
        >
          {/* 4 Góc */}
          <path d="M10,10 L60,10 L60,14 L14,14 L14,60 L10,60 Z" fill={color} />
          <path
            d="M390,10 L340,10 L340,14 L386,14 L386,60 L390,60 Z"
            fill={color}
          />
          <path
            d="M10,590 L60,590 L60,586 L14,586 L14,540 L10,540 Z"
            fill={color}
          />
          <path
            d="M390,590 L340,590 L340,586 L386,586 L386,540 L390,540 Z"
            fill={color}
          />

          {/* Các điểm neo nhỏ */}
          <rect x="18" y="18" width="4" height="4" fill={color} />
          <rect x="378" y="18" width="4" height="4" fill={color} />
          <rect x="18" y="578" width="4" height="4" fill={color} />
          <rect x="378" y="578" width="4" height="4" fill={color} />

          {/* Viền mờ nền (đứng im) */}
          <path
            d="M20,20 L380,20 L380,580 L20,580 Z"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.2"
          />
        </g>

        {/* --- LỚP 2: ĐỘNG (DYNAMIC) --- 
            Chứa phần tử CHUYỂN ĐỘNG nhưng KHÔNG CÓ FILTER.
            Tuyệt đối không gắn filter vào class animate-dash.
        */}
        <path
          d="M20,20 L380,20 L380,580 L20,580 Z"
          fill="none"
          stroke={`url(#grad-${color})`}
          strokeWidth="2"
          strokeDasharray="20 40"
          strokeLinecap="round"
          className={active ? "animate-dash" : ""}
          style={{
            opacity: active ? 1 : 0,
            transition: "opacity 0.5s",
            // Đảm bảo không có filter nào dính vào đây
            filter: "none",
          }}
        />

        {active && (
          <path
            d="M0,300 Q20,250 40,300 T80,300 T120,300"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.2"
            transform="translate(0, 280) scale(10, 0.5)"
          />
        )}
      </svg>
    </div>
  )
);
DragonBorderFixed.displayName = "DragonBorderFixed";

// 2. Hiệu ứng Chí Tôn (Giữ nguyên, thêm will-change)
const SupremeEffects = memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] transform-gpu">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] animate-[spin_30s_linear_infinite] opacity-30 will-change-transform">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 w-[60vh] h-[10vh] origin-left bg-gradient-to-r from-yellow-500/20 to-transparent"
          style={{ transform: `rotate(${i * 45}deg) translateY(-50%)` }}
        />
      ))}
    </div>
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-yellow-400 rounded-full w-1 h-1 animate-[float_5s_ease-in-out_infinite]"
        style={{
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
          animationDelay: Math.random() * 2 + "s",
          boxShadow: "0 0 10px #eab308",
        }}
      />
    ))}
  </div>
));
SupremeEffects.displayName = "SupremeEffects";

// 3. Thanh Chỉ Số - FIX LAG: Dùng ScaleX thay vì Width
const PowerBar = memo(
  ({
    label,
    value,
    color,
    delay,
    isActive,
  }: {
    label: string;
    value: number;
    color: string;
    delay: number;
    isActive: boolean;
  }) => {
    return (
      <div className="w-full mb-3">
        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 text-gray-400 font-mono">
          <span>{label}</span>
          <span
            style={{
              color,
              opacity: isActive ? 1 : 0.5,
              transition: "opacity 0.5s",
            }}
          >
            {value}%
          </span>
        </div>

        {/* Container */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
          {/* Dùng scaleX để GPU xử lý co giãn -> Không gây Reflow layout -> MƯỢT
           */}
          <div
            className="h-full w-full origin-left will-change-transform transition-transform duration-1000 ease-out relative"
            style={{
              backgroundColor: color,
              transform: isActive ? `scaleX(${value / 100})` : "scaleX(0)",
              transitionDelay: `${delay}ms`,
            }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
          </div>
        </div>
      </div>
    );
  }
);
PowerBar.displayName = "PowerBar";

// 4. Mưa Ma Trận - OPTIMIZATION: Tạo nội dung tĩnh bằng useMemo
const MatrixRain = memo(
  ({ active, color }: { active: boolean; color: string }) => {
    const rainDrops = useMemo(() => {
      return [...Array(8)].map((_, i) => ({
        key: i,
        duration: Math.random() * 2 + 1,
        delay: Math.random(),
        chars: CHARS.split("")
          .sort(() => 0.5 - Math.random())
          .slice(0, 15),
      }));
    }, []);

    if (!active) return null;

    return (
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none mask-gradient transform-gpu">
        <div className="flex justify-around">
          {rainDrops.map((drop) => (
            <div
              key={drop.key}
              className="flex flex-col text-[10px] font-mono animate-matrix-fall will-change-transform"
              style={{
                color: color,
                animationDuration: `${drop.duration}s`,
                animationDelay: `${drop.delay}s`,
              }}
            >
              {drop.chars.map((char, j) => (
                <span key={j}>{char}</span>
              ))}
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes matrix-fall {
            0% {
              transform: translateY(-100%);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(100%);
              opacity: 0;
            }
          }
          .animate-matrix-fall {
            animation: matrix-fall linear infinite;
          }
          .mask-gradient {
            mask-image: linear-gradient(
              to bottom,
              transparent,
              black 20%,
              black 80%,
              transparent
            );
          }
        `}</style>
      </div>
    );
  }
);
MatrixRain.displayName = "MatrixRain";

// =============================================================================
// PHẦN 4: MAIN COMPONENT (SOUL PLATE)
// =============================================================================

export default memo(
  function SoulPlate({
    role,
    isActive,
    onHover,
  }: {
    role: IRole;
    isActive: boolean;
    onHover: (id: string) => void;
  }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const stats = useMemo(
      () => ({
        power: 40 + role.level * 15,
        intellect: 50 + role.level * 10,
        speed: 30 + role.level * 20,
      }),
      [role.level]
    );

    const isSupreme = role.level === 4;

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !cardRef.current) return;

        requestAnimationFrame(() => {
          if (!containerRef.current || !cardRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Giảm độ nghiêng xuống một chút để đỡ chóng mặt và render nhẹ hơn
          const rotateY = ((x - rect.width / 2) / rect.width) * 15;
          const rotateX = ((y - rect.height / 2) / rect.height) * -15;

          cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${
            isActive ? 1.02 : 1
          })`;
        });
      },
      [isActive]
    );

    const handleMouseLeave = useCallback(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
      }
    }, []);

    const handleMouseEnter = useCallback(() => {
      onHover(role.id);
    }, [onHover, role.id]);

    return (
      <div
        ref={containerRef}
        className={`relative perspective-1200 z-10 ${
          isSupreme ? "md:col-span-2 lg:col-span-1 lg:row-span-1" : ""
        }`}
        style={{ zIndex: isActive ? 50 : 10 }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className={`
          relative w-full h-[550px] transition-transform duration-100 ease-linear transform-style-3d
          flex flex-col items-center justify-between p-1 group cursor-pointer will-change-transform
          ${isActive ? "" : "opacity-60 hover:opacity-100"}
        `}
        >
          <div className="relative w-full h-full bg-[#050505] overflow-hidden clip-corner-oct transform-gpu">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-[#0a0a0a]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay" />
              <MatrixRain active={isActive} color={role.color} />
              <div
                className="absolute inset-0 transition-opacity duration-700 will-change-[opacity]"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${role.color}20, transparent 70%)`,
                  opacity: isActive ? 1 : 0,
                }}
              />
            </div>

            {/* Border - ĐÃ FIX LỖI KHỰNG */}
            <div className="absolute inset-0 transform translate-z-20 pointer-events-none">
              <DragonBorderFixed color={role.color} active={isActive} />
            </div>

            {/* Effects */}
            {isSupreme && <SupremeEffects />}

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-between p-6 transform translate-z-40">
              <div className="mt-4">
                <div
                  className={`px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase border relative overflow-hidden ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-500 border-white/10"
                  }`}
                  style={{ borderColor: isActive ? role.color : "" }}
                >
                  <span className="relative z-10">
                    Cảnh Giới • 0{role.level}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center text-center w-full">
                <div className="relative mb-8 group-hover:-translate-y-4 transition-transform duration-500 will-change-transform">
                  <div className="absolute inset-0 animate-spin-slow opacity-20">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-32 h-32"
                      fill="none"
                      stroke={role.color}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    >
                      <polygon points="50 1, 95 25, 95 75, 50 99, 5 75, 5 25" />
                    </svg>
                  </div>
                  <div
                    className="w-24 h-24 flex items-center justify-center relative z-10"
                    style={{
                      color: role.color,
                      filter: isActive
                        ? `drop-shadow(0 0 15px ${role.color})`
                        : "",
                    }}
                  >
                    <svg
                      className="w-12 h-12"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={role.iconPath} />
                    </svg>
                  </div>
                </div>

                <ScrambledTitle
                  text={role.name}
                  active={isActive}
                  color={role.color}
                  isSupreme={isSupreme}
                />

                <div className="flex items-center gap-2 mb-4 w-full justify-center opacity-50">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-white/50" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
                </div>

                <p
                  className={`text-xs text-gray-400 font-mono text-center px-4 leading-relaxed transition-opacity duration-500 ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                >
                  {role.description}
                </p>
              </div>

              <div
                className={`w-full transition-all duration-700 delay-100 ${
                  isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {isActive ? (
                  <div className="mb-6 space-y-2 bg-black/40 p-4 rounded border border-white/5 backdrop-blur-sm">
                    <PowerBar
                      label="Linh Lực"
                      value={stats.power}
                      color={role.color}
                      delay={0}
                      isActive={isActive}
                    />
                    <PowerBar
                      label="Ngộ Tính"
                      value={stats.intellect}
                      color={role.color}
                      delay={100}
                      isActive={isActive}
                    />
                    <PowerBar
                      label="Thân Pháp"
                      value={stats.speed}
                      color={role.color}
                      delay={200}
                      isActive={isActive}
                    />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-gray-600 animate-pulse">
                      Đang chờ kết nối...
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest border-t border-white/10 pt-3">
                  <span>Quyền hạn: {role.privileges.length}</span>
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-green-500 animate-ping" : "bg-gray-600"
                      }`}
                    />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .clip-corner-oct {
            clip-path: polygon(
              10% 0,
              90% 0,
              100% 5%,
              100% 95%,
              90% 100%,
              10% 100%,
              0 95%,
              0 5%
            );
          }
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
          .perspective-1200 {
            perspective: 1200px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
        `}</style>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.role.id === nextProps.role.id
    );
  }
);
