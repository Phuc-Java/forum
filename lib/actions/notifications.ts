"use server";

import { Client, Databases, ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import type { Notification, NotificationType } from "../types";

// Reusable client factory for server actions
function createServerClient() {
  return new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
}

/**
 * Create a notification (Server Action)
 * Called automatically when someone comments on a post or creates a new post
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  postId: string;
  postTitle: string;
  commentContent?: string;
}) {
  // Don't notify yourself
  if (data.userId === data.fromUserId) {
    return { success: true, skipped: true };
  }

  try {
    const client = createServerClient();
    const databases = new Databases(client);

    const notification = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      ID.unique(),
      {
        userId: data.userId,
        type: data.type,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        postId: data.postId,
        postTitle: data.postTitle.substring(0, 200), // Limit title length
        commentContent: data.commentContent?.substring(0, 200) || null,
        isRead: false,
      }
    );

    return { success: true, notification };
  } catch (error) {
    console.error("createNotification error:", error);
    return { success: false, error: "Không thể tạo thông báo" };
  }
}

/**
 * Create notifications for all users when a new post is created
 * This notifies everyone except the author
 */
export async function createNewPostNotifications(data: {
  postId: string;
  postTitle: string;
  authorId: string;
  authorName: string;
}) {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    // Get all profiles except the author
    const profiles = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.notEqual("userId", data.authorId), Query.limit(100)]
    );

    // Create notifications in parallel (server-side, so it's efficient)
    const notificationPromises = profiles.documents.map((profile) =>
      databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        ID.unique(),
        {
          userId: profile.userId,
          type: "new_post",
          fromUserId: data.authorId,
          fromUserName: data.authorName,
          postId: data.postId,
          postTitle: data.postTitle.substring(0, 200),
          commentContent: null,
          isRead: false,
        }
      )
    );

    await Promise.allSettled(notificationPromises);

    return { success: true, count: profiles.documents.length };
  } catch (error) {
    console.error("createNewPostNotifications error:", error);
    return { success: false, error: "Không thể tạo thông báo" };
  }
}

/**
 * Get notifications for a user (Server Action)
 * Optimized with pagination and caching headers
 */
export async function getNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
) {
  const { limit = 20, offset = 0, unreadOnly = false } = options || {};

  try {
    const client = createServerClient();
    const databases = new Databases(client);

    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (unreadOnly) {
      queries.push(Query.equal("isRead", false));
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      queries
    );

    return {
      success: true,
      notifications: response.documents as unknown as Notification[],
      total: response.total,
    };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { success: false, notifications: [], total: 0 };
  }
}

/**
 * Get unread notification count (Server Action)
 * Lightweight query for badge display
 */
export async function getUnreadCount(userId: string) {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      [
        Query.equal("userId", userId),
        Query.equal("isRead", false),
        Query.limit(1), // We only need the count
      ]
    );

    return { success: true, count: response.total };
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Mark a notification as read (Server Action)
 */
export async function markAsRead(notificationId: string) {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      notificationId,
      { isRead: true }
    );

    return { success: true };
  } catch (error) {
    console.error("markAsRead error:", error);
    return { success: false };
  }
}

/**
 * Mark all notifications as read for a user (Server Action)
 */
export async function markAllAsRead(userId: string) {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    // Get all unread notifications
    const unreadNotifications = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      [
        Query.equal("userId", userId),
        Query.equal("isRead", false),
        Query.limit(100),
      ]
    );

    // Update all in parallel (server-side efficiency)
    const updatePromises = unreadNotifications.documents.map((notification) =>
      databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        notification.$id,
        { isRead: true }
      )
    );

    await Promise.allSettled(updatePromises);

    return { success: true, count: unreadNotifications.documents.length };
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return { success: false };
  }
}

/**
 * Delete a notification (Server Action)
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
) {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    // Verify ownership
    const notification = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      notificationId
    );

    if (notification.userId !== userId) {
      return { success: false, error: "Không có quyền xóa thông báo này" };
    }

    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      notificationId
    );

    return { success: true };
  } catch (error) {
    console.error("deleteNotification error:", error);
    return { success: false };
  }
}

/**
 * Delete all notifications for a user (Server Action)
 */
export async function deleteAllNotifications(userId: string) {
  try {
    const client = createServerClient();
    const databases = new Databases(client);

    const notifications = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.notifications,
      [Query.equal("userId", userId), Query.limit(100)]
    );

    const deletePromises = notifications.documents.map((notification) =>
      databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        notification.$id
      )
    );

    await Promise.allSettled(deletePromises);

    return { success: true, count: notifications.documents.length };
  } catch (error) {
    console.error("deleteAllNotifications error:", error);
    return { success: false };
  }
}
