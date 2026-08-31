// frontend/src/app/transactions/page.tsx
'use client';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/utils/api';
import { 
  UploadCloud, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  merchant: string;
  category: string;
  timestamp: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/transactions/');
      setTransactions(res.data);
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: 'Only .csv files are supported.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadStatus(null);
      const res = await api.post('/api/v1/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus({
        type: 'success',
        message: `Successfully ingested ${res.data.length} transactions with ML categorization!`,
      });
      fetchTransactions();
    } catch (err: any) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to upload CSV file.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Get unique list of categories for filter dropdown
  const categories = ['All', ...Array.from(new Set(transactions.map((t) => t.category)))];

  // Filter and search logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Transactions & Statement Ingestion</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload statement CSVs or explore categorized financial records.
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl transition text-sm self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <FileText className="text-emerald-400 h-5 w-5" />
          <span>Upload Bank Statement (CSV)</span>
        </h2>
        <p className="text-xs text-slate-400">
          File must include headers: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">date</code>,{' '}
          <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">merchant</code>,{' '}
          <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">amount</code>, and optional{' '}
          <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">category</code>.
        </p>

        {/* Upload Trigger Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/40 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            {uploading ? (
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200">
              {uploading ? 'Processing & Categorizing Records...' : 'Click to select or drag and drop statement CSV'}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">Supports CSV up to 10MB</p>
          </div>
        </div>

        {/* Upload Feedback Message */}
        {uploadStatus && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center space-x-3 border ${
              uploadStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{uploadStatus.message}</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950 p-4 border border-slate-800 rounded-2xl">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition placeholder-slate-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition w-full sm:w-auto"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-slate-500 space-x-3">
            <RefreshCw className="animate-spin h-6 w-6 text-emerald-400" />
            <span>Loading records from database...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-400">No transactions found</p>
            <p className="text-xs">Try clearing search filters or upload a new CSV file above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 font-medium">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Merchant</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/30 transition">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                      {tx.merchant}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">
                        <Tag className="h-3 w-3" />
                        <span>{tx.category}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-white whitespace-nowrap">
                      ${Number(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}