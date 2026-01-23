
import React from 'react';
import { TelemetryData } from '../types';

interface Props {
  elapsedSeconds: number;
  telemetry: TelemetryData;
  hideContainer?: boolean;
}

const ArtemisHUD: React.FC<Props> = ({ elapsedSeconds, telemetry, hideContainer }) => {
  const { altitude, velocity } = telemetry;

  // Staging logic
  const isAscent = elapsedSeconds >= 0 && elapsedSeconds < 486;
  const isBoosterSeparated = elapsedSeconds >= 128;
  const isCoreSeparated = elapsedSeconds >= 498;
  const isSolarArrayDeployed = elapsedSeconds >= 1200;

  // Visual calculation for atmospheric transition
  const atmosphereOpacity = Math.max(0, 1 - altitude / 120);
  
  // Velocity-based effects
  const speedFactor = Math.min(1, velocity / 28000);
  const shakeIntensity = isAscent ? (Math.sin(elapsedSeconds * 15) * speedFactor * 2) : 0;
  
  // Speed particles (streaks) frequency
  const streakCount = Math.floor(speedFactor * 15);

  const hudContent = (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-500 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[400px]'}`}>
      
      {/* 1. Atmospheric Haze Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          opacity: atmosphereOpacity,
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
        }}
      ></div>

      {/* 2. Starfield / Grid */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* 3. Speed Streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: streakCount }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1px] bg-blue-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${15 + Math.random() * 45}px`,
              top: '-100px',
              animation: `streak ${0.2 + Math.random() * 0.4}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 4. Telemetry Header - Only show if not inside MultiViewMonitor */}
      {!hideContainer && (
        <div className="absolute top-3 left-3 flex flex-col z-20">
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Vehicle System Monitor</span>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] text-blue-400 mono font-bold">MODE: ACTIVE_RENDER</span>
            <span className="text-[8px] text-slate-600 mono">|</span>
            <span className="text-[8px] text-emerald-400 mono font-bold">SYNC: OK</span>
          </div>
        </div>
      )}

      {/* 5. 3D Scene Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center perspective-[1000px] transition-transform duration-75 scale-90 lg:scale-100"
        style={{ transform: `translate(${shakeIntensity}px, ${shakeIntensity/2}px)` }}
      >
        <div 
          className="absolute bottom-10 w-48 h-48 border border-blue-500/20 rounded-full rotate-x-70 animate-[spin_20s_linear_infinite]"
          style={{ transform: `rotateX(75deg) scale(${1 + atmosphereOpacity * 0.2})` }}
        >
          <div className="absolute inset-0 border-t border-blue-400/40 rounded-full blur-[2px]"></div>
          <div className="absolute inset-4 border border-blue-500/10 rounded-full"></div>
        </div>

        <div 
          className="relative preserve-3d animate-[rotateVehicle_18s_linear_infinite] transition-all duration-500" 
          style={{ transformStyle: 'preserve-3d', marginTop: `${-altitude/15}px` }}
        >
          <div className={`preserve-3d transition-transform duration-1000 ${isCoreSeparated ? 'translate-y-[-30px]' : ''}`}>
            <div className="relative w-10 h-8 bg-blue-500/25 border border-blue-400/70 preserve-3d" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)' }}>
              {isSolarArrayDeployed && (
                <>
                  <div className="absolute top-2 -left-14 w-14 h-3 bg-blue-400/30 border border-blue-400/50 animate-pulse origin-right rotate-y-45"></div>
                  <div className="absolute top-2 -right-14 w-14 h-3 bg-blue-400/30 border border-blue-400/50 animate-pulse origin-left rotate-y-45"></div>
                </>
              )}
            </div>
            <div className="w-10 h-10 bg-slate-400/25 border border-slate-400/70 -mt-px"></div>
          </div>

          {!isCoreSeparated && (
            <div className="relative preserve-3d w-10 h-40 bg-orange-600/25 border-x border-orange-500/50 -mt-px flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-orange-500/30 to-orange-500/10"></div>
              {!isBoosterSeparated && (
                <>
                  <div className="absolute top-6 -left-6 w-5 h-30 bg-slate-200/25 border border-slate-300/50 translate-z-4">
                    <div className="absolute bottom-0 w-full h-6 bg-orange-500/40 blur-sm animate-pulse"></div>
                  </div>
                  <div className="absolute top-6 -right-6 w-5 h-30 bg-slate-200/25 border border-slate-300/50 -translate-z-4">
                     <div className="absolute bottom-0 w-full h-6 bg-orange-500/40 blur-sm animate-pulse"></div>
                  </div>
                </>
              )}
              {isAscent && (
                <div className="absolute -bottom-16 flex flex-col items-center">
                  <div className="w-8 bg-gradient-to-b from-orange-400 via-orange-500/60 to-transparent animate-pulse opacity-80 blur-[2px]" style={{ height: `${15 + Math.random() * 15 * (1 + speedFactor)}px` }}></div>
                  <div className="w-14 h-24 bg-gradient-to-b from-blue-400/20 to-transparent blur-xl -mt-10"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Telemetry Labels */}
      <div className="absolute bottom-4 left-4 space-y-3 z-20">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Altitude (KM)</span>
          <span className="text-lg lg:text-xl mono text-emerald-400 font-bold tabular-nums">
            {altitude.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Velocity (KM/H)</span>
          <span className="text-lg lg:text-xl mono text-blue-400 font-bold tabular-nums">
            {velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-right z-20">
        <div className="mb-3 space-y-1">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-[9px] mono text-slate-400 font-bold uppercase">Booster:</span>
            <span className={`text-[9px] font-bold ${!isBoosterSeparated ? 'text-green-400' : 'text-slate-500'}`}>{!isBoosterSeparated ? 'ACTIVE' : 'OFF'}</span>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <span className="text-[9px] mono text-slate-400 font-bold uppercase">Staging:</span>
            <span className={`text-[9px] font-bold ${!isCoreSeparated ? 'text-green-400' : 'text-blue-400'}`}>{!isCoreSeparated ? 'NOMINAL' : 'DONE'}</span>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded shadow-inner">
           <span className="text-[10px] mono text-blue-300 font-bold uppercase tracking-tighter">Dynamics: {isAscent ? 'THRUST' : 'DRIFT'}</span>
        </div>
      </div>

      <style>{`
        @keyframes rotateVehicle { 0% { transform: rotateY(0deg) rotateX(-10deg); } 100% { transform: rotateY(360deg) rotateX(-10deg); } }
        @keyframes streak { 0% { transform: translateY(-100px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(800px); opacity: 0; } }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-x-70 { transform: rotateX(75deg); }
        .rotate-y-45 { transform: rotateY(45deg); }
      `}</style>
    </div>
  );

  return hudContent;
};

export default ArtemisHUD;
