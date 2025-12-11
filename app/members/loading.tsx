export default function MembersLoading() {
  return (
    <main className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center py-8 space-y-4">
          <div className="h-12 bg-surface/40 rounded-lg w-64 mx-auto animate-pulse"></div>
          <div className="h-4 bg-surface/30 rounded w-96 mx-auto animate-pulse"></div>
          <div className="h-3 bg-surface/20 rounded w-32 mx-auto animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-surface/40 border border-border animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10"></div>
                <div className="h-6 w-8 bg-primary/10 rounded"></div>
                <div className="h-3 w-16 bg-foreground/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-16 bg-surface/40 border border-border rounded-xl animate-pulse"></div>

        {/* Members Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-surface/40 border border-border rounded-xl p-5 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-foreground/10 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/10 rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-5 bg-secondary/10 rounded-full w-16"></div>
                <div className="h-5 bg-accent/10 rounded-full w-20"></div>
              </div>
              <div className="h-3 bg-foreground/5 rounded w-full mt-3"></div>
              <div className="h-3 bg-foreground/5 rounded w-2/3 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
