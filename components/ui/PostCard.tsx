"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  toggleLike,
  createComment,
  getComments,
  deleteComment,
} from "@/lib/actions/posts";
import { getCurrentUser } from "@/lib/appwrite/client";
import { getProfileByUserId, type Profile } from "@/lib/actions/profile";

interface Comment {
  $id: string;
  $createdAt: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}

interface ServerUser {
  $id: string;
  name: string;
  email: string;
}

interface ServerProfile {
  $id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface PostCardProps {
  post: {
    $id: string;
    $createdAt: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    likes?: string[];
    commentsCount?: number;
  };
  serverUser?: ServerUser | null;
  authorProfile?: ServerProfile | null;
}

// Cache for comment profiles (only for comments, not author)
const profileCache: Map<string, Profile | null> = new Map();

export default function PostCard({
  post,
  serverUser,
  authorProfile: serverAuthorProfile,
}: PostCardProps) {
  // State for user - fallback to client-side if no serverUser
  const [user, setUser] = useState<ServerUser | null>(serverUser || null);

  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    serverUser ? (post.likes || []).includes(serverUser.$id) : false
  );
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Track comment count - use from post.commentsCount or load from API
  const [commentCount, setCommentCount] = useState<number>(
    post.commentsCount ?? 0
  );

  // Use server-provided author profile
  const authorProfile = serverAuthorProfile || null;

  // Comment profiles (loaded on demand)
  const [commentProfiles, setCommentProfiles] = useState<
    Map<string, Profile | null>
  >(new Map());

  // Load comment count on mount if commentsCount is 0 or undefined
  useEffect(() => {
    const loadCommentCount = async () => {
      if ((post.commentsCount ?? 0) === 0) {
        const result = await getComments(post.$id);
        if (result.success && result.comments) {
          setCommentCount(result.comments.length);
        }
      }
    };
    loadCommentCount();
  }, [post.$id, post.commentsCount]);

  // Fallback to client-side auth check if no serverUser
  useEffect(() => {
    if (!serverUser) {
      const checkAuth = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          setIsLiked((post.likes || []).includes(currentUser.$id));
        }
      };
      checkAuth();
    }
  }, [serverUser, post.likes]);

  // Load comment author profiles when comments change
  useEffect(() => {
    const loadCommentProfiles = async () => {
      const newProfiles = new Map<string, Profile | null>();
      for (const comment of comments) {
        if (!profileCache.has(comment.authorId)) {
          const profile = await getProfileByUserId(comment.authorId);
          profileCache.set(comment.authorId, profile);
        }
        newProfiles.set(
          comment.authorId,
          profileCache.get(comment.authorId) || null
        );
      }
      setCommentProfiles(newProfiles);
    };
    if (comments.length > 0) {
      loadCommentProfiles();
    }
  }, [comments]);

  const getAvatarSrc = (
    profile: Profile | ServerProfile | null | undefined
  ) => {
    if (profile?.avatarUrl) {
      return `/avatars/${profile.avatarUrl}`;
    }
    return "/avatars/default.jpg";
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

  const handleLike = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    setLikeLoading(true);
    const userName = authorProfile?.displayName || user.name || "Ẩn danh";
    const result = await toggleLike(post.$id, user.$id, userName);

    if (result.success) {
      setIsLiked(result.liked!);
      setLikes((prev) =>
        result.liked
          ? [...prev, user.$id]
          : prev.filter((id) => id !== user.$id)
      );
    }
    setLikeLoading(false);
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);

    if (!showComments && comments.length === 0) {
      setCommentsLoading(true);
      const result = await getComments(post.$id);
      if (result.success) {
        setComments(result.comments as unknown as Comment[]);
      }
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setCommentSubmitting(true);
    const result = await createComment(
      post.$id,
      user.$id,
      user.name || user.email.split("@")[0],
      newComment
    );

    if (result.success && result.comment) {
      setComments((prev) => [result.comment as unknown as Comment, ...prev]);
      setCommentCount((prev) => prev + 1);
      setNewComment("");
    }
    setCommentSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const result = await deleteComment(commentId, user.$id);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.$id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <article className="group bg-surface/40 backdrop-blur-md border border-border hover:border-primary/50 rounded-lg p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,159,0.1)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar - Clickable */}
          <Link
            href={`/profile/${post.authorId}`}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors hover:shadow-[0_0_10px_rgba(0,255,159,0.3)]"
          >
            <Image
              src={getAvatarSrc(authorProfile)}
              alt={post.authorName || "Avatar"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </Link>
          {/* Author Info */}
          <div>
            <Link
              href={`/profile/${post.authorId}`}
              className="font-mono font-bold text-foreground hover:text-primary transition-colors"
            >
              {authorProfile?.displayName || post.authorName || "Ẩn Danh"}
            </Link>
            <p className="text-xs font-mono text-foreground/40">
              {formatDate(post.$createdAt)}
            </p>
          </div>
        </div>

        {/* ID Badge */}
        <span className="text-xs font-mono text-foreground/30 bg-background/50 px-2 py-1 rounded">
          #{post.$id.slice(-6)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold font-mono text-foreground mb-3 group-hover:text-primary transition-colors">
        {post.title}
      </h3>

      {/* Content */}
      <p className="text-foreground/70 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Footer - Like & Comment buttons */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isLiked
                ? "text-pink-500 bg-pink-500/10"
                : "text-foreground/40 hover:text-pink-500 hover:bg-pink-500/10"
            } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg
              className="w-4 h-4"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-xs font-mono">
              {likes.length > 0 ? likes.length : "Thích"}
            </span>
          </button>

          {/* Comment button */}
          <button
            onClick={handleToggleComments}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              showComments
                ? "text-secondary bg-secondary/10"
                : "text-foreground/40 hover:text-secondary hover:bg-secondary/10"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs font-mono">
              {commentCount > 0 ? commentCount : "Bình luận"}
            </span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2 text-sm font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? "..." : "Gửi"}
              </button>
            </form>
          ) : (
            <p className="text-sm font-mono text-foreground/40 text-center py-2">
              Đăng nhập để bình luận
            </p>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-pulse text-foreground/40 font-mono text-sm">
                Đang tải bình luận...
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => {
                const commentProfile = commentProfiles.get(comment.authorId);
                return (
                  <div
                    key={comment.$id}
                    className="bg-background/30 rounded-lg p-3 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${comment.authorId}`}
                          className="w-6 h-6 rounded-full overflow-hidden border border-secondary/30 hover:border-secondary transition-colors"
                        >
                          <Image
                            src={getAvatarSrc(commentProfile)}
                            alt={comment.authorName || "Avatar"}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <Link
                          href={`/profile/${comment.authorId}`}
                          className="text-sm font-mono font-bold text-foreground hover:text-secondary transition-colors"
                        >
                          {commentProfile?.displayName || comment.authorName}
                        </Link>
                        <span className="text-xs font-mono text-foreground/30">
                          {formatDate(comment.$createdAt)}
                        </span>
                      </div>
                      {user && user.$id === comment.authorId && (
                        <button
                          onClick={() => handleDeleteComment(comment.$id)}
                          className="text-xs text-danger/60 hover:text-danger transition-colors"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-mono text-foreground/70 pl-8">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm font-mono text-foreground/30 py-4">
              Chưa có bình luận nào
            </p>
          )}
        </div>
      )}
    </article>
  );
}
