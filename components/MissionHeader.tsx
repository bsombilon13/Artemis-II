import React from 'react';
import { MissionPhase } from '../types';

interface Props {
  phase: MissionPhase;
  setPhase: (phase: MissionPhase) => void;
  countdownMs: number;
  onOpenSettings: () => void;
}

const MissionHeader: React.FC<Props> = ({ phase, setPhase, countdownMs, onOpenSettings }) => {
  const getPhaseName = () => {
    switch (phase) {
      case MissionPhase.PRE_LAUNCH: return 'PRE-LAUNCH SEQUENCE';
      case MissionPhase.ASCENT: return 'ASCENT & INJECTION';
      case MissionPhase.ORBIT: return 'TRANS-LUNAR TRANSIT';
      case MissionPhase.LUNAR_FLYBY: return 'LUNAR SPHERE OF INFLUENCE';
      case MissionPhase.RETURN: return 'EARTH RE-ENTRY';
      case MissionPhase.SPLASHDOWN: return 'RECOVERY OPERATIONS';
      default: return 'ARTEMIS II MISSION';
    }
  };

  const formatCountdown = (msTotal: number) => {
    const abs = Math.abs(msTotal);
    const d = Math.floor(abs / (1000 * 60 * 60 * 24));
    const h = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((abs % (1000 * 60)) / 1000);
    const ms = Math.floor((abs % 1000) / 10);
    
    return {
      d: d.toString().padStart(2, '0'),
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
      ms: ms.toString().padStart(2, '0')
    };
  };

  const timeParts = formatCountdown(countdownMs);
  const isTMinus = countdownMs > 0;

  return (
    <header className="glass border-b border-white/10 z-50 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Mission Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA" className="w-12 h-auto drop-shadow-lg" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Artemis_program_%28original_with_wordmark%29.svg" alt="Artemis" className="w-11 h-auto" />
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight mono leading-none text-white">ARTEMIS II</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1.5">FLIGHT_OPERATIONS_CENTER</p>
          </div>
        </div>

        {/* Master Mission Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">
              {isTMinus ? 'MISSION COUNTDOWN (L-MINUS)' : 'MISSION ELAPSED TIME (T-PLUS)'}
            </p>
            {isTMinus && (
              <span className="text-[9px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full mono border border-blue-500/40 font-bold uppercase">
                Uplink Active
              </span>
            )}
          </div>
          
          <div className={`flex items-baseline font-black mono tracking-tighter tabular-nums ${isTMinus && countdownMs < 60000 ? 'text-red-500' : 'text-white'}`}>
            <span className="text-5xl opacity-80">{isTMinus ? 'L-' : 'T+'}</span>
            <span className="text-5xl">{timeParts.d}</span>
            <span className="text-2xl mx-1 text-slate-600">:</span>
            <span className="text-5xl">{timeParts.h}</span>
            <span className="text-2xl mx-1 text-slate-600">:</span>
            <span className="text-5xl">{timeParts.m}</span>
            <span className="text-2xl mx-1 text-slate-600">:</span>
            <span className="text-5xl">{timeParts.s}</span>
            <span className="text-2xl mx-1 text-slate-600">:</span>
            <span className="text-4xl text-blue-400 font-bold">{timeParts.ms}</span>
          </div>
        </div>
        
        {/* Status Quick-Look */}
        <div className="flex space-x-8 items-center">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">SYSTEM_STATUS</p>
            <div className="flex items-center justify-end space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-sm font-black text-blue-300 mono uppercase tracking-tight">{getPhaseName()}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <button 
            onClick={onOpenSettings}
            className="group flex flex-col items-end px-4 py-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-blue-400">CONFIG</p>
            <p className="text-xs font-black mono text-white group-hover:text-blue-200 uppercase">Mission_Control</p>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MissionHeader;