// frontend/src/components/Sidebar.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Receipt, MessageSquare, TrendingUp, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Sidebar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'AI Assistant', href: '/ai-chat', icon: MessageSquare },
    { name: 'Predictive Insights', href: '/forecasting', icon: TrendingUp },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 h-screen p-4 fixed left-0 top-0 flex flex-col justify-between z-20">
      <div>
        <div className="text-xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent px-4 py-6">
          FinanceAI Platform
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 text-slate-400 hover:text-white hover:bg-slate-900 px-4 py-3 rounded-xl transition"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4">
        {isAuthenticated ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                ✓
              </div>
              <span className="text-xs text-slate-300 font-medium">Logged In</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-900 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex items-center space-x-2 text-emerald-400 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition text-xs font-semibold"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In / Register</span>
          </Link>
        )}
      </div>
    </div>
  );
}