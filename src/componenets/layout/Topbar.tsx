import type { ReactNode } from 'react';
import { useTheme } from '../../theme/useTheme';

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
     const { theme, toggle } = useTheme();
  const initials = userName
    ? userName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

 const roleColor =
  role === 'admin'
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    : role === 'manager'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';


 return (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              className="h-9 w-9 rounded border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {/* user chip */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 flex items-center justify-center text-xs">
                {initials}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-sm text-gray-800 dark:text-gray-100">{userName}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded capitalize ${roleColor}`}>
                {role}
              </span>
            </div>

            {rightExtra}

            <button
              className="h-8 px-3 rounded bg-black text-white text-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              onClick={onAddTask}
            >
              Add Task
            </button>

            <button
              className="h-9 px-3 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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