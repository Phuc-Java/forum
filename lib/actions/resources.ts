"use server";

import { Client, Databases, Query, ID } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import type {
  Resource,
  ResourceMeta,
  ResourceLike,
  ResourceComment,
  ResourceWithMeta,
  ResourceCategoryId,
  CreateResourceInput,
} from "../types/resources";

// Server-side client with API key for write operations
function getServerClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  // Set API key for server-side operations (create, update, delete)
  const apiKey = process.env.APPWRITE_API_KEY;
  if (apiKey) {
    client.setKey(apiKey);
  }

  return client;
}

// ============ GET RESOURCES ============

/**
 * Get all resources by category
 */
export async function getResourcesByCategory(
  category: ResourceCategoryId,
  limit: number = 50
): Promise<ResourceWithMeta[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Get resources
    const resourcesRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      [
        Query.equal("category", category),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );

    const resources = resourcesRes.documents as unknown as Resource[];
    if (resources.length === 0) return [];

    // Get meta for all resources
    const resourceIds = resources.map((r) => r.$id);
    const [metaRes, likesRes, commentsRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceMeta,
        [Query.equal("resourceId", resourceIds), Query.limit(100)]
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceLikes,
        [Query.equal("resourceId", resourceIds), Query.limit(1000)]
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceComments,
        [Query.equal("resourceId", resourceIds), Query.limit(1000)]
      ),
    ]);

    const metaMap = new Map<string, ResourceMeta>();
    (metaRes.documents as unknown as ResourceMeta[]).forEach((m) => {
      metaMap.set(m.resourceId, m);
    });

    // Count likes per resource
    const likesCountMap = new Map<string, number>();
    (likesRes.documents as unknown as ResourceLike[]).forEach((l) => {
      likesCountMap.set(
        l.resourceId,
        (likesCountMap.get(l.resourceId) || 0) + 1
      );
    });

    // Count comments per resource
    const commentsCountMap = new Map<string, number>();
    (commentsRes.documents as unknown as ResourceComment[]).forEach((c) => {
      commentsCountMap.set(
        c.resourceId,
        (commentsCountMap.get(c.resourceId) || 0) + 1
      );
    });

    // Combine data
    const result = resources
      .map((resource) => ({
        ...resource,
        meta: metaMap.get(resource.$id) || null,
        likesCount: likesCountMap.get(resource.$id) || 0,
        commentsCount: commentsCountMap.get(resource.$id) || 0,
      }))
      .filter((r) => r.meta?.isPublished !== false); // Filter unpublished

    return result;
  } catch (error) {
    console.error("getResourcesByCategory error:", error);
    return [];
  }
}

/**
 * Get single resource by ID with full details
 */
export async function getResourceById(
  resourceId: string,
  userId?: string
): Promise<ResourceWithMeta | null> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Get resource
    const resource = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      resourceId
    )) as unknown as Resource;

    // Get meta, likes count, comments count
    const [metaRes, likesRes, commentsRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceMeta,
        [Query.equal("resourceId", resourceId), Query.limit(1)]
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceLikes,
        [Query.equal("resourceId", resourceId), Query.limit(1000)]
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceComments,
        [Query.equal("resourceId", resourceId), Query.limit(1000)]
      ),
    ]);

    const meta = (metaRes.documents[0] as unknown as ResourceMeta) || null;
    const likes = likesRes.documents as unknown as ResourceLike[];

    // Check if current user liked
    const isLiked = userId ? likes.some((l) => l.userId === userId) : false;

    // Increment view count
    if (meta) {
      databases
        .updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.resourceMeta,
          meta.$id,
          { viewCount: (meta.viewCount || 0) + 1 }
        )
        .catch(() => {}); // Fire and forget
    }

    return {
      ...resource,
      meta,
      likesCount: likes.length,
      commentsCount: commentsRes.documents.length,
      isLiked,
    };
  } catch (error) {
    console.error("getResourceById error:", error);
    return null;
  }
}

/**
 * Get comments for a resource
 */
export async function getResourceComments(
  resourceId: string
): Promise<ResourceComment[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceComments,
      [
        Query.equal("resourceId", resourceId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]
    );

    return response.documents as unknown as ResourceComment[];
  } catch (error) {
    console.error("getResourceComments error:", error);
    return [];
  }
}

import { createNewResourceNotifications } from "./notifications";

// ============ CREATE / UPDATE RESOURCES ============

/**
 * Create a new resource (thanh_nhan or chi_ton only)
 */
export async function createResource(
  input: CreateResourceInput,
  authorId: string,
  authorName: string
): Promise<{ success: boolean; resourceId?: string; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Create resource document
    const resource = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      ID.unique(),
      {
        title: input.title,
        content: input.content,
        category: input.category,
        authorId,
        authorName,
        tags: input.tags || null,
        requiredRole: input.requiredRole || null,
        allowedRoles: input.allowedRoles || null, // JSON array of role IDs
        rating: 0,
        ratingCount: 0,
        ratingSum: 0,
      }
    );

    // Create meta document
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceMeta,
      ID.unique(),
      {
        resourceId: resource.$id,
        thumbnail: input.thumbnail || null,
        attachments: input.attachments
          ? JSON.stringify(input.attachments)
          : null,
        isPinned: false,
        isPublished: input.isPublished ?? true,
        viewCount: 0,
      }
    );

    // Send notifications to users who can view this resource
    // Run in background, don't block the response
    createNewResourceNotifications({
      resourceId: resource.$id,
      resourceTitle: input.title,
      authorId,
      authorName,
      allowedRoles: input.allowedRoles || null,
      category: input.category,
    }).catch((err) =>
      console.error("Failed to send resource notifications:", err)
    );

    return { success: true, resourceId: resource.$id };
  } catch (error) {
    console.error("createResource error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tạo bài viết";
    return { success: false, error: message };
  }
}

