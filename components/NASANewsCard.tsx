import React, { useState, useEffect } from 'react';
import { getLatestNASANews } from '../services/geminiService';

const NASANewsCard: React.FC = () => {
  const [news, setNews] = useState<string>("Initializing NASA news uplink...");
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  const fetchNews = async () => {
    setLoading(true);
    const result = await getLatestNASANews();
    setNews(result);
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
      <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">NASA Mission Intelligence</h3>
        </div>
        {loading && (
          <span className="text-[7px] mono text-blue-400 animate-pulse font-bold">POLLING...</span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/30">
        <div className="prose prose-invert max-w-none">
          <div className="text-[10px] mono text-slate-300 leading-relaxed whitespace-pre-wrap">
            {news}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 px-3 py-1.5 border-t border-slate-800 flex justify-between items-center">
        <span className="text-[7px] text-slate-600 mono font-bold">SOURCE: NASA.GOV_RSS</span>
        <button 
          onClick={fetchNews}
          className="text-[7px] text-blue-500 hover:text-blue-400 mono font-bold uppercase tracking-widest transition-colors"
          disabled={loading}
        >
          {loading ? 'BUSY' : `SYNC @ ${lastSync || '00:00:00'}`}
        </button>
      </div>
    </div>
  );
};

export default NASANewsCard;