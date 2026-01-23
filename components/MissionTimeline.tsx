import React, { useEffect, useRef, useMemo } from 'react';
import { TimelineEvent } from '../types';

interface Props {
  elapsedSeconds: number;
  isCompressed?: boolean;
}

const MISSION_EVENTS: TimelineEvent[] = [
  { offsetSeconds: -177300, label: "Call to Stations", description: "The launch team arrives on their stations and the countdown begins" },
  { offsetSeconds: -175200, label: "Countdown Start", description: "The countdown clock begins" },
  { offsetSeconds: -169200, label: "Sound Suppression Prep", description: "Fill the water tank for the sound suppression system" },
  { offsetSeconds: -160200, label: "Orion Power Up", description: "The Orion spacecraft is powered up" },
  { offsetSeconds: -142200, label: "Core Stage Power Up", description: "The core stage is powered up" },
  { offsetSeconds: -140400, label: "ICPS Power Up", description: "The interim cryogenic propulsion stage (ICPS) is powered up" },
  { offsetSeconds: -139500, label: "RS-25 Engine Prep", description: "Final preparations of the four RS-25 engines" },
  { offsetSeconds: -117000, label: "Orion Battery Charge", description: "Charge Orion flight batteries to 100%" },
  { offsetSeconds: -109800, label: "Core Battery Charge", description: "Charge core stage flight batteries" },
  { offsetSeconds: -67500, label: "ICPS Launch Power Up", description: "The ICPS is powered-up for launch" },
  { offsetSeconds: -64800, label: "Suit Regulator Leak Checks", description: "Orion crew suit regulator leak checks" },
  { offsetSeconds: -52200, label: "Personnel Evacuation", description: "All non-essential personnel leave Launch Complex 39B" },
  { offsetSeconds: -45900, label: "GLS Activation", description: "Ground Launch Sequencer (GLS) activation" },
  { offsetSeconds: -47700, label: "Vehicle Inerting", description: "Air-to-gaseous nitrogen (GN2) changeover and vehicle cavity inerting" },
  { offsetSeconds: -41700, label: "Hold: Weather Briefing", description: "2-hour 15-minute built in countdown hold begins. Weather and tanking briefing." },
  { offsetSeconds: -37200, label: "Tanking Go/No-Go Poll", description: "Launch team decides if they are “go” or “no-go” to begin tanking" },
  { offsetSeconds: -36600, label: "LOX Chilldown", description: "Core stage LOX transfer line chilldown" },
  { offsetSeconds: -36600, label: "LH2 Chilldown", description: "Core stage LH2 chilldown" },
  { offsetSeconds: -37200, label: "Orion Cold Soak", description: "Orion cold soak" },
  { offsetSeconds: -35400, label: "LOX Main Chilldown", description: "Core stage LOX main propulsion system chilldown" },
  { offsetSeconds: -33900, label: "LH2 Slow Fill", description: "Core stage LH2 slow fill start" },
  { offsetSeconds: -33600, label: "Resume T-Clock", description: "Resume T-Clock from T-8H10M" },
  { offsetSeconds: -33000, label: "LOX Slow Fill", description: "Core stage LOX slow fill" },
  { offsetSeconds: -32400, label: "LH2 Fast Fill", description: "Core stage LH2 fast fill" },
  { offsetSeconds: -32100, label: "LOX Fast Fill", description: "Core stage LOX fast fill" },
  { offsetSeconds: -31200, label: "Crew Wake Up", description: "Crew wake up and Launch countdown status check" },
  { offsetSeconds: -31500, label: "ICPS LH2 Chilldown", description: "ICPS LH2 chilldown" },
  { offsetSeconds: -29400, label: "ICPS LH2 Fast Fill", description: "ICPS LH2 fast fill start" },
  { offsetSeconds: -27600, label: "Core LH2 Topping", description: "Core stage LH2 topping" },
  { offsetSeconds: -27000, label: "Core LH2 Replenish", description: "Core stage LH2 replenish (L-7H30M – launch)" },
  { offsetSeconds: -26700, label: "ICPS LH2 Relief Test", description: "ICPS LH2 vent and relief test" },
  { offsetSeconds: -25500, label: "ICPS LH2 Topping", description: "ICPS LH2 tank topping start" },
  { offsetSeconds: -22200, label: "Orion Comms Active", description: "Orion communications system activated" },
  { offsetSeconds: -22200, label: "Core LOX Topping", description: "Core stage LOX topping" },
  { offsetSeconds: -21600, label: "ICPS LOX Fast Fill", description: "ICPS LOX fast fill" },
  { offsetSeconds: -21600, label: "Flight Crew Weather Brief", description: "Flight crew weather brief" },
  { offsetSeconds: -20400, label: "Core LOX Replenish", description: "Core stage LOX replenish (L-5H40M – launch)" },
  { offsetSeconds: -20400, label: "Crew Suit Donning", description: "Flight crew begins donning launch and entry spacesuits" },
  { offsetSeconds: -16800, label: "40-Minute Built-in Hold", description: "Start 40-minute built in hold" },
  { offsetSeconds: -16200, label: "Crew LC-39B Departure", description: "Flight crew departs to Launch Complex 39B" },
  { offsetSeconds: -14400, label: "Crew Ingress", description: "Flight crew ingress, communication checks and suit leak checks" },
  { offsetSeconds: -12300, label: "White Room Closeout", description: "White room closeout complete" },
  { offsetSeconds: -12000, label: "Hatch Closure", description: "Crew module hatch preps and closure" },
  { offsetSeconds: -3600, label: "Launch Director Brief", description: "Launch Director brief – Flight vehicle/TPS Scan results" },
  { offsetSeconds: -2400, label: "30-Minute Hold", description: "Built in 30-minute countdown hold begins" },
  { offsetSeconds: -1500, label: "Comms Loop Transfer", description: "Transition team to Orion to Earth communication loop" },
  { offsetSeconds: -960, label: "Final Launch Poll", description: "The launch director polls the team to ensure they are “go” for launch" },
  { offsetSeconds: -600, label: "T-10 Minutes: Terminal", description: "Ground Launch Sequencer initiates terminal count" },
  { offsetSeconds: -480, label: "Access Arm Retract", description: "Crew Access Arm retract" },
  { offsetSeconds: -360, label: "Orion Internal Power", description: "Orion set to internal power" },
  { offsetSeconds: -240, label: "Core APU Start", description: "Core Stage APU starts" },
  { offsetSeconds: -122, label: "ICPS Internal Power", description: "ICPS switches to internal battery power" },
  { offsetSeconds: -33, label: "Automated Launch Sequencer", description: "GLS sends “go for automated launch sequencer” command" },
  { offsetSeconds: -10, label: "Engine Start Command", description: "GLS sends the command for core stage engine start" },
  { offsetSeconds: -6.36, label: "RS-25 Startup", description: "RS-25 engines startup" },
  { offsetSeconds: 0, label: "T-0: LIFTOFF", description: "Booster ignition, umbilical separation, and liftoff" },
  { offsetSeconds: 9, label: "Tower Clear", description: "SLS clears the launch tower" },
  { offsetSeconds: 56, label: "Supersonic", description: "SLS reaches supersonic speed" },
  { offsetSeconds: 70, label: "Max Q", description: "Maximum dynamic pressure" },
  { offsetSeconds: 128, label: "SRB Separation", description: "Solid Rocket Booster separation" },
  { offsetSeconds: 198, label: "LAS Jettison", description: "Launch abort system jettison" },
  { offsetSeconds: 486, label: "MECO", description: "SLS core stage main engine cutoff" },
  { offsetSeconds: 498, label: "Core Stage Separation", description: "Core stage separates from ICPS" },
  { offsetSeconds: 1200, label: "Solar Array Deploy", description: "Orion solar arrays deploy" },
  { offsetSeconds: 2940, label: "Perigee Raise", description: "Perigee raise maneuver" },
  { offsetSeconds: 6477, label: "Apogee Raise Burn", description: "Apogee raise burn" },
  { offsetSeconds: 12255, label: "Orion/ICPS Separation", description: "Orion separates from ICPS" },
  { offsetSeconds: 16500, label: "Prox Ops Conclude", description: "Proximity operations conclude" },
  { offsetSeconds: 18000, label: "ICPS Disposal Burn", description: "Disposal burn of ICPS" },
  { offsetSeconds: 92220, label: "Translunar Injection", description: "Flight Day 2: TLI burn" },
  { offsetSeconds: 787560, label: "SPLASHDOWN", description: "Artemis II Splashdown" },
];

