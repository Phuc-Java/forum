"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  type ResourceWithMeta,
  type ResourceComment,
  type ResourceCategory,
  parseTags,
  parseAttachments,
  formatRating,
} from "@/lib/types/resources";
import {
  toggleResourceLike,
  createResourceComment,
  deleteResourceComment,
  rateResource,
} from "@/lib/actions/resources";
import { hasPermission, parseAllowedRoles } from "@/lib/roles";
import type { ServerProfile } from "@/lib/appwrite/server";

interface ResourceDetailClientProps {
  resource: ResourceWithMeta;
  comments: ResourceComment[];
  categoryInfo: ResourceCategory;
  serverUser: { $id: string; name: string; email: string } | null;
  userProfile: ServerProfile | null;
}

export default function ResourceDetailClient({
  resource,
  comments: initialComments,
  categoryInfo,
  serverUser,
  userProfile,
}: ResourceDetailClientProps) {
  const [isLiked, setIsLiked] = useState(resource.isLiked || false);
  const [likesCount, setLikesCount] = useState(resource.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState<ResourceComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [currentRating, setCurrentRating] = useState(
    formatRating(resource.ratingSum, resource.ratingCount)
  );

  const tags = parseTags(resource.tags);
  const attachments = parseAttachments(resource.meta?.attachments);

  // Parse allowed roles for display (for showing badge, not for access control - server handles that)
  const allowedRolesInfo = parseAllowedRoles(resource.allowedRoles);

  // Note: Access control is handled by server (page.tsx)
  // This component only renders if user has access

  const canComment = hasPermission(userProfile?.role, "canComment");

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle like
  const handleLike = async () => {
    if (!serverUser) {
      alert("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    setLikeLoading(true);
    const displayName = userProfile?.displayName || serverUser.name;
    const result = await toggleResourceLike(
      resource.$id,
      serverUser.$id,
      displayName
    );

    if (result.success) {
      setIsLiked(result.liked!);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
    }
    setLikeLoading(false);
  };

  // Handle comment
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUser || !newComment.trim()) return;

    setCommentLoading(true);
    const displayName = userProfile?.displayName || serverUser.name;
    const result = await createResourceComment(
      resource.$id,
      serverUser.$id,
      displayName,
      newComment.trim()
    );

    if (result.success && result.comment) {
      setComments((prev) => [result.comment!, ...prev]);
      setNewComment("");
    }
    setCommentLoading(false);
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    const result = await deleteResourceComment(commentId);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.$id !== commentId));
    }
  };

  // Handle rating
  const handleRate = async (rating: number) => {
    if (!serverUser) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }

    setRatingLoading(true);
    const result = await rateResource(resource.$id, rating);

    if (result.success) {
      setUserRating(rating);
      setCurrentRating(result.newRating!);
    }
    setRatingLoading(false);
  };

  // Note: Access control is handled by server (page.tsx)
  // This component only renders if user already has access

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-mono text-foreground/60">
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

        {/* Article Header */}
        <header className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.meta?.isPinned && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/20 border border-amber-500/50 text-amber-400">
                📌 Ghim
              </span>
            )}
            {allowedRolesInfo.length > 0 && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono ${allowedRolesInfo[0].bgColor} ${allowedRolesInfo[0].borderColor} border ${allowedRolesInfo[0].color}`}
              >
                🔒 {allowedRolesInfo.map((r) => r.name).join(", ")}+
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono ${categoryInfo.bgColor} ${categoryInfo.borderColor} border ${categoryInfo.color}`}
            >
              {categoryInfo.icon} {categoryInfo.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-foreground mb-4">
            {resource.title}
          </h1>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-sm font-mono text-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-foreground/60">
            <Link
              href={`/profile/${resource.authorId}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span className="text-primary font-bold">
                {resource.authorName}
              </span>
            </Link>
            <span>•</span>
            <span>{formatDate(resource.$createdAt)}</span>
            {resource.meta?.viewCount && resource.meta.viewCount > 0 && (
              <>
                <span>•</span>
                <span>👁️ {resource.meta.viewCount} lượt xem</span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-foreground/60">
                Đánh giá:
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={ratingLoading || userRating > 0}
                    className={`text-xl transition-transform hover:scale-110 ${
                      star <=
                      (hoverRating || userRating || Math.round(currentRating))
                        ? "text-yellow-400"
                        : "text-foreground/20"
                    } ${ratingLoading ? "opacity-50" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-sm font-mono text-foreground/60">
                {currentRating > 0
                  ? `${currentRating.toFixed(1)}/5`
                  : "Chưa có"}
                {resource.ratingCount && resource.ratingCount > 0 && (
                  <span className="text-foreground/40">
                    {" "}
                    ({resource.ratingCount} đánh giá)
                  </span>
                )}
              </span>
            </div>
          </div>
        </header>

        {/* Thumbnail */}
        {resource.meta?.thumbnail && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden border border-border">
            <Image
              src={resource.meta.thumbnail}
              alt={resource.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <article className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <div
            className="prose prose-invert max-w-none font-mono text-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />
        </article>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold font-mono text-foreground mb-4">
              📎 Tệp đính kèm ({attachments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <span className="text-2xl">
                    {file.type === "image"
                      ? "🖼️"
                      : file.type === "link"
                      ? "🔗"
                      : "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs font-mono text-foreground/40">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center gap-4 p-4 bg-surface/60 backdrop-blur-md border border-border rounded-2xl">
          <button
            onClick={handleLike}
            disabled={likeLoading || !serverUser}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all ${
              isLiked
                ? "bg-danger/20 border border-danger/50 text-danger"
                : "bg-background/50 border border-border text-foreground/60 hover:border-danger/50 hover:text-danger"
            } ${likeLoading ? "opacity-50" : ""}`}
          >
            <span>{isLiked ? "❤️" : "🤍"}</span>
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-border rounded-lg text-foreground/60">
            <span>💬</span>
            <span className="font-mono text-sm">{comments.length}</span>
          </div>

          <div className="flex-1"></div>

          <Link
            href="/resources"
            className="px-4 py-2 bg-background/50 border border-border rounded-lg font-mono text-sm text-foreground/60 hover:border-primary/50 hover:text-primary transition-colors"
          >
            ← Quay lại
          </Link>
        </div>

        {/* Comments Section */}
        <section className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold font-mono text-foreground mb-6">
            💬 Bình luận ({comments.length})
          </h3>

          {/* Comment Form */}
          {canComment && serverUser ? (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="px-6 py-2 bg-primary/20 border border-primary/50 rounded-lg font-mono text-sm text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </form>
          ) : !serverUser ? (
            <div className="mb-6 p-4 bg-background/50 border border-border rounded-xl text-center">
              <p className="font-mono text-sm text-foreground/60">
                <Link href="/login" className="text-primary hover:underline">
                  Đăng nhập
                </Link>{" "}
                để bình luận
              </p>
            </div>
          ) : null}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center py-8 font-mono text-foreground/40">
                Chưa có bình luận nào
              </p>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.$id}
                  comment={comment}
                  currentUserId={serverUser?.$id}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// Comment Card Component
function CommentCard({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: ResourceComment;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const isOwner = currentUserId === comment.authorId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-background/50 border border-border rounded-xl">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${comment.authorId}`}
            className="font-mono font-bold text-primary hover:underline"
          >
            {comment.authorName}
          </Link>
          <span className="text-xs font-mono text-foreground/40">
            {formatDate(comment.$createdAt)}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.$id)}
            className="text-xs font-mono text-danger/60 hover:text-danger transition-colors"
          >
            Xóa
          </button>
        )}
      </div>
      <p className="font-mono text-sm text-foreground/80 whitespace-pre-wrap">
        {comment.content}
      </p>
    </div>
  );
}
