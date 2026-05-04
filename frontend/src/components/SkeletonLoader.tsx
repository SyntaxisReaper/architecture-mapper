export function SkeletonLoader() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header skeleton */}
      <div className="card space-y-3">
        <div className="skeleton h-7 w-48 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Layer cards skeleton */}
      <div>
        <div className="skeleton h-4 w-36 rounded-lg mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-12 rounded-full" />
                <div className="skeleton h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-5/6 rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack skeleton */}
      <div className="card space-y-3">
        <div className="skeleton h-4 w-28 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
