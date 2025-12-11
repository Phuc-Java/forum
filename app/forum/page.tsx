import {
  getPosts,
  getServerUser,
  getServerProfiles,
  getServerProfile,
  type ServerProfile,
} from "@/lib/appwrite/server";
import { PostCard, CreatePostForm } from "@/components";
import type { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Góp Ý | Xóm Nhà Lá",
  description: "Nơi chia sẻ ý kiến và góp ý với cộng đồng Xóm Nhà Lá",
};

// Force dynamic rendering để luôn lấy data mới nhất (SSR)
// Với VPS mạnh, không cần cache - luôn fresh data
export const dynamic = "force-dynamic";

// Revalidate mỗi 0 giây = always fresh (hoặc set số giây nếu muốn ISR)
export const revalidate = 0;

export default async function ForumPage() {
  // Server-side data fetching - Tận dụng sức mạnh VPS
  const [posts, user] = await Promise.all([getPosts(), getServerUser()]);

  // Get current user's profile for permissions check
  const currentUserProfile = user ? await getServerProfile(user.$id) : null;

  // Batch fetch all author profiles (SSR)
  const authorIds = posts.map((p) => p.authorId);
  const profiles = await getServerProfiles(authorIds);

  // Convert Map to serializable object for client components
  const profilesObject: Record<string, ServerProfile> = {};
  profiles.forEach((profile, key) => {
    profilesObject[key] = profile;
  });

  return (
    <main className="min-h-screen bg-background pt-8 pb-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8 relative z-10">
        {/* Header - Enhanced Animation */}
        <div className="text-center py-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-mono animate-fade-in-up">
            <span className="text-primary text-glow-primary animate-glow-pulse">
              {">"}{" "}
            </span>
            <span className="text-foreground">Góp </span>
            <span className="text-secondary text-glow-secondary">Ý</span>
          </h1>
          <p
            className="text-foreground/60 font-mono max-w-2xl mx-auto animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            Nơi chia sẻ những câu chuyện, tâm tư và kết nối với cộng đồng Xóm
            Nhà Lá.
          </p>
          <div
            className="flex items-center justify-center gap-2 text-xs text-accent font-mono animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,159,0.8)]"></span>
            <span>BẢO MẬT • ẨN DANH • AN TOÀN</span>
          </div>
        </div>

        {/* Create Post Form - Pass user and profile from server */}
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <CreatePostForm
            serverUser={user}
            serverProfile={currentUserProfile}
          />
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            <h2 className="text-xl font-bold font-mono text-accent flex items-center gap-2">
              <span className="animate-pulse">{">"}</span> Bài Viết (
              {posts.length})
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-secondary to-transparent"></div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-surface/30 rounded-lg border border-border animate-fade-in-up">
              <div className="text-5xl mb-4 animate-float">📭</div>
              <p className="text-foreground/60 font-mono">
                Chưa có bài viết nào
              </p>
              <p className="text-foreground/40 font-mono text-sm mt-2">
                Hãy là người đầu tiên chia sẻ!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={post.$id}
                  className="animate-fade-in-up opacity-0"
                  style={{
                    animationDelay: `${0.5 + index * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <PostCard
                    post={post}
                    serverUser={user}
                    authorProfile={profilesObject[post.authorId] || null}
                    currentUserProfile={currentUserProfile}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
