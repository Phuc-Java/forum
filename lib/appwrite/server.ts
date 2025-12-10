import { Client, Databases, Query, Account } from "node-appwrite";
import { cookies } from "next/headers";
import { APPWRITE_CONFIG } from "./config";

// ============ SINGLETON CLIENTS ============
// Tối ưu: Tái sử dụng client instances

let serverClient: Client | null = null;

// Server-side client (no auth) - Cached singleton
function getServerClient(): Client {
  if (!serverClient) {
    serverClient = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    // Nếu có API Key thì set ở đây (optional, để public read)
    // serverClient.setKey(process.env.APPWRITE_API_KEY!);
  }
  return serverClient;
}

// Server-side client with session from cookies
async function getServerClientWithSession() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  // Try to get session from cookies
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(
    `a_session_${APPWRITE_CONFIG.projectId}`
  );

  if (sessionCookie?.value) {
    client.setSession(sessionCookie.value);
  }

  return client;
}

// ============ AUTH FUNCTIONS (Server-side) ============

export interface ServerUser {
  $id: string;
  name: string;
  email: string;
}

/**
 * Get current user from session cookie (Server-side)
 * Tận dụng SSR để check auth
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const client = await getServerClientWithSession();
    const account = new Account(client);
    const user = await account.get();
    return {
      $id: user.$id,
      name: user.name,
      email: user.email,
    };
  } catch {
    return null;
  }
}

// ============ PROFILE FUNCTIONS (Server-side) ============

export interface ServerProfile {
  $id: string;
  $createdAt: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  avatarType?: "default" | "custom";
  location?: string;
  website?: string;
  skills?: string;
  socialLinks?: string;
}

/**
 * Get profile by userId (Server-side) - Tận dụng SSR
 */
export async function getServerProfile(
  userId: string
): Promise<ServerProfile | null> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (response.documents.length === 0) return null;
    return response.documents[0] as unknown as ServerProfile;
  } catch (error) {
    console.error("getServerProfile error:", error);
    return null;
  }
}

/**
 * Get multiple profiles by userIds (Server-side) - Batch fetch for SSR
 */
export async function getServerProfiles(
  userIds: string[]
): Promise<Map<string, ServerProfile>> {
  const profiles = new Map<string, ServerProfile>();
  if (userIds.length === 0) return profiles;

  try {
    const client = getServerClient();
    const databases = new Databases(client);

    // Unique userIds
    const uniqueIds = [...new Set(userIds)];

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", uniqueIds), Query.limit(100)]
    );

    for (const doc of response.documents) {
      const profile = doc as unknown as ServerProfile;
      profiles.set(profile.userId, profile);
    }

    return profiles;
  } catch (error) {
    console.error("getServerProfiles error:", error);
    return profiles;
  }
}

// ============ POSTS FUNCTIONS (Server-side) ============

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

/**
 * Get all posts (server-side) - Tận dụng SSR
 */
export async function getPosts(): Promise<Post[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      [Query.orderDesc("$createdAt"), Query.limit(50)]
    );

    return response.documents as unknown as Post[];
  } catch (error) {
    console.error("getPosts error:", error);
    return [];
  }
}

/**
 * Get single post by ID (server-side)
 */
export async function getPost(postId: string): Promise<Post | null> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const post = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.posts,
      postId
    );

    return post as unknown as Post;
  } catch (error) {
    console.error("getPost error:", error);
    return null;
  }
}
