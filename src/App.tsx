import { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useSearchParams } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { logout } from './features/auth/authSlice';
import AdminPage from './features/users/AdminPage';
import TaskTable from './features/tasks/TaskTable';
import AddTaskModal from './features/tasks/AddTaskModal';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import Topbar from './componenets/layout/Topbar';

function Dashboard() {
  const user = useAppSelector(s => s.auth.user);
  const d = useAppDispatch();

  // Use URL to control the Add Task modal (?new=1)
  const [params, setParams] = useSearchParams();
  const isOpen = params.get('new') === '1';

  const openAdd = () => {
    const next = new URLSearchParams(params);
    next.set('new', '1');
    // replace to avoid polluting history if you click Add multiple times
    setParams(next, { replace: true });
  };

  const closeAdd = () => {
    const next = new URLSearchParams(params);
    next.delete('new');
    setParams(next, { replace: true });
  };

  // Optional: Close modal with Esc key (Topbar is already sticky, modal listens for Esc internally)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) closeAdd(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen">
      <Topbar
        title="Tasks Management"
        userName={user?.name}
        role={user?.role}
        onAddTask={openAdd}
        onLogout={() => d(logout())}
        rightExtra={
          <RoleGuard allow={['admin']}>
            <Link to="/admin" className="h-9 px-3 rounded border text-sm flex items-center transition-colors
           border-gray-200 text-gray-900 hover:bg-gray-50
           dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800
           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/20 dark:focus:ring-white/20"
>
              Admin
            </Link>
          </RoleGuard>
        }
      />

      <main className="max-w-5xl mx-auto p-4 text-gray-900 dark:text-gray-100">
        <TaskTable />
      </main>

      <AddTaskModal open={isOpen} onClose={closeAdd} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
