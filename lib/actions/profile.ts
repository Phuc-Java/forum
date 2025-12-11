"use server";

import { Client, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";

// Server-side client
function getServerClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  return client;
}

// ============ PROFILE TYPES ============

export interface Profile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarType: "default" | "custom";
  avatarUrl: string | null;
  location: string | null;
  website: string | null;
  socialLinks: string | null; // JSON string
  skills: string | null;
  // Role system fields
  role: string | null;
  customTags: string | null;
  permissions: string | null;
}

export interface SocialLinks {
  github?: string;
  discord?: string;
  twitter?: string;
  facebook?: string;
}

// ============ PROFILE FUNCTIONS ============

/**
 * Get profile by userId
 */
export async function getProfileByUserId(
  userId: string
): Promise<Profile | null> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return null;
    }

    return response.documents[0] as unknown as Profile;
  } catch (error) {
    console.error("getProfileByUserId error:", error);
    return null;
  }
}

/**
 * Get profile by document ID
 */
export async function getProfileById(
  profileId: string
): Promise<Profile | null> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const profile = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      profileId
    );

    return profile as unknown as Profile;
  } catch (error) {
    console.error("getProfileById error:", error);
    return null;
  }
}

/**
 * Create new profile for user
 */
export async function createProfile(
  userId: string,
  displayName: string
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Check if profile already exists
    const existing = await getProfileByUserId(userId);
    if (existing) {
      return { success: true, profile: existing };
    }

    const profile = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      "unique()",
      {
        userId,
        displayName,
        bio: null,
        avatarType: "default",
        avatarUrl: "default.jpg",
        location: null,
        website: null,
        socialLinks: null,
        skills: null,
        role: "pham_nhan", // Default role: Phàm Nhân
        customTags: null,
        permissions: null,
      }
    );

    return { success: true, profile: profile as unknown as Profile };
  } catch (error) {
    console.error("createProfile error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tạo profile";
    return { success: false, error: message };
  }
}

/**
 * Update profile
 */
export async function updateProfile(
  profileId: string,
  userId: string,
  data: {
    displayName?: string;
    bio?: string | null;
    avatarType?: "default" | "custom";
    avatarUrl?: string | null;
    location?: string | null;
    website?: string | null;
    socialLinks?: string | null;
    skills?: string | null;
  }
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Verify ownership
    const existing = await getProfileById(profileId);
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Không có quyền chỉnh sửa profile này" };
    }

    const profile = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      profileId,
      data
    );

    return { success: true, profile: profile as unknown as Profile };
  } catch (error) {
    console.error("updateProfile error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật profile";
    return { success: false, error: message };
  }
}

/**
 * Get user stats (posts count, comments count)
 */
export async function getUserStats(
  userId: string
): Promise<{ postsCount: number; commentsCount: number }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Count posts
    const postsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      [Query.equal("authorId", userId), Query.limit(1000)]
    );

    // Count comments
    const commentsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      [Query.equal("authorId", userId), Query.limit(1000)]
    );

    return {
      postsCount: postsResponse.total,
      commentsCount: commentsResponse.total,
    };
  } catch (error) {
    console.error("getUserStats error:", error);
    return { postsCount: 0, commentsCount: 0 };
  }
}

/**
 * Get user's recent posts
 */
export async function getUserPosts(userId: string, limit: number = 5) {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );

    return response.documents;
  } catch (error) {
    console.error("getUserPosts error:", error);
    return [];
  }
}
