
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
  const isOrbit = elapsedSeconds >= 486 && elapsedSeconds < 786780;
  const isReturn = elapsedSeconds >= 786780 && elapsedSeconds < 787560;
  const isLanded = elapsedSeconds >= 787560;

  const isSupersonic = velocity > 1234 && isAscent;
  const isMaxQ = elapsedSeconds >= 60 && elapsedSeconds <= 80;
  
  const isBoosterSeparated = elapsedSeconds >= 128;
  const isBoosterSepFlash = elapsedSeconds >= 128 && elapsedSeconds < 131;
  
  const isLASJettisoned = elapsedSeconds >= 198;
  const isCoreSeparated = elapsedSeconds >= 498;
  const isCoreSepFlash = elapsedSeconds >= 498 && elapsedSeconds < 501.5;
  
  const isICPSActive = elapsedSeconds >= 498 && elapsedSeconds < 12255;
  const isOrionSeparated = elapsedSeconds >= 12255;
  const isOrionSepFlash = elapsedSeconds >= 12255 && elapsedSeconds < 12258;

  const isSolarArrayDeployed = elapsedSeconds >= 13455;

  // Dynamic Pitch (Gravity Turn)
  const pitchAngle = useMemo(() => {
    if (elapsedSeconds < 10) return 0;
    if (elapsedSeconds < 486) {
      return Math.min(80, ((elapsedSeconds - 10) / 476) * 80);
    }
    if (isReturn) return 160; 
    return 85; 
  }, [elapsedSeconds, isReturn]);

  // Telemetry-driven Environment
  const atmosphereOpacity = Math.max(0, 1 - altitude / 120);
  const spaceOpacity = Math.min(1, altitude / 100);
  const speedFactor = Math.min(1, velocity / 28000);
  
  // Re-entry or high-speed ascent atmospheric compression
  const plasmaIntensity = Math.max(0, (speedFactor * 1.5) * atmosphereOpacity * (altitude > 20 ? 1 : 0)) + (isReturn ? 0.8 : 0);

  // ENHANCED: Multi-frequency Camera Shake
  const shakeIntensity = useMemo(() => {
    let intensity = 0;
    if (isAscent) {
      // Base vibration (high frequency)
      intensity = Math.sin(elapsedSeconds * 65) * 1.2;
      // Secondary rumble (low frequency)
      intensity += Math.sin(elapsedSeconds * 12) * 0.8;
      
      // Multipliers based on aerodynamic stress
      if (isMaxQ) intensity *= 4.5;
      if (isSupersonic) intensity *= 2.2;
      
      // Decay slightly as altitude increases and air thins
      intensity *= (1 - (altitude / 100) * 0.4);
    } else if (isICPSActive && speedFactor > 0.4) {
      intensity = Math.sin(elapsedSeconds * 30) * 0.6;
    } else if (isReturn) {
      // Violent re-entry buffeting
      intensity = Math.sin(elapsedSeconds * 80) * 6.0;
      intensity += Math.sin(elapsedSeconds * 15) * 2.5;
    }
    
    // Impact events
    if (isBoosterSepFlash || isCoreSepFlash || isOrionSepFlash) {
      intensity += Math.sin(elapsedSeconds * 150) * 12;
    }
    
    return intensity;
  }, [elapsedSeconds, isAscent, isMaxQ, isSupersonic, altitude, isICPSActive, speedFactor, isReturn, isBoosterSepFlash, isCoreSepFlash, isOrionSepFlash]);

  const thrustParticles = useMemo(() => {
    if (!isAscent && !isICPSActive) return [];
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      left: 15 + (i * 9) % 70,
      delay: (i * 0.04) % 1.2,
      duration: 0.2 + (i * 0.03) % 0.6,
      scale: 0.2 + (i % 5) * 0.5,
      opacity: 0.3 + (i % 3) * 0.4
    }));
  }, [isAscent, isICPSActive]);

  return (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-700 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[400px]'}`}>
      
      {/* SVG Filters for Atmospheric Distortion */}
      <svg className="absolute w-0 h-0 overflow-hidden">
        <defs>
          <filter id="heatHaze">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" seed={Math.floor(elapsedSeconds % 100)}>
              <animate attributeName="baseFrequency" dur="10s" values="0.01 0.05;0.01 0.1;0.01 0.05" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale={isMaxQ || isReturn ? "20" : "5"} />
          </filter>
        </defs>
      </svg>

      {/* HUD State Indicator */}
      <div className="absolute top-4 right-4 z-40 flex flex-col items-end space-y-1">
        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all duration-500 ${
          isAscent ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
          isOrbit ? 'bg-blue-500/20 border-blue-500 text-blue-400' :
          isReturn ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-500'
        }`}>
          {isAscent ? 'Propulsion Nominal' : isOrbit ? 'Orbital Operations' : isReturn ? 'Thermal Interface' : 'Stationary'}
        </div>
        <div className="text-[7px] text-slate-500 mono font-bold tracking-tighter uppercase">
          Sys_State: {isLanded ? 'SECURE' : 'ACTIVE'}
        </div>
      </div>

      {/* Atmospheric & Space Effects */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: atmosphereOpacity, background: 'radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.2) 0%, transparent 90%)' }}></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: spaceOpacity }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`star-${i}`} className="absolute bg-white rounded-full" style={{ left: `${(i * 137.45) % 100}%`, top: `${(i * 71.89) % 100}%`, width: `${0.5 + (i % 1)}px`, height: `${0.5 + (i % 1)}px`, opacity: 0.1 + Math.random() * 0.4, animation: `starFlow ${5 + (1 - speedFactor) * 25}s linear infinite`, animationDelay: `-${Math.random() * 20}s` }} />
        ))}
      </div>

      {/* Re-entry / Ascent Glow & ENHANCED Distortion Layer */}
      {(plasmaIntensity > 0.05 || isReturn) && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-700" 
          style={{ 
            opacity: plasmaIntensity, 
            background: isReturn ? 'radial-gradient(ellipse at center, rgba(255, 60, 0, 0.4) 0%, rgba(255, 120, 0, 0.2) 40%, transparent 80%)' : 'radial-gradient(ellipse at center, rgba(255, 120, 50, 0.3) 0%, rgba(255, 30, 0, 0.2) 50%, transparent 95%)',
            filter: 'url(#heatHaze)' 
          }}
        >
           {/* Turbulence shimmer effect */}
           <div className="absolute inset-0 opacity-30 animate-pulse bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] bg-fixed"></div>
        </div>
      )}

      {/* ROCKET VIEWPORT - High frequency translate for shake */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-all duration-[40ms] ease-out scale-[0.45] sm:scale-[0.55] md:scale-[0.6] lg:scale-[0.5] xl:scale-[0.6]" 
        style={{ 
          transform: `translate(${shakeIntensity}px, ${shakeIntensity * 0.8}px)`, 
          perspective: '2000px',
          filter: (isAscent && velocity > 5000) || isReturn ? 'url(#heatHaze)' : 'none'
        }}
      >
        <div className="relative preserve-3d transition-transform duration-[1200ms] ease-out-expo" style={{ transform: `rotateX(${pitchAngle}deg)`, transformStyle: 'preserve-3d' }}>
          
          {/* ORION ASSEMBLY */}
          <div className={`relative preserve-3d transition-all duration-[3500ms] ${isOrionSeparated ? 'translate-z-[300px] translate-y-[-400px] rotate-x-[15deg] scale-[1.1]' : ''}`}>
            
            {/* Launch Abort System */}
            <div className={`absolute bottom-[98%] left-1/2 -translate-x-1/2 preserve-3d transition-all duration-[2800ms] ${isLASJettisoned ? 'translate-y-[-2000px] opacity-0 rotate-x-[180deg] scale-150' : ''}`}>
               <div className="w-3 h-24 bg-gradient-to-r from-slate-400 via-white to-slate-400 border-x border-slate-500/30 mx-auto relative">
                  <div className="w-full h-6 bg-slate-200" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
               </div>
               <div className="relative w-16 h-10 preserve-3d -mt-1">
                  <div className="absolute inset-0 bg-slate-200 border border-slate-400" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
               </div>
            </div>

            {/* Orion Capsule */}
            <div className={`w-16 h-14 bg-slate-50 mx-auto relative z-10 transition-all duration-1000 ${isOrionSepFlash ? 'brightness-200 scale-125 shadow-[0_0_100px_#fff]' : ''} ${isOrbit && !isReturn ? 'shadow-[0_0_40px_rgba(59,130,246,0.4)]' : ''}`} style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
               <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-black/30"></div>
               
               {isOrbit && (
                 <>
                   <div className="absolute inset-0 bg-blue-400/5 animate-pulse"></div>
                   <div className="absolute top-2 left-2 w-1 h-1 bg-green-400 rounded-full animate-blink-fast shadow-[0_0_5px_#4ade80]"></div>
                   <div className="absolute top-2 right-2 w-1 h-1 bg-red-400 rounded-full animate-blink-slow shadow-[0_0_5px_#f87171]"></div>
                 </>
               )}

               {isReturn && (
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/40 to-red-600/60 shadow-[inset_0_-15px_30px_rgba(255,0,0,0.6),0_5px_30px_rgba(255,60,0,0.8)] border-b-2 border-red-500/50"></div>
               )}

               {isPreLaunch && (
                 <div className="absolute -left-2 top-2 w-8 h-4 bg-white/10 blur-md animate-venting rotate-12"></div>
               )}

               <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-2">
                 <div className="w-3 h-2 bg-slate-900/90 rounded-sm"></div>
                 <div className="w-3 h-2 bg-slate-900/90 rounded-sm"></div>
               </div>
            </div>

            {/* Solar Arrays */}
            {isSolarArrayDeployed && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0 h-0 preserve-3d">
                {[0, 90, 180, 270].map((angle) => (
                  <div key={angle} className="absolute top-0 left-0 w-48 h-12 bg-blue-800/90 border border-blue-400/60 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.1)]" style={{ transformOrigin: 'left center', transform: `rotateY(${angle}deg) rotateX(15deg) scaleX(${Math.min(1, (elapsedSeconds - 13455) / 15)})`, clipPath: 'polygon(0% 20%, 98% 0%, 100% 100%, 0% 80%)' }}>
                    <div className="w-full h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_100%] opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ICPS */}
          <div className={`transition-all duration-[4500ms] ease-out-expo ${isOrionSeparated ? 'translate-y-[400px] opacity-10 rotate-x-[-45deg] blur-md' : isCoreSeparated ? 'translate-y-[-60px]' : ''}`}>
             <div className="w-18 h-28 bg-gradient-to-r from-slate-300 via-white to-slate-300 border-x border-slate-400/30 mx-auto relative -mt-1 shadow-xl">
                <div className="absolute bottom-0 w-full h-12 bg-slate-400/50" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}></div>
                {isICPSActive && !isOrionSeparated && (
                   <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-20 h-64">
                      <div className="w-full h-full bg-gradient-to-b from-blue-400/70 via-blue-700/5 to-transparent blur-2xl animate-pulse"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-32 bg-cyan-100 blur-lg opacity-60"></div>
                   </div>
                )}
             </div>
          </div>

          {/* SLS CORE STAGE & SIDE BOOSTERS */}
          <div className={`transition-all duration-[5500ms] ease-out-expo ${isCoreSeparated ? 'translate-y-[1200px] opacity-0 rotate-x-[-90deg]' : ''}`}>
            <div className="relative preserve-3d w-24 h-[420px] bg-[#e67e22] mx-auto -mt-1 shadow-2xl border-x border-[#d35400]/50">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_2px,transparent_2px,transparent_8px)] opacity-30"></div>
              
              {isPreLaunch && (
                <div className="absolute inset-0 bg-white/5 animate-pulse overflow-hidden">
                   <div className="absolute top-1/4 left-0 w-full h-20 bg-white/10 blur-xl animate-venting"></div>
                   <div className="absolute top-2/4 right-0 w-full h-20 bg-white/10 blur-xl animate-venting" style={{ animationDelay: '2s' }}></div>
                </div>
              )}

              {/* SRBs */}
              <div className="absolute inset-0 preserve-3d">
                {[ -1, 1 ].map(side => (
                  <div key={side} className={`absolute top-28 w-14 h-[350px] bg-white transition-all duration-[6000ms] ease-out-expo ${isBoosterSeparated ? `translate-x-[${side * 600}px] translate-y-[1000px] rotate-z-[${side * 150}deg] opacity-0` : ''}`} style={{ [side === -1 ? 'right' : 'left']: '105%', marginRight: side === -1 ? '-4px' : '0', marginLeft: side === 1 ? '-4px' : '0', border: '1px solid #ddd', boxShadow: side === -1 ? '-5px 0 15px rgba(0,0,0,0.3)' : '5px 0 15px rgba(0,0,0,0.3)' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
                    <div className="absolute inset-x-0 top-1/4 h-1 bg-black/20 rotate-12"></div>
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-black/20 -rotate-12"></div>
                    <div className="absolute bottom-full left-0 w-full h-14 bg-white" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                       <div className="absolute top-4 left-1/2 -translate-x-1/2 w-5 h-5 bg-black/5 rounded-full"></div>
                    </div>
                    {isBoosterSepFlash && <div className="absolute top-4 left-0 right-0 h-8 bg-orange-500 blur-xl animate-ping opacity-70"></div>}
                    {!isBoosterSeparated && isAscent && (
                      <div className="absolute -bottom-72 left-1/2 -translate-x-1/2 w-24 h-[450px] z-[-1]">
                         <div className="w-full h-full bg-gradient-to-b from-orange-400 via-orange-600/30 to-transparent blur-[40px] animate-pulse"></div>
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-80 bg-white/95 blur-xl shadow-[0_0_60px_#fff]"></div>
                         {/* Mach Shock Diamonds for SRB */}
                         {isSupersonic && (
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-8 opacity-40">
                               <div className="w-10 h-2 bg-white/40 blur-[1px] rounded-full animate-pulse"></div>
                               <div className="w-8 h-2 bg-white/30 blur-[1px] rounded-full animate-pulse"></div>
                            </div>
                         )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CORE STAGE ENGINE GLOW PULSE */}
              {isAscent && !isCoreSeparated && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none z-10">
                   <div className="w-full h-full bg-gradient-to-t from-orange-500/80 via-yellow-400/40 to-transparent blur-2xl rounded-full animate-[enginePulse_0.15s_infinite]"></div>
                   <div className="absolute inset-0 w-full h-full bg-white/20 blur-xl rounded-full animate-[enginePulse_0.08s_infinite] scale-75"></div>
                </div>
              )}

              {/* CORE STAGE RS-25 ENGINES */}
              {isAscent && !isCoreSeparated && (
                <div className="absolute -bottom-96 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* Heat haze distortion effect around engines */}
                  <div className="absolute -top-10 w-48 h-48 bg-blue-500/5 blur-3xl animate-venting scale-150"></div>
                  
                  <div className="w-40 h-[600px] bg-gradient-to-b from-orange-500/50 via-red-900/10 to-transparent blur-[80px]"></div>
                  <div className="absolute top-0 w-20 h-96 bg-gradient-to-b from-cyan-400/80 via-blue-600/20 to-transparent blur-3xl animate-pulse opacity-90"></div>
                  
                  {/* Dense Thrust Particles */}
                  {thrustParticles.map(p => (
                    <div 
                      key={p.id} 
                      className="absolute w-2 h-2 rounded-full blur-[2px]" 
                      style={{ 
                        left: `${p.left}%`, 
                        backgroundColor: p.id % 3 === 0 ? '#60a5fa' : '#fdba74',
                        animation: `thrustParticle ${p.duration}s linear infinite`, 
                        animationDelay: `${p.delay}s`, 
                        transform: `scale(${p.scale})`,
                        opacity: p.opacity
                      }} 
                    />
                  ))}

                  {/* Heat Distortion Overlay */}
                  <div className="absolute top-0 w-32 h-64 bg-white/5 blur-3xl rounded-full scale-150 animate-pulse mix-blend-overlay"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* METRICS HUD */}
      <div className="absolute bottom-6 left-6 space-y-4 z-30 pointer-events-none scale-75 md:scale-90 origin-bottom-left">
        <MetricItem label="Trajectory Pitch" value={pitchAngle} unit="DEG" color="text-white" progress={pitchAngle/90} />
        <MetricItem label="V-Speed" value={velocity} unit="KM/H" color="text-blue-400" progress={velocity/28000} />
        <MetricItem label="Radar Altitude" value={altitude} unit="KM" color="text-emerald-400" progress={altitude/400} />
      </div>

      <style>{`
        @keyframes starFlow { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        @keyframes thrustParticle {
          0% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
          50% { opacity: 0.8; filter: blur(2px); }
          100% { transform: translateY(500px) scale(0.1); opacity: 0; filter: blur(8px); }
        }
        @keyframes venting {
          0%, 100% { opacity: 0.05; transform: translateX(0) translateY(0) scale(1); }
          50% { opacity: 0.2; transform: translateX(-10px) translateY(-5px) scale(1.1); }
        }
        @keyframes blink-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes blink-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes sweep {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes enginePulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-blink-fast { animation: blink-fast 0.8s infinite; }
        .animate-blink-slow { animation: blink-slow 2.5s infinite; }
        .animate-venting { animation: venting 5s ease-in-out infinite; }
        .animate-sweep { animation: sweep 8s linear infinite; }
        .preserve-3d { transform-style: preserve-3d; }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

const MetricItem: React.FC<{ label: string, value: number, unit: string, color: string, progress: number }> = ({ label, value, unit, color, progress }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mb-1">{label}</span>
    <div className="flex items-center space-x-3">
      <div className="flex items-baseline w-36">
        <span className={`text-4xl mono font-black tabular-nums ${color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
          {value.toLocaleString(undefined, { maximumFractionDigits: label.includes('Pitch') ? 1 : 0 })}
        </span>
        <span className="text-[10px] text-slate-600 mono font-black ml-2">{unit}</span>
      </div>
      <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full transition-all duration-700 ease-out ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(100, progress * 100)}%`, boxShadow: '0 0 10px currentColor' }}></div>
      </div>
    </div>
  </div>
);

export default ArtemisHUD;
