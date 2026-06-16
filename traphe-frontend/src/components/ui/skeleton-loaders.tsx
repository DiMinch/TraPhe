
interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton shimmer element.
 * Apply width/height via className.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

/**
 * Table row skeleton — mimics a data table row with N columns.
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Card skeleton — mimics a product/item card.
 */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product grid skeleton — mimics the POS product grid.
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Dashboard stat card skeleton.
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * Full page skeleton — for route-level lazy loading.
 */
export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Skeleton className="h-9 w-64 rounded-lg" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Premium warm-toned skeleton shimmer element for customer interface.
 * Uses soft honey, caramel, and cream tones.
 */
export function ClientSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-amber-100/40 via-orange-50/50 to-amber-100/40 rounded-xl ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

/**
 * Customer product card skeleton matching client site theme.
 */
export function ClientProductCardSkeleton() {
  return (
    <div className="bg-[#FBF5EC] rounded-2xl p-4 border border-[#F5EAD8]/40 shadow-xs flex flex-col justify-between h-[360px] animate-pulse">
      <div className="space-y-4">
        {/* Product Image Placeholder */}
        <ClientSkeleton className="h-[200px] w-full rounded-xl" />
        {/* Category & Title */}
        <div className="space-y-2">
          <ClientSkeleton className="h-3 w-1/4 rounded-full" />
          <ClientSkeleton className="h-5 w-3/4 rounded-full" />
        </div>
      </div>
      {/* Price & Action Button */}
      <div className="flex justify-between items-center pt-2">
        <ClientSkeleton className="h-5 w-1/3 rounded-full" />
        <ClientSkeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid of customer product cards.
 */
export function ClientProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ClientProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Customer side Shop/Menu main page skeleton.
 */
export function ClientPageSkeleton() {
  return (
    <div className="bg-[#FAF6F0] min-h-screen pb-16">
      {/* Page Hero Header Skeleton */}
      <section className="text-center pt-16 pb-12 px-6 max-w-2xl mx-auto space-y-4">
        <ClientSkeleton className="h-12 w-3/4 mx-auto rounded-full" />
        <ClientSkeleton className="h-4 w-full mx-auto rounded-full" />
        <ClientSkeleton className="h-4 w-5/6 mx-auto rounded-full" />
      </section>

      {/* Search Bar Skeleton */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-[#FBF5EC] p-4 rounded-2xl border border-[#F5EAD8]/40 shadow-xs">
          <ClientSkeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        {/* Filter Section Skeleton */}
        <div className="w-full lg:w-64 shrink-0 bg-[#FBF5EC] p-6 rounded-2xl border border-[#F5EAD8]/40 h-[400px] space-y-6">
          <ClientSkeleton className="h-6 w-1/2 rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <ClientSkeleton className="h-4 w-2/3 rounded-full" />
                <ClientSkeleton className="h-4 w-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#F5EAD8]/25">
            <ClientSkeleton className="h-6 w-1/3 rounded-full" />
            <div className="flex gap-2">
              <ClientSkeleton className="h-8 w-24 rounded-full" />
              <ClientSkeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
          <ClientProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}

/**
 * Customer product detail page skeleton.
 */
export function ClientProductDetailSkeleton() {
  return (
    <div className="bg-[#FAF6F0] min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Image */}
        <div className="flex flex-col space-y-4">
          <ClientSkeleton className="w-full aspect-square rounded-3xl" />
          <div className="flex gap-4">
            <ClientSkeleton className="w-20 h-20 rounded-xl" />
            <ClientSkeleton className="w-20 h-20 rounded-xl" />
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <ClientSkeleton className="h-4 w-1/4 rounded-full" />
            <ClientSkeleton className="h-10 w-3/4 rounded-full" />
            <ClientSkeleton className="h-6 w-1/3 rounded-full" />
          </div>

          <div className="space-y-3">
            <ClientSkeleton className="h-4 w-full rounded-full" />
            <ClientSkeleton className="h-4 w-full rounded-full" />
            <ClientSkeleton className="h-4 w-5/6 rounded-full" />
          </div>

          {/* Configuration selections (Size, Sugar, Ice) */}
          <div className="space-y-6 pt-4 border-t border-[#F5EAD8]/30">
            <div className="space-y-3">
              <ClientSkeleton className="h-5 w-20 rounded-full" />
              <div className="flex gap-3">
                <ClientSkeleton className="h-10 w-16 rounded-full" />
                <ClientSkeleton className="h-10 w-16 rounded-full" />
                <ClientSkeleton className="h-10 w-16 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <ClientSkeleton className="h-5 w-24 rounded-full" />
              <div className="flex gap-3">
                <ClientSkeleton className="h-10 w-24 rounded-full" />
                <ClientSkeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex gap-4 pt-6 border-t border-[#F5EAD8]/30">
            <ClientSkeleton className="h-12 w-28 rounded-full" />
            <ClientSkeleton className="h-12 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Customer branches location list skeleton.
 */
export function ClientBranchesSkeleton() {
  return (
    <div className="bg-[#FAF6F0] min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <ClientSkeleton className="h-10 w-1/2 mx-auto rounded-full" />
          <ClientSkeleton className="h-4 w-full mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* List of locations */}
          <div className="md:col-span-1 space-y-4 h-[600px] overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#FBF5EC] p-5 rounded-2xl border border-[#F5EAD8]/40 space-y-3">
                <ClientSkeleton className="h-6 w-3/4 rounded-full" />
                <ClientSkeleton className="h-4 w-full rounded-full" />
                <ClientSkeleton className="h-4 w-1/2 rounded-full" />
                <div className="flex gap-2 pt-2">
                  <ClientSkeleton className="h-8 w-20 rounded-full" />
                  <ClientSkeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="md:col-span-2 h-[600px]">
            <ClientSkeleton className="w-full h-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
