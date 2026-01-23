
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { getLatestNASANews } from '../services/geminiService';

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
    label: "HEO PERIGEE RAISE", 
    shortLabel: "HEO",
    description: "Engine burn to reach High Earth Orbit for 24 hours of system testing.", 
    historicalFact: "HEO testing ensures life support systems are fully operational before TLI.",
    missionFact: "Orion's first burn in space to raise perigee from Earth's atmosphere.",
    x: 30, y: 28, t: 2940, color: "#60a5fa" 
  },
  { 
    id: 2, 
    label: "TRANSLUNAR INJECTION", 
    shortLabel: "TLI",
    description: "The ICPS upper stage sends the crew on their trajectory toward the Moon.", 
    historicalFact: "TLI marks the departure from Earth's immediate influence.",
    missionFact: "The ICPS provides the massive impulse needed to reach lunar distances.",
    x: 42, y: 28, t: 92220, color: "#10b981" 
  },
  { 
    id: 3, 
    label: "CLOSEST APPROACH (FLYBY)", 
    shortLabel: "FLYBY",
    description: "Orion passes behind the Moon, using gravity for a free return to Earth.", 
    historicalFact: "The flyby provides a spectacular view of the Lunar Farside.",
    missionFact: "Altitude drops to approx 10,000km above the lunar surface.",
    x: 75, y: 60, t: 436980, color: "#f1f5f9" 
  },
  { 
    id: 4, 
    label: "TRANSEARTH COAST", 
    shortLabel: "TEC",
    description: "The long journey back to Earth following the lunar gravity assist.", 
    historicalFact: "The free-return trajectory is a safety-first flight design.",
    missionFact: "Velocity gradually increases as Orion is pulled back by Earth's gravity.",
    x: 45, y: 55, t: 550000, color: "#3b82f6" 
  },
  { 
    id: 5, 
    label: "RE-ENTRY & SPLASHDOWN", 
    shortLabel: "SPLASH",
    description: "Orion enters atmosphere and splashes down in the Pacific Ocean.", 
    historicalFact: "Artemis II splashdown targets the coast of San Diego.",
    missionFact: "The skip-entry maneuver bleeds off 25,000 mph of velocity.",
    x: 18, y: 38, t: 787560, color: "#ef4444" 
  }
];

