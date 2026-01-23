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

  const fetchNews = async () => {
    setLoading(true);
    const result = await getLatestNASANews();
    if (Array.isArray(result)) {
      setUpdates(result);
    }
    setLastSync(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-xl h-full border border-slate-800 flex flex-col overflow-hidden bg-slate-900/60 shadow-2xl">
      <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">NASA Intelligence Feed</h3>
        </div>
        {loading && (
          <span className="text-[7px] mono text-blue-400 animate-pulse font-bold uppercase">Uplink Active</span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/30">
        <div className="flex flex-col">
          {updates.length === 0 && !loading && (
            <div className="p-4 text-[10px] mono text-slate-600 italic">No mission bulletins currently in buffer...</div>
          )}
          {updates.map((update, idx) => (
            <div 
              key={idx} 
              className={`p-3 border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors last:border-0 ${loading ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[7px] mono text-blue-500 font-bold uppercase tracking-widest">BULLETIN_{idx.toString().padStart(2, '0')}</span>
                <span className="text-[7px] mono text-slate-600">{update.timestamp}</span>
              </div>
              <p className="text-[10px] mono text-slate-300 leading-relaxed font-medium">
                {update.content}
              </p>
            </div>
          ))}
          {loading && updates.length === 0 && (
            <div className="p-6 flex flex-col items-center justify-center space-y-3 opacity-40">
              <div className="w-4 h-4 border border-blue-500/50 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-[8px] mono text-slate-500 uppercase tracking-widest">Synchronizing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/90 px-3 py-1.5 border-t border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[7px] text-slate-600 mono font-bold">MODE: REAL_TIME</span>
          <span className="text-[7px] text-slate-800 mono">|</span>
          <span className="text-[7px] text-slate-600 mono">{updates.length} ENTRIES</span>
        </div>
        <button 
          onClick={fetchNews}
          className="text-[7px] text-blue-500 hover:text-blue-400 mono font-bold uppercase tracking-widest transition-colors disabled:opacity-30"
          disabled={loading}
        >
          {loading ? 'WAIT' : `REF @ ${lastSync || '00:00:00'}`}
        </button>
      </div>
    </div>
  );
};

export default NASANewsCard;