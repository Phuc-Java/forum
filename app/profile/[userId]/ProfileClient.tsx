"use client";

import Link from "next/link";
import Image from "next/image";
import { RoleBadge, UserBadges } from "@/components/ui/RoleBadge";
import { getRoleInfo, parseCustomTags } from "@/lib/roles";

// Types
interface ProfileData {
  $id: string;
  $createdAt: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  avatarType?: "default" | "custom";
  location?: string;
  website?: string;
  skills?: string;
  socialLinks?: string;
  role?: string;
  customTags?: string;
}

interface SocialLinks {
  github?: string;
  discord?: string;
  twitter?: string;
  facebook?: string;
}

interface ProfileClientProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  stats: { postsCount: number; commentsCount: number };
  recentPosts: { $id: string; $createdAt: string; title?: string }[];
}

export default function ProfileClient({
  profile,
  isOwnProfile,
  stats,
  recentPosts,
}: ProfileClientProps) {
  // Parse social links
  let socialLinks: SocialLinks = {};
  try {
    if (profile?.socialLinks) {
      socialLinks = JSON.parse(profile.socialLinks);
    }
  } catch {
    socialLinks = {};
  }

  // Parse skills
  const skills = profile?.skills
    ? profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  // Check if has any social links
  const hasSocialLinks = Object.values(socialLinks).some((v) => v);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAvatarSrc = (profile: ProfileData | null) => {
    if (!profile) return "/avatars/default.jpg";
    if (profile.avatarType === "custom" && profile.avatarUrl) {
      return profile.avatarUrl;
    }
    return `/avatars/${profile.avatarUrl || "default.jpg"}`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Hero Section */}
        <div className="relative animate-fade-in">
          {/* Background Banner */}
          <div className="h-48 bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl border border-border overflow-hidden">
            <div className="absolute inset-0 bg-[url('/avatars/Black%20White%20Dark%20Futuristic%20Coming%20Soon%20Website%20Coming%20Soon%20Page.png')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent"></div>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-gradient-shift"></div>
          </div>

          {/* Profile Card */}
          <div
            className="relative -mt-20 mx-4 sm:mx-8 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 glass hover:shadow-[0_0_40px_rgba(0,255,159,0.15)] transition-all duration-500">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/50 overflow-hidden bg-surface shadow-[0_0_30px_rgba(0,255,159,0.3)] group-hover:shadow-[0_0_50px_rgba(0,255,159,0.5)] transition-all duration-500 group-hover:scale-105">
                    <Image
                      src={getAvatarSrc(profile)}
                      alt={profile?.displayName || "Avatar"}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-primary rounded-full border-2 border-surface animate-glow-pulse"></div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 flex-wrap">
                    <h1
                      className={`text-3xl font-bold font-mono ${
                        getRoleInfo(profile?.role).color
                      } ${getRoleInfo(profile?.role).textGlow}`}
                    >
                      {profile?.displayName}
                    </h1>
                    <RoleBadge role={profile?.role} size="md" />
                    {isOwnProfile && profile?.role !== "no_le" && (
                      <Link
                        href="/profile/edit"
                        className="p-2 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(0,255,159,0.3)] transition-all duration-300 btn-press"
                        title="Chỉnh sửa profile"
                      >
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>

                  {/* Custom Tags */}
                  {parseCustomTags(profile?.customTags).length > 0 && (
                    <div
                      className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4 animate-fade-in"
                      style={{ animationDelay: "200ms" }}
                    >
                      <UserBadges
                        role={null}
                        customTags={profile?.customTags}
                        showRole={false}
                        showTags={true}
                        tagSize="md"
                      />
                    </div>
                  )}

                  {profile?.location && (
                    <p
                      className="flex items-center justify-center sm:justify-start gap-2 text-foreground/60 font-mono text-sm mb-4 animate-fade-in"
                      style={{ animationDelay: "250ms" }}
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {profile.location}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                    <div
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,159,0.2)] transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: "300ms" }}
                    >
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-mono text-sm text-foreground">
                        <span className="font-bold text-primary">
                          {stats.postsCount}
                        </span>{" "}
                        bài viết
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-lg hover:scale-105 hover:shadow-[0_0_15px_rgba(189,0,255,0.2)] transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: "350ms" }}
                    >
                      <svg
                        className="w-5 h-5 text-secondary"
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
                      <span className="font-mono text-sm text-foreground">
                        <span className="font-bold text-secondary">
                          {stats.commentsCount}
                        </span>{" "}
                        bình luận
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-xs font-mono text-foreground/40 animate-fade-in"
                    style={{ animationDelay: "400ms" }}
                  >
                    Tham gia từ{" "}
                    {profile?.$createdAt
                      ? formatDate(profile.$createdAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role & Permissions Section */}
        <div
          className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="text-lg font-bold font-mono text-amber-400 mb-4 flex items-center gap-2">
            <span>👑</span>
            Cấp Bậc & Quyền Hạn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Role */}
            <div
              className={`p-4 rounded-lg border hover:scale-[1.02] transition-all duration-300 ${
                getRoleInfo(profile?.role).bgColor
              } ${getRoleInfo(profile?.role).borderColor}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">
                  {getRoleInfo(profile?.role).icon}
                </span>
                <div>
                  <p className="text-xs font-mono text-foreground/50 uppercase">
                    Cấp bậc hiện tại
                  </p>
                  <p
                    className={`text-xl font-bold font-mono ${
                      getRoleInfo(profile?.role).color
                    } ${getRoleInfo(profile?.role).textGlow}`}
                  >
                    {getRoleInfo(profile?.role).name}
                  </p>
                </div>
              </div>
              <p className="text-sm font-mono text-foreground/60 mt-2">
                {getRoleInfo(profile?.role).description}
              </p>
            </div>

            {/* Permissions Preview */}
            <div className="p-4 rounded-lg border border-border bg-background/30">
              <p className="text-xs font-mono text-foreground/50 uppercase mb-3">
                Quyền hạn
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {(() => {
                  const roleInfo = getRoleInfo(profile?.role);
                  const permissions = [
                    { name: "Đọc bài", level: 1 },
                    { name: "Like", level: 2 },
                    { name: "Bình luận", level: 2 },
                    { name: "Đăng bài", level: 3 },
                    { name: "Ghim bài", level: 4 },
                    { name: "Quản trị", level: 5 },
                  ];
                  return permissions.map((perm) => (
                    <div key={perm.name} className="flex items-center gap-1.5">
                      {roleInfo.level >= perm.level ? (
                        <span className="text-primary">✓</span>
                      ) : (
                        <span className="text-foreground/30">✗</span>
                      )}
                      <span
                        className={
                          roleInfo.level >= perm.level
                            ? "text-foreground/80"
                            : "text-foreground/30"
                        }
                      >
                        {perm.name}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section - Only show if has bio */}
        {profile?.bio && (
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-mono text-primary mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Giới thiệu
            </h2>
            <p className="text-foreground/80 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Info Grid - Only show if has data */}
        {(skills.length > 0 || profile?.website || hasSocialLinks) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills - Only show if has skills */}
            {skills.length > 0 && (
              <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold font-mono text-accent mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Kỹ năng & Sở thích
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-accent font-mono text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links - Only show if has website or social links */}
            {(profile?.website || hasSocialLinks) && (
              <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold font-mono text-secondary mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Liên kết
                </h2>
                <div className="space-y-3">
                  {profile?.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors group"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </div>
                      <span className="font-mono text-sm truncate">
                        {profile.website}
                      </span>
                    </a>
                  )}
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground/70 hover:text-foreground transition-colors group"
                    >
                      <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center group-hover:bg-foreground/20 transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </div>
                      <span className="font-mono text-sm">GitHub</span>
                    </a>
                  )}
                  {socialLinks.discord && (
                    <a
                      href={socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground/70 hover:text-[#5865F2] transition-colors group"
                    >
                      <div className="w-8 h-8 bg-[#5865F2]/10 rounded-lg flex items-center justify-center group-hover:bg-[#5865F2]/20 transition-colors">
                        <svg
                          className="w-4 h-4 text-[#5865F2]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                        </svg>
                      </div>
                      <span className="font-mono text-sm">Discord</span>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground/70 hover:text-[#1DA1F2] transition-colors group"
                    >
                      <div className="w-8 h-8 bg-[#1DA1F2]/10 rounded-lg flex items-center justify-center group-hover:bg-[#1DA1F2]/20 transition-colors">
                        <svg
                          className="w-4 h-4 text-[#1DA1F2]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </div>
                      <span className="font-mono text-sm">Twitter</span>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground/70 hover:text-[#1877F2] transition-colors group"
                    >
                      <div className="w-8 h-8 bg-[#1877F2]/10 rounded-lg flex items-center justify-center group-hover:bg-[#1877F2]/20 transition-colors">
                        <svg
                          className="w-4 h-4 text-[#1877F2]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <span className="font-mono text-sm">Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Posts - Only show if has posts */}
        {recentPosts.length > 0 && (
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-mono text-primary mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              Bài viết gần đây
            </h2>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.$id}
                  href="/forum"
                  className="block p-4 bg-background/50 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <h3 className="font-mono font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    {post.title || "Không có tiêu đề"}
                  </h3>
                  <p className="text-xs font-mono text-foreground/40">
                    {formatDate(post.$createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors font-mono text-sm text-foreground/70 hover:text-primary"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại diễn đàn
          </Link>
        </div>
      </div>
    </div>
  );
}
