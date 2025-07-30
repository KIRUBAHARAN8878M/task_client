import { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { logout } from './features/auth/authSlice';
import AdminPage from './features/users/AdminPage';
import TaskTable from './features/tasks/TaskTable';
import AddTaskModal from './features/tasks/AddTaskModal';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

function Dashboard() {
  const user = useAppSelector(s => s.auth.user);
  const d = useAppDispatch();
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-3 text-sm">
          <span>{user?.name} ({user?.role})</span>
          <RoleGuard allow={['admin']}>
            <Link to="/admin" className="underline">Admin</Link>
          </RoleGuard>
          <button className="btn-sm" onClick={() => setOpenAdd(true)}>Add Task</button>
          <button className="btn-sm" onClick={() => d(logout())}>Logout</button>
        </div>
      </header>

      <TaskTable />

      <AddTaskModal open={openAdd} onClose={() => setOpenAdd(false)} />
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
