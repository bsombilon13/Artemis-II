
import React, { useMemo, useRef, useEffect, useState } from 'react';

interface Props {
  elapsedSeconds: number;
  hideContainer?: boolean;
}

interface Milestone {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
  historicalFact: string;
  missionFact: string;
  x: number;
  y: number;
  t: number;
  color: string;
}

/**
 * Milestones mapped to the high-fidelity NASA mission profile
 * Times are approximate for visualization based on a ~10 day mission
 */
const MILESTONES: Milestone[] = [
  { 
    id: 0, 
    label: "LAUNCH & ASCENT", 
    shortLabel: "LIFT",
    description: "The SLS rocket ignites and Orion begins its climb to Earth orbit.", 
    historicalFact: "Artemis II is the first crewed mission to the lunar vicinity in over 50 years.",
    missionFact: "Maximum dynamic pressure (Max-Q) occurs at approximately 70 seconds.",
    x: 21, y: 34, t: 0, color: "#3b82f6" 
  },
  { 
    id: 1, 
    label: "TRANSLUNAR INJECTION", 
    shortLabel: "TLI",
    description: "The ICPS upper stage performs the critical burn to send Orion toward the Moon.", 
    historicalFact: "The TLI burn for Apollo missions was a critical 'Go' point for deep space.",
    missionFact: "Orion's velocity increases by 3,000 m/s to break Earth's gravity.",
    x: 35, y: 30, t: 92220, color: "#10b981" 
  },
  { 
    id: 2, 
    label: "OUTBOUND POWERED FLYBY", 
    shortLabel: "OPF",
    description: "Close approach (60 nmi) using Moon's gravity to target DRO insertion.", 
    historicalFact: "Gravity assists were pioneered by missions like Mariner 10 and Voyager.",
    missionFact: "Orion uses the Moon's gravity to whip it into a high-altitude lunar orbit.",
    x: 65, y: 56, t: 341940, color: "#10b981" 
  },
  { 
    id: 3, 
    label: "LUNAR ORBIT INSERTION", 
    shortLabel: "LOI",
    description: "Main engine burn to enter Distant Retrograde Orbit.", 
    historicalFact: "Apollo 8 was the first human-crewed spacecraft to reach lunar orbit in 1968.",
    missionFact: "DRO is highly stable and requires minimal fuel to maintain over long periods.",
    x: 82, y: 48, t: 360000, color: "#94a3b8" 
  },
  { 
    id: 4, 
    label: "DISTANT RETROGRADE ORBIT", 
    shortLabel: "DRO",
    description: "Orbit 38,000 nmi from Moon surface to test deep space durability.", 
    historicalFact: "Artemis I successfully tested this same orbit in an uncrewed configuration.",
    missionFact: "Orion will travel further from Earth than any human-crewed spacecraft in history.",
    x: 75, y: 80, t: 421320, color: "#94a3b8" 
  },
  { 
    id: 5, 
    label: "DRO DEPARTURE", 
    shortLabel: "DEP",
    description: "Leave stable lunar orbit and initiate return coast to Earth.", 
    historicalFact: "The 'Trans-Earth Injection' burn is the critical step for coming home.",
    missionFact: "Departure timing is calculated to align with precise Pacific landing sites.",
    x: 64, y: 72, t: 503220, color: "#3b82f6" 
  },
  { 
    id: 6, 
    label: "RETURN POWERED FLYBY", 
    shortLabel: "RPF",
    description: "Close flyby burn to slingshot Orion back toward Earth's atmosphere.", 
    historicalFact: "The return leg is often called the 'homeward bound' phase of the mission.",
    missionFact: "Orion targets a narrow 'entry corridor' only a few miles wide.",
    x: 62, y: 60, t: 550000, color: "#3b82f6" 
  },
  { 
    id: 7, 
    label: "RE-ENTRY & SPLASHDOWN", 
    shortLabel: "SPLASH",
    description: "Orion enters atmosphere and splashes down in the Pacific.", 
    historicalFact: "Recovery ships like the USS Portland are stationed for rapid extraction.",
    missionFact: "The heat shield must withstand 5,000°F during the skip-entry maneuver.",
    x: 18, y: 38, t: 787560, color: "#ef4444" 
  }
];

