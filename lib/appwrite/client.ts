"use client";

import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "./config";

// Singleton instances
let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

function getClient(): Client {
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
  }
  return client;
}

function getAccount(): Account {
  if (!account) {
    account = new Account(getClient());
  }
  return account;
}

function getDatabases(): Databases {
  if (!databases) {
    databases = new Databases(getClient());
  }
  return databases;
}

// ============ AUTH FUNCTIONS ============

/**
 * Login user (client-side)
 * Sets session cookie for server-side auth
 */
export async function login(email: string, password: string) {
  try {
    const acc = getAccount();

    // Check existing session first
    try {
      const existingUser = await acc.get();
      if (existingUser) {
        return { success: true, user: existingUser };
      }
    } catch {
      // No session, proceed with login
    }

    const session = await acc.createEmailPasswordSession(email, password);
    const user = await acc.get();

    // Set session cookie for server-side auth
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: session.secret }),
      });
    } catch (e) {
      console.warn("Failed to set session cookie:", e);
    }

    return { success: true, session, user };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Đăng nhập thất bại";
    return { error: message };
  }
}

/**
 * Register new user (client-side)
 * Sets session cookie for server-side auth
 */
export async function register(email: string, password: string, name: string) {
  try {
    const acc = getAccount();
    await acc.create("unique()", email, password, name);
    // Auto login after register
    const session = await acc.createEmailPasswordSession(email, password);
    const user = await acc.get();

    // Set session cookie for server-side auth
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: session.secret }),
      });
    } catch (e) {
      console.warn("Failed to set session cookie:", e);
    }

    return { success: true, session, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đăng ký thất bại";
    return { error: message };
  }
}

/**
 * Get current logged in user (client-side)
 */
export async function getCurrentUser() {
  try {
    const acc = getAccount();
    return await acc.get();
  } catch {
    return null;
  }
}

/**
 * Sync session cookie for server-side auth
 * Uses JWT to authenticate with server
 * Call this when user has client-side session but server doesn't recognize it
 */
export async function syncSessionCookie(): Promise<boolean> {
  try {
    const acc = getAccount();
    // First check if user is logged in client-side
    const user = await acc.get();
    if (!user) return false;

    // Create JWT for server auth
    const jwt = await acc.createJWT();

    // Send JWT to server to set session cookie
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jwt: jwt.jwt }),
    });

    return response.ok;
  } catch (e) {
    console.warn("Failed to sync session cookie:", e);
    return false;
  }
}

/**
 * Get user profile by userId (client-side)
 */
export async function getUserProfile(userId: string) {
  try {
    const db = getDatabases();
    const response = await db.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", userId), Query.limit(1)]
    );
    if (response.documents.length === 0) return null;
    return response.documents[0] as unknown as {
      $id: string;
      userId: string;
      displayName: string;
      role?: string;
      customTags?: string;
    };
  } catch (error) {
    console.error("getUserProfile error:", error);
    return null;
  }
}

/**
 * Logout user (client-side)
 * Also clears session cookie
 */
export async function logout() {
  try {
    const acc = getAccount();
    await acc.deleteSession("current");

    // Clear session cookie
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to clear session cookie:", e);
    }

    // Reset singletons
    client = null;
    account = null;
    databases = null;
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Đăng xuất thất bại";
    return { error: message };
  }
}

// ============ PROFILE TYPES ============

export interface ProfileData {
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
  socialLinks: string | null;
  skills: string | null;
  // Role system fields
  role: string | null;
  customTags: string | null;
  permissions: string | null;
}

// ============ PROFILE FUNCTIONS (Client-side) ============

/**
 * Get profile by userId (client-side)
 */
export async function getProfileByUserIdClient(
  userId: string
): Promise<ProfileData | null> {
  try {
    const db = getDatabases();
    const response = await db.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return null;
    }

    return response.documents[0] as unknown as ProfileData;
  } catch (error) {
    console.error("getProfileByUserIdClient error:", error);
    return null;
  }
}

/**
 * Create new profile (client-side)
 */
export async function createProfileClient(
  userId: string,
  displayName: string
): Promise<{ success: boolean; profile?: ProfileData; error?: string }> {
  try {
    const db = getDatabases();

    // Check if profile already exists
    const existing = await getProfileByUserIdClient(userId);
    if (existing) {
      return { success: true, profile: existing };
    }

    const profile = await db.createDocument(
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

    return { success: true, profile: profile as unknown as ProfileData };
  } catch (error) {
    console.error("createProfileClient error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tạo profile";
    return { success: false, error: message };
  }
}

/**
 * Update profile (client-side)
 */
export async function updateProfileClient(
  profileId: string,
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
): Promise<{ success: boolean; profile?: ProfileData; error?: string }> {
  try {
    const db = getDatabases();

    const profile = await db.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      profileId,
      data
    );

    return { success: true, profile: profile as unknown as ProfileData };
  } catch (error) {
    console.error("updateProfileClient error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật profile";
    return { success: false, error: message };
  }
}
