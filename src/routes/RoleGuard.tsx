import type { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import type { Role } from '../features/auth/types';

export default function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useAppSelector(s => s.auth.user?.role);
  if (!role || !allow.includes(role)) return null;
  return <>{children}</>;
}
