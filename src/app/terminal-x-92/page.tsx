'use client';
import { useState, useEffect } from 'react';
import PasswordGate from '@/components/PasswordGate';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
}
