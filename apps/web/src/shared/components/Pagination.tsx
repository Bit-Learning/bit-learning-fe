import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
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
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="w-10 h-10 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 font-bold rounded-lg transition-all ${
              isActive
                ? "bg-blue-700 text-white shadow-sm"
                : "border border-gray-200 text-gray-600 font-medium hover:border-blue-700 hover:text-blue-700"
            }`}
          >
            {pageNum + 1}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="w-10 h-10 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
