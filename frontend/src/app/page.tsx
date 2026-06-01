'use client';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

export default function Home() {
  const [status, setStatus] = useState<string>('Connecting...');
  const [dbStatus, setDbStatus] = useState<string>('Checking...');

  useEffect(() => {
    api.get('/api/health')
      .then((res) => {
        setStatus(res.data.status);
        setDbStatus(res.data.database);
      })
      .catch((err) => {
        setStatus('Disconnected');
        setDbStatus(err.message);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Finance AI Project Setup</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">API Gateway Status</h2>
          <p className={`font-bold ${status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
            {status.toUpperCase()}
          </p>
        </div>
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
          <p className={`font-bold ${dbStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
            {dbStatus.toUpperCase()}
          </p>
        </div>
      </div>
    </main>
  );
}