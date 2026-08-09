'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
}

export default function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
  className,
}: PaginationFooterProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array (with ellipsis if many pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/50 dark:border-white/10 bg-surface-variant/20 dark:bg-slate-950/20 text-xs",
        className
      )}
    >
      {/* Left: Range and total info */}
      <div className="flex items-center gap-3 text-text-secondary font-medium">
        <span>
          Showing <strong className="font-black text-text-primary font-mono">{startItem}</strong> to{' '}
          <strong className="font-black text-text-primary font-mono">{endItem}</strong> of{' '}
          <strong className="font-black text-text-primary font-mono">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-border/40 pl-3">
            <span className="text-[11px]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-surface dark:bg-slate-900 border border-border/60 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-text-primary focus:outline-none"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls & Page numbers */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-border/60 dark:border-white/10 bg-surface/80 dark:bg-slate-900/80 text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center border",
                  currentPage === p
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-surface-variant/40 dark:bg-slate-800/40 border-border/40 text-text-secondary hover:text-text-primary hover:bg-surface-variant/80"
                )}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-text-secondary font-bold">
                {p}
              </span>
            )
          )}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-border/60 dark:border-white/10 bg-surface/80 dark:bg-slate-900/80 text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
