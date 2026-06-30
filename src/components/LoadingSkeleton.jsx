import React from 'react';

const SkeletonBlock = ({ className = '' }) => (
  <div className={`bg-[#1A1A2E] rounded animate-pulse ${className}`} />
);

const TableSkeleton = ({ rows = 5, cols = 3 }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-white/5">
    {/* Header */}
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#1A1A2E]/50">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="flex-1"
          style={{ flexBasis: i === 0 ? '40%' : `${60 / (cols - 1)}%` }}
        >
          <SkeletonBlock className="h-3 w-3/4" />
        </div>
      ))}
      <SkeletonBlock className="h-3 w-16 flex-shrink-0" />
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
        style={{ animationDelay: `${rowIdx * 80}ms` }}
      >
        {/* First col with avatar */}
        <div className="flex items-center gap-3 flex-[2]">
          <SkeletonBlock className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-2.5 w-1/2" />
          </div>
        </div>

        {/* Middle cols */}
        {Array.from({ length: cols - 1 }).map((_, colIdx) => (
          <div key={colIdx} className="flex-1">
            <SkeletonBlock
              className={`h-3 ${colIdx % 2 === 0 ? 'w-2/3' : 'w-1/2'}`}
            />
          </div>
        ))}

        {/* Action col */}
        <div className="flex gap-2 flex-shrink-0">
          <SkeletonBlock className="h-7 w-7 rounded-lg" />
          <SkeletonBlock className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    ))}

    {/* Footer pagination */}
    <div className="flex items-center justify-between px-6 py-4 bg-[#1A1A2E]/30">
      <SkeletonBlock className="h-3 w-32" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-8 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const CardsSkeleton = ({ rows = 5, cols = 3 }) => {
  const total = rows * cols;
  return (
    <div
      className="grid gap-4 sm:gap-5"
      style={{
        gridTemplateColumns: `repeat(${Math.min(cols, 12)}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#1A1A2E] rounded-2xl border border-white/5 p-5 flex flex-col gap-4 animate-pulse"
          style={{ animationDelay: `${(idx % cols) * 60 + Math.floor(idx / cols) * 40}ms` }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl bg-[#6C63FF]/20" />
              <div className="flex flex-col gap-1.5">
                <SkeletonBlock className="h-3 w-24 bg-white/10" />
                <SkeletonBlock className="h-2.5 w-16 bg-white/[0.06]" />
              </div>
            </div>
            <SkeletonBlock className="h-6 w-14 rounded-full bg-[#00D4AA]/10" />
          </div>

          {/* Metric */}
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-7 w-2/3 bg-white/10" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-2.5 w-12 rounded-full bg-[#00D4AA]/10" />
              <SkeletonBlock className="h-2.5 w-20 bg-white/[0.06]" />
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="h-16 rounded-xl bg-[#0A0A0F] flex items-end gap-1 px-2 pb-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className="flex-1 rounded-sm bg-[#6C63FF]/15"
                style={{ height: `${30 + Math.sin(i * 0.8) * 25}%` }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <SkeletonBlock className="h-2.5 w-24 bg-white/[0.06]" />
            <SkeletonBlock className="h-2.5 w-12 bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ListSkeleton = ({ rows = 5 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        className="flex items-center gap-4 px-4 py-3.5 bg-[#1A1A2E] rounded-xl border border-white/5 animate-pulse"
        style={{ animationDelay: `${idx * 70}ms` }}
      >
        {/* Left icon/avatar */}
        <div className="relative flex-shrink-0">
          <SkeletonBlock className="h-11 w-11 rounded-full bg-white/[0.08]" />
          <SkeletonBlock className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#0A0A0F] bg-[#00D4AA]/20" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-3 w-32 sm:w-40 bg-white/10" />
            <SkeletonBlock className="h-2.5 w-16 rounded-full bg-[#6C63FF]/15" />
          </div>
          <SkeletonBlock className="h-2.5 w-full max-w-xs bg-white/[0.06]" />
        </div>

        {/* Right meta */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <SkeletonBlock className="h-2.5 w-14 bg-white/[0.06]" />
          <SkeletonBlock className="h-5 w-5 rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    ))}

    {/* Load more */}
    <div className="flex justify-center pt-2">
      <SkeletonBlock className="h-9 w-28 rounded-xl animate-pulse" />
    </div>
  </div>
);

const LoadingSkeleton = ({
  rows = 5,
  cols = 3,
  type = 'table',
  className = '',
  title = false,
  subtitle = false,
  toolbar = false,
}) => {
  return (
    <div
      className={`w-full bg-[#0A0A0F] min-h-screen p-4 sm:p-6 ${className}`}
    >
      {/* Optional page header */}
      {(title || subtitle || toolbar) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-2">
            {title && (
              <SkeletonBlock className="h-6 w-48 sm:w-64 animate-pulse" />
            )}
            {subtitle && (
              <SkeletonBlock className="h-3.5 w-64 sm:w-96 animate-pulse" />
            )}
          </div>
          {toolbar && (
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-9 w-36 rounded-xl animate-pulse" />
              <SkeletonBlock className="h-9 w-9 rounded-xl animate-pulse" />
              <SkeletonBlock className="h-9 w-24 rounded-xl animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Type variants */}
      {type === 'table' && <TableSkeleton rows={rows} cols={cols} />}
      {type === 'cards' && <CardsSkeleton rows={rows} cols={cols} />}
      {type === 'list' && <ListSkeleton rows={rows} />}
    </div>
  );
};

export default LoadingSkeleton;