export default function ForumLoading() {
  return (
    <main className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center py-8 space-y-4">
          <div className="h-12 w-48 bg-surface/50 rounded-lg mx-auto animate-pulse"></div>
          <div className="h-4 w-96 max-w-full bg-surface/30 rounded mx-auto animate-pulse"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-surface/40 backdrop-blur-md border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface/50 animate-pulse"></div>
            <div className="h-4 w-32 bg-surface/50 rounded animate-pulse"></div>
          </div>
          <div className="h-10 bg-surface/30 rounded-lg animate-pulse"></div>
          <div className="h-24 bg-surface/30 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-primary/20 rounded-lg animate-pulse"></div>
        </div>

        {/* Posts Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/50"></div>
            <div className="h-6 w-32 bg-surface/50 rounded animate-pulse"></div>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface/40 border border-border rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface/50 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-surface/50 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-surface/30 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 w-3/4 bg-surface/50 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-surface/30 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-surface/30 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-border/50">
                <div className="h-8 w-20 bg-surface/30 rounded-lg animate-pulse"></div>
                <div className="h-8 w-24 bg-surface/30 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