const MissionTrajectoryMap: React.FC<Props> = ({ elapsedSeconds, hideContainer }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  
  const outboundPath = "M 21,34 C 25,30 30,28 40,28 C 55,28 60,45 65,56 C 75,65 85,55 82,48";
  const orbitPath = "M 82,48 C 75,40 95,75 75,80 C 65,85 55,75 64,72";
  const returnPath = "M 64,72 C 70,65 65,65 62,60 C 50,45 30,45 18,38";
  
  const fullPathD = `${outboundPath} ${orbitPath.replace('M', 'L')} ${returnPath.replace('M', 'L')}`;
  
  const totalMissionSeconds = 787560;
  const progress = Math.max(0, Math.min(1, elapsedSeconds / totalMissionSeconds));

  const pathRef = useRef<SVGPathElement>(null);
  const [indicatorPos, setIndicatorPos] = useState({ x: 0, y: 0, angle: 0 });

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(length * progress);
      const nextPoint = pathRef.current.getPointAtLength(Math.min(length, length * progress + 0.1));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
      setIndicatorPos({ x: point.x, y: point.y, angle });
    }
  }, [progress]);

  // Current milestone based on time
  const currentActiveMilestone = useMemo(() => {
    return [...MILESTONES].reverse().find(m => elapsedSeconds >= m.t) || MILESTONES[0];
  }, [elapsedSeconds]);

  // Auto-sync selection to current phase
  useEffect(() => {
    if (isSynced) {
      setSelectedMilestone(currentActiveMilestone);
    }
  }, [currentActiveMilestone, isSynced]);

  const mapContent = (
    <div className="relative h-full w-full flex flex-col p-4 bg-slate-950/40 select-none">
      {/* Tactical Status Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Cislunar Navigation Display</span>
          <div className="flex items-center space-x-3 mt-1">
             <div className="flex items-center space-x-1">
               <div className="w-2 h-0.5 bg-emerald-500"></div>
               <span className="text-[8px] mono text-slate-400 uppercase">Outbound</span>
             </div>
             <div className="flex items-center space-x-1">
               <div className="w-2 h-0.5 bg-slate-500"></div>
               <span className="text-[8px] mono text-slate-400 uppercase">DRO_Phase</span>
             </div>
             <div className="flex items-center space-x-1">
               <div className="w-2 h-0.5 bg-blue-500"></div>
               <span className="text-[8px] mono text-slate-400 uppercase">Return</span>
             </div>
          </div>
        </div>
        <button 
          onClick={() => setIsSynced(!isSynced)}
          className={`px-2 py-0.5 rounded text-[8px] mono border transition-all flex items-center space-x-2 ${isSynced ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
        >
          <span className={`w-1 h-1 rounded-full ${isSynced ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <span>{isSynced ? 'SYNC_LOCKED' : 'MANUAL_VIEW'}</span>
        </button>
      </div>

      <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-slate-800/50 overflow-hidden shadow-inner group/map">
        {/* Dynamic Scanlines / Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="mapGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <radialGradient id="earthGrad">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="60%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <radialGradient id="moonGrad">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="80%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>
          </defs>

          {/* TRAJECTORY PATH SEGMENTS */}
          <path d={outboundPath} fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1,1" className="opacity-40" />
          <path d={orbitPath} fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1,1" className="opacity-40" />
          <path d={returnPath} fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1,1" className="opacity-40" />

          {/* Hidden reference path for movement calculation */}
          <path ref={pathRef} d={fullPathD} fill="none" stroke="transparent" />

          {/* Active progress highlight */}
          <path 
             d={fullPathD} 
             fill="none" 
             stroke="#fff" 
             strokeWidth="0.5" 
             className="opacity-30"
             strokeDasharray="1000"
             strokeDashoffset={1000 - (progress * 1000)}
          />

          {/* EARTH */}
          <g transform="translate(20, 35)">
             <circle r="12" fill="rgba(59, 130, 246, 0.05)" className="animate-pulse" />
             <circle r="7" fill="url(#earthGrad)" stroke="#3b82f6" strokeWidth="0.2" />
             <path d="M -2,-2 Q 0,-4 3,-1 Q 4,2 1,4 Q -1,5 -4,2 Z" fill="#3b82f6" opacity="0.3" />
             <text y="12" textAnchor="middle" className="text-[3px] mono fill-blue-400/60 font-bold uppercase tracking-widest">Earth</text>
          </g>

          {/* MOON */}
          <g transform="translate(75, 60)">
             <circle r="9" fill="rgba(255, 255, 255, 0.03)" />
             <circle r="5" fill="url(#moonGrad)" stroke="#94a3b8" strokeWidth="0.2" />
             <text y="10" textAnchor="middle" className="text-[3px] mono fill-slate-400 font-bold uppercase tracking-widest">The Moon</text>
          </g>

          {/* MILESTONE INTERACTIVE MARKERS */}
          {MILESTONES.map((m) => {
            const isPassed = elapsedSeconds >= m.t;
            const isHovered = hoveredId === m.id;
            const isCurrent = isSynced && currentActiveMilestone.id === m.id;
            const isSelected = selectedMilestone?.id === m.id;
            const isActive = isSelected || isHovered || isCurrent;

            return (
              <g key={m.id} 
                 className="cursor-pointer group"
                 onMouseEnter={() => setHoveredId(m.id)}
                 onMouseLeave={() => setHoveredId(null)}
                 onClick={() => { setSelectedMilestone(m); setIsSynced(false); }}
              >
                {/* Hit area */}
                <circle cx={m.x} cy={m.y} r="6" fill="transparent" />
                
                {/* Current phase ping */}
                {isCurrent && (
                  <circle cx={m.x} cy={m.y} r="4" fill={m.color} className="opacity-20 animate-ping" />
                )}

                {/* Main point */}
                <circle 
                  cx={m.x} cy={m.y} 
                  r={isActive ? "2.5" : "1.2"} 
                  fill={isPassed ? m.color : "#020617"} 
                  stroke={isActive ? "#fff" : (isPassed ? "#fff" : "#334155")} 
                  strokeWidth={isActive ? "1" : "0.3"} 
                  filter={isActive ? "url(#mapGlow)" : "none"}
                  className="transition-all duration-300"
                />

                {/* Status indicator line */}
                {isActive && (
                  <line x1={m.x} y1={m.y} x2={m.x} y2={m.y - 6} stroke="#fff" strokeWidth="0.2" strokeDasharray="1,1" />
                )}

                {/* Milestone Label */}
                <text 
                  x={m.x} y={m.y - 8} 
                  textAnchor="middle" 
                  className={`text-[2.5px] mono font-bold uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'opacity-100 fill-white' : 'opacity-0'}`}
                >
                  {m.shortLabel}
                </text>
              </g>
            );
          })}

          {/* ORION SPACECRAFT INDICATOR */}
          {progress >= 0 && progress < 1 && (
            <g transform={`translate(${indicatorPos.x}, ${indicatorPos.y}) rotate(${indicatorPos.angle})`}>
              <circle r="3" fill="rgba(59, 130, 246, 0.2)" className="animate-ping" />
              <path 
                d="M -1.2,-0.8 L 1.5,0 L -1.2,0.8 Z" 
                fill="#fff" 
                stroke="#3b82f6" 
                strokeWidth="0.2" 
                filter="url(#mapGlow)"
              />
            </g>
          )}
        </svg>

        {/* Floating Detail Panel (Tactical UI) */}
        {selectedMilestone && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900/95 border border-blue-500/30 rounded-lg p-3 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isSynced && currentActiveMilestone.id === selectedMilestone.id ? 'animate-pulse' : ''}`} style={{ backgroundColor: selectedMilestone.color }}></div>
                  <h4 className="text-[10px] font-bold text-white mono uppercase tracking-widest">{selectedMilestone.label}</h4>
                </div>
                {isSynced && currentActiveMilestone.id === selectedMilestone.id && (
                  <span className="text-[7px] text-blue-400 mono font-bold uppercase mt-0.5 ml-4">● Active Phase</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[8px] mono px-1.5 py-0.5 rounded ${elapsedSeconds >= selectedMilestone.t ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {elapsedSeconds >= selectedMilestone.t ? 'COMPLETED' : 'PENDING'}
                </span>
                <button 
                  onClick={() => { setSelectedMilestone(null); setIsSynced(false); }}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-mono italic">"{selectedMilestone.description}"</p>
            
            <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-800">
               <div>
                  <span className="text-[7px] text-blue-400 font-bold uppercase block mb-0.5">Historical Brief</span>
                  <p className="text-[8px] text-slate-500 leading-tight italic">{selectedMilestone.historicalFact}</p>
               </div>
               <div>
                  <span className="text-[7px] text-emerald-400 font-bold uppercase block mb-0.5">Technical Spec</span>
                  <p className="text-[8px] text-slate-400 leading-tight mono">{selectedMilestone.missionFact}</p>
               </div>
            </div>
          </div>
        )}

        {/* Global Position Metrics */}
        <div className="absolute bottom-4 right-4 text-right pointer-events-none">
          <div className="flex flex-col space-y-1">
            <div className="bg-slate-900/60 border border-white/5 rounded px-2 py-1">
               <span className="text-[7px] text-slate-500 uppercase block font-bold">Vector Magnitude</span>
               <span className="text-[10px] mono text-blue-400 font-bold">{(indicatorPos.angle + 360).toFixed(2)}° THETA</span>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded px-2 py-1">
               <span className="text-[7px] text-slate-500 uppercase block font-bold">SOI Status</span>
               <span className="text-[10px] mono text-emerald-400 font-bold uppercase">
                 {progress < 0.1 ? 'ASCENT' : progress < 0.4 ? 'EARTH_CENTRIC' : progress < 0.7 ? 'LUNAR_CENTRIC' : 'RE-ENTRY'}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[8px] text-slate-500 uppercase block mb-1">Cislunar Distance</span>
           <span className="text-[11px] mono text-blue-300 font-bold uppercase">
             {(progress * 384400).toLocaleString()} <span className="text-[8px] text-slate-600">KM</span>
           </span>
        </div>
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[8px] text-slate-500 uppercase block mb-1">Orbital Period</span>
           <span className="text-[11px] mono text-emerald-300 font-bold uppercase">
             {progress < 0.2 ? 'TBD' : '142.4 HRS'}
           </span>
        </div>
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[8px] text-slate-500 uppercase block mb-1">Navigation Signal</span>
           <span className="text-[11px] mono text-slate-300 font-bold uppercase">
             {isSynced ? 'DSN_LINKED' : 'MANUAL_MODE'}
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
