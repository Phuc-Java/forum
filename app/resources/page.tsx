import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { getResourcesByCategory } from "@/lib/actions/resources";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
} from "@/lib/types/resources";
import ResourcesClient from "./ResourcesClient";
import type { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Tài Nguyên | Xóm Nhà Lá",
  description: "Kho tài nguyên, thủ thuật, mã nguồn mở và tài liệu học tập",
};

// Force dynamic - Tận dụng VPS mạnh
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryId = (params.category || "tricks") as ResourceCategoryId;

  // Validate category
  const validCategory = RESOURCE_CATEGORIES[categoryId] ? categoryId : "tricks";

  // Parallel fetch - Tận dụng VPS
  const [user, resources] = await Promise.all([
    getServerUser(),
    getResourcesByCategory(validCategory, 50),
  ]);

  // Get user profile for permissions (try server-side, will fallback to client)
  const userProfile = user ? await getServerProfile(user.$id) : null;

  // Check admin permission - thanh_nhan (level 4) or chi_ton (level 5)
  const userRole = userProfile?.role || "";
  const canCreate = userRole === "chi_ton" || userRole === "thanh_nhan";

  // Debug log
  console.log("🔍 Resources:", {
    userId: user?.$id,
    profileId: userProfile?.$id,
    role: userRole,
    canCreate,
  });

  return (
    <ResourcesClient
      initialCategory={validCategory}
      initialResources={resources}
      serverUser={user}
      userProfile={userProfile}
      categories={RESOURCE_CATEGORIES}
      canCreate={canCreate}
    />
  );
}
