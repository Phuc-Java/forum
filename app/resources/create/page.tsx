import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
} from "@/lib/types/resources";
import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { redirect } from "next/navigation";
import CreateResourceClient from "./CreateResourceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Bài Mới | Xóm Nhà Lá",
  description: "Tạo bài viết mới trong kho tài nguyên",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CreateResourcePage({ searchParams }: PageProps) {
  // Server-side auth check
  const [serverUser, params] = await Promise.all([
    getServerUser(),
    searchParams,
  ]);

  if (!serverUser) {
    redirect("/login?from=/resources/create");
  }

  const userProfile = await getServerProfile(serverUser.$id);

  // Check permission - only pham_nhan+ can create
  const role = userProfile?.role || "pham_nhan";
  const canCreate = [
    "pham_nhan",
    "chi_cuong_gia",
    "thanh_nhan",
    "chi_ton",
  ].includes(role);

  if (!canCreate) {
    redirect("/resources");
  }

  const categoryId = (params.category || "tricks") as ResourceCategoryId;
  const validCategory = RESOURCE_CATEGORIES[categoryId] ? categoryId : "tricks";

  // Prepare user data for client
  const userData = {
    id: serverUser.$id,
    name: serverUser.name,
    displayName: userProfile?.displayName || serverUser.name,
    role: role,
  };

  return (
    <CreateResourceClient
      initialCategory={validCategory}
      categories={RESOURCE_CATEGORIES}
      userData={userData}
    />
  );
}
