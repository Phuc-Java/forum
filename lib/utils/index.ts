// ============ UTILITY FUNCTIONS ============
// Các hàm tiện ích dùng chung
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Format date to Vietnamese locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 giờ trước")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateString);
}

/**
 * Get avatar source path
 */
export function getAvatarSrc(avatarUrl?: string | null): string {
  if (avatarUrl) {
    return `/avatars/${avatarUrl}`;
  }
  return "/avatars/default.jpg";
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Parse social links JSON safely
 */
export function parseSocialLinks(json: string | null | undefined): {
  github?: string;
  discord?: string;
  twitter?: string;
  facebook?: string;
} {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * Generate unique ID for client-side use
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
