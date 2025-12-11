"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/appwrite/client";
import { getProfileByUserId } from "@/lib/actions/profile";
import {
  getAllResourcesForAdmin,
  deleteResource,
  toggleResourcePin,
} from "@/lib/actions/resources";
import { isSuperAdmin, isAdmin } from "@/lib/roles";
import {
  RESOURCE_CATEGORIES,
  getCategoryInfo,
  parseTags,
  type ResourceWithMeta,
} from "@/lib/types/resources";

export default function AdminResourcesPage() {
  const router = useRouter();
  const [, setCurrentUser] = useState<{
    $id: string;
    name: string;
    email: string;
  } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check auth and load data
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      const profile = await getProfileByUserId(user.$id);
      if (!profile || !isAdmin(profile.role)) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setCurrentUserRole(profile.role);

      // Load resources
      const allResources = await getAllResourcesForAdmin();
      setResources(allResources);
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  const handleDelete = async (resourceId: string) => {
    if (!isSuperAdmin(currentUserRole)) {
      alert("Chỉ Chí Tôn mới có quyền xóa bài viết");
      return;
    }

    if (
      !confirm(
        "Bạn có chắc muốn xóa bài viết này? Hành động không thể hoàn tác!"
      )
    ) {
      return;
    }

    setDeleting(resourceId);
    const result = await deleteResource(resourceId);

    if (result.success) {
      setResources((prev) => prev.filter((r) => r.$id !== resourceId));
    } else {
      alert(result.error || "Không thể xóa bài viết");
    }
    setDeleting(null);
  };

  const handleTogglePin = async (resourceId: string) => {
    const result = await toggleResourcePin(resourceId);

    if (result.success) {
      setResources((prev) =>
        prev.map((r) =>
          r.$id === resourceId
            ? {
                ...r,
                meta: r.meta
                  ? { ...r.meta, isPinned: result.isPinned ?? null }
                  : null,
              }
            : r
        )
      );
    } else {
      alert(result.error || "Không thể ghim bài viết");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-foreground/60">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold font-mono text-danger mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-foreground/60 font-mono mb-6">
            Bạn cần có cấp bậc Thành Nhân trở lên để truy cập.
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary font-mono"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  // Group by category
  const resourcesByCategory = resources.reduce((acc, r) => {
    const cat = r.category || "tricks";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<string, ResourceWithMeta[]>);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold font-mono text-amber-400 flex items-center gap-3">
              📁 Quản Lý Tài Nguyên
            </h1>
            <p className="text-foreground/60 font-mono text-sm mt-1">
              Tổng cộng {resources.length} bài viết
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-foreground/70 hover:border-primary/50 transition-colors"
            >
              ← Quản trị chính
            </Link>
            <Link
              href="/resources"
              className="px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-foreground/70 hover:border-primary/50 transition-colors"
            >
              Xem tài nguyên
            </Link>
          </div>
        </div>

        {/* Stats by Category */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.values(RESOURCE_CATEGORIES).map((cat) => {
            const count = resourcesByCategory[cat.id]?.length || 0;
            return (
              <div
                key={cat.id}
                className={`p-4 rounded-lg border ${cat.bgColor} ${cat.borderColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`font-mono font-bold ${cat.color}`}>
                    {count}
                  </span>
                </div>
                <p className={`text-xs font-mono ${cat.color} opacity-80`}>
                  {cat.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Resources Table */}
        <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-background/30">
            <h2 className="font-mono font-bold text-foreground flex items-center gap-2">
              <span>📄</span>
              Tất cả bài viết
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background/50">
                <tr className="text-left font-mono text-sm text-foreground/60">
                  <th className="px-4 py-3">Bài viết</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Tác giả</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <p className="font-mono text-foreground/40">
                        Chưa có bài viết nào
                      </p>
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => {
                    const catInfo = getCategoryInfo(resource.category);
                    const tags = parseTags(resource.tags);

                    return (
                      <tr
                        key={resource.$id}
                        className="hover:bg-background/30 transition-colors"
                      >
                        {/* Title */}
                        <td className="px-4 py-3">
                          <Link
                            href={`/resources/${resource.$id}`}
                            className="font-mono text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {resource.title}
                          </Link>
                          {tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 bg-secondary/10 text-secondary rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-mono ${catInfo.bgColor} ${catInfo.borderColor} border ${catInfo.color}`}
                          >
                            {catInfo.icon} {catInfo.name}
                          </span>
                        </td>

                        {/* Author */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-foreground/70">
                            {resource.authorName}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-foreground/50">
                            {formatDate(resource.$createdAt)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {resource.meta?.isPinned && (
                              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
                                📌 Ghim
                              </span>
                            )}
                            {resource.meta?.isPublished === false && (
                              <span className="px-2 py-0.5 rounded text-xs bg-foreground/10 text-foreground/50">
                                Nháp
                              </span>
                            )}
                            {resource.meta?.viewCount && (
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">
                                👁️ {resource.meta.viewCount}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleTogglePin(resource.$id)}
                              className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-mono hover:bg-amber-500/20 transition-colors"
                              title={
                                resource.meta?.isPinned ? "Bỏ ghim" : "Ghim"
                              }
                            >
                              {resource.meta?.isPinned ? "📌" : "📍"}
                            </button>

                            <Link
                              href={`/resources/${resource.$id}`}
                              className="px-2 py-1 bg-primary/10 border border-primary/30 rounded text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
                            >
                              Xem
                            </Link>

                            {isSuperAdmin(currentUserRole) && (
                              <button
                                onClick={() => handleDelete(resource.$id)}
                                disabled={deleting === resource.$id}
                                className="px-2 py-1 bg-danger/10 border border-danger/30 rounded text-danger text-xs font-mono hover:bg-danger/20 transition-colors disabled:opacity-50"
                              >
                                {deleting === resource.$id ? "..." : "Xóa"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
