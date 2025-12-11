"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
  type ResourceWithMeta,
  parseTags,
  formatRating,
  getCategoryInfo,
} from "@/lib/types/resources";
import { getResourcesByCategory } from "@/lib/actions/resources";
import { canViewResource, parseAllowedRoles } from "@/lib/roles";
import type { ServerProfile } from "@/lib/appwrite/server";

interface ResourcesClientProps {
  initialCategory: ResourceCategoryId;
  initialResources: ResourceWithMeta[];
  serverUser: { $id: string; name: string; email: string } | null;
  userProfile: ServerProfile | null;
  categories: typeof RESOURCE_CATEGORIES;
  canCreate: boolean; // Passed from server
}

export default function ResourcesClient({
  initialCategory,
  initialResources,
  categories,
  userProfile: serverUserProfile,
  canCreate: serverCanCreate,
}: ResourcesClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [activeCategory, setActiveCategory] =
    useState<ResourceCategoryId>(initialCategory);
  const [resources, setResources] =
    useState<ResourceWithMeta[]>(initialResources);
  const [loading, setLoading] = useState(false);
  const [canCreatePost, setCanCreatePost] = useState(serverCanCreate);

  // IMPORTANT: userRole for viewing permissions is FIXED from server
  // This prevents client-side override that could unlock restricted content
  const displayUserRole = serverUserProfile?.role || null;

  const handleCategoryChange = async (categoryId: ResourceCategoryId) => {
    if (categoryId === activeCategory) return;

    setActiveCategory(categoryId);
    setLoading(true);

    // Update URL
    startTransition(() => {
      router.push(`/resources?category=${categoryId}`, { scroll: false });
    });

    // Fetch new resources
    const newResources = await getResourcesByCategory(categoryId);
    setResources(newResources);
    setLoading(false);
  };

  const categoryInfo = getCategoryInfo(activeCategory);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-40 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-40 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        ></div>
      </div>

      <div className="flex relative z-10">
        {/* Sidebar - Fixed/Sticky */}
        <aside className="w-64 h-screen bg-surface/50 backdrop-blur-md border-r border-border p-4 sticky top-0 hidden md:block overflow-y-auto animate-slide-in-left">
          <div className="space-y-2">
            <h2 className="text-lg font-bold font-mono text-foreground px-3 py-2 flex items-center gap-2">
              <span className="animate-float">📁</span> Danh Mục
            </h2>

            {Object.values(categories).map((category, index) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    handleCategoryChange(category.id as ResourceCategoryId)
                  }
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-xl font-mono text-sm text-left transition-all duration-300 flex items-center gap-3 btn-press animate-fade-in ${
                    isActive
                      ? `${category.bgColor} ${category.borderColor} border ${category.color} shadow-lg`
                      : "hover:bg-background/50 text-foreground/70 hover:text-foreground hover:scale-[1.02]"
                  } ${loading ? "opacity-50" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Create Post Button - Only for admins */}
          {canCreatePost && (
            <div
              className="mt-6 pt-6 border-t border-border animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                href={`/resources/create?category=${activeCategory}`}
                className="w-full px-4 py-3 bg-primary/20 border border-primary/50 rounded-xl font-mono text-sm text-primary hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(0,255,159,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 btn-press"
              >
                <span>✍️</span>
                <span>Đăng Bài Mới</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8">
          {/* Mobile Category Selector */}
          <div className="md:hidden mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {Object.values(categories).map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() =>
                      handleCategoryChange(category.id as ResourceCategoryId)
                    }
                    className={`px-4 py-2 rounded-full font-mono text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? `${category.bgColor} ${category.borderColor} border ${category.color}`
                        : "bg-surface/50 border border-border text-foreground/70"
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl animate-float">
                {categoryInfo.icon}
              </span>
              <h1
                className={`text-3xl font-bold font-mono ${categoryInfo.color}`}
              >
                {categoryInfo.name}
              </h1>
            </div>
            <p className="text-foreground/60 font-mono">
              {categoryInfo.description}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm font-mono text-foreground/40">
                {resources.length} bài viết
              </span>
              {canCreatePost && (
                <Link
                  href={`/resources/create?category=${activeCategory}`}
                  className="md:hidden px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg font-mono text-sm text-primary hover:bg-primary/30 hover:scale-105 transition-all duration-300 btn-press"
                >
                  ✍️ Đăng Bài
                </Link>
              )}
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 bg-surface/30 rounded-2xl border border-border animate-fade-in">
              <div className="text-6xl mb-4 animate-float">
                {categoryInfo.icon}
              </div>
              <p className="text-foreground/60 font-mono text-lg">
                Chưa có bài viết trong mục này
              </p>
              {canCreatePost && (
                <Link
                  href={`/resources/create?category=${activeCategory}`}
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary/20 border border-primary/50 rounded-xl text-primary font-mono hover:bg-primary/30 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,159,0.3)] transition-all duration-300 btn-press"
                >
                  ✍️ Tạo bài viết đầu tiên
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {resources.map((resource, index) => {
                // Use displayUserRole (server-side) for locked status
                // This prevents client-side override
                const isLocked = !canViewResource(
                  displayUserRole,
                  resource.allowedRoles
                );
                return (
                  <ResourceCard
                    key={resource.$id}
                    resource={resource}
                    index={index}
                    isLocked={isLocked}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Resource Card Component
function ResourceCard({
  resource,
  index,
  isLocked = false,
}: {
  resource: ResourceWithMeta;
  index: number;
  isLocked?: boolean;
}) {
  const tags = parseTags(resource.tags);
  const rating = formatRating(resource.ratingSum, resource.ratingCount);

  // Parse allowed roles for display using helper from lib/roles
  const allowedRolesInfo = parseAllowedRoles(resource.allowedRoles);

  // Show locked card if user doesn't have permission
  if (isLocked) {
    return (
      <div
        className="group bg-surface/40 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden relative animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Locked Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
          <span className="text-5xl mb-3 animate-float">🔒</span>

          {/* Title visible on locked card */}
          <h3 className="text-lg font-bold font-mono text-foreground text-center line-clamp-2 mb-3 px-2">
            {resource.title}
          </h3>

          <p className="text-foreground/60 font-mono text-sm text-center mb-3">
            Nội dung giới hạn
          </p>

          {/* Show allowed roles (Exact Match) */}
          {allowedRolesInfo.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-4 px-2">
              {allowedRolesInfo.slice(0, 3).map((role, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-full text-xs font-mono ${role.bgColor} ${role.borderColor} border ${role.color} hover:scale-105 transition-transform duration-300`}
                >
                  {role.icon} {role.name}
                </span>
              ))}
              {allowedRolesInfo.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs font-mono bg-surface border border-border text-foreground/60">
                  +{allowedRolesInfo.length - 3}
                </span>
              )}
            </div>
          )}

          <Link
            href="/profile/edit"
            className="px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg text-xs font-mono text-primary hover:bg-primary/30 hover:scale-105 transition-all duration-300 btn-press"
          >
            ⬆️ Xin nâng cấp
          </Link>

          {/* Reload hint */}
          <p className="text-foreground/40 font-mono text-[10px] text-center mt-3 px-2">
            💡 Nếu bạn có quyền xem, hãy thử{" "}
            <button
              onClick={() => window.location.reload()}
              className="text-primary/70 hover:text-primary underline"
            >
              tải lại trang (F5)
            </button>
          </p>
        </div>

        {/* Blurred Content Behind */}
        <div className="opacity-20 blur-sm pointer-events-none">
          {/* Thumbnail placeholder */}
          <div className="h-40 bg-linear-to-br from-primary/10 to-secondary/10"></div>
          <div className="p-5">
            <div className="h-6 bg-foreground/10 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-foreground/10 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-foreground/10 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Normal card
  return (
    <Link
      href={`/resources/${resource.$id}`}
      className="group bg-surface/60 backdrop-blur-md border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 card-hover animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      {resource.meta?.thumbnail && (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={resource.meta.thumbnail}
            alt={resource.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent"></div>
        </div>
      )}

      <div className="p-5">
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Allowed Roles Badge (Exact Match) */}
          {allowedRolesInfo.length > 0 && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-mono flex items-center gap-1 ${allowedRolesInfo[0].bgColor} ${allowedRolesInfo[0].borderColor} border ${allowedRolesInfo[0].color} group-hover:scale-105 transition-transform duration-300`}
            >
              <span>🔒</span>
              <span>
                {allowedRolesInfo.length === 1
                  ? allowedRolesInfo[0].name
                  : `${allowedRolesInfo.length} roles`}
              </span>
            </span>
          )}

          {/* Pinned Badge */}
          {resource.meta?.isPinned && (
            <span className="px-2 py-1 rounded-full text-xs font-mono bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center gap-1 animate-glow-pulse">
              📌 Ghim
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold font-mono text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-2">
          {resource.title}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-secondary/10 border border-secondary/30 rounded-full text-xs font-mono text-secondary hover:scale-105 transition-transform duration-300"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-mono text-foreground/40">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating Stars */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm transition-transform duration-300 group-hover:scale-110 ${
                  star <= Math.round(rating)
                    ? "text-yellow-400"
                    : "text-foreground/20"
                }`}
                style={{ transitionDelay: `${star * 30}ms` }}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs font-mono text-foreground/50">
            {rating > 0 ? rating.toFixed(1) : "Chưa có đánh giá"}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-foreground/40">bởi</span>
            <span className="text-sm font-mono text-primary">
              {resource.authorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-foreground/40">
            <span className="flex items-center gap-1">
              ❤️ {resource.likesCount}
            </span>
            <span className="flex items-center gap-1">
              💬 {resource.commentsCount}
            </span>
            {resource.meta?.viewCount && resource.meta.viewCount > 0 && (
              <span className="flex items-center gap-1">
                👁️ {resource.meta.viewCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Loading Skeleton
function ResourceCardSkeleton() {
  return (
    <div className="bg-surface/60 border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-primary/10"></div>
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-primary/10 rounded-full"></div>
          <div className="h-5 w-16 bg-secondary/10 rounded-full"></div>
        </div>
        <div className="h-6 bg-foreground/10 rounded w-3/4"></div>
        <div className="h-4 bg-foreground/5 rounded w-full"></div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-4 h-4 bg-yellow-500/20 rounded"></div>
          ))}
        </div>
        <div className="flex justify-between pt-3 border-t border-border/50">
          <div className="h-4 w-24 bg-foreground/10 rounded"></div>
          <div className="h-4 w-20 bg-foreground/10 rounded"></div>
        </div>
      </div>
    </div>
  );
}
