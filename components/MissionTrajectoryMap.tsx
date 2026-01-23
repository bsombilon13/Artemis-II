import React, { useMemo, useRef, useEffect, useState } from 'react';
import { getLatestNASANews } from '../services/geminiService';

interface Props {
  elapsedSeconds: number;
  hideContainer?: boolean;
}

interface NASAUpdate {
  timestamp: string;
  content: string;
}

interface Milestone {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
  objective: string;
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
    label: "Launch and Ascent", 
    shortLabel: "LIFT",
    description: "The SLS rocket ignites and Orion begins its climb to Earth orbit.", 
    objective: "Execute nominal vertical ascent and achieve initial Earth orbit insertion.",
    historicalFact: "Artemis II is the first crewed mission to the lunar vicinity in over 50 years.",
    missionFact: "Maximum dynamic pressure (Max-Q) occurs at approximately 70 seconds.",
    x: 21, y: 34, t: 0, color: "#3b82f6" 
  },
  { 
    id: 1, 
    label: "HEO Perigee Raise", 
    shortLabel: "HEO",
    description: "Engine burn to reach High Earth Orbit for 24 hours of system testing.", 
    objective: "Verify life support systems and proximity operations in high Earth orbit.",
    historicalFact: "HEO testing ensures life support systems are fully operational before TLI.",
    missionFact: "Orion's first burn in space to raise perigee from Earth's atmosphere.",
    x: 32, y: 23, t: 2940, color: "#60a5fa" 
  },
  { 
    id: 2, 
    label: "Translunar Injection", 
    shortLabel: "TLI",
    description: "The ICPS upper stage sends the crew on their trajectory toward the Moon.", 
    objective: "Perform high-delta-V burn to depart Earth SOI and intercept lunar gravity.",
    historicalFact: "TLI marks the departure from Earth's immediate influence.",
    missionFact: "The ICPS provides the massive impulse needed to reach lunar distances.",
    x: 48, y: 22, t: 92220, color: "#10b981" 
  },
  { 
    id: 3, 
    label: "Lunar Flyby", 
    shortLabel: "FLYBY",
    description: "Orion passes behind the Moon, using gravity for a free return to Earth.", 
    objective: "Utilize lunar gravity for free-return trajectory and conduct farside observations.",
    historicalFact: "The flyby provides a spectacular view of the Lunar Farside.",
    missionFact: "Altitude drops to approx 10,000km above the lunar surface.",
    x: 82, y: 58, t: 436980, color: "#f1f5f9" 
  },
  { 
    id: 4, 
    label: "Transearth Coast", 
    shortLabel: "TEC",
    description: "The long journey back to Earth following the lunar gravity assist.", 
    objective: "Maintain thermal management and crew health during the 4-day transit back to Earth.",
    historicalFact: "The free-return trajectory is a safety-first flight design.",
    missionFact: "Velocity gradually increases as Orion is pulled back by Earth's gravity.",
    x: 45, y: 70, t: 550000, color: "#3b82f6" 
  },
  { 
    id: 5, 
    label: "Re-entry and Splashdown", 
    shortLabel: "SPLASH",
    description: "Orion enters atmosphere and splashes down in the Pacific Ocean.", 
    objective: "Demonstrate heat shield performance at lunar re-entry speeds and safe crew recovery.",
    historicalFact: "Artemis II splashdown targets the coast of San Diego.",
    missionFact: "The skip-entry maneuver bleeds off 25,000 mph of velocity.",
    x: 18, y: 38, t: 787560, color: "#ef4444" 
  }
];

