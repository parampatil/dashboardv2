// app/dashboard/dashboard1/components/Pagination.tsx
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "...";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handlePageClick = (page: PageItem) => {
    if (page !== "...") {
      onPageChange(page);
    }
  };

  const pages = getPageNumbers();

  if (currentPage === 0 || totalPages === 0) return null;

  return (
    <motion.div
      className="flex items-center justify-center py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav
        className="relative z-0 inline-flex items-center gap-1 p-1 rounded-lg bg-white shadow-lg"
        aria-label="Pagination"
      >
        {/* First/Previous Navigation */}
        <div className="flex gap-1">
          <motion.button
            key="first"
            whileHover={{ scale: 1.05, backgroundColor: "rgb(243 244 246)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween" }}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">First</span>
            <ChevronsLeft className="h-5 w-5" />
          </motion.button>

          <motion.button
            key="previous"
            whileHover={{ scale: 1.05, backgroundColor: "rgb(243 244 246)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween" }}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => (
            <motion.button
              key={`page-${page}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "tween" }}
              onClick={() => handlePageClick(page as PageItem)}
              disabled={page === "..."}
              className={`relative inline-flex items-center justify-center min-w-[2.5rem] h-10 rounded-md text-sm font-medium transition-colors
                    ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${
                page === "..."
                  ? "cursor-default hover:bg-transparent"
                  : "cursor-pointer"
              }`}
            >
              {page}
              {currentPage === page && (
                <motion.div
                  layoutId="activePageIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-md -z-10"
                  transition={{ type: "tween" }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Next/Last Navigation */}
        <div className="flex gap-1">
          <motion.button
            key="next"
            whileHover={{ scale: 1.05, backgroundColor: "rgb(243 244 246)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween" }}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" />
          </motion.button>

          <motion.button
            key="last"
            whileHover={{ scale: 1.05, backgroundColor: "rgb(243 244 246)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween" }}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Last</span>
            <ChevronsRight className="h-5 w-5" />
          </motion.button>
        </div>
      </nav>
    </motion.div>
  );
}
