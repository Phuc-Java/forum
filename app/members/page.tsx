import { getAllMembers, getMemberStats } from "@/lib/actions/members";
import { getServerUser } from "@/lib/appwrite/server";
import MembersClient from "./MembersClient";
import type { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Thành Viên | Xóm Nhà Lá",
  description:
    "Danh sách thành viên của cộng đồng Xóm Nhà Lá - Nơi hội tụ những tâm hồn đồng điệu",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MembersPage() {
  // Server-side data fetching - parallel for performance
  const [members, stats, serverUser] = await Promise.all([
    getAllMembers(),
    getMemberStats(),
    getServerUser(),
  ]);

  return (
    <MembersClient
      members={members}
      stats={stats}
      currentUserId={serverUser?.$id || null}
    />
  );
}
