import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  darkMode?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, darkMode = false }) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (currentPage <= 2) {
        pages.push(1, 2, 3, "...", totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push("...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages - 1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className={cn(
          "cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30",
          darkMode ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className={cn(
              "w-9 h-9 flex items-center justify-center text-sm",
              darkMode ? "text-gray-500" : "text-gray-400",
            )}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              "cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
              currentPage === p
                ? darkMode
                  ? "bg-blue-500 text-white shadow"
                  : "bg-blue-600 text-white shadow"
                : darkMode
                  ? "text-gray-300 hover:bg-white/10"
                  : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {(p as number) + 1}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        className={cn(
          "cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30",
          darkMode ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100",
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
