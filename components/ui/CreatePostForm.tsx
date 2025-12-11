"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite/client";
import { createPost } from "@/lib/actions/posts";
import { getProfileByUserId, type Profile } from "@/lib/actions/profile";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { getRoleInfo, hasPermission } from "@/lib/roles";
import Link from "next/link";

interface User {
  $id: string;
  name: string;
  email: string;
}

interface ServerProfile {
  $id: string;
  userId: string;
  displayName: string;
  role?: string;
  customTags?: string;
  permissions?: string;
}

interface CreatePostFormProps {
  serverUser?: User | null;
  serverProfile?: Profile | ServerProfile | null;
}

export default function CreatePostForm({
  serverUser,
  serverProfile,
}: CreatePostFormProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(serverUser || null);
  const [profile, setProfile] = useState<Profile | ServerProfile | null>(
    serverProfile || null
  );
  const [loading, setLoading] = useState(!serverUser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fallback to client-side auth check if no serverUser provided
  useEffect(() => {
    if (!serverUser) {
      const checkAuth = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const userProfile = await getProfileByUserId(currentUser.$id);
          setProfile(userProfile);
        }
        setLoading(false);
      };
      checkAuth();
    }
  }, [serverUser]);

  // Check permission to create post
  const canCreatePost = hasPermission(
    profile?.role,
    "canCreatePost",
    profile?.permissions
  );
  const roleInfo = getRoleInfo(profile?.role);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("authorId", user.$id);
    formData.append("authorName", user.name || user.email.split("@")[0]);

    const result = await createPost(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Không thể tạo bài viết");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
          <div className="h-4 bg-primary/20 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h3 className="text-xl font-bold text-foreground font-mono mb-2">
          Yêu Cầu Đăng Nhập
        </h3>
        <p className="text-foreground/60 font-mono text-sm mb-4">
          Bạn cần đăng nhập để đăng bài viết
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-accent text-background font-mono font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,255,159,0.6)] transition-all"
        >
          Đăng Nhập
        </Link>
      </div>
    );
  }

  // Check if user has permission to create posts
  if (!canCreatePost) {
    return (
      <div
        className={`backdrop-blur-md border rounded-lg p-8 text-center ${roleInfo.bgColor} ${roleInfo.borderColor}`}
      >
        <div className="text-4xl mb-4">{roleInfo.icon}</div>
        <h3 className={`text-xl font-bold font-mono mb-2 ${roleInfo.color}`}>
          Chưa Đủ Cấp Bậc
        </h3>
        <div className="flex justify-center mb-3">
          <RoleBadge role={profile?.role} size="md" />
        </div>
        <p className="text-foreground/60 font-mono text-sm mb-4">
          Cấp bậc của bạn là{" "}
          <span className={roleInfo.color}>&quot;{roleInfo.name}&quot;</span>.
          <br />
          Bạn cần đạt cấp{" "}
          <span className="text-blue-400">&quot;Chí Cường Giả&quot;</span> trở
          lên để đăng bài.
        </p>
        <div className="text-xs font-mono text-foreground/40 bg-background/30 rounded-lg p-3">
          💡 Tham gia bình luận và tương tác để được nâng cấp!
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-background font-bold font-mono">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`font-mono font-bold ${roleInfo.color} ${roleInfo.textGlow}`}
            >
              {profile?.displayName || user.name || "Ẩn Danh"}
            </p>
            <RoleBadge role={profile?.role} size="sm" showName={false} />
          </div>
          <p className="text-xs font-mono text-foreground/40">
            Đang soạn bài viết mới...
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/50 rounded-lg p-3 text-danger text-sm font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-primary/10 border border-primary/50 rounded-lg p-3 text-primary text-sm font-mono">
          ✓ Đăng bài thành công!
        </div>
      )}

      <input
        name="title"
        type="text"
        required
        placeholder="Tiêu đề bài viết..."
        className="w-full bg-background/50 border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 font-mono outline-none transition-colors"
      />

      <textarea
        name="content"
        required
        rows={4}
        placeholder="Nội dung bài viết..."
        className="w-full bg-background/50 border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 font-mono outline-none transition-colors resize-none"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-linear-to-r from-primary to-accent text-background font-mono font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,255,159,0.6)] transition-all disabled:opacity-50"
      >
        {submitting ? "Đang đăng..." : "Đăng Bài"}
      </button>
    </form>
  );
}
