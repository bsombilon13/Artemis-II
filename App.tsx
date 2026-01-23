
import React, { useState, useEffect } from 'react';
import { MissionPhase, TelemetryData, MissionUpdate } from './types';
import Sidebar from './components/Sidebar';
import MissionHeader from './components/MissionHeader';
import TelemetryGraphs from './components/TelemetryGraphs';
import LiveFeeds from './components/LiveFeeds';
import MissionTimeline from './components/MissionTimeline';
import MissionLog from './components/MissionLog';
import SettingsPanel from './components/SettingsPanel';

const App: React.FC = () => {
  const [phase, setPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [updates, setUpdates] = useState<MissionUpdate[]>([]);
  const [countdown, setCountdown] = useState<number>(3600); // 1 hour in seconds
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Configuration State - Using stable NASA live streams/videos
  // Updated Feed 1 to the requested Artemis II visualization video (nrVnsO_rdew)
  const [videoIds, setVideoIds] = useState<string[]>(['nrVnsO_rdew', 'p7K0lK3-N0I', '9vX2P4w6u-4']);

  // Mock Telemetry Generation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const last = prev[prev.length - 1] || { altitude: 0, velocity: 0, fuel: 100, heartRate: 72 };
        let newAlt = last.altitude;
        let newVel = last.velocity;

        if (phase === MissionPhase.ASCENT) {
          newAlt += Math.random() * 500;
          newVel += Math.random() * 200;
        } else if (phase === MissionPhase.ORBIT || phase === MissionPhase.LUNAR_FLYBY) {
          newAlt = 384400 + (Math.random() * 100);
          newVel = 1000 + (Math.random() * 50);
        }

        const newData: TelemetryData = {
          timestamp: Date.now(),
          altitude: Math.max(0, newAlt),
          velocity: Math.max(0, newVel),
          fuel: Math.max(0, last.fuel - (phase === MissionPhase.ASCENT ? 0.1 : 0.001)),
          heartRate: 70 + Math.random() * 20
        };

        return [...prev.slice(-30), newData];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Countdown Logic
  useEffect(() => {
    if (phase === MissionPhase.PRE_LAUNCH) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) {
            setPhase(MissionPhase.ASCENT);
            addLog('LIFTOFF! Artemis II has cleared the tower.', 'system');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const addLog = (message: string, type: MissionUpdate['type'] = 'system') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setUpdates(prev => [{ time: timeStr, source: 'HOUSTON', message, type }, ...prev]);
  };

  useEffect(() => {
    addLog('System initialization complete. Monitoring Artemis II pre-flight diagnostics.');
  }, []);

  const handleUpdateConfig = (newIds: string[], newCountdown: number) => {
    setVideoIds(newIds);
    if (phase === MissionPhase.PRE_LAUNCH) {
      setCountdown(newCountdown);
    }
    setIsSettingsOpen(false);
    addLog('Mission parameters updated by flight director.', 'system');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      {/* Settings Panel Overlay */}
      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          countdown={countdown} 
          onSave={handleUpdateConfig} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {/* Left Sidebar - Status & Navigation */}
      <Sidebar 
        currentPhase={phase} 
        setPhase={setPhase} 
        countdown={countdown}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Command Display */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MissionHeader phase={phase} />
        
        <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-y-auto">
          {/* Top Row: Live Feeds */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <LiveFeeds videoIds={videoIds} />
            <MissionTimeline phase={phase} />
          </div>

          {/* Right Column: Telemetry */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <TelemetryGraphs data={telemetry} />
            <div className="glass rounded-xl p-4 border border-slate-800">
              <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Spacecraft Health</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Oxygen Levels</span>
                  <span className="text-green-400 mono">98.2%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Cabin Pressure</span>
                  <span className="text-green-400 mono">101.3 kPa</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Power Output</span>
                  <span className="text-blue-400 mono">4.2 kW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Log */}
          <div className="col-span-12">
            <MissionLog updates={updates} />
          </div>
        </div>

        {/* HUD Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[12px] border-slate-900/20 mix-blend-overlay z-0"></div>
      </main>
    </div>
  );
};

export default App;
