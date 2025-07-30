import { useEffect, useMemo, useState } from 'react';
import Modal from '../../componenets/Modal';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createTask } from './taskSlice';
import { listUsers, type UserLite } from '../users/usersApi';
import { Toast } from '../../componenets/Toast';

type Props = { open: boolean; onClose: () => void };

export default function AddTaskModal({ open, onClose }: Props) {
  const d = useAppDispatch();
  const me = useAppSelector(s => s.auth.user);
  const role = me?.role;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState(me?.id || '');
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string|undefined>();

  // reset form when opened
  useEffect(() => {
    if (open) {
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate('');
      setAssignee(me?.id || '');
      setToast(undefined);
    }
  }, [open, me?.id]);

  // admins need the user list to assign to anyone
useEffect(() => {
  if (!open) return;
  if (role === 'admin') {
    setLoadingUsers(true);
    listUsers().then(setUsers).catch((e)=>setToast(e?.message || 'Failed to load users')).finally(()=>setLoadingUsers(false));
  } else {
    setUsers([]);
  }
}, [open, role]);

  const canPickAssignee = role === 'admin';

  // Ensure current user appears as an option even if listUsers is still loading
  const options = useMemo(() => {
    if (!canPickAssignee) return [];
    const hasMe = users.some(u => u._id === me?.id);
    return hasMe || !me?.id ? users : [{ _id: me.id, name: me.name, email: me.email, role: me.role! }, ...users];
  }, [users, canPickAssignee, me]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setToast('Title is required'); return; }
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
      setToast(err?.message || 'Failed to create task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Task">
      <form onSubmit={submit} className="space-y-3">
        <input
          className="input w-full"
          placeholder="Title *"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          required
        />

        <textarea
          className="input w-full"
          placeholder="Description"
          value={description}
          onChange={e=>setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select className="input" value={priority} onChange={e=>setPriority(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input className="input" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          {canPickAssignee ? (
            <select
              className="input"
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              disabled={loadingUsers || busy}
            >
              <option value="">Select assignee</option>
              {options.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
          ) : (
            <input className="input" value={`${me?.name} — ${me?.email}`} disabled />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-sm" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create Task'}</button>
        </div>
      </form>

      {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
    </Modal>
  );
}
