
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TelemetryData } from '../types';

interface Props {
  data: TelemetryData[];
}

const TelemetryGraphs: React.FC<Props> = ({ data }) => {
  const current = data[data.length - 1] || { altitude: 0, velocity: 0, fuel: 0, heartRate: 0 };

  return (
    <div className="space-y-4">
      {/* Velocity Display */}
      <div className="glass rounded-xl p-4 border border-slate-800">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Velocity</p>
            <h3 className="text-2xl font-bold mono text-blue-400">{current.velocity.toFixed(1)} <span className="text-xs text-slate-500">km/h</span></h3>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest">Altitude</p>
             <h3 className="text-xl font-bold mono text-emerald-400">{current.altitude.toFixed(1)} <span className="text-xs text-slate-500">km</span></h3>
          </div>
        </div>
        
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6', fontFamily: 'JetBrains Mono' }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="velocity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVel)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heart Rate / Biometrics */}
      <div className="glass rounded-xl p-4 border border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Crew Biometrics - CDR Reed Wiseman</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold mono text-red-500">
            {current.heartRate.toFixed(0)} <span className="text-xs text-slate-500">BPM</span>
          </div>
          <div className="h-10 w-32">
             {/* Small sparkline-like display */}
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <Area type="monotone" dataKey="heartRate" stroke="#ef4444" fill="transparent" strokeWidth={1.5} isAnimationActive={false} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryGraphs;
