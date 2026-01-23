
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
    <div className="glass rounded-xl p-5 border border-slate-800 shadow-2xl mb-4 relative overflow-hidden group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
        <span className="text-6xl font-bold mono">NAV-01</span>
      </div>

      <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Mission Trajectory status</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold mono text-slate-100 tracking-tighter">
              {progress.toFixed(3)}<span className="text-sm text-blue-500 ml-1">%</span>
            </span>
            <span className="text-[9px] mono text-slate-600 uppercase">Mission Completion Index</span>
          </div>
        </div>

        {nextMilestone && (
          <div className="flex flex-col items-end bg-blue-600/5 border border-blue-500/20 rounded-lg px-4 py-2">
            <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping mr-2"></span>
              Target Acquisition: {nextMilestone.label}
            </span>
            <div className="text-sm font-bold mono text-slate-200 tabular-nums">
              T-MINUS {formatCountdown(nextMilestone.offset - elapsedSeconds)}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative h-12 flex items-center group/track">
        {/* Track Glow Effect */}
        <div className="absolute left-0 right-0 h-1 bg-slate-900 rounded-full border border-white/5"></div>
        
        {/* Active Progress with multi-layered glow */}
        <div 
          className="absolute left-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out z-10"
          style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse rounded-full"></div>
        </div>

        {/* Milestone Markers */}
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
              <div className="relative group/marker">
                {/* Ping animation for the next milestone */}
                {isNext && (
                   <div className="absolute inset-0 w-3 h-3 -left-0.5 -top-0.5 rounded-full bg-blue-400/40 animate-ping"></div>
                )}
                
                <div className={`w-2 h-2 rounded-full border-2 border-slate-950 transition-all duration-500 ${
                  isReached ? 'bg-blue-400 scale-110 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-slate-700'
                }`}></div>
                
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ${
                  isReached ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'
                }`}>
                  <span className={`text-[8px] font-bold mono whitespace-nowrap px-1 rounded ${
                    isReached ? 'text-blue-400' : 'text-slate-600'
                  }`}>
                    {m.label}
                  </span>
                  {isNext && (
                    <span className="text-[6px] text-blue-500/80 mono mt-0.5 animate-bounce">▼</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Current Position Rocket Marker */}
        <div 
          className="absolute z-30 transition-all duration-1000 ease-out"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        >
          <div className="flex flex-col items-center -mt-8">
            <div className="px-1.5 py-0.5 bg-white text-slate-950 text-[7px] font-bold mono rounded-sm mb-1 shadow-xl">
               ORION_V4
            </div>
            <div className="w-0.5 h-6 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Footer Info Readouts */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/50 pt-4">
        <div className="flex flex-col">
          <span className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">Vector status</span>
          <span className="text-[10px] mono text-emerald-400 font-bold">NOMINAL_PATH</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">Guidance mode</span>
          <span className="text-[10px] mono text-blue-400 font-bold">AUTO_STELLAR</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">Sync freq</span>
          <span className="text-[10px] mono text-slate-400 font-bold">2.482 GHz</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">System time</span>
          <span className="text-[10px] mono text-slate-400 font-bold tabular-nums">
            {new Date().toISOString().split('T')[1].split('.')[0]} UTC
          </span>
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
