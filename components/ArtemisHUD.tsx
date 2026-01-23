
import React from 'react';
import { TelemetryData } from '../types';

interface Props {
  elapsedSeconds: number;
  telemetry: TelemetryData;
  hideContainer?: boolean;
}

const ArtemisHUD: React.FC<Props> = ({ elapsedSeconds, telemetry, hideContainer }) => {
  const { altitude, velocity } = telemetry;

  // Staging logic based on mission timeline
  const isAscent = elapsedSeconds >= 0 && elapsedSeconds < 486;
  const isBoosterSeparated = elapsedSeconds >= 128;
  const isJustSeparated = elapsedSeconds >= 128 && elapsedSeconds < 135;
  const isLASJettisoned = elapsedSeconds >= 198;
  const isCoreSeparated = elapsedSeconds >= 498;
  const isSolarArrayDeployed = elapsedSeconds >= 1200;

  // Visual calculation for atmospheric transition
  const atmosphereOpacity = Math.max(0, 1 - altitude / 120);
  
  // Velocity-based effects
  const speedFactor = Math.min(1, velocity / 28000);
  const shakeIntensity = isAscent ? (Math.sin(elapsedSeconds * 15) * speedFactor * 1.5) : 0;
  
  // Speed particles (streaks) frequency
  const streakCount = Math.floor(speedFactor * 15);

  const hudContent = (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-500 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[400px]'}`}>
      
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
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* 3. Speed Streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: streakCount }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1px] bg-blue-400/20"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${20 + Math.random() * 60}px`,
              top: '-100px',
              animation: `streak ${0.15 + Math.random() * 0.3}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 4. HUD Telemetry Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Dynamic Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_2px,3px_100%]"></div>
        
        {/* Corner Brackets */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-500/30"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-500/30"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-500/30"></div>
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-500/30"></div>

        {/* Center Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-500/10 rounded-full">
            <div className="absolute top-1/2 left-0 w-4 h-px bg-blue-500/40"></div>
            <div className="absolute top-1/2 right-0 w-4 h-px bg-blue-500/40"></div>
            <div className="absolute top-0 left-1/2 h-4 w-px bg-blue-500/40"></div>
            <div className="absolute bottom-0 left-1/2 h-4 w-px bg-blue-500/40"></div>
        </div>
      </div>

      {/* 5. 3D Rocket Scene */}
      <div 
        className="relative w-full h-full flex items-center justify-center perspective-[1200px] transition-transform duration-75"
        style={{ transform: `translate(${shakeIntensity}px, ${shakeIntensity/2}px)` }}
      >
        {/* Ground/Reference Ring */}
        <div 
          className="absolute bottom-16 w-64 h-64 border border-blue-500/10 rounded-full rotate-x-70 animate-[spin_30s_linear_infinite]"
          style={{ transform: `rotateX(80deg) scale(${1 + atmosphereOpacity * 0.3})` }}
        >
          <div className="absolute inset-0 border-t-2 border-blue-400/20 rounded-full blur-[1px]"></div>
          <div className="absolute inset-8 border border-blue-500/5 rounded-full"></div>
        </div>

        {/* The Rocket (SLS) */}
        <div 
          className="relative preserve-3d animate-[rotateVehicle_20s_linear_infinite] transition-all duration-700" 
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
        >
          {/* Orion Stack (Capsule + Service Module + ICPS) */}
          <div className={`preserve-3d transition-all duration-1000 ${isCoreSeparated ? 'translate-y-[-60px]' : ''}`}>
            
            {/* Orion Capsule (Top Cone) */}
            <div className="relative preserve-3d">
              <div className="w-8 h-6 bg-slate-100/30 border border-slate-300/50 mx-auto" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
              </div>
              
              {/* Solar Arrays */}
              {isSolarArrayDeployed && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 preserve-3d">
                  {/* Four-wing configuration */}
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
                      <div className="w-full h-full bg-[linear-gradient(90deg,transparent_4px,rgba(59,130,246,0.2)_4px)] bg-[size:8px_100%]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Module & ICPS */}
            <div className="w-8 h-12 bg-slate-300/20 border-x border-slate-400/40 mx-auto -mt-px relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-slate-400/50"></div>
               {/* Detail lines */}
               <div className="absolute top-4 left-0 w-full h-px bg-slate-400/20"></div>
               <div className="absolute top-8 left-0 w-full h-px bg-slate-400/20"></div>
            </div>
          </div>

          {/* Core Stage (Orange Tank) */}
          {!isCoreSeparated && (
            <div className={`relative preserve-3d w-12 h-48 bg-orange-600/20 border-x border-orange-500/40 mx-auto -mt-px flex justify-center transition-all duration-1000 ${isCoreSeparated ? 'opacity-0 translate-y-[200px] scale-95' : 'opacity-100'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-orange-500/20 to-orange-500/5"></div>
              
              {/* Core Detail Ribbing */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(0,0,0,0.1)_95%)] bg-[size:100%_10px]"></div>

              {/* SRB Boosters (Side Attachments) */}
              {(elapsedSeconds < 140) && (
                <>
                  {/* Left Booster */}
                  <div 
                    className={`absolute top-10 -left-6 w-5 h-36 bg-slate-100/20 border border-slate-300/40 translate-z-4 transition-all duration-500 ${isBoosterSeparated ? 'animate-[boosterSepLeft_4s_ease-in_forwards]' : ''}`}
                  >
                    <div className="absolute top-0 left-0 w-full h-4 bg-slate-300/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                    {!isBoosterSeparated && <div className="absolute bottom-0 w-full h-8 bg-orange-500/40 blur-md animate-pulse"></div>}
                  </div>
                  {/* Right Booster */}
                  <div 
                    className={`absolute top-10 -right-6 w-5 h-36 bg-slate-100/20 border border-slate-300/40 -translate-z-4 transition-all duration-500 ${isBoosterSeparated ? 'animate-[boosterSepRight_4s_ease-in_forwards]' : ''}`}
                  >
                     <div className="absolute top-0 left-0 w-full h-4 bg-slate-300/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                     {!isBoosterSeparated && <div className="absolute bottom-0 w-full h-8 bg-orange-500/40 blur-md animate-pulse"></div>}
                  </div>
                </>
              )}

              {/* Separation Flash Effect */}
              {isJustSeparated && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/40 rounded-full blur-[40px] animate-[sepFlash_1s_ease-out_forwards] z-50"></div>
              )}

              {/* Engine Exhaust (Core) */}
              {isAscent && (
                <div className="absolute -bottom-24 flex flex-col items-center">
                  <div className="w-10 bg-gradient-to-b from-orange-400 via-orange-500/60 to-transparent animate-pulse opacity-80 blur-[2px]" style={{ height: `${20 + Math.random() * 30 * (1 + speedFactor)}px` }}></div>
                  <div className="w-16 h-32 bg-gradient-to-b from-blue-400/10 to-transparent blur-2xl -mt-16"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Telemetry Data Readouts */}
      <div className="absolute bottom-6 left-6 space-y-4 z-20">
        <div className="flex flex-col group">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] group-hover:text-blue-400 transition-colors">ALTITUDE_AERO</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl lg:text-2xl mono text-emerald-400 font-bold tabular-nums drop-shadow-lg">
              {altitude.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-slate-500 mono">KM</span>
          </div>
        </div>
        <div className="flex flex-col group">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] group-hover:text-blue-400 transition-colors">VELOCITY_VEC</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl lg:text-2xl mono text-blue-400 font-bold tabular-nums drop-shadow-lg">
              {velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-500 mono">KM/H</span>
          </div>
        </div>
      </div>

      {/* 7. Status HUD elements */}
      <div className="absolute top-6 right-6 text-right z-20">
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-[9px] mono text-slate-400 font-bold uppercase tracking-widest">SRB_STATUS:</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${!isBoosterSeparated ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'}`}>
                {!isBoosterSeparated ? 'INTERNAL_IGNITION' : 'JETTISON_COMPLETE'}
            </span>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <span className="text-[9px] mono text-slate-400 font-bold uppercase tracking-widest">STAGING_AUTO:</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${!isCoreSeparated ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {!isCoreSeparated ? 'ACTIVE_BURN' : 'INJECTION_SUCCESS'}
            </span>
          </div>
        </div>
        
        {/* Dynamic Warning/Info Panel */}
        <div className="px-4 py-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl">
           <div className="flex items-center space-x-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] mono text-blue-300 font-bold uppercase tracking-tight">System Vector</span>
           </div>
           <p className="text-[8px] mono text-slate-500 leading-tight uppercase">
             {isJustSeparated ? 'BOOSTER SEPARATION INITIATED - VELOCITY COMPENSATION ACTIVE' : (isAscent ? 'Propulsion phase: Max dynamic pressure monitor active' : 'Orbital phase: Solar acquisition and power management')}
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
        @keyframes boosterSepLeft {
            0% { transform: translateX(0) translateY(0) rotate(0); opacity: 1; }
            20% { transform: translateX(-40px) translateY(10px) rotate(-15deg); opacity: 1; }
            100% { transform: translateX(-200px) translateY(500px) rotate(-90deg); opacity: 0; }
        }
        @keyframes boosterSepRight {
            0% { transform: translateX(0) translateY(0) rotate(0); opacity: 1; }
            20% { transform: translateX(40px) translateY(10px) rotate(15deg); opacity: 1; }
            100% { transform: translateX(200px) translateY(500px) rotate(90deg); opacity: 0; }
        }
        @keyframes sepFlash {
            0% { opacity: 0; transform: scale(0.2); }
            10% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 0; transform: scale(2); }
        }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-x-70 { transform: rotateX(80deg); }
      `}</style>
    </div>
  );

  return hudContent;
};

export default ArtemisHUD;
