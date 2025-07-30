import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createTask } from './taskSlice';
import RoleGuard from '../../routes/RoleGuard';
import TeamPicker from './TeamPicker';

export default function TaskForm() {
  const d = useAppDispatch();
  const role = useAppSelector(s => s.auth.user?.role);
  const [title,setTitle]=useState('');
  const [description,setDescription]=useState('');
  const [priority,setPriority]=useState<'low'|'medium'|'high'>('medium');
  const [dueDate,setDueDate]=useState<string>('');
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await d(createTask({
        title, description, priority, dueDate: dueDate || undefined,
        teamIds: (role === 'admin' || role === 'manager') ? teamIds : undefined
      }) as any).unwrap?.();
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setTeamIds([]);
    } catch (e:any) {
      // optionally lift to a Toast
      alert(e?.message || 'Failed to create task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border p-4 rounded">
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} />
        <select className="input" value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <input className="input" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
        <button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Add'}</button>
      </div>

      <textarea className="input w-full" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />

      {/* Only managers/admins can assign teams */}
      <RoleGuard allow={['admin','manager']}>
        <TeamPicker value={teamIds} onChange={setTeamIds} disabled={busy} />
        <p className="text-xs text-gray-500">
          Managers/Admins: selected users will also see this task. You always see your own tasks.
        </p>
      </RoleGuard>
    </form>
  );
}
