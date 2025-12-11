import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { getResourceById, getResourceComments } from "@/lib/actions/resources";
import { getCategoryInfo } from "@/lib/types/resources";
import { getRoleInfo, canViewResource, parseAllowedRoles } from "@/lib/roles";
import ResourceDetailClient from "./ResourceDetailClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResourceById(id);

  if (!resource) {
    return { title: "Không tìm thấy | Xóm Nhà Lá" };
  }

  return {
    title: `${resource.title} | Xóm Nhà Lá`,
    description: resource.content.slice(0, 160),
  };
}

// Force dynamic
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResourceDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Parallel fetch
  const [user, resource] = await Promise.all([
    getServerUser(),
    getResourceById(id),
  ]);

  if (!resource) {
    notFound();
  }

  // Get user profile
  const userProfile = user ? await getServerProfile(user.$id) : null;

  // Check permission BEFORE loading comments (server-side check)
  const userRole = userProfile?.role || null;
  const canAccess = canViewResource(userRole, resource.allowedRoles);

  // If user cannot access, show locked page immediately (server-side)
  if (!canAccess) {
    const allowedRolesInfo = parseAllowedRoles(resource.allowedRoles);
    const categoryInfo = getCategoryInfo(resource.category);

    return (
      <main className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-mono text-foreground/60 mb-6">
            <Link
              href="/resources"
              className="hover:text-primary transition-colors"
            >
              Tài Nguyên
            </Link>
            <span>/</span>
            <Link
              href={`/resources?category=${resource.category}`}
              className={`hover:text-primary transition-colors ${categoryInfo.color}`}
            >
              {categoryInfo.icon} {categoryInfo.name}
            </Link>
          </div>

          {/* Locked content card */}
          <div className="text-center py-16 bg-surface/30 rounded-2xl border border-amber-500/30 backdrop-blur-md">
            <div className="text-8xl mb-6">🔒</div>

            {/* Show title on locked page */}
            <h1 className="text-2xl font-bold font-mono text-foreground mb-4 px-4">
              {resource.title}
            </h1>

            <p className="text-foreground/60 font-mono mb-6 max-w-md mx-auto">
              Bài viết này chỉ dành cho một số cấp bậc nhất định.
            </p>

            {/* Required roles (Exact Match) */}
            {allowedRolesInfo.length > 0 && (
              <div className="mb-8">
                <p className="text-sm text-foreground/50 font-mono mb-3">
                  Chỉ dành cho các cấp bậc sau:
                </p>
                <div className="flex flex-wrap gap-2 justify-center px-4">
                  {allowedRolesInfo.map((role, i) => (
                    <span
                      key={i}
                      className={`px-4 py-2 rounded-full text-sm font-mono ${role.bgColor} ${role.borderColor} border ${role.color} flex items-center gap-2`}
                    >
                      {role.icon} {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current user role */}
            {userProfile && (
              <div className="mb-8 text-sm text-foreground/50 font-mono">
                Cấp bậc hiện tại của bạn:{" "}
                <span
                  className={getRoleInfo(userProfile.role || "no_le").color}
                >
                  {getRoleInfo(userProfile.role || "no_le").icon}{" "}
                  {getRoleInfo(userProfile.role || "no_le").name}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!user ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/50 rounded-xl text-primary font-mono hover:bg-primary/30 transition-colors"
                >
                  🔑 Đăng nhập
                </Link>
              ) : (
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 font-mono hover:bg-amber-500/30 transition-colors"
                >
                  ⬆️ Xin nâng cấp
                </Link>
              )}
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl text-foreground/70 font-mono hover:bg-surface/80 transition-colors"
              >
                ← Quay lại
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // User has access - load comments and render full page
  const comments = await getResourceComments(id);
  const categoryInfo = getCategoryInfo(resource.category);

  return (
    <ResourceDetailClient
      resource={resource}
      comments={comments}
      categoryInfo={categoryInfo}
      serverUser={user}
      userProfile={userProfile}
    />
  );
}
