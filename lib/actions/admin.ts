"use server";

import { Client, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import type { RoleType } from "../roles";

// Server-side client
function getServerClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  return client;
}

export interface UserWithProfile {
  $id: string;
  $createdAt: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: string | null;
  customTags: string | null;
  permissions: string | null;
}

/**
 * Get all profiles for admin panel
 */
export async function getAllProfiles(): Promise<UserWithProfile[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    return response.documents as unknown as UserWithProfile[];
  } catch (error) {
    console.error("getAllProfiles error:", error);
    return [];
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  profileId: string,
  newRole: RoleType,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Verify admin has permission
    const adminProfile = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", adminUserId), Query.limit(1)]
    );

    if (adminProfile.documents.length === 0) {
      return { success: false, error: "Admin profile not found" };
    }

    const adminRole = adminProfile.documents[0].role as string;
    // Only chi_ton can change roles
    if (adminRole !== "chi_ton") {
      return { success: false, error: "Không đủ quyền thay đổi cấp bậc" };
    }

    // Update the profile
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      profileId,
      { role: newRole }
    );

    return { success: true };
  } catch (error) {
    console.error("updateUserRole error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật role";
    return { success: false, error: message };
  }
}

/**
 * Update user custom tags (admin only)
 */
export async function updateUserTags(
  profileId: string,
  tags: string[],
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Verify admin has permission
    const adminProfile = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", adminUserId), Query.limit(1)]
    );

    if (adminProfile.documents.length === 0) {
      return { success: false, error: "Admin profile not found" };
    }

    const adminRole = adminProfile.documents[0].role as string;
    // thanh_nhan and chi_ton can assign tags
    if (adminRole !== "chi_ton" && adminRole !== "thanh_nhan") {
      return { success: false, error: "Không đủ quyền gán tag" };
    }

    // Save tags as comma-separated string for easy reading in database
    // Format: "Tag1, Tag2, Tag3" hoặc "Ám Dạ Đế" nếu chỉ 1 tag
    const tagsString = tags.length > 0 ? tags.join(", ") : "";

    // Update the profile
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      profileId,
      { customTags: tagsString }
    );

    return { success: true };
  } catch (error) {
    console.error("updateUserTags error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật tags";
    return { success: false, error: message };
  }
}

/**
 * Search profiles by name
 */
export async function searchProfiles(
  query: string
): Promise<UserWithProfile[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.search("displayName", query), Query.limit(50)]
    );

    return response.documents as unknown as UserWithProfile[];
  } catch (error) {
    console.error("searchProfiles error:", error);
    return [];
  }
}

// ==================== POST MANAGEMENT ====================

export interface PostWithDetails {
  $id: string;
  $createdAt: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: string[];
  commentsCount: number;
}

/**
 * Get all posts for admin panel
 */
export async function getAllPosts(): Promise<PostWithDetails[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    return response.documents as unknown as PostWithDetails[];
  } catch (error) {
    console.error("getAllPosts error:", error);
    return [];
  }
}

/**
 * Admin delete post - deletes post and all related data (comments, notifications)
 */
export async function adminDeletePost(
  postId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Verify admin has permission
    const adminProfile = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", adminUserId), Query.limit(1)]
    );

    if (adminProfile.documents.length === 0) {
      return { success: false, error: "Admin profile not found" };
    }

    const adminRole = adminProfile.documents[0].role as string;
    // Only thanh_nhan and chi_ton can delete posts
    if (adminRole !== "chi_ton" && adminRole !== "thanh_nhan") {
      return { success: false, error: "Không đủ quyền xóa bài viết" };
    }

    // 1. Delete all comments of this post
    const comments = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      [Query.equal("postId", postId), Query.limit(1000)]
    );

    for (const comment of comments.documents) {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.comments,
        comment.$id
      );
    }

    // 2. Delete all notifications related to this post
    try {
      const notifications = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        [Query.equal("postId", postId), Query.limit(1000)]
      );

      for (const notification of notifications.documents) {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.notifications,
          notification.$id
        );
      }
    } catch (notifError) {
      console.error("Failed to delete notifications:", notifError);
      // Don't fail the whole operation
    }

    // 3. Delete the post
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      postId
    );

    console.log(
      `Admin ${adminUserId} deleted post ${postId} with ${comments.documents.length} comments`
    );

    return { success: true };
  } catch (error) {
    console.error("adminDeletePost error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể xóa bài viết";
    return { success: false, error: message };
  }
}
