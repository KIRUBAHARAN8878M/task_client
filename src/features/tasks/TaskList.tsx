import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchTasks, updateTask, deleteTask, type Task } from './taskSlice';
import { Toast } from '../../componenets/Toast';

const PAGE_LIMIT = 10;

export default function TaskList() {
  const d = useAppDispatch();
  const { items, loading, total, error } = useAppSelector((s) => s.tasks as any);
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<string>('-createdAt');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Keep an AbortController to cancel previous fetch when filters change fast
  const abortRef = useRef<AbortController | null>(null);

  // Reset to page 1 when filters/sort change
  useEffect(() => { setPage(1); }, [status, sort]);

  useEffect(() => {
    // Cancel previous fetch
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    d(
      fetchTasks({
        status,
        sort,
        page,
        limit: PAGE_LIMIT
      }) as any
    )
      .unwrap?.()
      .catch((e: any) => {
        if (e?.name !== 'AbortError') setToast(e?.message || 'Failed to load tasks');
      });

    return () => controller.abort();
  }, [status, sort, page, d]);

  const maxPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / PAGE_LIMIT)),
    [total]
  );

  const toggleDone = async (t: Task) => {
    try {
      setBusyId(t._id);
      await d(
        updateTask({
          id: t._id,
          body: { status: t.status === 'done' ? 'inprogress' : 'done' }
        }) as any
      ).unwrap?.();
    } catch (e: any) {
      setToast(e?.message || 'Failed to update task');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    try {
      setBusyId(id);
      await d(deleteTask(id) as any).unwrap?.();
      setToast('Task deleted');
    } catch (e: any) {
      setToast(e?.message || 'Failed to delete task');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-priority">Priority desc</option>
          <option value="priority">Priority asc</option>
        </select>
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-2">
          <p>Loading…</p>
          {/* simple skeleton lines */}
          <div className="animate-pulse h-12 bg-gray-100 rounded" />
          <div className="animate-pulse h-12 bg-gray-100 rounded" />
          <div className="animate-pulse h-12 bg-gray-100 rounded" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="border rounded p-6 text-center text-gray-600">
          No tasks found. Try changing filters or create your first task.
        </div>
      )}

      {items.length > 0 && (
        <ul className="divide-y border rounded">
          {items.map((t) => (
            <li key={t._id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="capitalize">{t.priority}</span>
                  <span>•</span>
                  <span className="capitalize">{t.status}</span>
                  {t.dueDate && (
                    <>
                      <span>•</span>
                      <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-sm"
                  disabled={busyId === t._id}
                  onClick={() => toggleDone(t)}
                >
                  {t.status === 'done' ? 'Reopen' : 'Done'}
                </button>
                <button
                  className="btn-sm"
                  disabled={busyId === t._id}
                  onClick={() => remove(t._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <button
          className="btn-sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} / {maxPages}
        </span>
        <button
          className="btn-sm"
          disabled={page >= maxPages}
          onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
        >
          Next
        </button>
        <span className="text-sm ml-auto">{total} total</span>
      </div>

      {(toast || error) && (
        <Toast
          message={toast || error}
          onClose={() => setToast(undefined)}
        />
      )}
    </div>
  );
}
