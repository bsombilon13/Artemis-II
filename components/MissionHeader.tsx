
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
    const ms = Math.floor((abs % 1000) / 10); // Display 2 digits for ms
    
    return {
      d: d.toString().padStart(2, '0'),
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
      ms: ms.toString().padStart(2, '0')
    };
  };

  const timeParts = formatCountdown(countdownMs);

  return (
    <header className="glass border-b border-slate-800 z-50 flex flex-col">
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" 
              alt="NASA" 
              className="w-10 h-auto object-contain" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Artemis_program_%28original_with_wordmark%29.svg" 
              alt="Artemis" 
              className="w-10 h-auto object-contain" 
            />
            <img 
              src="https://www3.nasa.gov/send-your-name-with-artemis/img/logo--rocket.png" 
              alt="Mission" 
              className="w-10 h-auto object-contain" 
            />
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter mono leading-none">ARTEMIS II</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Flight Operations Director</p>
          </div>
        </div>

        {/* Master Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {countdownMs > 0 ? 'L-Minus Countdown' : 'Mission Elapsed Time'}
            </p>
            {countdownMs > 0 && (
              <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded mono border border-blue-500/30 font-bold">
                TARGET: FEB 06 21:41 EST
              </span>
            )}
          </div>
          
          <div className={`flex items-baseline font-bold mono tracking-tighter tabular-nums ${countdownMs < 60000 && countdownMs > 0 ? 'text-red-500' : 'text-slate-100'}`}>
            <span className="text-5xl">{countdownMs > 0 ? 'L-' : 'T+'}</span>
            <span className="text-5xl">{timeParts.d}</span>
            <span className="text-2xl mx-1 text-slate-500">:</span>
            <span className="text-5xl">{timeParts.h}</span>
            <span className="text-2xl mx-1 text-slate-500">:</span>
            <span className="text-5xl">{timeParts.m}</span>
            <span className="text-2xl mx-1 text-slate-500">:</span>
            <span className="text-5xl">{timeParts.s}</span>
            <span className="text-2xl mx-1 text-slate-500">:</span>
            <span className="text-3xl text-blue-400 w-[1.2em]">{timeParts.ms}</span>
          </div>
        </div>
        
        <div className="flex space-x-6 items-center">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mission Status</p>
            <p className="text-sm font-bold text-blue-400 mono">{getPhaseName()}</p>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <button 
            onClick={onOpenSettings}
            className="flex flex-col items-end group"
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Config</p>
            <p className="text-sm font-bold mono group-hover:text-white transition-colors">DASHBOARD</p>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MissionHeader;
