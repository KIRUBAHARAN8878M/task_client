import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchTasks, updateTask, deleteTask, type Task } from "./taskSlice";
import { listUsers, type UserLite } from "../users/usersApi";
import { Toast } from "../../componenets/Toast";

const LIMIT = 10;
const statusOptions = ["todo", "inprogress", "done"] as const;
const priorityOptions = ["low", "medium", "high"] as const;

export default function TaskTable() {
  const d = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.tasks as any);
  const role = useAppSelector((s) => s.auth.user?.role);
  const meId = useAppSelector((s) => s.auth.user?.id);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [toast, setToast] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Users for Assignee select (manager/admin only)
  const [users, setUsers] = useState<UserLite[]>([]);
  useEffect(() => {
    if (role === "admin") {
      listUsers()
        .then(setUsers)
        .catch((e) => setToast(e?.message || "Failed to load users"));
    } else {
      setUsers([]); // ensure empty for manager/user
    }
  }, [role]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, sort]);

  useEffect(() => {
    (d(fetchTasks({ status: statusFilter, sort, page, limit: LIMIT })) as any)
      .unwrap?.()
      .catch((e: any) => setToast(e?.message || "Failed to load tasks"));
  }, [d, statusFilter, sort, page]);

  const maxPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / LIMIT)),
    [total]
  );

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u._id, u.name));
    return map;
  }, [users]);

  // permissions
  const canEditTitle = (t: Task) => role === "admin";
  const canEditMeta = (t: Task) => role === "admin" || role === "manager";
  const canEditOwner = (t: Task) => role === "admin"; // <-- manager cannot change assignee
  const canDelete = (t: Task) => role === "admin";
  const canEditStatus = (t: Task) =>
    role === "admin" ||
    role === "manager" || // server still enforces own/team
    (role === "user" && t.owner === meId);

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

  // Render
  return (
    <div className="space-y-3">
      {/* Filters + Add button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-priority">Priority desc</option>
            <option value="priority">Priority asc</option>
          </select>
        </div>

        {/* Add Task button is handled by Dashboard (opens modal) */}
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-[700px] w-full">
          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="p-2 w-6">#</th>
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Due</th>
              <th className="p-2">Assignee</th>
              <th className="p-2 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <>
                <tr>
                  <td colSpan={7} className="p-4">
                    Loading…
                  </td>
                </tr>
              </>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-gray-600">
                  No tasks found.
                </td>
              </tr>
            )}

            {items.map((t: Task, i: number) => {
              // USERS: force assignee to self & lock edits except status
              const isUser = role === "user";
              const lockAllButStatus = isUser;

              return (
                <tr key={t._id} className="border-t">
                  <td className="p-2 text-sm text-gray-500">
                    {(page - 1) * LIMIT + i + 1}
                  </td>

                  {/* Title */}
                  <td className="p-2">
                    {canEditTitle ? (
                      <InlineText
                        value={t.title}
                        disabled={busyId === t._id}
                        onSave={(val) => onInlineUpdate(t._id, { title: val })}
                      />
                    ) : (
                      <div className="truncate">{t.title}</div>
                    )}
                  </td>

                  {/* Status (all roles can edit; user ONLY this) */}
                  <td className="p-2">
                    <InlineSelect
                      value={t.status}
                      options={statusOptions}
                      disabled={busyId === t._id}
                      onChange={(val) =>
                        onInlineUpdate(t._id, { status: val as any })
                      }
                    />
                  </td>

                  {/* Priority */}
                  <td className="p-2">
                    {lockAllButStatus ? (
                      <span className="capitalize text-gray-600">
                        {t.priority}
                      </span>
                    ) : (
                      <InlineSelect
                        value={t.priority}
                        options={priorityOptions}
                        disabled={!canEditMeta || busyId === t._id}
                        onChange={(val) =>
                          onInlineUpdate(t._id, { priority: val as any })
                        }
                      />
                    )}
                  </td>

                  {/* Due */}
                  <td className="p-2">
                    {lockAllButStatus ? (
                      <span className="text-gray-600">
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString()
                          : "—"}
                      </span>
                    ) : (
                      <InlineDate
                        value={t.dueDate ?? ""}
                        disabled={!canEditMeta || busyId === t._id}
                        onChange={(val) =>
                          onInlineUpdate(t._id, { dueDate: val || undefined })
                        }
                      />
                    )}
                  </td>

                  {/* Assignee (readable name if we have it) */}
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
                      <span className="text-gray-600">
                        {/* If admin loaded users, show name; otherwise show id / "Me" */}
                        {t.owner === meId
                          ? "Me"
                          : userMap.get(t.owner) || t.owner}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-2">
                    {canDelete ? (
                      <button
                        className="btn-sm"
                        disabled={busyId === t._id}
                        onClick={() => onDelete(t._id)}
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
    </div>
  );
}

/* ------- small inline editors ------- */

function InlineText({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled?: boolean;
  onSave: (v: string) => void;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input
      className="input"
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
      className="input"
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
  // expects yyyy-mm-dd
  const formatted = value ? new Date(value).toISOString().slice(0, 10) : "";
  return (
    <input
      className="input"
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
  // Ensure the current owner is visible even if not in users[]
  const hasCurrent = users.some((u) => u._id === value);
  const currentFallback = hasCurrent
    ? null
    : { _id: value, name: "Current assignee", email: value };

  const options = currentFallback ? [currentFallback, ...users] : users;

  return (
    <select
      className="input"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((u) => (
        <option key={u._id} value={u._id}>
          {u.name} — {u.email}
        </option>
      ))}
    </select>
  );
}
