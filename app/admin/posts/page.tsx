"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/appwrite/client";
import { getProfileByUserId } from "@/lib/actions/profile";
import {
  getAllPosts,
  adminDeletePost,
  type PostWithDetails,
} from "@/lib/actions/admin";
import { isAdmin } from "@/lib/roles";

export default function AdminPostsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    $id: string;
    name: string;
    email: string;
  } | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check auth and load data
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      // Get current user's profile to check role
      const profile = await getProfileByUserId(user.$id);
      if (!profile || !isAdmin(profile.role)) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      // Load all posts
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  const handleDelete = async (postId: string) => {
    if (!currentUser) return;

    setDeletingId(postId);
    const result = await adminDeletePost(postId, currentUser.$id);

    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.$id !== postId));
      setConfirmDelete(null);
    } else {
      alert(result.error || "Lỗi khi xóa bài viết");
    }
    setDeletingId(null);
  };

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

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Filter posts by search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-foreground/60">
            Đang tải danh sách bài viết...
          </p>
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
            Bạn cần có cấp bậc &quot;Thành Nhân&quot; trở lên để truy cập trang
            này.
          </p>
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary font-mono hover:bg-primary/30 transition-colors"
          >
            Quay lại diễn đàn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold font-mono text-amber-400 flex items-center gap-3">
              📝 Quản Lý Bài Viết
            </h1>
            <p className="text-foreground/60 font-mono text-sm mt-1">
              Xóa bài viết góp ý và dữ liệu liên quan
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-foreground/70 hover:border-primary/50 transition-colors"
            >
              ← Quản trị viên
            </Link>
            <Link
              href="/forum"
              className="px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-foreground/70 hover:border-primary/50 transition-colors"
            >
              🏠 Diễn đàn
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-primary/10 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📄</span>
              <span className="font-mono font-bold text-primary text-xl">
                {posts.length}
              </span>
            </div>
            <p className="text-xs font-mono text-primary/80">Tổng bài viết</p>
          </div>
          <div className="p-4 rounded-lg border bg-accent/10 border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">❤️</span>
              <span className="font-mono font-bold text-accent text-xl">
                {posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)}
              </span>
            </div>
            <p className="text-xs font-mono text-accent/80">Tổng lượt thích</p>
          </div>
          <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💬</span>
              <span className="font-mono font-bold text-blue-400 text-xl">
                {posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0)}
              </span>
            </div>
            <p className="text-xs font-mono text-blue-400/80">Tổng bình luận</p>
          </div>
          <div className="p-4 rounded-lg border bg-purple-500/10 border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👤</span>
              <span className="font-mono font-bold text-purple-400 text-xl">
                {new Set(posts.map((p) => p.authorId)).size}
              </span>
            </div>
            <p className="text-xs font-mono text-purple-400/80">Người đăng</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung, tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-surface border border-border rounded-xl font-mono text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Posts Table */}
        <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-background/30">
            <h2 className="font-mono font-bold text-foreground flex items-center gap-2">
              <span>📋</span>
              Danh sách bài viết ({filteredPosts.length})
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-foreground/60 font-mono">
                {searchQuery
                  ? "Không tìm thấy bài viết phù hợp"
                  : "Chưa có bài viết nào"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/50">
                  <tr className="text-left font-mono text-sm text-foreground/60">
                    <th className="px-4 py-3">Bài viết</th>
                    <th className="px-4 py-3">Tác giả</th>
                    <th className="px-4 py-3 text-center">Thích</th>
                    <th className="px-4 py-3 text-center">Bình luận</th>
                    <th className="px-4 py-3">Ngày đăng</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.$id}
                      className="hover:bg-background/30 transition-colors"
                    >
                      {/* Post Title & Content Preview */}
                      <td className="px-4 py-3 max-w-md">
                        <div>
                          <p className="font-mono font-medium text-foreground line-clamp-1">
                            {post.title}
                          </p>
                          <p className="text-xs text-foreground/50 font-mono mt-1 line-clamp-2">
                            {truncateContent(post.content, 80)}
                          </p>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile/${post.authorId}`}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {post.authorName}
                        </Link>
                      </td>

                      {/* Likes */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm text-foreground/70">
                          {post.likes?.length || 0}
                        </span>
                      </td>

                      {/* Comments */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm text-foreground/70">
                          {post.commentsCount || 0}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-foreground/50">
                          {formatDate(post.$createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {confirmDelete === post.$id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-danger font-mono">
                              Xác nhận?
                            </span>
                            <button
                              onClick={() => handleDelete(post.$id)}
                              disabled={deletingId === post.$id}
                              className="px-3 py-1 bg-danger/20 border border-danger/50 rounded text-danger text-xs font-mono hover:bg-danger/30 transition-colors disabled:opacity-50"
                            >
                              {deletingId === post.$id ? "..." : "Xóa"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1 bg-surface border border-border rounded text-foreground/70 text-xs font-mono hover:border-foreground/30 transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(post.$id)}
                            className="px-3 py-1.5 bg-danger/10 border border-danger/30 rounded-lg text-danger text-xs font-mono hover:bg-danger/20 transition-colors"
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-mono font-medium text-danger">
                Lưu ý quan trọng
              </p>
              <p className="font-mono text-sm text-danger/80 mt-1">
                Khi xóa bài viết, tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn:
                bình luận, thông báo, lượt thích. Hành động này không thể hoàn
                tác.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
