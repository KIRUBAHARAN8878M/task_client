import { useEffect, useMemo, useState } from 'react';
import { listUsers, type UserLite } from '../users/usersApi';

type Props = {
  value: string[];                 // selected user IDs
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export default function TeamPicker({ value, onChange, disabled }: Props) {
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listUsers();
        setUsers(data);
      } catch {
        // fail silently (optional: lift to a toast)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [q, users]);

  const toggle = (id: string) => {
    if (disabled) return;
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Team</label>
      <input
        className="input"
        placeholder="Search users by name or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={disabled || loading}
      />
      <div className="max-h-40 overflow-auto border rounded">
        {loading ? (
          <div className="p-2 text-sm text-gray-500">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">No matches</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((u) => (
              <li key={u._id} className="p-2 flex items-center justify-between">
                <div className="text-sm">
                  <div>{u.name}</div>
                  <div className="text-gray-500">{u.email}</div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value.includes(u._id)}
                    onChange={() => toggle(u._id)}
                    disabled={disabled}
                  />
                  <span>Select</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Selected: {value.length || 0}
      </p>
    </div>
  );
}
