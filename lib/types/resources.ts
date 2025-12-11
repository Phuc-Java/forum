// ============ RESOURCE TYPES ============
// Types cho hệ thống Tài nguyên

// Categories cho sidebar
export const RESOURCE_CATEGORIES = {
  tricks: {
    id: "tricks",
    name: "Thủ Thuật",
    icon: "💡",
    description: "Mẹo hay và thủ thuật hữu ích",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
  },
  opensource: {
    id: "opensource",
    name: "Mã Nguồn Mở",
    icon: "🔓",
    description: "Source code và dự án mở",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
  },
  learning: {
    id: "learning",
    name: "Tài Liệu Học Tập",
    icon: "📚",
    description: "Tài liệu, khóa học và hướng dẫn",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
  },
  confessions: {
    id: "confessions",
    name: "Tâm Sự",
    icon: "💭",
    description: "Chia sẻ câu chuyện và tâm sự",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/50",
  },
  privileges: {
    id: "privileges",
    name: "Đặc Quyền",
    icon: "👑",
    description: "Nội dung độc quyền cho thành viên",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/50",
  },
} as const;

export type ResourceCategoryId = keyof typeof RESOURCE_CATEGORIES;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[ResourceCategoryId];

// Resource (Bài viết chính)
export interface Resource {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  content: string;
  category: ResourceCategoryId;
  authorId: string;
  authorName: string;
  tags: string | null;
  requiredRole: string | null;
  allowedRoles: string | null; // JSON array of role IDs
  rating: number | null;
  ratingCount: number | null;
  ratingSum: number | null;
}

// Resource Meta (Metadata bổ sung)
export interface ResourceMeta {
  $id: string;
  $createdAt: string;
  resourceId: string;
  thumbnail: string | null;
  attachments: string | null; // JSON array
  isPinned: boolean | null;
  isPublished: boolean | null;
  viewCount: number | null;
}

// Resource Like
export interface ResourceLike {
  $id: string;
  $createdAt: string;
  resourceId: string;
  userId: string;
  userName: string | null;
}

// Resource Comment
export interface ResourceComment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: string | null; // JSON array of userIds
}

// Combined Resource with all data (for display)
export interface ResourceWithMeta extends Resource {
  meta?: ResourceMeta | null;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

// Attachment type
export interface ResourceAttachment {
  id: string;
  name: string;
  type: "image" | "file" | "link";
  url: string;
  size?: number;
}

// Create Resource input
export interface CreateResourceInput {
  title: string;
  content: string;
  category: ResourceCategoryId;
  tags?: string;
  requiredRole?: string;
  allowedRoles?: string; // JSON array of role IDs
  thumbnail?: string;
  attachments?: ResourceAttachment[];
  isPublished?: boolean;
}

// Helper functions
export function getCategoryInfo(categoryId: string): ResourceCategory {
  return (
    RESOURCE_CATEGORIES[categoryId as ResourceCategoryId] ||
    RESOURCE_CATEGORIES.tricks
  );
}

export function parseTags(tagsString: string | null | undefined): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseAttachments(
  attachmentsJson: string | null | undefined
): ResourceAttachment[] {
  if (!attachmentsJson) return [];
  try {
    return JSON.parse(attachmentsJson);
  } catch {
    return [];
  }
}

export function formatRating(
  ratingSum: number | null,
  ratingCount: number | null
): number {
  if (!ratingSum || !ratingCount || ratingCount === 0) return 0;
  return Math.round((ratingSum / ratingCount) * 10) / 10;
}
