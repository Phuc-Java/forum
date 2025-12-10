export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section Skeleton */}
        <div className="relative">
          <div className="h-48 bg-surface/30 rounded-2xl animate-pulse"></div>
          <div className="relative -mt-20 mx-4 sm:mx-8">
            <div className="bg-surface/50 border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar Skeleton */}
                <div className="w-32 h-32 rounded-full bg-surface/50 animate-pulse"></div>

                {/* Info Skeleton */}
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div className="h-8 w-48 bg-surface/50 rounded animate-pulse mx-auto sm:mx-0"></div>
                  <div className="h-4 w-32 bg-surface/30 rounded animate-pulse mx-auto sm:mx-0"></div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="h-10 w-28 bg-surface/30 rounded-lg animate-pulse"></div>
                    <div className="h-10 w-32 bg-surface/30 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="bg-surface/40 border border-border rounded-xl p-6 space-y-4">
          <div className="h-6 w-32 bg-surface/50 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface/30 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-surface/30 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-surface/30 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
