import Button from './Button';

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
  page, pageSize, total,
  onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 20, 50]
}: Props) {
  const maxPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const goto = (p: number) => onPageChange(Math.min(maxPages, Math.max(1, p)));

  const pagesToShow = (() => {
    const arr: number[] = [];
    const left = Math.max(1, page - 2);
    const right = Math.min(maxPages, page + 2);
    for (let i = left; i <= right; i++) arr.push(i);
    return arr;
  })();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of <span className="font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
             className="border rounded px-3 py-1 text-sm bg-white text-gray-900 border-gray-300
             dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Page size"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        )}

        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => goto(1)}>{'«'}</Button>
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => goto(page - 1)}>{'‹'}</Button>

        <div className="flex items-center gap-1">
          {pagesToShow.map((p) => (
            <button
              key={p}
              className={`h-8 min-w-8 px-2 rounded text-sm ${p === page ? 'bg-black text-white' : 'border hover:bg-gray-50'}`}
              onClick={() => goto(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>

        <Button size="sm" variant="secondary" disabled={page >= maxPages} onClick={() => goto(page + 1)}>{'›'}</Button>
        <Button size="sm" variant="secondary" disabled={page >= maxPages} onClick={() => goto(maxPages)}>{'»'}</Button>
      </div>
    </div>
  );
}
