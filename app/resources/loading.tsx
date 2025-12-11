export default function ResourcesLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="w-64 min-h-screen bg-surface/50 border-r border-border p-4 hidden md:block">
          <div className="space-y-2">
            <div className="h-8 bg-foreground/10 rounded-lg w-32 mb-4 animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-background/30 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6 md:p-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full animate-pulse"></div>
              <div className="h-10 bg-foreground/10 rounded-lg w-48 animate-pulse"></div>
            </div>
            <div className="h-4 bg-foreground/5 rounded w-64 mt-2 animate-pulse"></div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-surface/60 border border-border rounded-2xl overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="h-40 bg-primary/10"></div>
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-primary/10 rounded-full"></div>
                    <div className="h-5 w-16 bg-secondary/10 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-foreground/10 rounded w-3/4"></div>
                  <div className="h-4 bg-foreground/5 rounded w-full"></div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="w-4 h-4 bg-yellow-500/20 rounded"
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border/50">
                    <div className="h-4 w-24 bg-foreground/10 rounded"></div>
                    <div className="h-4 w-20 bg-foreground/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
