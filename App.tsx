import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MissionPhase, TelemetryData, MissionUpdate } from './types';
import MissionHeader from './components/MissionHeader';
import { PrimaryFeed, SecondaryFeeds } from './components/LiveFeeds';
import MissionTimeline from './components/MissionTimeline';
import MultiViewMonitor from './components/MultiViewMonitor';
import SettingsPanel from './components/SettingsPanel';
import HorizontalTimeline from './components/HorizontalTimeline';
import MissionLog from './components/MissionLog';

const INITIAL_LAUNCH_DATE = new Date('2026-02-07T02:41:00Z');
// Reduced to 3 video IDs (Primary + 2 Secondary)
const INITIAL_VIDEO_IDS = ['nrVnsO_rdew', 'Jm8wRjD3xVA', '9vX2P4w6u-4'];
const HISTORY_LIMIT = 40;
const STORAGE_KEY = 'artemis_mission_config';

const App: React.FC = () => {
  const [phase, setPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [missionUpdates, setMissionUpdates] = useState<MissionUpdate[]>([]);
  
  // States for transition animation
  const [isPhaseTransitioning, setIsPhaseTransitioning] = useState(false);
  const [displayPhase, setDisplayPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);

  // Initialize state from local storage or defaults
  const [launchDate, setLaunchDate] = useState<Date>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        return new Date(config.launchDate);
      } catch (e) {
        console.error("Failed to parse saved launch date", e);
      }
    }
    return INITIAL_LAUNCH_DATE;
  });

  const [videoIds, setVideoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        return config.videoIds || INITIAL_VIDEO_IDS;
      } catch (e) {
        console.error("Failed to parse saved video IDs", e);
      }
    }
    return INITIAL_VIDEO_IDS;
  });
  
  // Track precise ms for the clock
  const [currentMs, setCurrentMs] = useState<number>(Date.now());
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  
  const elapsedSeconds = useMemo(() => {
    return (currentMs - launchDate.getTime()) / 1000;
  }, [currentMs, launchDate]);

  // Handle phase transition animation logic
  useEffect(() => {
    if (phase !== displayPhase) {
      setIsPhaseTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPhase(phase);
        setIsPhaseTransitioning(false);
      }, 400); // Duration of the fade-out
      return () => clearTimeout(timer);
    }
  }, [phase, displayPhase]);

  // Persist settings to local storage whenever they change
  useEffect(() => {
    const config = {
      videoIds,
      launchDate: launchDate.toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [videoIds, launchDate]);

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

  // Precise timer for ms display and history tracking
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentMs(now);
      
      const currentElapsed = (now - launchDate.getTime()) / 1000;
      if (currentElapsed >= 0 && currentElapsed < 600) setPhase(MissionPhase.ASCENT);
      else if (currentElapsed >= 600 && currentElapsed < 172800) setPhase(MissionPhase.ORBIT);
      else if (currentElapsed >= 172800) setPhase(MissionPhase.LUNAR_FLYBY);
    }, 45); // ~22fps
    return () => clearInterval(timer);
  }, [launchDate]);

  // Update telemetry history at a slower interval to keep graphs performant but fluid
  useEffect(() => {
    const historyTimer = setInterval(() => {
      setTelemetryHistory(prev => {
        const next = [...prev, telemetry];
        if (next.length > HISTORY_LIMIT) return next.slice(1);
        return next;
      });
    }, 1000); // Add a point every second
    return () => clearInterval(historyTimer);
  }, [telemetry]);

  const handlePromoteToPrimary = (index: number) => {
    const actualIndex = index + 1;
    const newVideoIds = [...videoIds];
    const temp = newVideoIds[0];
    newVideoIds[0] = newVideoIds[actualIndex];
    newVideoIds[actualIndex] = temp;
    setVideoIds(newVideoIds);
  };

  const addMissionUpdate = useCallback((message: string, source: string = 'SYSTEM', type: 'system' | 'comms' | 'telemetry' = 'comms') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMissionUpdates(prev => [{ time, source, message, type }, ...prev].slice(0, 50));
  }, []);

  const countdownMs = useMemo(() => {
    return launchDate.getTime() - currentMs;
  }, [currentMs, launchDate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      {/* Global CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          launchDate={launchDate} 
          onSave={(ids, newDate) => {
            setVideoIds(ids);
            setLaunchDate(newDate);
            setIsSettingsOpen(false);
            addMissionUpdate('Mission configuration parameters updated by Flight Director.', 'SYSTEM', 'system');
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className={isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}>
          <MissionHeader 
            phase={displayPhase} 
            setPhase={setPhase} 
            countdownMs={countdownMs} 
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
        
        <div className="flex-1 p-4 flex flex-col overflow-hidden max-h-full space-y-4">
          
          {/* Top Row: Mission Progress and Event Log */}
          <div className="grid grid-cols-12 gap-4 shrink-0">
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <HorizontalTimeline elapsedSeconds={elapsedSeconds} />
            </div>
            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
              <div className="h-[200px] lg:h-full min-h-[200px]">
                <MissionLog updates={missionUpdates} />
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
            {/* Left Column: Primary Feeds */}
            <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
              <PrimaryFeed videoId={videoIds[0]} />
              
              <SecondaryFeeds 
                videoIds={videoIds.slice(1)} 
                onPromote={handlePromoteToPrimary}
              />
            </div>

            {/* Right Column: Multi-View & Side-aligned Event Timeline */}
            <div className="col-span-12 lg:col-span-5 flex flex-row h-full min-h-0 space-x-4">
               <div className="flex-1 min-h-0">
                  <MultiViewMonitor 
                    elapsedSeconds={elapsedSeconds} 
                    telemetry={telemetry} 
                    telemetryHistory={telemetryHistory}
                  />
               </div>
               <div className={`w-56 shrink-0 flex flex-col min-h-0 ${isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}>
                  <MissionTimeline elapsedSeconds={elapsedSeconds} isCompressed={true} />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;