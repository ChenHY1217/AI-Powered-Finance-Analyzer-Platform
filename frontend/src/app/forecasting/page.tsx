// frontend/src/app/forecasting/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function ForecastingView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/v1/analytics/forecast');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to compile predictive metrics pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400">
        <RefreshCw className="animate-spin h-8 w-8 mr-3 text-cyan-400" /> Computing Time-Series Trend Projections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20 bg-slate-950 border border-red-900/30 rounded-2xl text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Cold-Start Error Context</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <button onClick={fetchForecast} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs hover:bg-slate-700 transition">
          Retry Aggregations
        </button>
      </div>
    );
  }

  // Flatten both historical and forecast datasets into a uniform timeline sequence for Recharts
  const chartData = [...data.historical, ...data.forecast];

  return (
    <main className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
          <Sparkles className="text-cyan-400 h-7 w-7" />
          <span>Predictive Spend Forecasting</span>
        </h1>
        <p className="text-slate-400 mt-1">Polynomial regression time-series models modeling structural user cashflow velocity.</p>
      </div>

      {/* KPI Callout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historical Daily Outflow Average</p>
          <p className="text-3xl font-bold text-white mt-2">${data.metrics.historical_average_daily.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-linear-to-br from-slate-950 to-cyan-950/20 border border-cyan-900/30 rounded-2xl">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Projected Next 30-Day Total Spending</p>
          <p className="text-3xl font-bold text-cyan-300 mt-2">${data.metrics.predicted_cumulative_next_month.toFixed(2)}</p>
        </div>
      </div>

      {/* Main Visualization Canvas */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Extrapolated Expenditure Vector</h2>
          <div className="flex space-x-4 text-xs">
            <span className="flex items-center text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2" /> Historical</span>
            <span className="flex items-center text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400 mr-2" /> ML Projection</span>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              {/* Separate rendering vectors to split active metrics from predictive forecasting visually */}
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} connectNulls />
              <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 5" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}