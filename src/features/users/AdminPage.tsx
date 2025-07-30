import { useEffect, useState } from 'react';
import RoleGuard from '../../routes/RoleGuard';
import { listUsers, updateUserRole, type UserLite } from './usersApi';
import { Toast } from '../../componenets/Toast';

export default function AdminPage() {
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listUsers();
        setUsers(data);
      } catch (e: any) {
        setToast(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const changeRole = async (id: string, role: UserLite['role']) => {
    try {
      setBusyId(id);
      const updated = await updateUserRole(id, role);
      setUsers((list) => list.map((u) => (u._id === id ? updated : u)));
      setToast('Role updated');
    } catch (e: any) {
      setToast(e?.message || 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RoleGuard allow={['admin']}>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-xl font-semibold">User management</h2>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="w-full border rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <select
                      className="input"
                      value={u.role}
                      disabled={busyId === u._id}
                      onChange={(e) => changeRole(u._id, e.target.value as UserLite['role'])}
                    >
                      <option value="admin">admin</option>
                      <option value="manager">manager</option>
                      <option value="user">user</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
      </div>
    </RoleGuard>
  );
}
