import React, { useState, useEffect } from 'react';
import { getLatestNASANews } from '../services/geminiService';

interface NASAUpdate {
  timestamp: string;
  content: string;
}

const NASANewsCard: React.FC = () => {
  const [updates, setUpdates] = useState<NASAUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchNews = async () => {
    if (loading) return;
    setLoading(true);
    setIsRateLimited(false);
    try {
      const result = await getLatestNASANews();
      if (Array.isArray(result)) {
        setUpdates(result);
      }
    } catch (error: any) {
      console.error("News card failed to fetch:", error);
      setIsRateLimited(true);
    } finally {
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh every 30 minutes to respect quota
    const interval = setInterval(fetchNews, 1800000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-xl h-full border border-slate-800 flex flex-col overflow-hidden bg-slate-900/60 shadow-2xl">
      <div className="h-10 bg-slate-900/95 px-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-blue-400' : isRateLimited ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-blue-500' : isRateLimited ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">NASA Intel Feed</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isRateLimited && <span className="text-[7px] mono text-red-400 font-bold uppercase tracking-widest">Protocol Fallback</span>}
          {loading && <span className="text-[8px] mono text-blue-400 font-bold uppercase tracking-widest animate-pulse">Uplink</span>}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20">
        <div className="flex flex-col min-h-full">
          {updates.length === 0 && !loading && (
            <div className="p-6 text-center">
              <p className="text-[10px] text-slate-600 italic">Listening for mission bulletins...</p>
            </div>
          )}
          
          {updates.map((update, idx) => (
            <div 
              key={idx} 
              className="p-3 border-b border-slate-800/50 hover:bg-blue-500/5 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[7px] mono text-blue-500 font-bold">MSG {idx.toString().padStart(2, '0')}</span>
                  <div className="h-px w-4 bg-slate-800 group-hover:bg-blue-500/30 transition-colors"></div>
                </div>
                <span className="text-[7px] mono text-slate-500 tabular-nums uppercase">{update.timestamp}</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed tracking-tight font-medium">
                {update.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-8 bg-slate-900/95 px-3 border-t border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-[7px] text-slate-600 mono font-bold uppercase">Sync: {lastSync || '--:--'}</span>
        </div>
        <button 
          onClick={fetchNews}
          className="group flex items-center space-x-1 disabled:opacity-50"
          disabled={loading}
        >
          <span className="text-[7px] text-blue-500 group-hover:text-blue-400 mono font-bold uppercase tracking-widest transition-colors">Refresh</span>
          <svg className={`w-2 h-2 text-blue-500 group-hover:text-blue-400 transition-transform ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NASANewsCard;