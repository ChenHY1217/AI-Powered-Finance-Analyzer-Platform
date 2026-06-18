// frontend/src/app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ArrowUpRight, TrendingUp, RefreshCw } from 'lucide-react';

interface Transaction {
  id: int;
  amount: number;
  merchant: string;
  category: string;
  timestamp: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // HARDCODED user_id=1 until Authentication systems are implemented
      const res = await api.get('/api/v1/transactions/?user_id=1');
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute local aggregations
  const totalSpending = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const categoryMap = transactions.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const pieData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400">
        <RefreshCw className="animate-spin h-8 w-8 mr-3 text-emerald-400" /> Loading System Data...
      </div>
    );
  }

  return (
    <main className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Financial Dashboard</h1>
          <p className="text-slate-400">Overview performance analytics for active account user_id: 1</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl transition text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Aggregated Outflow</p>
            <p className="text-3xl font-bold text-white mt-2">${totalSpending.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Tracked Transactions</p>
            <p className="text-3xl font-bold text-white mt-2">{transactions.length}</p>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <ArrowUpRight className="h-6 w-6" />
          </div>
        </div>
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Primary Category Expense</p>
            <p className="text-3xl font-bold text-white mt-2">
              {pieData.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Expenditure by Category</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-white mb-2">Category Proportions</h2>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex justify-between text-xs text-slate-400 px-2 py-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-slate-200">${item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}