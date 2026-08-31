// frontend/src/app/ai-chat/page.tsx
'use client';
import { useState } from 'react';
import { api } from '@/utils/api';
import { Send, Bot, User, RefreshCw } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function AIChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am your AI Copilot. Ask me questions about your transaction categories, historical spending patterns, or trends.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setSending(true);

    try {
      // POST up to our agent coordinator framework
      const res = await api.post('/api/v1/chat/', { message: userMsg });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'An orchestration execution fault took place while evaluating the data tools layer.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto h-screen flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Bot className="text-emerald-400 h-7 w-7" />
          <span>AI Financial Copilot Agent</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Asynchronous tool-calling interface targeting localized financial analytical models.
        </p>
        <hr className="border-slate-800 mt-4" />
      </div>

      {/* Chat History Viewbox */}
      <div className="flex-1 my-6 overflow-y-auto space-y-4 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex space-x-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto justify-end' : ''}`}>
            {msg.sender === 'ai' && (
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Bot className="h-5 w-5" />
              </div>
            )}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user' 
                ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                U
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex space-x-3 items-center text-xs text-slate-500 italic">
            <RefreshCw className="animate-spin h-4 w-4 text-emerald-400" />
            <span>Agent is evaluating analytics execution plans...</span>
          </div>
        )}
      </div>

      {/* Action Form Input Tray */}
      <form onSubmit={handleSendMessage} className="flex space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something (e.g., 'What was my highest grocery expense?')"
          disabled={sending}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-5 py-3 rounded-xl transition flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </main>
  );
}