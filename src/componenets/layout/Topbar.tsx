import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  title?: string;
  userName?: string;
  role?: 'admin' | 'manager' | 'user' | undefined;
  onAddTask: () => void;
  onLogout: () => void;
  rightExtra?: ReactNode; // optional slot (e.g., Admin link)
};

export default function Topbar({
  title = 'Tasks',
  userName,
  role,
  onAddTask,
  onLogout,
  rightExtra
}: Props) {
  const initials = userName
    ? userName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const roleColor =
    role === 'admin' ? 'bg-red-100 text-red-700'
    : role === 'manager' ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-700';

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Left: Title */}
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h1>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User chip */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                {initials}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-sm">{userName}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${roleColor} capitalize`}>
                {role}
              </span>
            </div>

            {/* Admin link slot, if provided */}
            {rightExtra}

            {/* Add Task */}
            <button
              className="h-9 px-3 rounded bg-black text-white text-sm hover:bg-black/90"
              onClick={onAddTask}
            >
              Add Task
            </button>

            {/* Logout */}
            <button
              className="h-9 px-3 rounded border text-sm hover:bg-gray-50"
              onClick={onLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