// ============ LIKES ============

/**
 * Toggle like on a resource
 */
export async function toggleResourceLike(
  resourceId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; liked?: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Check if already liked
    const existingLike = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceLikes,
      [
        Query.equal("resourceId", resourceId),
        Query.equal("userId", userId),
        Query.limit(1),
      ]
    );

    if (existingLike.documents.length > 0) {
      // Unlike - delete the like
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceLikes,
        existingLike.documents[0].$id
      );
      return { success: true, liked: false };
    } else {
      // Like - create new
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceLikes,
        ID.unique(),
        {
          resourceId,
          userId,
          userName,
        }
      );
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("toggleResourceLike error:", error);
    return { success: false, error: "Không thể thực hiện" };
  }
}

// ============ COMMENTS ============

/**
 * Create a comment on a resource
 */
export async function createResourceComment(
  resourceId: string,
  authorId: string,
  authorName: string,
  content: string
): Promise<{ success: boolean; comment?: ResourceComment; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const comment = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceComments,
      ID.unique(),
      {
        resourceId,
        authorId,
        authorName,
        content,
        likes: null,
      }
    );

    return { success: true, comment: comment as unknown as ResourceComment };
  } catch (error) {
    console.error("createResourceComment error:", error);
    return { success: false, error: "Không thể tạo bình luận" };
  }
}

/**
 * Delete a comment (author or admin)
 */
export async function deleteResourceComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceComments,
      commentId
    );

    return { success: true };
  } catch (error) {
    console.error("deleteResourceComment error:", error);
    return { success: false, error: "Không thể xóa bình luận" };
  }
}

// ============ RATING ============

/**
 * Rate a resource (1-5 stars)
 */
export async function rateResource(
  resourceId: string,
  rating: number
): Promise<{ success: boolean; newRating?: number; error?: string }> {
  try {
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating phải từ 1-5" };
    }

    const client = getServerClient();
    const databases = new Databases(client);

    // Get current resource
    const resource = (await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      resourceId
    )) as unknown as Resource;

    const newRatingCount = (resource.ratingCount || 0) + 1;
    const newRatingSum = (resource.ratingSum || 0) + rating;
    const newRating = Math.round((newRatingSum / newRatingCount) * 10) / 10;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      resourceId,
      {
        rating: newRating,
        ratingCount: newRatingCount,
        ratingSum: newRatingSum,
      }
    );

    return { success: true, newRating };
  } catch (error) {
    console.error("rateResource error:", error);
    return { success: false, error: "Không thể đánh giá" };
  }
}

// ============ ADMIN ============

/**
 * Delete a resource (chi_ton only)
 */
export async function deleteResource(
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Delete all related data
    const [metaRes, likesRes, commentsRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceMeta,
        [Query.equal("resourceId", resourceId)]
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceLikes,
        [Query.equal("resourceId", resourceId), Query.limit(1000)]
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.resourceComments,
        [Query.equal("resourceId", resourceId), Query.limit(1000)]
      ),
    ]);

    // Delete all in parallel
    const deletePromises: Promise<unknown>[] = [];

    // Delete meta
    metaRes.documents.forEach((doc) => {
      deletePromises.push(
        databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.resourceMeta,
          doc.$id
        )
      );
    });

    // Delete likes
    likesRes.documents.forEach((doc) => {
      deletePromises.push(
        databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.resourceLikes,
          doc.$id
        )
      );
    });

    // Delete comments
    commentsRes.documents.forEach((doc) => {
      deletePromises.push(
        databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.resourceComments,
          doc.$id
        )
      );
    });

    await Promise.all(deletePromises);

    // Delete the resource itself
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      resourceId
    );

    return { success: true };
  } catch (error) {
    console.error("deleteResource error:", error);
    return { success: false, error: "Không thể xóa bài viết" };
  }
}

/**
 * Toggle pin status (admin only)
 */
export async function toggleResourcePin(
  resourceId: string
): Promise<{ success: boolean; isPinned?: boolean; error?: string }> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Get meta
    const metaRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceMeta,
      [Query.equal("resourceId", resourceId), Query.limit(1)]
    );

    if (metaRes.documents.length === 0) {
      return { success: false, error: "Không tìm thấy metadata" };
    }

    const meta = metaRes.documents[0] as unknown as ResourceMeta;
    const newPinned = !meta.isPinned;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceMeta,
      meta.$id,
      { isPinned: newPinned }
    );

    return { success: true, isPinned: newPinned };
  } catch (error) {
    console.error("toggleResourcePin error:", error);
    return { success: false, error: "Không thể ghim bài viết" };
  }
}

/**
 * Get all resources for admin panel
 */
export async function getAllResourcesForAdmin(): Promise<ResourceWithMeta[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const resourcesRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resources,
      [Query.orderDesc("$createdAt"), Query.limit(200)]
    );

    const resources = resourcesRes.documents as unknown as Resource[];
    if (resources.length === 0) return [];

    // Get meta for all
    const resourceIds = resources.map((r) => r.$id);
    const metaRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.resourceMeta,
      [Query.equal("resourceId", resourceIds), Query.limit(200)]
    );

    const metaMap = new Map<string, ResourceMeta>();
    (metaRes.documents as unknown as ResourceMeta[]).forEach((m) => {
      metaMap.set(m.resourceId, m);
    });

    return resources.map((resource) => ({
      ...resource,
      meta: metaMap.get(resource.$id) || null,
      likesCount: 0,
      commentsCount: 0,
    }));
  } catch (error) {
    console.error("getAllResourcesForAdmin error:", error);
    return [];
  }
}