const formatTimeShort = (seconds: number) => {
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  const prefix = seconds < 0 ? 'L-' : 'T+';
  return `${prefix}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const MissionTimeline: React.FC<Props> = ({ elapsedSeconds, isCompressed }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(() => {
    let bestIdx = -1;
    for (let i = 0; i < MISSION_EVENTS.length; i++) {
      if (elapsedSeconds >= MISSION_EVENTS[i].offsetSeconds) {
        bestIdx = i;
      } else {
        break;
      }
    }
    return bestIdx;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div className={`glass rounded-xl h-full border border-white/10 flex flex-col overflow-hidden shadow-2xl ${isCompressed ? 'bg-slate-900/80' : 'bg-slate-900/60'}`}>
      <div className={`bg-slate-800/80 px-4 py-3 border-b border-white/10 flex items-center justify-between`}>
        <div className="flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-300">Sequence Monitor</h3>
          {!isCompressed && <span className="text-[9px] text-blue-400 font-bold italic mt-0.5 tracking-tighter uppercase">Flight Day Chronology</span>}
        </div>
        <div className="flex items-center space-x-2">
           <div className={`px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/30`}>
              <span className="text-[8px] mono text-emerald-400 font-black animate-pulse uppercase tracking-wider">Sync Active</span>
           </div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-black/30"
      >
        <div className={`relative ${isCompressed ? 'py-4' : 'py-8'}`}>
          <div className={`absolute top-0 bottom-0 w-0.5 bg-white/5 ${isCompressed ? 'left-[18px]' : 'left-[34px]'}`}></div>
          
          <div className="space-y-1">
            {MISSION_EVENTS.map((event, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div 
                  key={idx}
                  ref={isActive ? activeItemRef : null}
                  className={`relative flex items-center transition-all duration-300 ${
                    isActive ? 'bg-blue-600/20 border-y border-blue-500/30 z-20 py-4' : 'py-1 opacity-60'
                  } ${isCompressed ? 'px-2' : 'px-6'}`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    {isActive && (
                      <div className="absolute rounded-full bg-blue-500/30 animate-ping w-10 h-10"></div>
                    )}
                    <div className={`relative z-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isActive 
                        ? 'w-6 h-6 bg-blue-500 border-white' 
                        : isPast 
                          ? 'w-3 h-3 bg-emerald-500 border-emerald-300' 
                          : 'w-3 h-3 bg-slate-800 border-slate-600'
                    }`}>
                      {isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </div>

                  <div className={`${isCompressed ? 'ml-3' : 'ml-6'} flex-1 overflow-hidden`}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`font-bold transition-colors truncate ${
                          isCompressed ? 'text-[10px]' : 'text-[12px]'
                        } ${
                          isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {event.label}
                        </span>
                        <span className={`mono tabular-nums shrink-0 font-bold ${isCompressed ? 'text-[8px]' : 'text-[10px]'} ${isActive ? 'text-blue-300' : 'text-slate-600'}`}>
                          {formatTimeShort(event.offsetSeconds)}
                        </span>
                      </div>
                      {isActive && !isCompressed && (
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-sm">
                          {event.description}
                        </p>
                      )}
                      {isActive && (
                         <div className="mt-2 h-[2px] w-full bg-blue-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 animate-[progress_3s_linear_infinite]" style={{ width: '40%' }}></div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className={`bg-slate-900 border-t border-white/10 px-4 py-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500`}>
        <span>Station: Flight Director</span>
        <span className="mono">Uptime Chrono: {Math.floor(elapsedSeconds / 3600).toString().padStart(3, '0')}H</span>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default MissionTimeline;