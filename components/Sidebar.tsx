
import React from 'react';
import { MissionPhase } from '../types';

interface Props {
  currentPhase: MissionPhase;
  setPhase: (phase: MissionPhase) => void;
  countdown: number;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<Props> = ({ currentPhase, setPhase, countdown, onOpenSettings }) => {
  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const phases = [
    { id: MissionPhase.PRE_LAUNCH, label: 'Pre-Launch' },
    { id: MissionPhase.ASCENT, label: 'Ascent' },
    { id: MissionPhase.ORBIT, label: 'Transit' },
    { id: MissionPhase.LUNAR_FLYBY, label: 'Moon' },
    { id: MissionPhase.RETURN, label: 'Return' },
    { id: MissionPhase.SPLASHDOWN, label: 'Splashdown' },
  ];

  return (
    <aside className="w-64 glass border-r border-slate-800 flex flex-col z-20">
      <div className="p-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA" className="w-8" />
        </div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-1">Countdown</h2>
        <div className={`text-3xl font-bold mono ${countdown < 10 && currentPhase === MissionPhase.PRE_LAUNCH ? 'text-red-500' : 'text-slate-100'}`}>
          {currentPhase === MissionPhase.PRE_LAUNCH ? `T-${formatCountdown(countdown)}` : 'T+ LAUNCH'}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Mission Phases</h2>
          <button 
            onClick={onOpenSettings}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
          >
            Config
          </button>
        </div>
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => setPhase(phase.id)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-between ${
              currentPhase === phase.id 
                ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400' 
                : 'hover:bg-slate-800/50 text-slate-400'
            }`}
          >
            <span className="mono">{phase.label}</span>
            {currentPhase === phase.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 glow-blue"></div>}
          </button>
        ))}
      </nav>

      <div className="p-6 bg-slate-900/50 border-t border-slate-800">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              <span>H2 Capacity</span>
              <span>84%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[84%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              <span>LOX Capacity</span>
              <span>92%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-[92%]"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
