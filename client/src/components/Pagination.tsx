import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  limit = 5,
  onLimitChange,
}) => {
  const getPageNumbers = (): (number | string)[] => {
    const visiblePages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
    } else {
      visiblePages.push(1);
      if (currentPage > 4) visiblePages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) visiblePages.push(i);

      if (currentPage < totalPages - 3) visiblePages.push("...");
      visiblePages.push(totalPages);
    }

    return visiblePages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      {/* Limit Selector */}
      {onLimitChange && (
        <div className="flex items-center gap-1">
          <label htmlFor="item-limit" className="text-sm text-gray-700">Limit:</label>
          <select
            id="item-limit"
            className="px-2 py-1 rounded border border-gray-400 bg-white text-gray-900 focus:outline-none"
            style={{ minWidth: '56px' }}
            value={limit}
            onChange={e => onLimitChange(Number(e.target.value))}
          >
            {[3, 5, 10, 15, 20, 25, 50].map(opt => (
              <option value={opt} key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => onPageChange(Number(page))}
            >
              {page}
            </button>
          )
        )}

        <button
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
