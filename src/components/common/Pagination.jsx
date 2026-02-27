export default function Pagination({ page, pages, total, limit, onPage }) {
  if (!pages || pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPageNums = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums = new Set([1, pages, page]);
    for (let i = Math.max(2, page - 2); i <= Math.min(pages - 1, page + 2); i++) nums.add(i);
    return Array.from(nums).sort((a, b) => a - b);
  };

  const pageNums = getPageNums();

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
      <p className="text-sm text-gray-500 dark:text-slate-400">
        Showing <span className="font-medium text-gray-700 dark:text-slate-200">{from}–{to}</span>{' '}
        of <span className="font-medium text-gray-700 dark:text-slate-200">{total}</span> records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="btn btn-secondary btn-sm disabled:opacity-40"
        >
          ‹ Prev
        </button>
        {pageNums.map((num, idx) => {
          const prev = pageNums[idx - 1];
          return (
            <span key={num} className="flex items-center gap-1">
              {prev && num - prev > 1 && (
                <span className="text-gray-400 dark:text-slate-500 px-1">…</span>
              )}
              <button
                onClick={() => onPage(num)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  num === page
                    ? 'bg-brand-gold text-white'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            </span>
          );
        })}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
          className="btn btn-secondary btn-sm disabled:opacity-40"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
