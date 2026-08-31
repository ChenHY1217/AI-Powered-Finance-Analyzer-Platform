// frontend/src/components/AuthGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { RefreshCw } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If the user is on the /auth page, allow them through
    if (pathname === '/auth') {
      setChecking(false);
      return;
    }

    // If not authenticated, redirect to /auth
    if (!isAuthenticated) {
      router.replace('/auth');
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, pathname, router]);

  // If on /auth, render children directly without sidebar offset
  if (pathname === '/auth') {
    return <>{children}</>;
  }

  // Show brief loading spinner while validating auth state
  if (checking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400">
        <RefreshCw className="animate-spin h-8 w-8 mr-3 text-emerald-400" />
        <span>Authenticating session...</span>
      </div>
    );
  }

  return <>{children}</>;
}