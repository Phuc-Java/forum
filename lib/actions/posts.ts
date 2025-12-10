"use server";

import { Client, Databases, ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";

/**
 * Create post (Server Action) - Requires auth
 */
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const authorId = formData.get("authorId") as string;
  const authorName = formData.get("authorName") as string;

  if (!title || !content) {
    return { error: "Vui lòng nhập tiêu đề và nội dung" };
  }

  if (!authorId || !authorName) {
    return { error: "Vui lòng đăng nhập để đăng bài" };
  }

  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Databases(client);

    const post = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      ID.unique(),
      {
        title: title.trim(),
        content: content.trim(),
        authorId,
        authorName,
        likes: [], // Empty array for likes
      }
    );

    return { success: true, post };
  } catch (error) {
    console.error("createPost error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tạo bài viết";
    return { error: message };
  }
}

/**
 * Toggle like on a post
 */
export async function toggleLike(postId: string, userId: string) {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Databases(client);

    // Get current post
    const post = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      postId
    );

    const currentLikes: string[] = post.likes || [];
    const hasLiked = currentLikes.includes(userId);

    // Toggle like
    const newLikes = hasLiked
      ? currentLikes.filter((id: string) => id !== userId)
      : [...currentLikes, userId];

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      postId,
      { likes: newLikes }
    );

    return { success: true, liked: !hasLiked, likesCount: newLikes.length };
  } catch (error) {
    console.error("toggleLike error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể thích bài viết";
    return { error: message };
  }
}

/**
 * Create comment on a post
 */
export async function createComment(
  postId: string,
  authorId: string,
  authorName: string,
  content: string
) {
  if (!content.trim()) {
    return { error: "Vui lòng nhập nội dung bình luận" };
  }

  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Databases(client);

    // Create the comment
    const comment = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      ID.unique(),
      {
        postId,
        authorId,
        authorName,
        content: content.trim(),
      }
    );

    // Update commentsCount on the post
    try {
      const post = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.posts,
        postId
      );
      const currentCount = (post.commentsCount as number) || 0;
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.posts,
        postId,
        { commentsCount: currentCount + 1 }
      );
    } catch (updateError) {
      console.error("Failed to update commentsCount:", updateError);
      // Don't fail the whole operation if count update fails
    }

    return { success: true, comment };
  } catch (error) {
    console.error("createComment error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tạo bình luận";
    return { error: message };
  }
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string) {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      [Query.equal("postId", postId), Query.orderDesc("$createdAt")]
    );

    return { success: true, comments: response.documents };
  } catch (error) {
    console.error("getComments error:", error);
    return { success: false, comments: [] };
  }
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string, authorId: string) {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Databases(client);

    // Verify ownership
    const comment = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      commentId
    );

    if (comment.authorId !== authorId) {
      return { error: "Bạn không có quyền xóa bình luận này" };
    }

    const postId = comment.postId as string;

    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      commentId
    );

    // Decrease commentsCount on the post
    try {
      const post = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.posts,
        postId
      );
      const currentCount = (post.commentsCount as number) || 0;
      if (currentCount > 0) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.posts,
          postId,
          { commentsCount: currentCount - 1 }
        );
      }
    } catch (updateError) {
      console.error("Failed to update commentsCount:", updateError);
      // Don't fail the whole operation if count update fails
    }

    return { success: true };
  } catch (error) {
    console.error("deleteComment error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể xóa bình luận";
    return { error: message };
  }
}

/**
 * Delete post (Server Action) - Requires auth
 */
export async function deletePost(postId: string, authorId: string) {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Databases(client);

    // Get post to verify ownership
    const post = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      postId
    );

    if (post.authorId !== authorId) {
      return { error: "Bạn không có quyền xóa bài viết này" };
    }

    // Delete all comments of this post first
    const comments = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      [Query.equal("postId", postId)]
    );

    for (const comment of comments.documents) {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.comments,
        comment.$id
      );
    }

    // Delete the post
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      postId
    );

    return { success: true };
  } catch (error) {
    console.error("deletePost error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể xóa bài viết";
    return { error: message };
  }
}
