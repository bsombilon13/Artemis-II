import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface SharedProps {
  videoIds: string[];
  onPromote?: (idx: number) => void;
}

const getEmbedUrl = (id: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Enhanced params for stability and control
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    rel: '0',
    enablejsapi: '1',
    origin: origin,
    widget_referrer: origin,
    iv_load_policy: '3', // Hide annotations
    modestbranding: '1',
    cc_load_policy: '0',
    controls: '0' // We provide our own HUD
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
};

const sendCommand = (iframe: HTMLIFrameElement | null, func: string, args: any[] = []) => {
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args
      }), '*');
    } catch (e) {
      console.warn("YouTube Command Hub Error:", e);
    }
  }
};

interface ControlProps {
  isMuted: boolean;
  isPlaying: boolean;
  volume: number;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (val: number) => void;
  onToggleFullscreen: () => void;
  onRefresh: () => void;
  onPromote?: () => void;
  size?: 'sm' | 'md' | 'xs';
}

const ControlBar: React.FC<ControlProps> = ({ 
  isMuted, 
  isPlaying, 
  volume, 
  onToggleMute, 
  onTogglePlay, 
  onVolumeChange, 
  onToggleFullscreen,
  onRefresh,
  onPromote,
  size = 'md' 
}) => {
  const isXS = size === 'xs';
  const buttonClass = `bg-black/80 border border-slate-700 hover:border-blue-500 rounded text-slate-300 mono uppercase font-bold transition-all active:scale-95 flex items-center justify-center hover:text-white ${
    isXS ? 'px-1 py-0.5 text-[6px]' : 'px-2 py-1 text-[10px]'
  }`;

  return (
    <div className={`absolute bottom-2 right-2 flex items-center space-x-1.5 z-30 transition-opacity opacity-0 group-hover:opacity-100 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-2xl`}>
      {/* Swap/Promote to Primary */}
      {onPromote && (
        <button onClick={onPromote} className={`${buttonClass} bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/40`} title="Highlight this feed">
           {isXS ? 'PRO' : 'PROMOTE'}
        </button>
      )}

      {/* Manual Refresh Link */}
      <button onClick={onRefresh} className={buttonClass} title="Reset connection">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button onClick={onTogglePlay} className={buttonClass} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? 'PAU' : 'PLY'}
      </button>
      
      {/* Mute/Unmute */}
      <button onClick={onToggleMute} className={buttonClass} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? 'UNM' : 'MUT'}
      </button>

      {/* Volume Slider */}
      {!isXS && (
        <div className="flex items-center space-x-2 px-2 border-l border-slate-800">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={isMuted ? 0 : volume} 
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-12 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            aria-label="Volume"
          />
        </div>
      )}

      {/* Fullscreen */}
      <button 
        onClick={onToggleFullscreen} 
        className={buttonClass} 
        aria-label="Toggle Fullscreen"
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
};

export const PrimaryFeed: React.FC<{ videoId: string }> = ({ videoId }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const embedUrl = useMemo(() => getEmbedUrl(videoId), [videoId, refreshKey]);

  const toggleMute = useCallback(() => {
    sendCommand(iframeRef.current, isMuted ? 'unMute' : 'mute');
    setIsMuted(!isMuted);
  }, [isMuted]);

  const togglePlay = useCallback(() => {
    sendCommand(iframeRef.current, isPlaying ? 'pauseVideo' : 'playVideo');
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      sendCommand(iframeRef.current, 'unMute');
      setIsMuted(false);
    }
    sendCommand(iframeRef.current, 'setVolume', [newVol]);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div ref={containerRef} className="aspect-video glass rounded-xl overflow-hidden border border-slate-800 relative group bg-black shadow-2xl">
      {/* Connectivity Status HUD */}
      <div className="absolute top-3 left-3 z-40 flex flex-col space-y-1">
        <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold mono text-white border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]'}`}></span>
          <span className="tracking-widest">FEED ALPHA: PRIMARY_MISSION_LINK</span>
        </div>
        {!isLoading && (
          <div className="flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded animate-in fade-in duration-500">
            <span className="text-[7px] mono text-blue-400 font-bold uppercase tracking-widest">Signal Stable // {Math.floor(Math.random() * 20 + 40)}ms</span>
          </div>
        )}
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 flex flex-col items-center justify-center space-y-4">
           <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] mono text-blue-400 font-bold animate-pulse uppercase tracking-[0.3em]">Establishing Uplink...</span>
             <span className="text-[8px] mono text-slate-600 uppercase mt-1">Satellite Relay: GS-42</span>
           </div>
        </div>
      )}

      <ControlBar 
        isMuted={isMuted} 
        isPlaying={isPlaying} 
        volume={volume}
        onToggleMute={toggleMute} 
        onTogglePlay={togglePlay} 
        onVolumeChange={handleVolumeChange}
        onToggleFullscreen={toggleFullscreen}
        onRefresh={handleRefresh}
        size="sm"
      />

      <iframe
        ref={iframeRef}
        key={`primary-feed-${videoId}-${refreshKey}`}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full border-0 bg-black transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  );
};

