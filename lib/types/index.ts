// ============ SHARED TYPES ============
// Tập trung tất cả types để tránh duplicate

// ============ USER TYPES ============
export interface User {
  $id: string;
  name: string;
  email: string;
}

// ============ PROFILE TYPES ============
export interface Profile {
  $id: string;
  $createdAt: string;
  $updatedAt?: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  avatarType?: "default" | "custom";
  avatarUrl?: string | null;
  location?: string | null;
  website?: string | null;
  socialLinks?: string | null;
  skills?: string | null;
  // Role system fields
  role?: string | null;
  customTags?: string | null;
  permissions?: string | null;
}

export interface SocialLinks {
  github?: string;
  discord?: string;
  twitter?: string;
  facebook?: string;
}

// ============ POST TYPES ============
export interface Post {
  $id: string;
  $createdAt: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  likes?: string[];
  commentsCount?: number;
}

// ============ COMMENT TYPES ============
export interface Comment {
  $id: string;
  $createdAt: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}

// ============ USER STATS ============
export interface UserStats {
  postsCount: number;
  commentsCount: number;
}

// ============ NOTIFICATION TYPES ============
export type NotificationType = "comment" | "new_post" | "like" | "new_resource";

export interface Notification {
  $id: string;
  $createdAt: string;
  userId: string;
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  postId: string;
  postTitle: string;
  commentContent?: string | null;
  isRead: boolean;
}
