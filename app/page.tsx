"use client";

import { useEffect, useState } from "react";
import { ID, Query } from "appwrite";
import Navbar from "@/components/Navbar";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import { databases, DATABASE_ID, COLLECTION_ID } from "@/lib/appwrite";

interface Post {
  $id: string;
  title: string;
  content: string;
  $createdAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from Appwrite
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(50)]
      );

      setPosts(response.documents as unknown as Post[]);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      setError(
        "Failed to load transmissions. Please check your Appwrite configuration."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new post
  const handleCreatePost = async (postData: {
    title: string;
    content: string;
  }) => {
    try {
      const newPost = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          title: postData.title,
          content: postData.content,
        }
      );

      // Prepend new post to the list for instant feedback
      setPosts([newPost as unknown as Post, ...posts]);

      console.log("✅ Post broadcasted successfully!");
    } catch (err) {
      console.error("❌ Error creating post:", err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12 space-y-4">
          <h1 className="text-5xl font-bold font-mono">
            <span className="text-primary text-glow-primary">{">"} </span>
            <span className="text-foreground">Welcome to the </span>
            <span className="text-secondary text-glow-secondary">Network</span>
          </h1>
          <p className="text-foreground/60 font-mono max-w-2xl mx-auto">
            A decentralized communication hub for hackers, makers, and digital
            nomads. Broadcast your thoughts securely to the network.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-accent font-mono">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>ENCRYPTED • ANONYMOUS • DECENTRALIZED</span>
          </div>
        </div>

        {/* Create Post Form */}
        <CreatePostForm onPostCreated={handleCreatePost} />

        {/* Posts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            <h2 className="text-2xl font-bold font-mono text-accent">
              {">"} Recent Transmissions
              {!isLoading && posts.length > 0 && (
                <span className="text-sm text-foreground/40 ml-2">
                  ({posts.length})
                </span>
              )}
            </h2>
            <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-secondary to-transparent"></div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-danger/10 border-2 border-danger rounded-lg p-6 text-center">
              <p className="text-danger font-mono text-lg mb-2">
                ⚠️ CONNECTION ERROR
              </p>
              <p className="text-foreground/60 text-sm font-mono mb-4">
                {error}
              </p>
              <button
                onClick={fetchPosts}
                className="px-6 py-2 bg-danger text-background font-mono font-bold rounded hover:bg-danger/80 transition-colors"
              >
                {">"} Retry Connection
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-6 animate-pulse"
                >
                  <div className="h-6 bg-foreground/10 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-foreground/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          )}

          {/* Posts List */}
          {!isLoading && !error && posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.$id}
                  title={post.title}
                  content={post.content}
                  createdAt={post.$createdAt}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && posts.length === 0 && (
            <div className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-2xl font-bold text-primary font-mono mb-2">
                No Transmissions Found
              </h3>
              <p className="text-foreground/60 font-mono">
                Be the first to broadcast a message to the network!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-foreground/40 font-mono text-sm border-t border-border/50">
          <p>© 2025 HackerForum • Powered by Next.js 16 & Appwrite</p>
          <p className="text-xs mt-2 text-accent">
            Stay Anonymous • Stay Secure • Stay Connected
          </p>
        </footer>
      </main>
    </div>
  );
}
