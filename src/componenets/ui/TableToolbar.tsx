type SortKey = '-createdAt' | 'createdAt' | '-priority' | 'priority' | '-dueDate' | 'dueDate';

type Props = {
  status: string;
  sort: SortKey;
  onStatusChange: (s: string) => void;
  onSortChange: (s: SortKey) => void;
  rightSlot?: React.ReactNode; // e.g., Add Task button
};

export default function TableToolbar({
  status, sort, onStatusChange, onSortChange, rightSlot
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        <select
          className="border rounded px-3 py-2 text-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter status"
        >
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          aria-label="Sort"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-priority">Priority ↓</option>
          <option value="priority">Priority ↑</option>
          <option value="-dueDate">Due date ↓</option>
          <option value="dueDate">Due date ↑</option>
        </select>
      </div>

      {rightSlot}
    </div>
  );
}
