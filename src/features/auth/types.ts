export type Role = 'admin' | 'manager' | 'user';
export interface User { id: string; name: string; email: string; role: Role; }
export interface AuthState { user: User | null; loading: boolean; error?: string; }
