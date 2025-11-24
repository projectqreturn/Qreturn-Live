"use client";

export default function PostPageNav({ page, totalPages, setPage }) {
  return (
    <div className="flex justify-center mt-6 space-x-2">
      {/* Prev button */}
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-700"
      >
        Prev
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-3 py-1 border rounded ${
            page === i + 1 ? "bg-gray-800 text-white" : ""
          }`}
        >
          {i + 1}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-700"
      >
        Next
      </button>
    </div>
  );
}
