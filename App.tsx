import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MissionPhase, TelemetryData, MissionUpdate } from './types';
import MissionHeader from './components/MissionHeader';
import { PrimaryFeed, SecondaryFeeds } from './components/LiveFeeds';
import MissionTimeline from './components/MissionTimeline';
import MultiViewMonitor from './components/MultiViewMonitor';
import SettingsPanel from './components/SettingsPanel';
import HorizontalTimeline from './components/HorizontalTimeline';
import MissionLog from './components/MissionLog';
import NASANewsCard from './components/NASANewsCard';

const INITIAL_LAUNCH_DATE = new Date('2026-02-07T02:41:00Z');
// 3 feeds: 1 Primary (Alpha) + 2 Secondary.
const INITIAL_VIDEO_IDS = ['nrVnsO_rdew', 'Jm8wRjD3xVA', '9vX2P4w6u-4'];
const HISTORY_LIMIT = 40;
const STORAGE_KEY = 'artemis_mission_config_v3';

const App: React.FC = () => {
  const [phase, setPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [missionUpdates, setMissionUpdates] = useState<MissionUpdate[]>([]);
  
  const [isPhaseTransitioning, setIsPhaseTransitioning] = useState(false);
  const [displayPhase, setDisplayPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);

  const [launchDate, setLaunchDate] = useState<Date>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.launchDate) return new Date(config.launchDate);
      } catch (e) {
        console.error("Hydration Error: Launch Date", e);
      }
    }
    return INITIAL_LAUNCH_DATE;
  });

  const [videoIds, setVideoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (Array.isArray(config.videoIds) && config.videoIds.length > 0) {
          return config.videoIds;
        }
      } catch (e) {
        console.error("Hydration Error: Video IDs", e);
      }
    }
    return INITIAL_VIDEO_IDS;
  });
  
  const [currentMs, setCurrentMs] = useState<number>(Date.now());
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  
  const elapsedSeconds = useMemo(() => {
    return (currentMs - launchDate.getTime()) / 1000;
  }, [currentMs, launchDate]);

  useEffect(() => {
    const config = {
      videoIds,
      launchDate: launchDate.toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [videoIds, launchDate]);

  useEffect(() => {
    if (phase !== displayPhase) {
      setIsPhaseTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPhase(phase);
        setIsPhaseTransitioning(false);
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [phase, displayPhase]);

  const telemetry = useMemo((): TelemetryData => {
    const t = elapsedSeconds;
    if (t < 0) return { timestamp: Date.now(), altitude: 0, velocity: 0, fuel: 100, heartRate: 72 };
    let alt = 0, vel = 0;
    if (t < 128) { vel = t * 150; alt = Math.pow(t, 2.1) / 50; }
    else if (t < 486) { vel = 19200 + (t - 128) * 30; alt = 50 + (t - 128) * 0.5; }
    else { vel = 28000; alt = 200 + (t / 1000); }
    return { timestamp: Date.now(), altitude: alt, velocity: vel, fuel: Math.max(0, 100 - (t / 100)), heartRate: 70 + Math.random() * 5 };
  }, [elapsedSeconds]);

  // Global Sync Timer matching Trajectory Milestones
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentMs(now);
      const t = (now - launchDate.getTime()) / 1000;
      
      if (t < 0) setPhase(MissionPhase.PRE_LAUNCH);
      else if (t < 486) setPhase(MissionPhase.ASCENT);
      else if (t < 92220) setPhase(MissionPhase.ORBIT);
      else if (t < 436980) setPhase(MissionPhase.LUNAR_FLYBY);
      else if (t < 786780) setPhase(MissionPhase.RETURN);
      else setPhase(MissionPhase.SPLASHDOWN);
    }, 50); 
    return () => clearInterval(timer);
  }, [launchDate]);

  useEffect(() => {
    const historyTimer = setInterval(() => {
      setTelemetryHistory(prev => {
        const next = [...prev, telemetry];
        return next.length > HISTORY_LIMIT ? next.slice(1) : next;
      });
    }, 1000);
    return () => clearInterval(historyTimer);
  }, [telemetry]);

  const handlePromoteToPrimary = (index: number) => {
    const actualIndex = index + 1;
    const newVideoIds = [...videoIds];
    [newVideoIds[0], newVideoIds[actualIndex]] = [newVideoIds[actualIndex], newVideoIds[0]];
    setVideoIds(newVideoIds);
  };

  const addMissionUpdate = useCallback((message: string, source: string = 'SYSTEM', type: 'system' | 'comms' | 'telemetry' = 'comms') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMissionUpdates(prev => [{ time, source, message, type }, ...prev].slice(0, 50));
  }, []);

  const countdownMs = useMemo(() => launchDate.getTime() - currentMs, [currentMs, launchDate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          launchDate={launchDate} 
          onSave={(ids, newDate) => {
            setVideoIds(ids);
            setLaunchDate(newDate);
            setIsSettingsOpen(false);
            addMissionUpdate('Mission parameters synchronized and cached in local storage.', 'SYSTEM', 'system');
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className={isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}>
          <MissionHeader phase={displayPhase} setPhase={setPhase} countdownMs={countdownMs} onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
        <div className="flex-1 p-4 flex flex-col overflow-hidden max-h-full space-y-4">
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
            <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex space-x-4 items-stretch">
                <div className="flex-1">
                  <PrimaryFeed videoId={videoIds[0]} />
                </div>
                <div className="w-72 shrink-0 hidden xl:block">
                  <NASANewsCard />
                </div>
              </div>
              
              <SecondaryFeeds videoIds={videoIds.slice(1)} onPromote={handlePromoteToPrimary} />
            </div>
            <div className="col-span-12 lg:col-span-5 flex flex-row h-full min-h-0 space-x-4">
               <div className="flex-1 min-h-0">
                  <MultiViewMonitor elapsedSeconds={elapsedSeconds} telemetry={telemetry} telemetryHistory={telemetryHistory} />
               </div>
               <div className={`w-64 shrink-0 flex flex-col min-h-0 ${isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}>
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