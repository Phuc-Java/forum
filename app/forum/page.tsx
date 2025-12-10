import {
  getPosts,
  getServerUser,
  getServerProfiles,
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

  // Batch fetch all author profiles (SSR)
  const authorIds = posts.map((p) => p.authorId);
  const profiles = await getServerProfiles(authorIds);

  // Convert Map to serializable object for client components
  const profilesObject: Record<string, ServerProfile> = {};
  profiles.forEach((profile, key) => {
    profilesObject[key] = profile;
  });

  return (
    <main className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-mono">
            <span className="text-primary text-glow-primary">{">"} </span>
            <span className="text-foreground">Góp </span>
            <span className="text-secondary text-glow-secondary">Ý</span>
          </h1>
          <p className="text-foreground/60 font-mono max-w-2xl mx-auto">
            Nơi chia sẻ những câu chuyện, tâm tư và kết nối với cộng đồng Xóm
            Nhà Lá.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-accent font-mono">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span>BẢO MẬT • ẨN DANH • AN TOÀN</span>
          </div>
        </div>

        {/* Create Post Form - Pass user from server */}
        <CreatePostForm serverUser={user} />

        {/* Posts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            <h2 className="text-xl font-bold font-mono text-accent">
              {">"} Bài Viết ({posts.length})
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-secondary to-transparent"></div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-surface/30 rounded-lg border border-border">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-foreground/60 font-mono">
                Chưa có bài viết nào
              </p>
              <p className="text-foreground/40 font-mono text-sm mt-2">
                Hãy là người đầu tiên chia sẻ!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.$id}
                  post={post}
                  serverUser={user}
                  authorProfile={profilesObject[post.authorId] || null}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