export const SecondaryFeeds: React.FC<SharedProps> = ({ videoIds, onPromote }) => {
  // Reduced titles and states to 2 feeds
  const titles = ['EXTERIOR OPTICS', 'INSTRUMENT STAGE'];
  const [muteStates, setMuteStates] = useState<boolean[]>([true, true]);
  const [playStates, setPlayStates] = useState<boolean[]>([true, true]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([true, true]);
  const [refreshKeys, setRefreshKeys] = useState<number[]>([0, 0]);
  
  const iframeRefs = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)];
  const containerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const toggleMute = (idx: number) => {
    sendCommand(iframeRefs[idx].current, muteStates[idx] ? 'unMute' : 'mute');
    const newMuteStates = [...muteStates];
    newMuteStates[idx] = !muteStates[idx];
    setMuteStates(newMuteStates);
  };

  const togglePlay = (idx: number) => {
    sendCommand(iframeRefs[idx].current, playStates[idx] ? 'pauseVideo' : 'playVideo');
    const newPlayStates = [...playStates];
    newPlayStates[idx] = !playStates[idx];
    setPlayStates(newPlayStates);
  };

  const toggleFullscreen = (idx: number) => {
    if (!document.fullscreenElement) {
      containerRefs[idx].current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleRefresh = (idx: number) => {
    const newLoads = [...loadingStates];
    newLoads[idx] = true;
    setLoadingStates(newLoads);
    
    const newKeys = [...refreshKeys];
    newKeys[idx] += 1;
    setRefreshKeys(newKeys);
  };

  const handleLoad = (idx: number) => {
    const newLoads = [...loadingStates];
    newLoads[idx] = false;
    setLoadingStates(newLoads);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {videoIds.map((id, idx) => (
        <div 
          key={`secondary-feed-${idx}-${id}`} 
          ref={containerRefs[idx]} 
          className="aspect-video glass rounded-xl overflow-hidden border border-slate-800 relative bg-black group shadow-lg ring-1 ring-slate-800/50 hover:ring-blue-500/30 transition-all"
        >
           {/* Feed ID Overlay */}
           <div className="absolute top-1.5 left-1.5 z-20 flex flex-col space-y-1">
             <div className="flex items-center space-x-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[7px] font-bold mono text-slate-300 border border-white/5 group-hover:text-white transition-colors">
                <span className={`w-1 h-1 rounded-full ${loadingStates[idx] ? 'bg-amber-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]'}`}></span>
                <span>FEED {idx + 1}: {titles[idx] || 'AUXILIARY'}</span>
             </div>
           </div>

           {/* Loading Overlay */}
           {loadingStates[idx] && (
             <div className="absolute inset-0 z-30 bg-slate-950/80 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
             </div>
           )}

           <ControlBar 
              isMuted={muteStates[idx]} 
              isPlaying={playStates[idx]} 
              volume={50}
              onToggleMute={() => toggleMute(idx)} 
              onTogglePlay={() => togglePlay(idx)}
              onVolumeChange={() => {}} 
              onToggleFullscreen={() => toggleFullscreen(idx)}
              onRefresh={() => handleRefresh(idx)}
              onPromote={onPromote ? () => onPromote(idx) : undefined}
              size="xs" 
           />

           <iframe
              ref={iframeRefs[idx]}
              key={`iframe-secondary-${idx}-${id}-${refreshKeys[idx]}`}
              onLoad={() => handleLoad(idx)}
              className={`w-full h-full border-0 bg-black transition-opacity duration-700 ${loadingStates[idx] ? 'opacity-0' : 'opacity-100'}`}
              src={getEmbedUrl(id)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
        </div>
      ))}
    </div>
  );
};