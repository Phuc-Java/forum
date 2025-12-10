"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getCurrentUser,
  getProfileByUserIdClient,
  updateProfileClient,
  createProfileClient,
  type ProfileData,
} from "@/lib/appwrite/client";
import { type SocialLinks } from "@/lib/actions/profile";
import { DEFAULT_AVATARS } from "@/lib/appwrite/config";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    $id: string;
    name: string;
    email: string;
  } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [skills, setSkills] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("default.jpg");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Social links
  const [github, setGithub] = useState("");
  const [discord, setDiscord] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Try to get existing profile using client-side function
      let existingProfile = await getProfileByUserIdClient(currentUser.$id);

      // If no profile exists, create one using client-side function
      if (!existingProfile) {
        const result = await createProfileClient(
          currentUser.$id,
          currentUser.name || currentUser.email.split("@")[0]
        );
        if (result.success && result.profile) {
          existingProfile = result.profile;
        }
      }

      if (existingProfile) {
        setProfile(existingProfile);
        // Use displayName from profile, fallback to user name
        setDisplayName(existingProfile.displayName || currentUser.name || "");
        setBio(existingProfile.bio || "");
        setLocation(existingProfile.location || "");
        setWebsite(existingProfile.website || "");
        setSkills(existingProfile.skills || "");
        setAvatarUrl(existingProfile.avatarUrl || "default.jpg");

        // Parse social links
        if (existingProfile.socialLinks) {
          try {
            const links: SocialLinks = JSON.parse(existingProfile.socialLinks);
            setGithub(links.github || "");
            setDiscord(links.discord || "");
            setTwitter(links.twitter || "");
            setFacebook(links.facebook || "");
          } catch {
            // Invalid JSON, ignore
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    setError("");
    setSuccess("");

    // Build social links JSON
    const socialLinks: SocialLinks = {};
    if (github) socialLinks.github = github;
    if (discord) socialLinks.discord = discord;
    if (twitter) socialLinks.twitter = twitter;
    if (facebook) socialLinks.facebook = facebook;

    // Use client-side update function
    const result = await updateProfileClient(profile.$id, {
      displayName: displayName || user.name || "Ẩn Danh",
      bio: bio || null,
      avatarType: "default",
      avatarUrl: avatarUrl,
      location: location || null,
      website: website || null,
      socialLinks:
        Object.keys(socialLinks).length > 0
          ? JSON.stringify(socialLinks)
          : null,
      skills: skills || null,
    });

    if (result.success) {
      setSuccess("Đã lưu thông tin thành công!");
      setProfile(result.profile!);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Có lỗi xảy ra");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-foreground/60">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono text-foreground">
              <span className="text-primary">Chỉnh sửa</span> Profile
            </h1>
            <p className="text-sm font-mono text-foreground/60 mt-1">
              Cập nhật thông tin cá nhân của bạn
            </p>
          </div>
          <Link
            href={`/profile/${user?.$id}`}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors font-mono text-sm"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Xem Profile
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-lg">
            <p className="text-danger font-mono text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-primary font-mono text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-mono text-primary mb-4">
              Ảnh đại diện
            </h2>

            <div className="flex items-center gap-6">
              {/* Current Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/50 overflow-hidden bg-surface shadow-[0_0_20px_rgba(0,255,159,0.2)]">
                  <Image
                    src={`/avatars/${avatarUrl}`}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Change Avatar Button */}
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary font-mono text-sm hover:bg-primary/20 transition-colors"
                >
                  {showAvatarPicker ? "Đóng" : "Chọn Avatar"}
                </button>
                <p className="text-xs font-mono text-foreground/40 mt-2">
                  Chọn từ bộ sưu tập avatar có sẵn
                </p>
              </div>
            </div>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <div className="mt-6 p-4 bg-background/50 border border-border rounded-lg">
                <p className="text-sm font-mono text-foreground/60 mb-4">
                  Chọn avatar:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {DEFAULT_AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(avatar);
                        setShowAvatarPicker(false);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        avatarUrl === avatar
                          ? "border-primary shadow-[0_0_15px_rgba(0,255,159,0.5)]"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={`/avatars/${avatar}`}
                        alt={avatar}
                        fill
                        className="object-cover"
                      />
                      {avatarUrl === avatar && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-mono text-primary mb-4">
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2">
                  Tên hiển thị <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={100}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Nhập tên hiển thị"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                />
                <p className="text-xs font-mono text-foreground/40 mt-1 text-right">
                  {bio.length}/500
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="VD: Hà Nội, Việt Nam"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2">
                  Kỹ năng & Sở thích
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="VD: JavaScript, React, Gaming (cách nhau bởi dấu phẩy)"
                />
                <p className="text-xs font-mono text-foreground/40 mt-1">
                  Phân cách các mục bằng dấu phẩy
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-mono text-secondary mb-4">
              Liên kết
            </h2>

            <div className="space-y-4">
              {/* Website */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="https://your-website.com"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="https://github.com/username"
                />
              </div>

              {/* Discord */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#5865F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Discord
                </label>
                <input
                  type="url"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="https://discord.gg/invite"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#1DA1F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="https://twitter.com/username"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-mono text-foreground/80 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#1877F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-xl text-primary font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,255,159,0.3)]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  Đang lưu...
                </span>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
            <Link
              href="/forum"
              className="px-8 py-4 bg-surface border border-border rounded-xl text-foreground/70 font-mono hover:border-danger/50 hover:text-danger transition-colors"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
