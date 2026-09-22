import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-3 overflow-hidden bg-white dark:bg-gray-800 animate-pulse flex flex-col justify-between h-[320px]">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="space-y-2 mt-3 px-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton({ count = 8 }) {
  return (
    <div className="flex items-center gap-4 overflow-hidden py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 shrink-0 w-28 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full animate-pulse">
      <div className="bg-gray-100 dark:bg-gray-800 h-12 rounded-t-xl mb-2" />
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
                  c === 0 ? "w-1/3" : "w-1/6"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#161623] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 animate-pulse space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        </div>
      ))}
    </div>
  );
}
