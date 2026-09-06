export function PortalPageSkeleton() {
  return (
    <div className="min-h-[50vh] px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-[#e5e7eb]" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#f3f4f6]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-[#e5e7eb] bg-white"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-xl border border-[#e5e7eb] bg-white" />
          <div className="h-56 animate-pulse rounded-xl border border-[#e5e7eb] bg-white" style={{ animationDelay: "100ms" }} />
        </div>
        <div className="h-40 animate-pulse rounded-xl border border-[#e5e7eb] bg-white" style={{ animationDelay: "160ms" }} />
      </div>
    </div>
  );
}
