
import React, { useState } from 'react';

interface Props {
  videoIds: string[];
  countdown: number;
  onSave: (ids: string[], countdown: number) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<Props> = ({ videoIds, countdown, onSave, onClose }) => {
  const [tempIds, setTempIds] = useState([...videoIds]);
  const [tempCountdown, setTempCountdown] = useState(countdown);

  const handleIdChange = (idx: number, val: string) => {
    // Simple regex to extract ID if user pastes a full URL
    let id = val;
    if (val.includes('v=')) {
      id = val.split('v=')[1].split('&')[0];
    } else if (val.includes('be/')) {
      id = val.split('be/')[1].split('?')[0];
    } else if (val.includes('embed/')) {
      id = val.split('embed/')[1].split('?')[0];
    }
    
    const newIds = [...tempIds];
    newIds[idx] = id;
    setTempIds(newIds);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md border border-slate-700 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold mono tracking-widest text-slate-100 uppercase">Mission Configuration</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Video Feed IDs</h3>
              <span className="text-[9px] text-slate-600 mono italic">Paste YouTube ID or full URL</span>
            </div>
            {tempIds.map((id, idx) => (
              <div key={idx}>
                <label className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Feed 0{idx + 1} Source</label>
                <input 
                  type="text" 
                  value={id}
                  placeholder="Enter YouTube ID..."
                  onChange={(e) => handleIdChange(idx, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs mono text-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Launch Timeline</h3>
            <div>
              <label className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Set Countdown (Seconds)</label>
              <input 
                type="number" 
                value={tempCountdown}
                onChange={(e) => setTempCountdown(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <p className="mt-2 text-[9px] text-slate-600 mono italic leading-tight">
                Countdown resets only during the PRE-LAUNCH phase.
              </p>
            </div>
          </section>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-widest font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(tempIds, tempCountdown)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-xs uppercase tracking-widest font-bold text-white rounded shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            Update Command Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
