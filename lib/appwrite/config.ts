// Appwrite Configuration - Shared constants
export const APPWRITE_CONFIG = {
  endpoint: "https://sgp.cloud.appwrite.io/v1",
  projectId: "6938fff4002177d39dc0",
  databaseId: "6939050d003171236d62",
  // Storage bucket for file uploads (images, attachments)
  storageBucketId: "693a642300377e4ba7d8", // Bucket "Kho"
  collections: {
    posts: "posts",
    comments: "comments",
    profiles: "profiles",
    notifications: "notifications",
    // Resource collections
    resources: "resources",
    resourceMeta: "resource_meta",
    resourceLikes: "resource_likes",
    resourceComments: "resource_comments",
  },
} as const;

// Avatar categories for better organization
export const AVATAR_CATEGORIES = {
  cute: {
    name: "Đáng yêu",
    icon: "🌸",
    avatars: [
      "default.jpg",
      "avatar-cute-2.jpg",
      "hinh-anh-cute-anime-020.jpg",
      "Hinh-anh-anime-dang-yeu-khong-the-cuong-duoc-2.jpg",
      "download (1).jfif",
      "download (2).jfif",
      "download (3).jfif",
    ],
  },
  cool: {
    name: "Ngầu lòi",
    icon: "🔥",
    avatars: [
      "avatar_nam_anime_cute_0_1b1ab1e844.webp",
      "download (4).jfif",
      "download (5).jfif",
      "download (6).jfif",
      "download (7).jfif",
    ],
  },
  aesthetic: {
    name: "Thẩm mỹ",
    icon: "✨",
    avatars: [
      "download (8).jfif",
      "download (9).jfif",
      "download (10).jfif",
      "download (11).jfif",
      "download (12).jfif",
    ],
  },
  others: {
    name: "Khác",
    icon: "🎭",
    avatars: [
      "download.jfif",
      "images.jfif",
      "images (1).jfif",
      "images (2).jfif",
      "Black White Dark Futuristic Coming Soon Website Coming Soon Page.png",
    ],
  },
} as const;

// All avatars flat list for backward compatibility
export const DEFAULT_AVATARS = [
  // Cute
  "default.jpg",
  "avatar-cute-2.jpg",
  "hinh-anh-cute-anime-020.jpg",
  "Hinh-anh-anime-dang-yeu-khong-the-cuong-duoc-2.jpg",
  "download (1).jfif",
  "download (2).jfif",
  "download (3).jfif",
  // Cool
  "avatar_nam_anime_cute_0_1b1ab1e844.webp",
  "download (4).jfif",
  "download (5).jfif",
  "download (6).jfif",
  "download (7).jfif",
  // Aesthetic
  "download (8).jfif",
  "download (9).jfif",
  "download (10).jfif",
  "download (11).jfif",
  "download (12).jfif",
  // Others
  "download.jfif",
  "images.jfif",
  "images (1).jfif",
  "images (2).jfif",
  "Black White Dark Futuristic Coming Soon Website Coming Soon Page.png",
] as const;

export type DefaultAvatar = (typeof DEFAULT_AVATARS)[number];
export type AvatarCategory = keyof typeof AVATAR_CATEGORIES;
