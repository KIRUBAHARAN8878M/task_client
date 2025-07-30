import { apiFetch } from '../../lib/http';
import type { Role } from '../auth/types';

export interface UserLite {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export async function listUsers(): Promise<UserLite[]> {
  return apiFetch<UserLite[]>('/users');
}

export async function updateUserRole(id: string, role: Role): Promise<UserLite> {
  return apiFetch<UserLite>(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
}
