
import React, { useMemo, useRef, useEffect, useState } from 'react';

interface Props {
  elapsedSeconds: number;
  hideContainer?: boolean;
}

interface Milestone {
  id: number;
  label: string;
  description: string;
  x: number;
  y: number;
  t: number;
}

const MILESTONES: Milestone[] = [
  { id: 1, label: "LAUNCH", description: "SLS Liftoff from LC-39B. Crew: Wiseman, Glover, Koch, Hansen.", x: 22, y: 35, t: 0 },
  { id: 2, label: "JETTISON", description: "SRB separation and LAS jettison. Ascent continues on Core Stage.", x: 25, y: 30, t: 128 },
  { id: 5, label: "APOGEE RAISE", description: "High Earth Orbit maneuver to test spacecraft systems before TLI.", x: 10, y: 35, t: 6477 },
  { id: 10, label: "TLI", description: "Translunar Injection. ICPS burn sends Orion toward the Moon.", x: 45, y: 55, t: 92220 },
  { id: 11, label: "FLYBY", description: "Lunar Farside Flyby. Orion reaches its furthest point from Earth.", x: 88, y: 60, t: 436980 },
  { id: 12, label: "TEI", description: "Trans-Earth Injection. Burn to return crew safely to Earth.", x: 65, y: 60, t: 503220 },
  { id: 15, label: "SPLASHDOWN", description: "Orion Crew Module splashdown in the Pacific Ocean.", x: 20, y: 22, t: 787560 }
];

const MissionTrajectoryMap: React.FC<Props> = ({ elapsedSeconds, hideContainer }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [indicatorPos, setIndicatorPos] = useState({ x: 0, y: 0 });
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  const pathD = "M 22,35 C 25,10 5,10 5,35 C 5,60 25,75 40,65 C 55,55 75,40 85,50 C 95,60 95,75 85,85 C 75,95 65,85 55,70 C 45,55 35,40 20,22";

  const totalMissionSeconds = 787560;
  const progress = Math.max(0, Math.min(1, elapsedSeconds / totalMissionSeconds));

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(length * progress);
      setIndicatorPos({ x: point.x, y: point.y });
    }
  }, [progress]);

  const mapContent = (
    <div className="relative h-full w-full flex flex-col p-4 bg-slate-950/40">
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
             <span className="text-[8px] mono text-slate-400">OUTBOUND</span>
          </div>
          <div className="flex items-center space-x-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <span className="text-[8px] mono text-slate-400">RETURN</span>
          </div>
        </div>
        <span className="text-[8px] text-slate-600 mono italic">CLICK MILESTONES FOR INTEL</span>
      </div>

      <div className="relative flex-1 bg-slate-950/50 rounded-lg border border-slate-800/50 overflow-hidden min-h-[240px]">
        {/* Space Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path d={pathD} fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          <path ref={pathRef} d={pathD} fill="none" stroke="url(#pathGradient)" strokeWidth="0.8" strokeDasharray="2,2" className="opacity-80" />

          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <radialGradient id="earthGlow"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></radialGradient>
            <radialGradient id="moonGlow"><stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.3" /><stop offset="100%" stopColor="#f1f5f9" stopOpacity="0" /></radialGradient>
          </defs>

          {/* Celestial Bodies */}
          <circle cx="20" cy="35" r="8" fill="url(#earthGlow)" className="animate-pulse" />
          <circle cx="20" cy="35" r="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.5" />
          <circle cx="85" cy="70" r="6" fill="url(#moonGlow)" />
          <circle cx="85" cy="70" r="3" fill="#334155" stroke="#94a3b8" strokeWidth="0.5" />

          {/* Interactive Milestone Markers */}
          {MILESTONES.map((m) => {
            const isPassed = elapsedSeconds >= m.t;
            const isSelected = selectedMilestone?.id === m.id;
            return (
              <g key={m.id} 
                 className="cursor-pointer group" 
                 onClick={() => setSelectedMilestone(m)}>
                <circle cx={m.x} cy={m.y} r="3" fill="transparent" /> {/* Larger hit area */}
                <circle 
                  cx={m.x} cy={m.y} r={isSelected ? "2" : "1.5"} 
                  fill={isPassed ? "#3b82f6" : "#0f172a"} 
                  stroke={isSelected ? "#fff" : (isPassed ? "#93c5fd" : "#334155")} 
                  strokeWidth={isSelected ? "0.6" : "0.3"} 
                  className="transition-all duration-300"
                />
                <text x={m.x} y={m.y - 4} textAnchor="middle" className={`text-[4px] font-bold mono transition-colors ${isSelected ? 'fill-white' : (isPassed ? 'fill-blue-400' : 'fill-slate-600')}`}>
                  {m.id}
                </text>
              </g>
            );
          })}

          {/* Spacecraft */}
          {progress > 0 && progress < 1 && (
            <g transform={`translate(${indicatorPos.x}, ${indicatorPos.y})`}>
              <circle r="2" fill="#3b82f6" className="animate-ping opacity-40" />
              <circle r="1.2" fill="#fff" stroke="#3b82f6" strokeWidth="0.4" />
            </g>
          )}
        </svg>

        {/* Dynamic Data Overlay */}
        <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none">
          <span className="text-[7px] mono text-blue-400 font-bold uppercase tracking-tight">V_TRAJ_POS: LOCKED</span>
          <span className="text-[6px] mono text-slate-500">REL_XYZ: {indicatorPos.x.toFixed(1)}, {indicatorPos.y.toFixed(1)}, 0.0</span>
        </div>

        {/* Milestone Information Popup */}
        {selectedMilestone && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 border border-blue-500/40 rounded p-2 animate-in slide-in-from-bottom-2 fade-in duration-300 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-col">
                <span className="text-[8px] text-blue-400 mono font-bold">MS_{selectedMilestone.id}: {selectedMilestone.label}</span>
                <span className="text-[7px] text-slate-500 mono uppercase tracking-widest">Flight Protocol Information</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedMilestone(null); }} className="text-slate-500 hover:text-white">&times;</button>
            </div>
            <p className="text-[9px] text-slate-300 leading-tight">
              {selectedMilestone.description}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 shrink-0">
        <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
           <span className="text-[7px] text-slate-500 uppercase block mb-0.5">Current Sector</span>
           <span className="text-[9px] mono text-blue-300 font-bold uppercase truncate">
             {elapsedSeconds < 92220 ? 'High Earth Orbit' : elapsedSeconds < 436980 ? 'Translunar Coast' : 'Lunar Return'}
           </span>
        </div>
        <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
           <span className="text-[7px] text-slate-500 uppercase block mb-0.5">Target Apex</span>
           <span className="text-[9px] mono text-emerald-300 font-bold uppercase truncate">
             {elapsedSeconds < 436980 ? 'Perilune - 10k KM' : 'Entry Interface'}
           </span>
        </div>
      </div>
    </div>
  );

  return hideContainer ? mapContent : (
    <div className="glass rounded-xl border border-slate-800 shadow-2xl overflow-hidden h-full">
      {mapContent}
    </div>
  );
};

export default MissionTrajectoryMap;
