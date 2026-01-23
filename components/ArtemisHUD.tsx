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
  const isLASSepFlash = elapsedSeconds >= 198 && elapsedSeconds < 200.5;

  const isCoreSeparated = elapsedSeconds >= 498;
  const isCoreSepFlash = elapsedSeconds >= 498 && elapsedSeconds < 501.5;
  
  const isICPSActive = elapsedSeconds >= 498 && elapsedSeconds < 12255;
  const isOrionSeparated = elapsedSeconds >= 12255;
  const isOrionSepFlash = elapsedSeconds >= 12255 && elapsedSeconds < 12257.5;

  const isSolarArrayDeployed = elapsedSeconds >= 1200;

  // Telemetry-driven Environment Logic
  const atmosphereOpacity = Math.max(0, 1 - altitude / 150);
  const spaceOpacity = Math.min(1, altitude / 100);
  const speedFactor = Math.min(1, velocity / 28000);
  
  // Plasma glow based on velocity and air density (simplified)
  const plasmaIntensity = Math.max(0, (speedFactor * 2) * atmosphereOpacity * (altitude > 15 ? 1 : 0));

  let shakeIntensity = (isAscent || (isICPSActive && speedFactor > 0.5)) 
    ? (Math.sin(elapsedSeconds * 20) * (isAscent ? 2 : 0.6) * speedFactor) 
    : 0;
  
  if (isBoosterSepFlash || isLASSepFlash || isCoreSepFlash || isOrionSepFlash) {
    shakeIntensity += Math.sin(elapsedSeconds * 80) * 5;
  }

  // Visual dynamic counts
  const streakCount = Math.floor(speedFactor * 18);
  const starsCount = 50;

  // Vehicle HUD movement
  const climbOffset = Math.max(-80, -altitude * 0.15); // Rocket 'climbs' in frame as alt increases
  const thrustScale = 1 + (speedFactor * 0.12); // Rocket 'pushes' forward with velocity

  return (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-700 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[320px] md:min-h-[400px]'}`}>
      
      {/* Dynamic Backgrounds */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          opacity: atmosphereOpacity,
          background: 'radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.25) 0%, transparent 85%)'
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
              width: `${0.5 + (i % 2.5)}px`,
              height: `${0.5 + (i % 2.5)}px`,
              opacity: 0.15 + Math.random() * 0.5,
              animation: `starFlow ${1.5 + (1 - speedFactor) * 12}s linear infinite`,
              animationDelay: `-${Math.random() * 12}s`
            }}
          />
        ))}
      </div>

      {/* Atmospheric Plasma Glow */}
      {plasmaIntensity > 0.1 && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-700"
          style={{ 
            opacity: plasmaIntensity * 0.5,
            background: 'radial-gradient(ellipse at center, rgba(255, 140, 60, 0.4) 0%, rgba(255, 40, 0, 0.2) 50%, transparent 80%)'
          }}
        ></div>
      )}

      {/* High-Speed Streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: streakCount }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1px] bg-blue-300/30"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${20 + Math.random() * 80}px`,
              top: '-250px',
              animation: `streak ${0.08 + (1 - speedFactor) * 0.4}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.08)_50%),linear-gradient(90deg,rgba(59,130,246,0.02),rgba(0,255,0,0.01),rgba(59,130,246,0.02))] bg-[size:100%_4px,5px_100%] opacity-40"></div>
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none">
          {isBoosterSepFlash && (
            <div className="bg-orange-500/20 border border-orange-500 text-orange-400 font-bold px-5 py-1.5 text-[11px] tracking-[0.3em] rounded-md animate-pulse">
              SRB JETTISON CONFIRMED
            </div>
          )}
          {isLASSepFlash && (
            <div className="bg-blue-500/20 border border-blue-500 text-blue-400 font-bold px-5 py-1.5 text-[11px] tracking-[0.3em] rounded-md animate-pulse">
              LAS JETTISON COMPLETE
            </div>
          )}
          {isCoreSepFlash && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 font-bold px-5 py-1.5 text-[11px] tracking-[0.3em] rounded-md animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              CORE STAGE SEPARATION
            </div>
          )}
          {isOrionSepFlash && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold px-5 py-1.5 text-[11px] tracking-[0.3em] rounded-md animate-pulse">
              ORION DEPLOYMENT PHASE
            </div>
          )}
        </div>

        {/* HUD UI Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-blue-400/10"></div>
        <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-blue-400/10"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-blue-400/10"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-blue-400/10"></div>
      </div>

      <div 
        className="relative w-full h-full flex items-center justify-center perspective-[1000px] transition-all duration-[100ms] ease-out"
        style={{ 
          transform: `translate(${shakeIntensity}px, ${shakeIntensity/2 + climbOffset}px) scale(${thrustScale})` 
        }}
      >
        {/* Orbital Sphere Reference */}
        <div 
          className="absolute bottom-20 w-96 h-96 border border-blue-500/5 rounded-full transition-transform duration-1000"
          style={{ 
            transform: `rotateX(85deg) scale(${1 + altitude / 600})`,
            opacity: 0.6 - spaceOpacity * 0.4
          }}
        >
          <div className="absolute inset-0 border-t-2 border-blue-400/10 rounded-full blur-[3px] animate-[spin_50s_linear_infinite]"></div>
        </div>

        <div 
          className="relative preserve-3d animate-[rotateVehicle_50s_linear_infinite]" 
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Rocket Visualization Container */}
          <div className={`preserve-3d transition-transform duration-[2200ms] ${isCoreSeparated ? 'translate-y-[-60px]' : ''}`}>
            
            {/* Orion + LAS */}
            <div className={`relative preserve-3d transition-all duration-[1500ms] ${isOrionSeparated ? 'translate-y-[-40px]' : ''}`}>
              {!isLASJettisoned && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-14 bg-slate-400/40 border-x border-slate-500/50">
                   <div className="w-full h-4 bg-slate-300/60" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                </div>
              )}
              
              {isLASSepFlash && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-20 h-20 z-50 flex items-center justify-center">
                  <div className="w-full h-full bg-blue-300/80 rounded-full animate-ping blur-md"></div>
                  <div className="absolute w-1.5 h-48 bg-gradient-to-t from-blue-200 to-transparent animate-[mechanicalFlash_0.6s_ease-out]"></div>
                </div>
              )}

              {/* Orion Module */}
              <div className={`w-10 h-8 bg-slate-100/30 border border-slate-300/50 mx-auto relative transition-all duration-700 ${isOrionSepFlash || plasmaIntensity > 0.4 ? 'scale-[1.08] brightness-150 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''}`} style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent"></div>
                 {plasmaIntensity > 0.25 && (
                   <div className="absolute inset-0 bg-orange-400/40 animate-pulse blur-[1.5px]"></div>
                 )}
              </div>

              {/* Solar Arrays */}
              {isSolarArrayDeployed && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0 h-0 preserve-3d">
                  {[0, 90, 180, 270].map((angle) => (
                    <div 
                      key={angle}
                      className="absolute top-0 left-0 w-24 h-6 bg-blue-600/30 border border-blue-400/60 animate-[deployArray_3s_ease-out_forwards]"
                      style={{ 
                        transformOrigin: 'left center', 
                        transform: `rotateY(${angle}deg) rotateX(20deg)`,
                        clipPath: 'polygon(0% 20%, 90% 0%, 100% 100%, 0% 80%)'
                      }}
                    >
                      <div className="w-full h-full bg-[linear-gradient(90deg,transparent_6px,rgba(59,130,246,0.15)_6px)] bg-[size:12px_100%]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adapter Section */}
            <div className="w-10 h-10 bg-slate-300/20 border-x border-slate-400/40 mx-auto -mt-px relative">
               {isOrionSepFlash && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full h-full z-50 flex items-center justify-center">
                    <div className="absolute w-20 h-20 border-2 border-emerald-400/60 rounded-full animate-[ringExpand_1.2s_ease-out_forwards] blur-[2px]"></div>
                    <div className="absolute w-3 h-3 bg-white rounded-full animate-ping"></div>
                 </div>
               )}
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500/10 blur-[4px] animate-pulse"></div>
            </div>

            {/* ICPS Upper Stage */}
            <div className={`transition-all duration-[3000ms] ${isOrionSeparated ? 'translate-y-[250px] opacity-0 rotate-[25deg]' : ''}`}>
              <div className={`w-12 h-18 bg-slate-300/10 border-x border-slate-400/20 mx-auto -mt-px relative transition-all duration-700 ${isCoreSepFlash ? 'scale-[1.08] brightness-125' : ''}`}>
                 <div className="absolute inset-x-0 bottom-0 h-6 bg-slate-400/20" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}></div>
                 
                 {isCoreSepFlash && (
                   <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-24 z-50 flex items-center justify-center">
                      <div className="absolute w-32 h-32 border-2 border-orange-500/60 rounded-full animate-[ringExpand_1.8s_ease-out_forwards] blur-[4px]"></div>
                      <div className="absolute w-1.5 h-40 bg-orange-400/40 animate-[mechanicalFlash_0.8s_linear]"></div>
                   </div>
                 )}
                 
                 {isICPSActive && speedFactor > 0.04 && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-8 h-20 bg-gradient-to-b from-blue-400/60 via-blue-500/20 to-transparent blur-lg animate-pulse"></div>
                 )}
              </div>
            </div>
          </div>

          {/* Core + Boosters */}
          <div className={`transition-all duration-[4000ms] ease-in-out ${isCoreSeparated ? 'translate-y-[500px] opacity-0 rotate-[-20deg] scale-80' : 'translate-y-0 opacity-100'}`}>
            <div className="relative preserve-3d w-16 h-72 bg-orange-600/20 border-x border-orange-500/40 mx-auto -mt-px shadow-[inset_0_0_35px_rgba(249,115,22,0.2)]">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_96%,rgba(0,0,0,0.08)_96%)] bg-[size:100%_14px]"></div>
              
              <div className="absolute inset-0 preserve-3d pointer-events-none">
                {/* SRB Left */}
                <div 
                  className={`absolute top-20 -left-8 w-8 h-56 bg-slate-100/20 border border-slate-300/40 transition-all duration-[6000ms] ${isBoosterSeparated ? 'translate-x-[-250px] translate-y-[600px] rotate-[-70deg] opacity-0' : ''}`}
                >
                  <div className="absolute top-0 w-full h-6 bg-slate-300/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                  {isBoosterSepFlash && (
                    <div className="absolute top-8 -right-8 w-20 h-20 flex items-center justify-center">
                      <div className="w-full h-full bg-orange-500/60 rounded-full animate-ping blur-2xl"></div>
                    </div>
                  )}
                  {!isBoosterSeparated && isAscent && (
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-6 h-24 bg-gradient-to-b from-orange-500/80 to-transparent blur-2xl animate-pulse"></div>
                  )}
                </div>

                {/* SRB Right */}
                <div 
                  className={`absolute top-20 -right-8 w-8 h-56 bg-slate-100/20 border border-slate-300/40 transition-all duration-[6000ms] ${isBoosterSeparated ? 'translate-x-[250px] translate-y-[600px] rotate-[70deg] opacity-0' : ''}`}
                >
                  <div className="absolute top-0 w-full h-6 bg-slate-300/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                  {isBoosterSepFlash && (
                    <div className="absolute top-8 -left-8 w-20 h-20 flex items-center justify-center">
                      <div className="w-full h-full bg-orange-500/60 rounded-full animate-ping blur-2xl"></div>
                    </div>
                  )}
                  {!isBoosterSeparated && isAscent && (
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-6 h-24 bg-gradient-to-b from-orange-500/80 to-transparent blur-2xl animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Core Plume */}
              {isAscent && (
                <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-14 bg-gradient-to-b from-orange-300 via-orange-500/60 to-transparent animate-pulse opacity-95 blur-[4px]" style={{ height: `${40 + Math.random() * 60 * (1 + speedFactor)}px` }}></div>
                  <div className="w-32 h-80 bg-gradient-to-b from-blue-400/25 to-transparent blur-[60px] -mt-40"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry Metric Overlays */}
      <div className="absolute bottom-10 left-10 space-y-6 z-20 pointer-events-none">
        <div className="flex flex-col group transition-all">
          <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.4em] opacity-80">Alt Profile</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl mono text-emerald-400 font-black tabular-nums transition-all">
              {altitude.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-[14px] text-slate-600 mono font-black">KM</span>
          </div>
        </div>
        <div className="flex flex-col group transition-all">
          <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.4em] opacity-80">Vector Vel</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl mono text-blue-400 font-black tabular-nums transition-all">
              {velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[14px] text-slate-600 mono font-black">KM/H</span>
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 text-right z-20 pointer-events-none">
        <div className="px-6 py-4 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
           <div className="flex items-center justify-end space-x-3 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAscent || isICPSActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
              <span className="text-[12px] text-blue-300 font-black uppercase tracking-[0.2em]">Deployment State</span>
           </div>
           <p className="text-[10px] mono text-slate-400 uppercase leading-tight font-black opacity-90 tracking-tighter">
             {isOrionSeparated ? 'TRANS-LUNAR_FLT' : isCoreSeparated ? 'ICPS_STAGE_ACTIVE' : isBoosterSeparated ? 'CORE_SUSTAINER' : 'ASCENT_MAX_THRUST'}
           </p>
        </div>
      </div>

      <style>{`
        @keyframes rotateVehicle { 
            0% { transform: rotateY(0deg) rotateX(-5deg); } 
            100% { transform: rotateY(360deg) rotateX(-5deg); } 
        }
        @keyframes streak { 
            0% { transform: translateY(-250px); opacity: 0; } 
            20% { opacity: 1; } 
            80% { opacity: 1; } 
            100% { transform: translateY(1200px); opacity: 0; } 
        }
        @keyframes starFlow {
            0% { transform: translateY(0); }
            100% { transform: translateY(100vh); }
        }
        @keyframes deployArray {
            0% { transform: rotateY(var(--angle)) scaleX(0); opacity: 0; }
            100% { transform: rotateY(var(--angle)) scaleX(1); opacity: 1; }
        }
        @keyframes ringExpand {
            0% { transform: scale(0.1); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
        }
        @keyframes mechanicalFlash {
            0% { transform: scaleY(0); opacity: 1; filter: brightness(3); }
            100% { transform: scaleY(2.5); opacity: 0; filter: brightness(1); }
        }
        @keyframes particleOut {
            0% { transform: translate(0, 0) scale(2); opacity: 1; }
            100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
        }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default ArtemisHUD;