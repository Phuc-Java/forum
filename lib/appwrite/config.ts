// Appwrite Configuration - Shared constants
export const APPWRITE_CONFIG = {
  endpoint: "https://sgp.cloud.appwrite.io/v1",
  projectId: "6938fff4002177d39dc0",
  databaseId: "6939050d003171236d62",
  collections: {
    posts: "posts",
    comments: "comments",
    profiles: "profiles",
    notifications: "notifications",
  },
} as const;

// Default avatars available in public/avatars/
export const DEFAULT_AVATARS = [
  "default.jpg",
  "avatar-cute-2.jpg",
  "avatar_nam_anime_cute_0_1b1ab1e844.webp",
  "hinh-anh-cute-anime-020.jpg",
  "Hinh-anh-anime-dang-yeu-khong-the-cuong-duoc-2.jpg",
] as const;

export type DefaultAvatar = (typeof DEFAULT_AVATARS)[number];
