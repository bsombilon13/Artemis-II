import React, { useMemo } from 'react';
import { TelemetryData } from '../types';

interface Props {
  elapsedSeconds: number;
  telemetry: TelemetryData;
  hideContainer?: boolean;
}

const ArtemisHUD: React.FC<Props> = ({ elapsedSeconds, telemetry, hideContainer }) => {
  const { altitude, velocity } = telemetry;

  // Staging logic based on mission timeline
  const isPreLaunch = elapsedSeconds < 0;
  const isAscent = elapsedSeconds >= 0 && elapsedSeconds < 486;
  
  const isBoosterSeparated = elapsedSeconds >= 128;
  const isBoosterSepFlash = elapsedSeconds >= 128 && elapsedSeconds < 132;
  
  const isLASJettisoned = elapsedSeconds >= 198;
  const isLASSepFlash = elapsedSeconds >= 198 && elapsedSeconds < 201;

  const isCoreSeparated = elapsedSeconds >= 498;
  const isCoreSepFlash = elapsedSeconds >= 498 && elapsedSeconds < 502;
  
  const isICPSActive = elapsedSeconds >= 498 && elapsedSeconds < 12255;
  const isOrionSeparated = elapsedSeconds >= 12255;
  const isOrionSepFlash = elapsedSeconds >= 12255 && elapsedSeconds < 12258;

  const isSolarArrayDeployed = elapsedSeconds >= 1200;

  // Visual calculation for atmospheric transition
  const atmosphereOpacity = Math.max(0, 1 - altitude / 120);
  
  // Velocity-based effects
  const speedFactor = Math.min(1, velocity / 28000);
  
  // Base rocket shake
  let shakeIntensity = (isAscent || (isICPSActive && speedFactor > 0.5)) 
    ? (Math.sin(elapsedSeconds * 15) * (isAscent ? 1.5 : 0.5) * speedFactor) 
    : 0;
  
  // Separation "Kicks"
  if (isBoosterSepFlash || isLASSepFlash || isCoreSepFlash || isOrionSepFlash) {
    shakeIntensity += Math.sin(elapsedSeconds * 60) * 4;
  }

  const streakCount = Math.floor(speedFactor * 12);

  const hudContent = (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-500 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[320px] md:min-h-[400px]'}`}>
      
      {/* 1. Atmospheric Haze Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          opacity: atmosphereOpacity,
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
        }}
      ></div>

      {/* 2. Starfield / Grid */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(59, 130, 246, 0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59, 130, 246, 0.03)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
      </div>

      {/* 3. Speed Streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: streakCount }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1px] bg-blue-400/20"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${15 + Math.random() * 40}px`,
              top: '-100px',
              animation: `streak ${0.15 + Math.random() * 0.3}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 4. HUD Telemetry Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,0,255,0.02),rgba(0,0,255,0.02))] bg-[size:100%_2px,3px_100%] opacity-50"></div>
        
        {/* Flash Alerts for Staging */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none">
          {isBoosterSepFlash && (
            <div className="bg-orange-500/20 border border-orange-500 text-orange-400 font-bold px-4 py-1 mono text-[10px] tracking-widest rounded animate-pulse">
              STAGE_EVENT: SRB_JETTISON
            </div>
          )}
          {isLASSepFlash && (
            <div className="bg-blue-500/20 border border-blue-500 text-blue-400 font-bold px-4 py-1 mono text-[10px] tracking-widest rounded animate-pulse">
              STAGE_EVENT: LAS_JETTISON
            </div>
          )}
          {isCoreSepFlash && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 font-bold px-4 py-1 mono text-[10px] tracking-widest rounded animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              STAGE_EVENT: CORE_SEP_CONFIRMED
            </div>
          )}
          {isOrionSepFlash && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold px-4 py-1 mono text-[10px] tracking-widest rounded animate-pulse">
              STAGE_EVENT: ORION_ICPS_SEP
            </div>
          )}
        </div>

        {/* Brackets */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-500/10"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-500/10"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-500/10"></div>
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-500/10"></div>
      </div>

      {/* 5. 3D Rocket Scene */}
      <div 
        className="relative w-full h-full flex items-center justify-center perspective-[1000px] transition-transform duration-75"
        style={{ transform: `translate(${shakeIntensity}px, ${shakeIntensity/2}px)` }}
      >
        <div 
          className="absolute bottom-16 w-64 h-64 border border-blue-500/5 rounded-full rotate-x-70 animate-[spin_60s_linear_infinite]"
          style={{ transform: `rotateX(80deg) scale(${1 + atmosphereOpacity * 0.3})` }}
        >
          <div className="absolute inset-0 border-t-2 border-blue-400/10 rounded-full blur-[1px]"></div>
        </div>

        {/* Main Vehicle Assembly */}
        <div 
          className="relative preserve-3d animate-[rotateVehicle_30s_linear_infinite]" 
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ORION / SERVICE MODULE / ICPS STACK */}
          <div className={`preserve-3d transition-transform duration-[2000ms] ${isCoreSeparated ? 'translate-y-[-40px]' : ''}`}>
            
            {/* Orion Capsule & LAS */}
            <div className="relative preserve-3d">
              {/* LAS (Launch Abort System) - Jettisons early */}
              {!isLASJettisoned && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-10 bg-slate-400/40 border-x border-slate-500/50">
                   <div className="w-full h-2 bg-slate-300/60" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                </div>
              )}
              {isLASSepFlash && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center z-50">
                   <div className="w-full h-full bg-blue-400/60 rounded-full animate-ping scale-150 blur-sm"></div>
                   <div className="absolute w-2 h-24 bg-gradient-to-t from-blue-400/80 to-transparent animate-[laserBeam_0.3s_ease-out_forwards]"></div>
                </div>
              )}

              {/* Capsule (Conical top) */}
              <div className="w-6 h-5 bg-slate-100/30 border border-slate-300/50 mx-auto" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
              </div>
              
              {/* Service Module Solar Arrays (Deployed later) */}
              {isSolarArrayDeployed && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 preserve-3d">
                  {[0, 90, 180, 270].map((angle) => (
                    <div 
                      key={angle}
                      className="absolute top-0 left-0 w-16 h-4 bg-blue-600/30 border border-blue-400/60 animate-[deployArray_2s_ease-out_forwards]"
                      style={{ 
                        transformOrigin: 'left center', 
                        transform: `rotateY(${angle}deg) rotateX(10deg)`,
                        clipPath: 'polygon(0% 20%, 90% 0%, 100% 100%, 0% 80%)'
                      }}
                    >
                      <div className="w-full h-full bg-[linear-gradient(90deg,transparent_4px,rgba(59,130,246,0.1)_4px)] bg-[size:8px_100%]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Module (ESM) */}
            <div className="w-6 h-6 bg-slate-300/20 border-x border-slate-400/40 mx-auto -mt-px relative">
               <div className="absolute top-0 w-full h-px bg-slate-400/50"></div>
               {/* Orion Sep Ring Flash */}
               {isOrionSepFlash && (
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-px bg-emerald-400 animate-[ringExpand_0.6s_ease-out_forwards] blur-[1px]"></div>
               )}
               {/* ESM Thrusters */}
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500/10 blur-[2px] animate-pulse"></div>
            </div>

            {/* ICPS (Upper Stage) */}
            <div className={`transition-all duration-[2500ms] ${isOrionSeparated ? 'translate-y-[150px] opacity-0 rotate-[15deg]' : ''}`}>
              <div className="w-8 h-12 bg-slate-300/10 border-x border-slate-400/20 mx-auto -mt-px relative">
                 <div className="absolute inset-x-0 bottom-0 h-4 bg-slate-400/20" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}></div>
                 {/* Core Sep Ring Flash */}
                 {isCoreSepFlash && (
                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-orange-500 animate-[ringExpand_1s_ease-out_forwards] blur-[2px]"></div>
                 )}
                 {/* ICPS Engine Burn (if active) */}
                 {isICPSActive && speedFactor > 0.1 && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-blue-400/40 via-blue-500/10 to-transparent blur-md animate-pulse"></div>
                 )}
              </div>
            </div>
          </div>

          {/* CORE STAGE (Orange Booster) */}
          <div className={`transition-all duration-[3000ms] ease-in-out ${isCoreSeparated ? 'translate-y-[300px] opacity-0 rotate-[-10deg] scale-90' : 'translate-y-0 opacity-100'}`}>
            <div className="relative preserve-3d w-12 h-52 bg-orange-600/20 border-x border-orange-500/40 mx-auto -mt-px shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]">
              {/* Detail Ribbing */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(0,0,0,0.05)_95%)] bg-[size:100%_10px]"></div>

              {/* SRBs (Side Boosters) */}
              <div className="absolute inset-0 preserve-3d pointer-events-none">
                {/* Left Booster */}
                <div 
                  className={`absolute top-12 -left-6 w-5 h-40 bg-slate-100/20 border border-slate-300/40 transition-all duration-[4000ms] ${isBoosterSeparated ? 'translate-x-[-150px] translate-y-[400px] rotate-[-45deg] opacity-0' : ''}`}
                >
                  <div className="absolute top-0 w-full h-4 bg-slate-300/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                  {/* Booster Sep Small Flash */}
                  {isBoosterSepFlash && (
                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-orange-500/40 rounded-full blur-md animate-ping"></div>
                  )}
                  {!isBoosterSeparated && isAscent && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-b from-orange-500/60 to-transparent blur-lg animate-pulse"></div>
                  )}
                </div>
                {/* Right Booster */}
                <div 
                  className={`absolute top-12 -right-6 w-5 h-40 bg-slate-100/20 border border-slate-300/40 transition-all duration-[4000ms] ${isBoosterSeparated ? 'translate-x-[150px] translate-y-[400px] rotate-[45deg] opacity-0' : ''}`}
                >
                  <div className="absolute top-0 w-full h-4 bg-slate-300/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                  {/* Booster Sep Small Flash */}
                  {isBoosterSepFlash && (
                    <div className="absolute top-1/2 -left-2 w-4 h-4 bg-orange-500/40 rounded-full blur-md animate-ping"></div>
                  )}
                  {!isBoosterSeparated && isAscent && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-b from-orange-500/60 to-transparent blur-lg animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Core Engine Exhaust */}
              {isAscent && (
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-10 bg-gradient-to-b from-orange-400 via-orange-500/40 to-transparent animate-pulse opacity-80 blur-[2px]" style={{ height: `${20 + Math.random() * 30 * (1 + speedFactor)}px` }}></div>
                  <div className="w-20 h-48 bg-gradient-to-b from-blue-400/10 to-transparent blur-3xl -mt-24"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Dynamic Readouts */}
      <div className="absolute bottom-6 left-6 space-y-3 z-20 pointer-events-none">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em]">Current_Altitude</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl mono text-emerald-400 font-bold tabular-nums">
              {altitude.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-slate-600 mono">KM</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em]">Vehicle_Velocity</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl mono text-blue-400 font-bold tabular-nums">
              {velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-600 mono">KM/H</span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 text-right z-20 pointer-events-none">
        <div className="px-4 py-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl">
           <div className="flex items-center justify-end space-x-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isAscent || isICPSActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
              <span className="text-[10px] mono text-blue-300 font-bold uppercase">Staging Status</span>
           </div>
           <p className="text-[8px] mono text-slate-500 uppercase leading-tight">
             {isOrionSeparated ? 'TRANS-LUNAR_CONFIG' : isCoreSeparated ? 'ICPS_ACTIVE' : isBoosterSeparated ? 'CORE_SUSTAINER' : 'ASCENT_POWER'}
           </p>
        </div>
      </div>

      <style>{`
        @keyframes rotateVehicle { 
            0% { transform: rotateY(0deg) rotateX(-5deg); } 
            100% { transform: rotateY(360deg) rotateX(-5deg); } 
        }
        @keyframes streak { 
            0% { transform: translateY(-100px); opacity: 0; } 
            20% { opacity: 0.8; } 
            80% { opacity: 0.8; } 
            100% { transform: translateY(800px); opacity: 0; } 
        }
        @keyframes deployArray {
            0% { transform: rotateY(var(--angle)) scaleX(0); opacity: 0; }
            100% { transform: rotateY(var(--angle)) scaleX(1); opacity: 1; }
        }
        @keyframes ringExpand {
            0% { transform: translateX(-50%) scaleX(0.5); opacity: 1; }
            100% { transform: translateX(-50%) scaleX(2.5); opacity: 0; }
        }
        @keyframes laserBeam {
            0% { transform: scaleY(0); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: scaleY(2) translateY(-20px); opacity: 0; }
        }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-x-70 { transform: rotateX(80deg); }
      `}</style>
    </div>
  );

  return hudContent;
};

export default ArtemisHUD;