
import React from 'react';
import { MissionUpdate } from '../types';

interface Props {
  updates: MissionUpdate[];
}

const MissionLog: React.FC<Props> = ({ updates }) => {
  return (
    <div className="glass rounded-xl h-48 border border-slate-800 flex flex-col overflow-hidden">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Mission Event Log</h3>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {updates.length === 0 && (
          <div className="text-slate-700">Awaiting initial telemetry sequence...</div>
        )}
        {updates.map((update, idx) => (
          <div key={idx} className="flex space-x-4 group">
            <span className="text-slate-600 shrink-0">[{update.time}]</span>
            <span className={`shrink-0 font-bold ${
              update.type === 'system' ? 'text-slate-400' : 'text-emerald-500'
            }`}>
              {update.source}:
            </span>
            <span className="text-slate-300">
              {update.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionLog;
