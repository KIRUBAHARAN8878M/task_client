import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import RoleGuard from "../../routes/RoleGuard";
import { listUsers, updateUserRole, type UserLite } from "./usersApi";
import { Toast } from "../../componenets/Toast";
import Topbar from "../../componenets/layout/Topbar";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout } from "../auth/authSlice";

export default function AdminPage() {
  // Only admins can see this whole page
  return (
    <RoleGuard allow={["admin"]}>
      <AdminPageInner />
    </RoleGuard>
  );
}

function AdminPageInner() {
  const navigate = useNavigate();
  const d = useAppDispatch();
  const me = useAppSelector((s) => s.auth.user);

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
        setToast(e?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const changeRole = async (id: string, role: UserLite["role"]) => {
    try {
      setBusyId(id);
      const updated = await updateUserRole(id, role);
      setUsers((list) => list.map((u) => (u._id === id ? updated : u)));
      setToast("Role updated");
    } catch (e: any) {
      setToast(e?.message || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Topbar with Back button and Logout, mirrors Dashboard style */}
      <Topbar
        title="Admin · User Management"
        userName={me?.name}
        role={me?.role}
        onAddTask={() => navigate("/?new=1", { replace: false })} // quick access to create task
        onLogout={() => d(logout())}
        rightExtra={
          <>
            {/* Back to Tasks */}
            <button
              className="h-9 px-3 rounded border text-sm flex items-center transition-colors
           border-gray-200 text-gray-900 hover:bg-gray-50
           dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800
           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/20 dark:focus:ring-white/20"

              onClick={() => navigate("/", { replace: false })}
              title="Back to Tasks"
            >
              ← Back
            </button>
            {/* When you’re already on Admin, keep the Admin pill disabled for clarity */}
            <Link
              to="/admin"
              className="h-9 px-3 rounded border text-sm text-gray-400 pointer-events-none hidden sm:flex items-center"
              aria-disabled
            >
              Admin
            </Link>
          </>
        }
      />

      <main className="max-w-5xl mx-auto p-4 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-gray-500">{users.length} total</p>
        </div>

        <div className="overflow-auto border rounded border-gray-200 dark:border-gray-800">
  <table className="min-w-[700px] w-full text-sm">
    <thead className="sticky top-0 z-10 bg-white dark:bg-gray-900">
      <tr className="border-b border-gray-200 dark:border-gray-800">
        <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300">Name</th>
        <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300">Email</th>
        <th className="py-2 px-3 text-left font-medium text-gray-700 dark:text-gray-300">Role</th>
      </tr>
    </thead>

            <tbody>
              {loading && users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4">
                    Loading…
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-600">
                    No users yet.
                  </td>
                </tr>
              )}

              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 px-3">{u.name}</td>
                  <td className="py-2 px-3">{u.email}</td>
                  <td className="py-2 px-3">
                    <select
                     className="border rounded px-3 py-2 text-sm bg-white text-gray-900 border-gray-300
             dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                      value={u.role}
                      disabled={busyId === u._id}
                      onChange={(e) =>
                        changeRole(u._id, e.target.value as UserLite["role"])
                      }
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
        </div>

        {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
      </main>
    </div>
  );
}
