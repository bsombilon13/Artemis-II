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
      case MissionPhase.PRE_LAUNCH: return 'Pre-Launch Sequence';
      case MissionPhase.ASCENT: return 'Ascent & Injection';
      case MissionPhase.ORBIT: return 'Trans-Lunar Transit';
      case MissionPhase.LUNAR_FLYBY: return 'Lunar Sphere of Influence';
      case MissionPhase.RETURN: return 'Earth Re-Entry';
      case MissionPhase.SPLASHDOWN: return 'Recovery Operations';
      default: return 'Artemis II Mission';
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
    <header className="relative z-50 flex flex-col border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 via-orange-500 to-yellow-400"></div>
      {/* Contrast Overlay */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]"></div>

      <div className="relative px-8 py-5 flex items-center justify-between">
        {/* Mission Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA" className="w-12 h-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Artemis_program_%28original_with_wordmark%29.svg" alt="Artemis" className="w-11 h-auto drop-shadow-lg filter brightness-0 invert" />
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-md">Artemis II</h1>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-[0.25em] mt-1.5 drop-shadow-sm">Flight Operations Center</p>
          </div>
        </div>

        {/* Master Mission Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-1">
            <p className="text-[10px] text-white/90 uppercase tracking-[0.3em] font-black drop-shadow-sm">
              {isTMinus ? 'Mission Countdown (L-Minus)' : 'Mission Elapsed Time (T-Plus)'}
            </p>
            {isTMinus && (
              <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full mono border border-white/30 font-bold uppercase backdrop-blur-md">
                Uplink Active
              </span>
            )}
          </div>
          
          <div className={`flex items-baseline font-black mono tracking-tighter tabular-nums ${isTMinus && countdownMs < 60000 ? 'text-red-200 animate-pulse' : 'text-white'} drop-shadow-xl`}>
            <span className="text-5xl opacity-80 font-bold">{isTMinus ? 'L-' : 'T+'}</span>
            <span className="text-5xl font-bold">{timeParts.d}</span>
            <span className="text-2xl mx-1 text-white/40">:</span>
            <span className="text-5xl font-bold">{timeParts.h}</span>
            <span className="text-2xl mx-1 text-white/40">:</span>
            <span className="text-5xl font-bold">{timeParts.m}</span>
            <span className="text-2xl mx-1 text-white/40">:</span>
            <span className="text-5xl font-bold">{timeParts.s}</span>
            <span className="text-2xl mx-1 text-white/40">:</span>
            <span className="text-4xl text-white/90 font-bold">{timeParts.ms}</span>
          </div>
        </div>
        
        {/* Status Quick-Look */}
        <div className="flex space-x-8 items-center">
          <div className="text-right">
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-1 drop-shadow-sm">System Status</p>
            <div className="flex items-center justify-end space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)] border border-white/20"></span>
              <p className="text-sm font-black text-white uppercase tracking-tight drop-shadow-md">{getPhaseName()}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <button 
            onClick={onOpenSettings}
            className="group flex flex-col items-end px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all shadow-lg backdrop-blur-md"
          >
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white">Settings</p>
            <p className="text-xs font-black text-white group-hover:text-blue-100 uppercase">Mission Control</p>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MissionHeader;