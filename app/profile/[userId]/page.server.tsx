import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { getUserStats, getUserPosts } from "@/lib/actions/profile";
import ProfileClient from "./ProfileClient";

// Force dynamic rendering - Tận dụng VPS mạnh
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;

  // Parallel fetch - Tối ưu cho server
  const [currentUser, profile, stats, recentPosts] = await Promise.all([
    getServerUser(),
    getServerProfile(userId),
    getUserStats(userId),
    getUserPosts(userId, 5),
  ]);

  // Profile not found
  if (!profile) {
    // If user is viewing their own profile but hasn't created one yet
    // Show a different message
    if (currentUser && currentUser.$id === userId) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold font-mono text-foreground mb-2">
              Tạo Profile của bạn
            </h1>
            <p className="text-foreground/60 font-mono mb-6">
              Bạn chưa có profile. Hãy tạo ngay để mọi người biết về bạn!
            </p>
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary font-mono hover:bg-primary/30 transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tạo Profile
            </Link>
          </div>
        </div>
      );
    }

    return notFound();
  }

  const isOwnProfile = currentUser?.$id === userId;

  // Convert server profile to client format
  const profileData = {
    $id: profile.$id,
    $createdAt: profile.$createdAt,
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    avatarType: profile.avatarType as "default" | "custom" | undefined,
    location: profile.location,
    website: profile.website,
    skills: profile.skills,
    socialLinks: profile.socialLinks,
    role: profile.role,
    customTags: profile.customTags,
  };

  return (
    <ProfileClient
      profile={profileData}
      isOwnProfile={isOwnProfile}
      stats={stats}
      recentPosts={
        recentPosts as { $id: string; $createdAt: string; title?: string }[]
      }
    />
  );
}
