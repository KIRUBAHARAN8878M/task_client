import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchTasks, updateTask, deleteTask, type Task } from "./taskSlice";
import { listUsers, type UserLite } from "../users/usersApi";
import { Toast } from "../../componenets/Toast";               
import TableToolbar from "../../componenets/ui/TableToolbar";   
import Pagination from "../../componenets/ui/Pagination";       

type SortKey =
  | "-createdAt"
  | "createdAt"
  | "-priority"
  | "priority"
  | "-dueDate"
  | "dueDate";

const DEFAULTS = {
  status: "",
  sort: "-createdAt" as SortKey,
  page: 1,
  limit: 10,
};

function getNum(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function getSort(v: string | null, fallback: SortKey): SortKey {
  const allowed: SortKey[] = [
    "-createdAt",
    "createdAt",
    "-priority",
    "priority",
    "-dueDate",
    "dueDate",
  ];
  return allowed.includes(v as SortKey) ? (v as SortKey) : fallback;
}

export default function TaskTable() {
  const d = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.tasks as any);
  const role = useAppSelector((s) => s.auth.user?.role);
  const meId = useAppSelector((s) => s.auth.user?.id);

  // URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();

  // Local view state mirrors URL for controlled fields
  const [status, setStatus] = useState<string>(
    searchParams.get("status") ?? DEFAULTS.status
  );
  const [sort, setSort] = useState<SortKey>(
    getSort(searchParams.get("sort"), DEFAULTS.sort)
  );
  const [page, setPage] = useState<number>(
    getNum(searchParams.get("page"), DEFAULTS.page)
  );
  const [limit, setLimit] = useState<number>(
    getNum(searchParams.get("limit"), DEFAULTS.limit)
  );

  // Keep local state in sync when URL changes (back/forward, direct edits)
  useEffect(() => {
    setStatus(searchParams.get("status") ?? DEFAULTS.status);
    setSort(getSort(searchParams.get("sort"), DEFAULTS.sort));
    setPage(getNum(searchParams.get("page"), DEFAULTS.page));
    setLimit(getNum(searchParams.get("limit"), DEFAULTS.limit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Users for Assignee select (admin only)
  const [users, setUsers] = useState<UserLite[]>([]);
  const [toast, setToast] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (role === "admin") {
      listUsers()
        .then(setUsers)
        .catch((e) => setToast(e?.message || "Failed to load users"));
    } else {
      setUsers([]);
    }
  }, [role]);

  // Fetch whenever URL-derived state changes
  useEffect(() => {
    (d(fetchTasks({ status, sort, page, limit })) as any)
      .unwrap?.()
      .catch((e: any) => setToast(e?.message || "Failed to load tasks"));
  }, [d, status, sort, page, limit]);

  // Update URL helper (keeps URL as the source of truth)
  const updateParams = (
    next: Partial<{
      status: string;
      sort: SortKey;
      page: number;
      limit: number;
    }>,
    replace = true
  ) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = {
      status,
      sort,
      page: String(page),
      limit: String(limit),
      ...current,
      ...Object.fromEntries(
        Object.entries(next).map(([k, v]) => [k, String(v)])
      ),
    };

    // Remove defaults to keep URL clean
    if (merged.status === DEFAULTS.status) delete merged.status;
    if (merged.sort === DEFAULTS.sort) delete merged.sort;
    if (Number(merged.page) === DEFAULTS.page) delete merged.page;
    if (Number(merged.limit) === DEFAULTS.limit) delete merged.limit;

    setSearchParams(merged, { replace });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u._id, u.name));
    return map;
  }, [users]);

  // permissions
  const canEditTitle = (t: Task) => role === "admin";
  const canEditMeta = (t: Task) => role === "admin" || role === "manager";
  const canEditOwner = (t: Task) => role === "admin";
  const canDelete = (t: Task) => role === "admin";
  const canEditStatus = (t: Task) =>
    role === "admin" ||
    role === "manager" ||
    (role === "user" && t.owner === meId);

  // updates
  const onInlineUpdate = async (id: string, body: Partial<Task>) => {
    try {
      setBusyId(id);
      await (d(updateTask({ id, body })) as any).unwrap?.();
    } catch (e: any) {
      setToast(e?.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setBusyId(id);
      await (d(deleteTask(id)) as any).unwrap?.();
      setToast("Task deleted");
    } catch (e: any) {
      setToast(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  // header sorting UI
  const toggleSort = (key: "createdAt" | "priority" | "dueDate") => {
    const desc = `-${key}` as SortKey;
    const asc = key as SortKey;
    const next = sort === desc ? asc : desc;
    updateParams({ sort: next, page: 1 });
  };
  const sortIcon = (key: "createdAt" | "priority" | "dueDate") => {
    const desc = `-${key}`;
    const asc = key;
    return (
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
        {sort === desc ? "↓" : sort === asc ? "↑" : "↕"}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <TableToolbar
        status={status}
        sort={sort}
        onStatusChange={(s) => updateParams({ status: s, page: 1 })}
        onSortChange={(s) => updateParams({ sort: s, page: 1 })}
        rightSlot={
          <button
            className="border rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={clearFilters}
            title="Clear filters and sorting"
          >
            Clear
          </button>
        }
      />

      <div className="overflow-auto border rounded border-gray-200 dark:border-gray-800">
        <table className="min-w-[800px] w-full text-sm text-gray-900 dark:text-gray-100">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-sm sticky top-0 z-[1]">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="p-2 w-6">#</th>
              <th className="p-2">Title</th>
              <th
                className="p-2 cursor-pointer select-none"
                onClick={() => toggleSort("createdAt")}
              >
                Created {sortIcon("createdAt")}
              </th>
              <th className="p-2">Status</th>
              <th
                className="p-2 cursor-pointer select-none"
                onClick={() => toggleSort("priority")}
              >
                Priority {sortIcon("priority")}
              </th>
              <th
                className="p-2 cursor-pointer select-none"
                onClick={() => toggleSort("dueDate")}
              >
                Due {sortIcon("dueDate")}
              </th>
              <th className="p-2">Assignee</th>
              <th className="p-2 w-24">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-gray-600 dark:text-gray-300">
                  No tasks found.
                </td>
              </tr>
            )}

            {items.map((t: Task, i: number) => (
              <tr
                key={t._id}
                className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  {(page - 1) * limit + i + 1}
                </td>

                {/* Title */}
                <td className="p-2">
                  {canEditTitle(t) ? (
                    <InlineText
                      value={t.title}
                      disabled={busyId === t._id}
                      onSave={(val) => onInlineUpdate(t._id, { title: val })}
                    />
                  ) : (
                    <div className="truncate">{t.title}</div>
                  )}
                </td>

                {/* Created */}
                <td className="p-2 text-gray-600 dark:text-gray-300">
                  {new Date(t.createdAt).toLocaleString()}
                </td>

                {/* Status */}
                <td className="p-2">
                  {canEditStatus(t) ? (
                    <InlineSelect
                      value={t.status}
                      options={["todo", "inprogress", "done"] as const}
                      disabled={busyId === t._id}
                      onChange={(val) =>
                        onInlineUpdate(t._id, { status: val as any })
                      }
                    />
                  ) : (
                    <span className="capitalize">{t.status}</span>
                  )}
                </td>

                {/* Priority */}
                <td className="p-2">
                  {canEditMeta(t) ? (
                    <InlineSelect
                      value={t.priority}
                      options={["low", "medium", "high"] as const}
                      disabled={busyId === t._id}
                      onChange={(val) =>
                        onInlineUpdate(t._id, { priority: val as any })
                      }
                    />
                  ) : (
                    <span className="capitalize">{t.priority}</span>
                  )}
                </td>

                {/* Due */}
                <td className="p-2">
                  {canEditMeta(t) ? (
                    <InlineDate
                      value={t.dueDate ?? ""}
                      disabled={busyId === t._id}
                      onChange={(val) =>
                        onInlineUpdate(t._id, { dueDate: val || undefined })
                      }
                    />
                  ) : t.dueDate ? (
                    new Date(t.dueDate).toLocaleDateString()
                  ) : (
                    "—"
                  )}
                </td>

                {/* Assignee */}
                <td className="p-2">
                  {canEditOwner(t) ? (
                    <InlineAssignee
                      value={t.owner}
                      users={users}
                      disabled={busyId === t._id}
                      onChange={(val) =>
                        onInlineUpdate(t._id, { owner: val as any })
                      }
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300">
                      {t.owner === meId ? "Me" : userMap.get(t.owner) || t.owner}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-2">
                  {role === "admin" ? (
                    <button
                      className="btn-sm"
                      disabled={busyId === t._id}
                      onClick={() => onDelete(t._id)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={limit}
        total={total}
        onPageChange={(p) => updateParams({ page: p }, false)}
        onPageSizeChange={(size) => updateParams({ limit: size, page: 1 })}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
    </div>
  );
}

/* ------- inline editors (unchanged) ------- */
import { useEffect as useEffect2, useState as useState2 } from "react";

function InlineText({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled?: boolean;
  onSave: (v: string) => void;
}) {
  const [v, setV] = useState2(value);
  useEffect2(() => setV(value), [value]);
  return (
    <input
      className="input dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
      value={v}
      disabled={disabled}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onSave(v)}
    />
  );
}

function InlineSelect<T extends string>({
  value,
  options,
  disabled,
  onChange,
}: {
  value: T;
  options: readonly T[];
  disabled?: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <select
      className="input dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function InlineDate({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const formatted = value ? new Date(value).toISOString().slice(0, 10) : "";
  return (
    <input
      className="input dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
      type="date"
      disabled={disabled}
      value={formatted}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function InlineAssignee({
  value,
  users,
  disabled,
  onChange,
}: {
  value: string;
  users: UserLite[];
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const hasCurrent = users.some((u) => u._id === value);
  const currentFallback = hasCurrent
    ? null
    : { _id: value, name: "Current assignee", email: value };
  const options = currentFallback ? [currentFallback, ...users] : users;
  return (
    <select
      className="input dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((u) => (
        <option key={u._id} value={u._id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}
