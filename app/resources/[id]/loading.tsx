export default function ResourceDetailLoading() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-foreground/10 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-foreground/10 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse"></div>
        </div>

        {/* Header */}
        <div className="bg-surface/60 border border-border rounded-2xl p-6 md:p-8 space-y-4 animate-pulse">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-primary/10 rounded-full"></div>
            <div className="h-6 w-24 bg-secondary/10 rounded-full"></div>
          </div>
          <div className="h-10 bg-foreground/10 rounded w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-secondary/10 rounded-full"></div>
            <div className="h-6 w-16 bg-secondary/10 rounded-full"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-foreground/10 rounded"></div>
            <div className="h-4 w-32 bg-foreground/10 rounded"></div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="h-64 md:h-96 bg-surface/60 border border-border rounded-2xl animate-pulse"></div>

        {/* Content */}
        <div className="bg-surface/60 border border-border rounded-2xl p-6 md:p-8 space-y-4 animate-pulse">
          <div className="h-4 bg-foreground/10 rounded w-full"></div>
          <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
          <div className="h-4 bg-foreground/10 rounded w-4/5"></div>
          <div className="h-4 bg-foreground/10 rounded w-full"></div>
          <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
          <div className="h-20"></div>
          <div className="h-4 bg-foreground/10 rounded w-full"></div>
          <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-4 bg-surface/60 border border-border rounded-2xl animate-pulse">
          <div className="h-10 w-20 bg-foreground/10 rounded-lg"></div>
          <div className="h-10 w-20 bg-foreground/10 rounded-lg"></div>
          <div className="flex-1"></div>
          <div className="h-10 w-24 bg-foreground/10 rounded-lg"></div>
        </div>

        {/* Comments */}
        <div className="bg-surface/60 border border-border rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 w-40 bg-foreground/10 rounded"></div>
          <div className="h-24 bg-background/50 rounded-xl"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-background/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