const MissionTrajectoryMap: React.FC<Props> = ({ elapsedSeconds, hideContainer }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  const [nasaUpdates, setNasaUpdates] = useState<NASAUpdate[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [lastSync, setLastSync] = useState("");
  
  const outboundPath = "M 21,34 C 23,28 35,20 50,22 C 65,25 78,45 82,58 C 84,65 78,68 75,60";
  const returnPath = "M 75,60 C 72,52 65,75 45,70 C 30,65 22,45 18,38";
  
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
    try {
      const updates = await getLatestNASANews();
      if (Array.isArray(updates)) {
        setNasaUpdates(updates);
      }
    } catch (error) {
      console.error("Gemini News Error:", error);
    } finally {
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const newsInterval = setInterval(fetchNews, 600000); // 10 min refresh
    return () => clearInterval(newsInterval);
  }, []);

  const currentActiveMilestone = useMemo(() => {
    return [...MILESTONES].reverse().find(m => elapsedSeconds >= m.t) || MILESTONES[0];
  }, [elapsedSeconds]);

  // Synchronize detailed pop-up with the mission timeline
  useEffect(() => {
    if (isSynced) {
      setSelectedMilestone(currentActiveMilestone);
    }
  }, [currentActiveMilestone, isSynced]);

  const soiStatusText = useMemo(() => {
    const t = elapsedSeconds;
    if (t < 0) return 'Pre-Launch';
    if (t < 486) return 'Powered Ascent';
    if (t < 2940) return 'Earth Orbit';
    if (t < 92220) return 'HEO Test Phase';
    if (t < 430000) return 'Translunar Coast';
    if (t < 445000) return 'Lunar Encounter';
    if (t < 780000) return 'Transearth Coast';
    if (t < 787560) return 'Atmospheric Re-entry';
    return 'Mission Complete';
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
    <div className="relative h-full w-full flex flex-col p-4 bg-slate-950/40 select-none overflow-hidden min-h-0">
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Artemis II Trajectory Status</span>
          <div className="flex items-center space-x-3 mt-1">
             <div className="flex items-center space-x-1">
               <div className="w-2 h-0.5 bg-emerald-500/50"></div>
               <span className="text-[8px] mono text-slate-500 uppercase tracking-tighter">Nominal Trajectory</span>
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
          <span>{isSynced ? 'Auto Sync' : 'Manual'}</span>
        </button>
      </div>

      <div className="flex-1 flex space-x-4 min-h-0 overflow-hidden">
        <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-slate-800/50 overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="earthGrad"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#020617" /></radialGradient>
              <radialGradient id="moonGrad"><stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#1e293b" /></radialGradient>
            </defs>

            <path d={outboundPath} fill="none" stroke="#10b981" strokeWidth="0.4" strokeDasharray="1,2" className="opacity-20" />
            <path d={returnPath} fill="none" stroke="#3b82f6" strokeWidth="0.4" strokeDasharray="1,2" className="opacity-20" />
            
            <path ref={pathRef} d={fullPathD} fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.8" />

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
              const isCurrent = currentActiveMilestone.id === m.id;
              const isActive = (selectedMilestone?.id === m.id) || (hoveredId === m.id) || (isSynced && isCurrent);
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
            <div className="absolute top-4 left-4 right-4 bg-slate-900/95 border border-blue-500/30 rounded-lg p-3 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-y-auto max-h-[80%] custom-scrollbar">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedMilestone.color }}></div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{selectedMilestone.label}</h4>
                  </div>
                  {isSynced && selectedMilestone.id === currentActiveMilestone.id && (
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[7px] mono text-emerald-400 font-bold animate-pulse">● Live Tracking</span>
                    </div>
                  )}
                </div>
                <button onClick={() => { setSelectedMilestone(null); setIsSynced(false); }} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[8px] text-slate-400 mt-1 italic leading-tight">"{selectedMilestone.description}"</p>
              
              <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                <span className="text-[7px] text-blue-400 font-bold uppercase block tracking-widest mb-1">Primary Mission Objective</span>
                <p className="text-[9px] text-slate-200 leading-tight">{selectedMilestone.objective}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                 <div>
                    <span className="text-[7px] text-blue-400 font-bold uppercase block">Technical Detail</span>
                    <p className="text-[7px] text-slate-400 leading-tight">{selectedMilestone.missionFact}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[7px] text-slate-500 font-bold uppercase block">Relative MET</span>
                    <p className="text-[7px] text-slate-500 mono tabular-nums">{selectedMilestone.t.toLocaleString()}s</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-48 xl:w-56 shrink-0 flex flex-col glass bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden min-h-0">
          <div className="h-9 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[8px] font-bold text-blue-400 tracking-tighter uppercase">NASA Intel Uplink</span>
            <div className={`w-1.5 h-1.5 rounded-full ${newsLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20 min-h-0">
             <div className="flex flex-col min-h-full">
               {nasaUpdates.length === 0 && !newsLoading && (
                 <div className="p-3 text-[9px] text-slate-600 italic">Listening for mission updates...</div>
               )}
               {nasaUpdates.map((update, idx) => (
                 <div 
                   key={idx} 
                   className="p-3 border-b border-slate-800/40 hover:bg-white/[0.01] transition-colors last:border-0"
                 >
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[7px] mono text-blue-500 font-bold uppercase tracking-tighter">Data {idx.toString().padStart(2, '0')}</span>
                     <span className="text-[7px] mono text-slate-600 uppercase tabular-nums">{update.timestamp}</span>
                   </div>
                   <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                     {update.content}
                   </p>
                 </div>
               ))}
               {newsLoading && (
                 <div className="p-3 flex flex-col items-center justify-center space-y-2 py-6">
                   <div className="w-3 h-3 border border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                   <span className="text-[7px] mono text-slate-600 uppercase tracking-widest">Polling</span>
                 </div>
               )}
             </div>
          </div>
          <div className="h-7 px-3 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center shrink-0">
             <span className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">Status Live</span>
             <span className="text-[7px] mono text-slate-500 uppercase tabular-nums">{lastSync}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 shrink-0">
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[7px] text-slate-500 uppercase block font-bold">Total Distance</span>
           <span className="text-[10px] mono text-blue-300 font-bold tabular-nums">{Math.floor(distanceKm).toLocaleString()} KM</span>
        </div>
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[7px] text-slate-500 uppercase block font-bold">Progress</span>
           <span className="text-[10px] mono text-emerald-300 font-bold tabular-nums">{(progress * 100).toFixed(3)}%</span>
        </div>
        <div className="glass p-2 rounded-lg border border-slate-800/50 bg-slate-950/40">
           <span className="text-[7px] text-slate-500 uppercase block font-bold">Nav Lock</span>
           <span className="text-[10px] text-slate-300 font-bold uppercase">{isSynced ? 'DSN Nominal' : 'Manual Override'}</span>
        </div>
      </div>
    </div>
  );

  return hideContainer ? mapContent : (
    <div className="glass rounded-xl border border-slate-800 shadow-2xl overflow-hidden h-full">{mapContent}</div>
  );
};

export default MissionTrajectoryMap;