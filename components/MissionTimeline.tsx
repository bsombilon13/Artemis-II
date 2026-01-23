
import React from 'react';
import { MissionPhase } from '../types';

interface Props {
  phase: MissionPhase;
}

const MissionTimeline: React.FC<Props> = ({ phase }) => {
  const stages = [
    { id: MissionPhase.PRE_LAUNCH, label: 'Pre-Launch', description: 'Systems Check & Fueling' },
    { id: MissionPhase.ASCENT, label: 'Ascent', description: 'Liftoff & Injection' },
    { id: MissionPhase.ORBIT, label: 'Lunar Injection', description: 'Trans-Lunar Trajectory' },
    { id: MissionPhase.LUNAR_FLYBY, label: 'Flyby', description: 'Free Return Orbit' },
    { id: MissionPhase.RETURN, label: 'Return', description: 'Atmospheric Entry' },
    { id: MissionPhase.SPLASHDOWN, label: 'Recovery', description: 'Ocean Splashdown' },
  ];

  const currentIdx = stages.findIndex(s => s.id === phase);

  return (
    <div className="glass rounded-xl p-6 border border-slate-800">
      <div className="flex justify-between mb-8 relative">
        {/* Connection Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-0"></div>
        <div 
          className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-1000 -z-0"
          style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }}
        ></div>

        {stages.map((stage, idx) => {
          const isActive = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center flex-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isActive ? 'bg-blue-600 border-blue-400 scale-125 glow-blue' : 
                  isCompleted ? 'bg-slate-700 border-slate-500' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-[10px] font-bold mono ${isActive ? 'text-white' : 'text-slate-500'}`}>0{idx + 1}</span>
                )}
              </div>
              <div className="text-center mt-3">
                <span className={`block text-[10px] uppercase tracking-widest mono font-bold ${isActive ? 'text-blue-400' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stage.label}
                </span>
                <span className={`block text-[8px] mt-1 mono max-w-[80px] mx-auto leading-tight ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                  {stage.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Time to Event</p>
          <p className="text-sm font-bold mono text-slate-100">00:42:15</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">G-Force</p>
          <p className="text-sm font-bold mono text-slate-100">1.2 G</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Internal Temp</p>
          <p className="text-sm font-bold mono text-slate-100">22.4°C</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Radiation</p>
          <p className="text-sm font-bold mono text-green-400">SAFE</p>
        </div>
      </div>
    </div>
  );
};

export default MissionTimeline;
