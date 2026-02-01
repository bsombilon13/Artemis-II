import React, { useMemo } from 'react';
import { TelemetryData } from '../types';

interface Props {
  elapsedSeconds: number;
  telemetry: TelemetryData;
  hideContainer?: boolean;
}

const ArtemisHUD: React.FC<Props> = ({ elapsedSeconds, telemetry, hideContainer }) => {
  const { altitude, velocity } = telemetry;

  const isPreLaunch = elapsedSeconds < 0;
  const isAscent = elapsedSeconds >= 0 && elapsedSeconds < 486;
  
  const isBoosterSeparated = elapsedSeconds >= 128;
  const isBoosterSepFlash = elapsedSeconds >= 128 && elapsedSeconds < 131;
  
  const isLASJettisoned = elapsedSeconds >= 198;
  const isLASSepFlash = elapsedSeconds >= 198 && elapsedSeconds < 201;

  const isCoreSeparated = elapsedSeconds >= 498;
  const isCoreSepFlash = elapsedSeconds >= 498 && elapsedSeconds < 501.5;
  
  const isICPSActive = elapsedSeconds >= 498 && elapsedSeconds < 12255;
  const isOrionSeparated = elapsedSeconds >= 12255;
  const isOrionSepFlash = elapsedSeconds >= 12255 && elapsedSeconds < 12258;

  const isSolarArrayDeployed = elapsedSeconds >= 13455; // Deploys shortly after separation

  // Dynamic Pitch (Gravity Turn) logic
  const pitchAngle = useMemo(() => {
    if (elapsedSeconds < 10) return 0;
    if (elapsedSeconds < 486) {
      return Math.min(80, ((elapsedSeconds - 10) / 476) * 80);
    }
    return 85; 
  }, [elapsedSeconds]);

  // Telemetry-driven Environment Logic
  const atmosphereOpacity = Math.max(0, 1 - altitude / 120);
  const spaceOpacity = Math.min(1, altitude / 100);
  const speedFactor = Math.min(1, velocity / 28000);
  
  const plasmaIntensity = Math.max(0, (speedFactor * 1.5) * atmosphereOpacity * (altitude > 20 ? 1 : 0));

  let shakeIntensity = (isAscent || (isICPSActive && speedFactor > 0.4)) 
    ? (Math.sin(elapsedSeconds * 30) * (isAscent ? 1.5 : 0.4) * speedFactor) 
    : 0;
  
  if (isBoosterSepFlash || isLASSepFlash || isCoreSepFlash || isOrionSepFlash) {
    shakeIntensity += Math.sin(elapsedSeconds * 100) * 8;
  }

  const streakCount = Math.floor(speedFactor * 25);
  const starsCount = 40;

  // Debris particles for separation
  const debris = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 300,
      vy: (Math.random() - 0.5) * 300,
      size: 1 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-700 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[400px]'}`}>
      
      {/* Dynamic Backgrounds */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          opacity: atmosphereOpacity,
          background: 'radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.2) 0%, transparent 80%)'
        }}
      ></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: spaceOpacity }}>
        {Array.from({ length: starsCount }).map((_, i) => (
          <div 
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              left: `${(i * 123.45) % 100}%`,
              top: `${(i * 67.89) % 100}%`,
              width: `${0.5 + (i % 2)}px`,
              height: `${0.5 + (i % 2)}px`,
              opacity: 0.1 + Math.random() * 0.4,
              animation: `starFlow ${1.0 + (1 - speedFactor) * 15}s linear infinite`,
              animationDelay: `-${Math.random() * 15}s`
            }}
          />
        ))}
      </div>

      {/* Atmospheric Plasma Glow */}
      {plasmaIntensity > 0.05 && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-700"
          style={{ 
            opacity: plasmaIntensity * 0.6,
            background: 'radial-gradient(ellipse at center, rgba(255, 120, 50, 0.5) 0%, rgba(255, 30, 0, 0.3) 60%, transparent 90%)'
          }}
        ></div>
      )}

      {/* High-Speed Streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: streakCount }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1.5px] bg-blue-300/20"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${30 + Math.random() * 100}px`,
              top: '-250px',
              animation: `streak ${0.05 + (1 - speedFactor) * 0.5}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Event Indicator */}
      {(isBoosterSepFlash || isLASSepFlash) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in zoom-in fade-in duration-300">
           <div className={`px-4 py-1.5 border rounded-full shadow-lg ${isBoosterSepFlash ? 'bg-blue-600/90 border-blue-400' : 'bg-orange-600/90 border-orange-400'}`}>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">
                {isBoosterSepFlash ? 'SRB Separation' : 'LAS Jettison Detected'}
              </span>
           </div>
        </div>
      )}

      {/* Separation Event Flashes */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {(isBoosterSepFlash || isLASSepFlash || isCoreSepFlash || isOrionSepFlash) && (
          <div className="absolute inset-0 bg-white/10 animate-pulse backdrop-blur-[1px]"></div>
        )}
      </div>

      {/* Vehicle Visualization Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-all duration-[50ms] ease-out"
        style={{ 
          transform: `translate(${shakeIntensity}px, ${shakeIntensity/2}px)`,
          perspective: '1200px'
        }}
      >
        <div 
          className="relative preserve-3d transition-transform duration-[1000ms] ease-out-expo"
          style={{ 
            transform: `rotateX(${pitchAngle}deg)`, 
            transformStyle: 'preserve-3d' 
          }}
        >
          {/* 3D ROCKET ASSEMBLY */}
          <div className="relative preserve-3d">
            
            {/* 1. ORION SPACECRAFT + LAS TOWER */}
            <div 
              className={`relative preserve-3d transition-all duration-[3000ms] ${
                isOrionSeparated 
                ? 'translate-z-[150px] translate-y-[-220px] rotate-x-[8deg] scale-[1.05]' 
                : ''
              } ${isOrionSeparated ? 'ease-out-back' : 'cubic-bezier(0.16, 1, 0.3, 1)'}`}
            >
              {/* Separation Debris Cloud */}
              {(isOrionSepFlash || isLASSepFlash || isBoosterSepFlash) && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0 h-0 z-50">
                  {debris.map(d => (
                    <div 
                      key={d.id}
                      className="absolute bg-white rounded-sm animate-debris-fly"
                      style={{
                        width: d.size,
                        height: d.size,
                        '--vx': `${d.vx}px`,
                        '--vy': `${d.vy}px`,
                        opacity: 0.8
                      } as any}
                    />
                  ))}
                </div>
              )}

              {/* LAS ASSEMBLY */}
              <div 
                className={`absolute bottom-[95%] left-1/2 -translate-x-1/2 preserve-3d transition-all duration-[2500ms] ${
                  isLASJettisoned 
                  ? 'translate-y-[-1200px] opacity-0 rotate-x-[120deg] scale-125' 
                  : ''
                }`}
              >
                {isLASSepFlash && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-t from-blue-400 via-blue-600/30 to-transparent blur-lg animate-pulse"></div>
                )}
                <div className="w-1.5 h-16 bg-slate-400/80 border-x border-slate-500/40 mx-auto relative">
                   <div className="w-full h-4 bg-slate-200/90" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                   <div className="absolute top-2 -left-1 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse"></div>
                   <div className="absolute top-2 -right-1 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse"></div>
                </div>
                <div className="relative w-12 h-6 preserve-3d">
                  <div className={`absolute inset-0 bg-slate-300/40 border border-slate-400/50 transition-all duration-[1500ms] ${isLASJettisoned ? 'translate-x-[-40px] rotate-y-[-90deg]' : ''}`} style={{ clipPath: 'polygon(30% 0%, 50% 0%, 50% 100%, 0% 100%)' }}></div>
                  <div className={`absolute inset-0 bg-slate-300/40 border border-slate-400/50 transition-all duration-[1500ms] ${isLASJettisoned ? 'translate-x-[40px] rotate-y-[90deg]' : ''}`} style={{ clipPath: 'polygon(50% 0%, 70% 0%, 100% 100%, 50% 100%)' }}></div>
                </div>
              </div>

              {/* ORION CAPSULE */}
              <div className={`w-12 h-10 bg-slate-100/40 border border-slate-300/50 mx-auto relative ${isOrionSepFlash ? 'brightness-200 scale-110 shadow-[0_0_50px_rgba(255,255,255,1)]' : ''}`} style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                 {(isOrionSepFlash || isLASSepFlash) && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                       <div className="absolute -left-6 top-3 w-8 h-1 bg-cyan-300 blur-[3px] animate-pulse"></div>
                       <div className="absolute -right-6 top-3 w-8 h-1 bg-cyan-300 blur-[3px] animate-pulse"></div>
                       <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-1 h-8 bg-cyan-300 blur-[3px] animate-pulse"></div>
                       <div className="absolute left-1/2 top-10 -translate-x-1/2 w-1 h-8 bg-cyan-300 blur-[3px] animate-pulse"></div>
                    </div>
                 )}
              </div>

              {/* SOLAR ARRAYS */}
              {isSolarArrayDeployed && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0 h-0 preserve-3d">
                  {[0, 90, 180, 270].map((angle) => (
                    <div 
                      key={angle}
                      className="absolute top-0 left-0 w-28 h-7 bg-blue-600/40 border border-blue-400/60 animate-[deployArray_4s_ease-out_forwards]"
                      style={{ 
                        transformOrigin: 'left center', 
                        transform: `rotateY(${angle}deg) rotateX(25deg)`,
                        clipPath: 'polygon(0% 20%, 90% 0%, 100% 100%, 0% 80%)'
                      }}
                    >
                      <div className="w-full h-full bg-[linear-gradient(90deg,transparent_6px,rgba(59,130,246,0.2)_6px)] bg-[size:10px_100%]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. ICPS */}
            <div className={`transition-all duration-[4000ms] cubic-bezier(0.16, 1, 0.3, 1) ${isOrionSeparated ? 'translate-y-[220px] opacity-10 rotate-x-[-25deg] scale-90 blur-[3px]' : isCoreSeparated ? 'translate-y-[-40px]' : ''}`}>
               <div className="w-14 h-20 bg-slate-300/15 border-x border-slate-400/30 mx-auto -mt-px relative">
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-400/25" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}></div>
                  {isICPSActive && !isOrionSeparated && (
                     <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-10 h-32 bg-gradient-to-b from-blue-400/70 via-blue-500/20 to-transparent blur-xl animate-pulse"></div>
                  )}
               </div>
            </div>

            {/* 3. SLS CORE STAGE + SRBs */}
            <div className={`transition-all duration-[5000ms] cubic-bezier(0.16, 1, 0.3, 1) ${isCoreSeparated ? 'translate-y-[600px] opacity-0 rotate-x-[-45deg]' : ''}`}>
              <div className="relative preserve-3d w-18 h-80 bg-orange-600/25 border-x border-orange-500/40 mx-auto -mt-px">
                <div className="absolute inset-0 bg-[linear-gradient(transparent_96%,rgba(0,0,0,0.1)_96%)] bg-[size:100%_16px]"></div>
                
                {/* SRBs */}
                <div className="absolute inset-0 preserve-3d">
                  {/* Left SRB */}
                  <div className={`absolute top-24 -left-10 w-9 h-64 bg-slate-100/30 border border-slate-300/40 transition-all duration-[6000ms] ${isBoosterSeparated ? 'translate-x-[-400px] translate-y-[600px] rotate-z-[-90deg] opacity-0' : ''}`}>
                    <div className="absolute top-0 w-full h-8 bg-slate-300/40" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                    
                    {/* Booster Separation Motors (BSMs) - Plumes during separation */}
                    {isBoosterSepFlash && (
                      <div className="absolute inset-0 z-50 pointer-events-none">
                        <div className="absolute -top-4 -right-4 w-12 h-4 bg-orange-400/80 blur-md animate-bsm-pulse"></div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-4 bg-orange-400/80 blur-md animate-bsm-pulse"></div>
                      </div>
                    )}

                    {!isBoosterSeparated && isAscent && (
                      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-8 h-32 bg-gradient-to-b from-orange-500/90 to-transparent blur-2xl animate-pulse"></div>
                    )}
                  </div>

                  {/* Right SRB */}
                  <div className={`absolute top-24 -right-10 w-9 h-64 bg-slate-100/30 border border-slate-300/40 transition-all duration-[6000ms] ${isBoosterSeparated ? 'translate-x-[400px] translate-y-[600px] rotate-z-[90deg] opacity-0' : ''}`}>
                    <div className="absolute top-0 w-full h-8 bg-slate-300/40" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                    
                    {/* Booster Separation Motors (BSMs) */}
                    {isBoosterSepFlash && (
                      <div className="absolute inset-0 z-50 pointer-events-none">
                        <div className="absolute -top-4 -left-4 w-12 h-4 bg-orange-400/80 blur-md animate-bsm-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-4 bg-orange-400/80 blur-md animate-bsm-pulse"></div>
                      </div>
                    )}

                    {!isBoosterSeparated && isAscent && (
                      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-8 h-32 bg-gradient-to-b from-orange-500/90 to-transparent blur-2xl animate-pulse"></div>
                    )}
                  </div>
                </div>

                {isAscent && !isCoreSeparated && (
                  <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-16 bg-gradient-to-b from-orange-300 via-orange-600/60 to-transparent animate-pulse opacity-95 blur-[6px]" style={{ height: `${60 + Math.random() * 80 * (1 + speedFactor)}px` }}></div>
                    <div className="w-40 h-96 bg-gradient-to-b from-blue-400/20 to-transparent blur-[80px] -mt-48"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Overlays */}
      <div className="absolute bottom-8 left-10 space-y-5 z-20 pointer-events-none">
        <div className="flex flex-col group">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] opacity-80 mb-1">Vehicle Pitch</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-baseline">
              <span className="text-4xl mono text-white font-black tabular-nums animate-telemetry-glow">
                {pitchAngle.toFixed(1)}°
              </span>
              <span className="text-[10px] text-slate-600 mono font-black ml-1">DEG</span>
            </div>
            <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden self-center ml-2 border border-white/5">
              <div 
                className="h-full bg-slate-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                style={{ width: `${(pitchAngle / 90) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col group">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] opacity-80 mb-1">Scalar Vel</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-baseline">
              <span className="text-4xl mono text-blue-400 font-black tabular-nums animate-telemetry-glow">
                {velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-slate-600 mono font-black ml-1">KM/H</span>
            </div>
            <div className="w-32 h-1 bg-slate-950 rounded-full overflow-hidden self-center ml-2 border border-blue-500/20 shadow-inner">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                style={{ width: `${Math.min(100, (velocity / 28000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col group">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] opacity-80 mb-1">Altitude MSL</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-baseline">
              <span className="text-4xl mono text-emerald-400 font-black tabular-nums animate-telemetry-glow">
                {altitude.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] text-slate-600 mono font-black ml-1">KM</span>
            </div>
            <div className="w-40 h-1 bg-slate-950 rounded-full overflow-hidden self-center ml-2 border border-emerald-500/20 shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                style={{ width: `${Math.min(100, (altitude / 400) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes streak { 
            0% { transform: translateY(-300px); opacity: 0; } 
            15% { opacity: 1; } 
            85% { opacity: 1; } 
            100% { transform: translateY(1400px); opacity: 0; } 
        }
        @keyframes starFlow {
            0% { transform: translateY(0); }
            100% { transform: translateY(100vh); }
        }
        @keyframes deployArray {
            0% { transform: rotateY(var(--angle)) scaleX(0); opacity: 0; }
            100% { transform: rotateY(var(--angle)) scaleX(1); opacity: 1; }
        }
        @keyframes debris-fly {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(var(--vx), var(--vy)); opacity: 0; }
        }
        @keyframes telemetry-glow-pulse {
          0% { filter: drop-shadow(0 0 0px currentColor); }
          50% { filter: drop-shadow(0 0 4px currentColor); opacity: 0.95; }
          100% { filter: drop-shadow(0 0 0px currentColor); }
        }
        @keyframes bsm-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        .animate-telemetry-glow {
          animation: telemetry-glow-pulse 2s ease-in-out infinite;
        }
        .animate-bsm-pulse {
          animation: bsm-pulse 0.1s ease-in-out infinite;
        }
        .preserve-3d { transform-style: preserve-3d; }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .ease-out-back { transition-timing-function: cubic-bezier(0.34, 1.3, 0.64, 1); }
        .animate-debris-fly { animation: debris-fly 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ArtemisHUD;