
import React from 'react';
import { MissionPhase } from '../types';

interface Props {
  phase: MissionPhase;
}

const MissionHeader: React.FC<Props> = ({ phase }) => {
  const getPhaseName = () => {
    switch (phase) {
      case MissionPhase.PRE_LAUNCH: return 'PRE-LAUNCH PREPARATIONS';
      case MissionPhase.ASCENT: return 'ASCENT & INJECTION';
      case MissionPhase.ORBIT: return 'TOWARDS THE MOON';
      case MissionPhase.LUNAR_FLYBY: return 'LUNAR FLYBY - FREE RETURN';
      case MissionPhase.RETURN: return 'EARTH RE-ENTRY';
      case MissionPhase.SPLASHDOWN: return 'MISSION ACCOMPLISHED';
      default: return 'ARTEMIS II MISSION';
    }
  };

  return (
    <header className="glass border-b border-slate-800 p-4 flex items-center justify-between z-10">
      <div className="flex items-center space-x-4">
        <div className="bg-red-600 px-3 py-1 rounded text-xs font-bold tracking-widest animate-pulse">LIVE</div>
        <h1 className="text-xl font-bold tracking-tighter mono">ARTEMIS II COMMAND CENTER</h1>
      </div>
      
      <div className="flex space-x-8 items-center">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Current Status</p>
          <p className="text-sm font-bold text-blue-400 mono">{getPhaseName()}</p>
        </div>
        <div className="text-center border-l border-slate-700 pl-8">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Spacecraft</p>
          <p className="text-sm font-bold mono">ORION CM-002</p>
        </div>
        <div className="text-center border-l border-slate-700 pl-8">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Trajectory</p>
          <p className="text-sm font-bold text-green-400 mono">NOMINAL</p>
        </div>
      </div>
    </header>
  );
};

export default MissionHeader;
