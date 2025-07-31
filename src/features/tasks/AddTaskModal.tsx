import { useEffect, useMemo, useState } from "react";
import Modal from "../../componenets/Modal";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createTask } from "./taskSlice";
import { listUsers, type UserLite } from "../users/usersApi";
import { Toast } from "../../componenets/Toast";
import Button from "../../componenets/ui/Button";
import Input from "../../componenets/ui/Input";
import Textarea from "../../componenets/ui/Textarea";
import Select from "../../componenets/ui/Select";
import { Field } from "../../componenets/ui/Field";

type Props = { open: boolean; onClose: () => void };

export default function AddTaskModal({ open, onClose }: Props) {
  const d = useAppDispatch();
  const me = useAppSelector((s) => s.auth.user);
  const role = me?.role;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState(me?.id || "");
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | undefined>();

  const canPickAssignee = role === "admin";

  // reset form when opened
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setAssignee(me?.id || "");
      setToast(undefined);
    }
  }, [open, me?.id]);

  // admins need the user list to assign to anyone
  useEffect(() => {
    if (!open) return;
    if (canPickAssignee) {
      setLoadingUsers(true);
      listUsers()
        .then(setUsers)
        .catch((e) => setToast(e?.message || "Failed to load users"))
        .finally(() => setLoadingUsers(false));
    } else {
      setUsers([]);
    }
  }, [open, canPickAssignee]);

  // Ensure current user appears even if listUsers is still loading
  const options = useMemo(() => {
    if (!canPickAssignee) return [];
    const hasMe = users.some((u) => u._id === me?.id);
    return hasMe || !me?.id
      ? users
      : [{ _id: me.id, name: me.name, email: me.email, role: me.role! }, ...users];
  }, [users, canPickAssignee, me]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast("Title is required");
      return;
    }
    setBusy(true);
    try {
      const body: any = {
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
      };
      if (canPickAssignee) {
        body.owner = assignee || me?.id;
      }
      await (d(createTask(body)) as any).unwrap?.();
      onClose(); // slice will add the new task at the top
    } catch (err: any) {
      setToast(err?.message || "Failed to create task");
    } finally {
      setBusy(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Task"
      // If your Modal supports className props, these help in dark mode:
      className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
      overlayClassName="bg-black/40 dark:bg-black/60"
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title" htmlFor="title" required>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={busy}
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={busy}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Field label="Priority" htmlFor="priority">
            <Select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              disabled={busy}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>

          <Field label="Due Date" htmlFor="due">
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={today}              // optional: prevent past dates
              disabled={busy}
            />
          </Field>

          {canPickAssignee ? (
            <Field label="Assignee" htmlFor="assignee">
              <Select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                disabled={loadingUsers || busy}
              >
                <option value="">Select assignee</option>
                {options.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Assignee" htmlFor="assignee_ro">
              <Input  id="assignee_ro"
                value={`${me?.name ?? ""} — ${me?.email ?? ""}`}
                disabled
              />
            </Field>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" loading={busy} disabled={busy}>
            Create Task
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
    </Modal>
  );
}
