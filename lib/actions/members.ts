"use server";

import { Client, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import { ROLE_LEVELS } from "../roles";

// Server-side client
function getServerClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  return client;
}

export interface MemberProfile {
  $id: string;
  $createdAt: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  avatarType: string | null;
  location: string | null;
  role: string | null;
  customTags: string | null;
  skills: string | null;
  lastSeen?: string | null; // For online status
}

/**
 * Get all members for public members page (Server-side)
 * Sorted by role level from highest to lowest
 */
export async function getAllMembers(): Promise<MemberProfile[]> {
  try {
    const client = getServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.limit(100)]
    );

    const members = response.documents as unknown as MemberProfile[];

    // Sort by role level (highest first), then by creation date
    members.sort((a, b) => {
      const levelA = ROLE_LEVELS[a.role as keyof typeof ROLE_LEVELS] || 1;
      const levelB = ROLE_LEVELS[b.role as keyof typeof ROLE_LEVELS] || 1;

      // Higher level first
      if (levelB !== levelA) {
        return levelB - levelA;
      }

      // Same level: newer first
      return (
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );
    });

    return members;
  } catch (error) {
    console.error("getAllMembers error:", error);
    return [];
  }
}

/**
 * Get member stats
 */
export async function getMemberStats(): Promise<{
  total: number;
  byRole: Record<string, number>;
}> {
  try {
    const members = await getAllMembers();

    const byRole: Record<string, number> = {
      no_le: 0,
      pham_nhan: 0,
      chi_cuong_gia: 0,
      thanh_nhan: 0,
      chi_ton: 0,
    };

    members.forEach((m) => {
      const role = m.role || "pham_nhan";
      if (byRole[role] !== undefined) {
        byRole[role]++;
      } else {
        byRole["pham_nhan"]++;
      }
    });

    return {
      total: members.length,
      byRole,
    };
  } catch (error) {
    console.error("getMemberStats error:", error);
    return { total: 0, byRole: {} };
  }
}
