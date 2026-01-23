import React, { useMemo } from 'react';

interface Props {
  elapsedSeconds: number;
}

const MAJOR_MILESTONES = [
  { label: "PRE-LAUNCH", offset: -177300, color: "slate" },
  { label: "LIFTOFF", offset: 0, color: "blue" },
  { label: "STAGING", offset: 128, color: "blue" },
  { label: "ORBIT", offset: 2940, color: "cyan" },
  { label: "TLI", offset: 92220, color: "indigo" },
  { label: "LUNAR", offset: 436980, color: "purple" },
  { label: "SPLASHDOWN", offset: 787560, color: "emerald" }
];

const HorizontalTimeline: React.FC<Props> = ({ elapsedSeconds }) => {
  const minOffset = MAJOR_MILESTONES[0].offset;
  const maxOffset = MAJOR_MILESTONES[MAJOR_MILESTONES.length - 1].offset;
  const totalDuration = maxOffset - minOffset;
  
  const progress = useMemo(() => {
    if (elapsedSeconds <= minOffset) return 0;
    if (elapsedSeconds >= maxOffset) return 100;
    return ((elapsedSeconds - minOffset) / totalDuration) * 100;
  }, [elapsedSeconds, minOffset, totalDuration, maxOffset]);

  const nextMilestone = useMemo(() => {
    return MAJOR_MILESTONES.find(m => m.offset > elapsedSeconds);
  }, [elapsedSeconds]);

  const formatCountdown = (seconds: number) => {
    const abs = Math.abs(seconds);
    const d = Math.floor(abs / 86400);
    const h = Math.floor((abs % 86400) / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = Math.floor(abs % 60);
    
    let parts = [];
    if (d > 0) parts.push(`${d}D`);
    parts.push(`${h.toString().padStart(2, '0')}H`);
    parts.push(`${m.toString().padStart(2, '0')}M`);
    parts.push(`${s.toString().padStart(2, '0')}S`);
    return parts.join(":");
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 shadow-2xl h-full relative overflow-hidden group transition-all duration-500 hover:bg-slate-900/40">
      <div className="flex flex-wrap justify-between items-end mb-8 gap-6 relative z-10">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase tracking-[0.4em] font-black">Mission Trajectory Status</span>
          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-4xl font-black mono text-white tracking-tighter">
              {progress.toFixed(3)}<span className="text-lg text-blue-400 ml-1.5">%</span>
            </span>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Global Index</span>
          </div>
        </div>

        {nextMilestone && (
          <div className="flex flex-col items-end bg-blue-500/10 border border-blue-400/30 rounded-xl px-5 py-3 shadow-lg">
            <span className="text-[10px] text-blue-300 uppercase tracking-[0.2em] font-black mb-1.5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-2.5"></span>
              Target Acquisition: {nextMilestone.label}
            </span>
            <div className="text-lg font-black mono text-white tabular-nums tracking-tight">
              T-Minus {formatCountdown(nextMilestone.offset - elapsedSeconds)}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative h-16 flex items-center z-10">
        <div className="absolute left-0 right-0 h-2.5 bg-slate-950 rounded-full border border-white/10 shadow-inner"></div>
        
        <div 
          className="absolute left-0 h-2.5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out z-10"
          style={{ width: `${progress}%`, boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse rounded-full"></div>
        </div>

        {MAJOR_MILESTONES.map((m, i) => {
          const mPos = ((m.offset - minOffset) / totalDuration) * 100;
          const isReached = elapsedSeconds >= m.offset;
          const isNext = nextMilestone?.label === m.label;
          
          return (
            <div 
              key={i} 
              className="absolute flex flex-col items-center z-20" 
              style={{ left: `${mPos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="relative">
                {isNext && (
                   <div className="absolute inset-0 w-5 h-5 -left-1 -top-1 rounded-full bg-blue-400/30 animate-ping"></div>
                )}
                
                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                  isReached ? 'bg-blue-400 border-white scale-125 shadow-[0_0_12px_rgba(96,165,250,0.8)]' : 'bg-slate-800 border-slate-600'
                }`}></div>
                
                <div className={`absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ${
                  isReached ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'
                }`}>
                  <span className={`text-[10px] font-black whitespace-nowrap px-2 py-0.5 rounded-md ${
                    isReached ? 'text-white bg-blue-600/20' : 'text-slate-500'
                  }`}>
                    {m.label}
                  </span>
                  {isNext && (
                    <span className="text-xs text-blue-400 font-black mt-1.5 animate-bounce">▲</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div 
          className="absolute z-30 transition-all duration-1000 ease-out"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        >
          <div className="flex flex-col items-center -mt-10">
            <div className="px-2 py-1 bg-white text-slate-950 text-[9px] font-black rounded shadow-[0_4px_15px_rgba(255,255,255,0.4)] uppercase">
               Orion V4
            </div>
            <div className="w-0.5 h-8 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-6 relative z-10">
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Vector Status</span>
          <span className="text-sm text-emerald-400 font-black tracking-tight">Nominal Path Locked</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Guidance Mode</span>
          <span className="text-sm text-blue-400 font-black tracking-tight">Stellar Inertial</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">S-Band Link</span>
          <span className="text-sm text-slate-300 font-black tracking-tight">Uplink Encrypted</span>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">System Clock (UTC)</span>
          <span className="text-sm mono text-white font-black tabular-nums tracking-tighter">
            {new Date().toISOString().split('T')[1].split('.')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;