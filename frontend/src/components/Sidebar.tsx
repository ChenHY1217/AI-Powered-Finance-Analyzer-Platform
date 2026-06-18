// frontend/src/components/Sidebar.tsx
import Link from 'next/link';
import { LayoutDashboard, Receipt, MessageSquare, Settings, TrendingUp } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'AI Assistant', href: '/ai-chat', icon: MessageSquare },
    { name: 'Predictive Insights', href: '/forecasting', icon: TrendingUp },
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 h-screen p-4 fixed left-0 top-0 flex flex-col justify-between">
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
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            TE
          </div>
          <div>
            <div className="text-sm font-medium text-white">Test Engineer</div>
            <div className="text-xs text-slate-500">ID: 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}