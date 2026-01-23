
import React, { useState, useEffect, useMemo } from 'react';
import { MissionPhase, TelemetryData } from './types';
import MissionHeader from './components/MissionHeader';
import { PrimaryFeed, SecondaryFeeds } from './components/LiveFeeds';
import MissionTimeline from './components/MissionTimeline';
import MultiViewMonitor from './components/MultiViewMonitor';
import SettingsPanel from './components/SettingsPanel';
import HorizontalTimeline from './components/HorizontalTimeline';

const INITIAL_LAUNCH_DATE = new Date('2026-02-07T02:41:00Z');

const App: React.FC = () => {
  const [phase, setPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [launchDate, setLaunchDate] = useState<Date>(INITIAL_LAUNCH_DATE);
  
  // Track precise ms for the clock
  const [currentMs, setCurrentMs] = useState<number>(Date.now());
  
  const elapsedSeconds = useMemo(() => {
    return (currentMs - launchDate.getTime()) / 1000;
  }, [currentMs, launchDate]);
  
  const [videoIds, setVideoIds] = useState<string[]>(['nrVnsO_rdew', 'Jm8wRjD3xVA', '9vX2P4w6u-4']);

  // Precise timer for ms display
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentMs(now);
      
      const currentElapsed = (now - launchDate.getTime()) / 1000;
      if (currentElapsed >= 0 && currentElapsed < 600) setPhase(MissionPhase.ASCENT);
      else if (currentElapsed >= 600 && currentElapsed < 172800) setPhase(MissionPhase.ORBIT);
      else if (currentElapsed >= 172800) setPhase(MissionPhase.LUNAR_FLYBY);
    }, 45); // ~22fps for smooth ms feel
    return () => clearInterval(timer);
  }, [launchDate]);

  // Derived Telemetry for HUD animations
  const telemetry = useMemo((): TelemetryData => {
    const t = elapsedSeconds;
    if (t < 0) return { timestamp: Date.now(), altitude: 0, velocity: 0, fuel: 100, heartRate: 72 };

    let alt = 0;
    let vel = 0;

    if (t < 128) { // S-II Ascent
      vel = t * 150; // Simple linear accel for visual
      alt = Math.pow(t, 2.1) / 50;
    } else if (t < 486) { // Core Stage Ascent
      vel = 19200 + (t - 128) * 30;
      alt = 50 + (t - 128) * 0.5;
    } else { // Orbital/Transit
      vel = 28000;
      alt = 200 + (t / 1000); // Gradual drift
    }

    return {
      timestamp: Date.now(),
      altitude: alt,
      velocity: vel,
      fuel: Math.max(0, 100 - (t / 100)),
      heartRate: 70 + Math.random() * 5
    };
  }, [elapsedSeconds]);

  const countdownMs = useMemo(() => {
    return launchDate.getTime() - currentMs;
  }, [currentMs, launchDate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          launchDate={launchDate} 
          onSave={(ids, newDate) => {
            setVideoIds(ids);
            setLaunchDate(newDate);
            setIsSettingsOpen(false);
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MissionHeader 
          phase={phase} 
          setPhase={setPhase} 
          countdownMs={countdownMs} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        <div className="flex-1 p-4 flex flex-col overflow-hidden max-h-full">
          {/* Horizontal Progress Timeline */}
          <HorizontalTimeline elapsedSeconds={elapsedSeconds} />

          <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
            {/* Left Column (Video Feeds & Signal Status) */}
            <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
              <PrimaryFeed videoId={videoIds[0]} />
              <SecondaryFeeds videoIds={videoIds.slice(1, 3)} forceSideBySide={true} />
              
              <div className="glass rounded-xl p-4 border border-slate-800 flex justify-between items-center bg-slate-900/40 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Signal Link Status</span>
                  <span className="text-sm font-bold mono text-emerald-400">COMMAND_LOCKED_SECURE</span>
                </div>
                <div className="flex space-x-1.5">
                   {[1,2,3,4,5,6].map(i => <div key={i} className={`w-1 h-5 ${i < 6 ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'} rounded-full`}></div>)}
                </div>
              </div>
            </div>

            {/* Right Column (MultiViewMonitor Top, Timeline Bottom) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col h-full min-h-0 space-y-4">
               <div className="shrink-0 h-[400px]"> {/* Fixed height for the monitor container */}
                  <MultiViewMonitor elapsedSeconds={elapsedSeconds} telemetry={telemetry} />
               </div>
               <div className="flex-1 flex flex-col min-h-0">
                  <MissionTimeline elapsedSeconds={elapsedSeconds} />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
