import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from './ui';

export function BootScreen() {
  return (
    <div className="boot">
      <BrandMark />
      <p>Opening your board…</p>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}