const MissionTrajectoryMap: React.FC<Props> = ({ elapsedSeconds, hideContainer }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  const [nasaNews, setNasaNews] = useState<string>("Connecting to NASA Command Link...");
  const [newsLoading, setNewsLoading] = useState(false);
  
  const outboundPath = "M 21,34 C 25,25 35,20 50,25 C 65,30 80,45 75,60";
  const returnPath = "M 75,60 C 70,75 50,75 35,60 C 25,50 20,42 18,38";
  
  const fullPathD = `${outboundPath} ${returnPath.replace('M', 'L')}`;
  const totalMissionSeconds = 787560;
  const progress = Math.max(0, Math.min(1, elapsedSeconds / totalMissionSeconds));

  const pathRef = useRef<SVGPathElement>(null);
  const [indicatorPos, setIndicatorPos] = useState({ x: 0, y: 0, angle: 0 });

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(length * progress);
      const nextPoint = pathRef.current.getPointAtLength(Math.min(length, length * progress + 0.1));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      setIndicatorPos({ x: point.x, y: point.y, angle });
    }
  }, [progress]);

  const fetchNews = async () => {
    setNewsLoading(true);
    const news = await getLatestNASANews();
    setNasaNews(news);
    setNewsLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const newsInterval = setInterval(fetchNews, 600000); // 10 min refresh
    return () => clearInterval(newsInterval);
  }, []);

  const currentActiveMilestone = useMemo(() => {
    return [...MILESTONES].reverse().find(m => elapsedSeconds >= m.t) || MILESTONES[0];
  }, [elapsedSeconds]);

  useEffect(() => {
    if (isSynced) setSelectedMilestone(currentActiveMilestone);
  }, [currentActiveMilestone, isSynced]);

  const soiStatusText = useMemo(() => {
    const t = elapsedSeconds;
    if (t < 0) return 'PRE-LAUNCH';
    if (t < 486) return 'POWERED_ASCENT';
    if (t < 2940) return 'EARTH_ORBIT';
    if (t < 92220) return 'HEO_TEST_PHASE';
    if (t < 430000) return 'TRANSLUNAR_COAST';
    if (t < 445000) return 'LUNAR_ENCOUNTER';
    if (t < 780000) return 'TRANSEARTH_COAST';
    if (t < 787560) return 'ATMOS_REENTRY';
    return 'MISSION_COMPLETE';
  }, [elapsedSeconds]);

  const distanceKm = useMemo(() => {
    const t = elapsedSeconds;
    if (t < 0) return 0;
    const maxDist = 400171; 
    if (t < 436980) { 
      const p = t / 436980;
      return p * maxDist;
    } else if (t < 787560) { 
      const p = (t - 436980) / (787560 - 436980);
      return maxDist * (1 - p);
    }
    return 0;
  }, [elapsedSeconds]);

  const mapContent = (
    <div className="relative h-full w-full flex flex-col p-4 bg-slate-950/40 select-none">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Artemis II Trajectory Status</span>
          <div className="flex items-center space-x-3 mt-1">
             <div className="flex items-center space-x-1">
               <div className="w-2 h-0.5 bg-emerald-500/50"></div>
               <span className="text-[8px] mono text-slate-500 uppercase tracking-tighter">Nominal_Trajectory</span>
             </div>
             <div className="flex items-center space-x-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
               <span className="text-[8px] mono text-blue-400 font-bold uppercase tracking-tight">{soiStatusText}</span>
             </div>
          </div>
        </div>
        <button 
          onClick={() => setIsSynced(!isSynced)}
          className={`px-2 py-1 rounded text-[8px] mono border transition-all flex items-center space-x-2 ${isSynced ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
        >
          <span className={`w-1 h-1 rounded-full ${isSynced ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <span>{isSynced ? 'AUTO_SYNC' : 'MANUAL'}</span>
        </button>
      </div>

      <div className="flex-1 flex space-x-4 min-h-0 overflow-hidden">
        {/* SVG Map Section */}
        <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-slate-800/50 overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="earthGrad"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#020617" /></radialGradient>
              <radialGradient id="moonGrad"><stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#1e293b" /></radialGradient>
            </defs>

            <path d={outboundPath} fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1,1" className="opacity-20" />
            <path d={returnPath} fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1,1" className="opacity-20" />
            
            <path ref={pathRef} d={fullPathD} fill="none" stroke="transparent" />

            <g transform="translate(20, 35)">
               <circle r="7" fill="url(#earthGrad)" stroke="#3b82f6" strokeWidth="0.2" className="opacity-80" />
               <text y="12" textAnchor="middle" className="text-[3px] mono fill-blue-400/60 font-bold uppercase tracking-widest">Earth</text>
            </g>

            <g transform="translate(75, 60)">
               <circle r="5" fill="url(#moonGrad)" stroke="#94a3b8" strokeWidth="0.2" className="opacity-80" />
               <text y="10" textAnchor="middle" className="text-[3px] mono fill-slate-400 font-bold uppercase tracking-widest">The Moon</text>
            </g>

            {MILESTONES.map((m) => {
              const isPassed = elapsedSeconds >= m.t;
              const isCurrent = isSynced && currentActiveMilestone.id === m.id;
              const isActive = (selectedMilestone?.id === m.id) || (hoveredId === m.id) || isCurrent;
              return (
                <g key={m.id} className="cursor-pointer" onMouseEnter={() => setHoveredId(m.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => { setSelectedMilestone(m); setIsSynced(false); }}>
                  <circle cx={m.x} cy={m.y} r="5" fill="transparent" />
                  {isCurrent && <circle cx={m.x} cy={m.y} r="3" fill={m.color} className="opacity-30 animate-ping" />}
                  <circle cx={m.x} cy={m.y} r={isActive ? "2.2" : "1.2"} fill={isPassed ? m.color : "#020617"} stroke={isActive ? "#fff" : (isPassed ? "#fff" : "#334155")} strokeWidth={isActive ? "0.8" : "0.3"} className="transition-all duration-300" />
                </g>
              );
            })}

            {progress > 0 && progress < 1 && (
              <g transform={`translate(${indicatorPos.x}, ${indicatorPos.y}) rotate(${indicatorPos.angle})`}>
                <path d="M -1.5,-1 L 2,0 L -1.5,1 Z" fill="#fff" stroke="#3b82f6" strokeWidth="0.3" />
                <circle r="2" fill="#3b82f6" className="opacity-20 animate-pulse" />
              </g>
            )}
          </svg>

          {selectedMilestone && (
            <div className="absolute top-4 left-4 right-4 bg-slate-900/95 border border-blue-500/30 rounded-lg p-3 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedMilestone.color }}></div>
                    <h4 className="text-[10px] font-bold text-white mono uppercase tracking-widest">{selectedMilestone.label}</h4>
                  </div>
                </div>
                <button onClick={() => { setSelectedMilestone(null); setIsSynced(true); }} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[8px] text-slate-400 mt-1 font-mono italic">"{selectedMilestone.description}"</p>
              <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-800">
                 <div>
                    <span className="text-[7px] text-blue-400 font-bold uppercase block">Mission Detail</span>
                    <p className="text-[7px] text-slate-400 mono">{selectedMilestone.missionFact}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[7px] text-slate-500 font-bold uppercase block">Relative MET</span>
                    <p className="text-[7px] text-slate-500 mono">{selectedMilestone.t.toLocaleString()}s</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* NASA News Intelligence Side Panel */}
        <div className="w-48 xl:w-56 shrink-0 flex flex-col glass bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[8px] mono font-bold text-blue-400 tracking-tighter uppercase">NASA_INTEL_UPLINK</span>
            <div className={`w-1.5 h-1.5 rounded-full ${newsLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
             <div className="text-[9px] mono text-slate-400 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
               {nasaNews}
             </div>
             {newsLoading && (
               <div className="flex items-center space-x-2 py-2">
                 <div className="w-1 h-1 bg-blue-500 animate-bounce"></div>
                 <div className="w-1 h-1 bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1 h-1 bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
               </div>
             )}
          </div>
          <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800 flex justify-between shrink-0">
             <span className="text-[7px] mono text-slate-600">LINK: AR-II_NET</span>
             <span className="text-[7px] mono text-slate-600">ST: {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[7px] text-slate-500 uppercase block font-bold">Total Distance</span>
           <span className="text-[10px] mono text-blue-300 font-bold">{Math.floor(distanceKm).toLocaleString()} KM</span>
        </div>
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[7px] text-slate-500 uppercase block font-bold">Progress</span>
           <span className="text-[10px] mono text-emerald-300 font-bold">{(progress * 100).toFixed(3)}%</span>
        </div>
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[7px] text-slate-500 uppercase block font-bold">Nav Lock</span>
           <span className="text-[10px] mono text-slate-300 font-bold">{isSynced ? 'DSN_NOMINAL' : 'MANUAL_OVERRIDE'}</span>
        </div>
      </div>
    </div>
  );

  return hideContainer ? mapContent : (
    <div className="glass rounded-xl border border-slate-800 shadow-2xl overflow-hidden h-full">{mapContent}</div>
  );
};

export default MissionTrajectoryMap;
