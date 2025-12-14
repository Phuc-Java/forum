// lib/shop-theme.ts
import { RoleType } from "./roles";

export interface TierTheme {
  name: string;
  primary: string; // Màu chính (Text, Icon)
  gradient: string; // Gradient cho nút, background
  border: string; // Màu viền
  shadow: string; // Màu đổ bóng
  bgHover: string; // Màu nền khi hover
  pinColor: string; // Màu cho cái 3D Pin
}

export const TIER_THEMES: Record<RoleType | string, TierTheme> = {
  no_le: {
    name: "Nô Lệ",
    primary: "text-gray-400",
    gradient: "from-gray-600 to-gray-800",
    border: "border-gray-600",
    shadow: "shadow-gray-500/20",
    bgHover: "hover:bg-gray-800",
    pinColor: "#9ca3af",
  },
  pham_nhan: {
    name: "Phàm Nhân",
    primary: "text-emerald-400",
    gradient: "from-emerald-500 to-teal-600",
    border: "border-emerald-500/30",
    shadow: "shadow-emerald-500/30",
    bgHover: "hover:bg-emerald-900/20",
    pinColor: "#10b981", // Emerald
  },
  chi_cuong_gia: {
    name: "Chí Cường Giả",
    primary: "text-cyan-400",
    gradient: "from-cyan-500 to-blue-600",
    border: "border-cyan-500/40",
    shadow: "shadow-cyan-500/40",
    bgHover: "hover:bg-cyan-900/20",
    pinColor: "#06b6d4", // Cyan
  },
  thanh_nhan: {
    name: "Thành Nhân",
    primary: "text-fuchsia-400",
    gradient: "from-fuchsia-500 to-purple-600",
    border: "border-fuchsia-500/50",
    shadow: "shadow-fuchsia-500/50",
    bgHover: "hover:bg-fuchsia-900/20",
    pinColor: "#d946ef", // Fuchsia
  },
  chi_ton: {
    name: "Chí Tôn",
    primary: "text-amber-400", // Vàng kim
    gradient: "from-amber-400 via-orange-500 to-red-600", // Gradient lửa
    border: "border-amber-500/60",
    shadow: "shadow-amber-500/60",
    bgHover: "hover:bg-amber-900/20",
    pinColor: "#f59e0b", // Amber
  },
};

// Hàm lấy theme an toàn
export const getTheme = (role: string = "pham_nhan") => {
  return TIER_THEMES[role] || TIER_THEMES["pham_nhan"];
};
