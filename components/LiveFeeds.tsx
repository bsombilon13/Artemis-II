
import React, { useState, useRef, useEffect } from 'react';

interface SharedProps {
  videoIds: string[];
  forceSideBySide?: boolean;
}

const getEmbedUrl = (id: string) => {
  const origin = window.location.origin;
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(origin)}`;
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
      console.error("Failed to send command to YouTube player:", e);
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
  size = 'md' 
}) => {
  const isXS = size === 'xs';
  const buttonClass = `bg-black/80 border border-slate-700 hover:border-blue-500 rounded text-slate-300 mono uppercase font-bold transition-all active:scale-95 ${
    isXS ? 'px-1 py-0.5 text-[6px]' : 'px-2 py-1 text-[10px]'
  }`;

  return (
    <div className={`absolute bottom-2 right-2 flex items-center space-x-2 z-30 transition-opacity opacity-0 group-hover:opacity-100 bg-slate-950/80 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800`}>
      {/* Play/Pause */}
      <button onClick={onTogglePlay} className={buttonClass} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      
      {/* Mute/Unmute */}
      <button onClick={onToggleMute} className={buttonClass} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      {/* Volume Slider */}
      <div className="flex items-center space-x-1 px-1 border-l border-slate-800">
        <span className="text-[8px] mono text-slate-500 font-bold">VOL</span>
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    sendCommand(iframeRef.current, isMuted ? 'unMute' : 'mute');
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    sendCommand(iframeRef.current, isPlaying ? 'pauseVideo' : 'playVideo');
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      sendCommand(iframeRef.current, 'unMute');
      setIsMuted(false);
    }
    sendCommand(iframeRef.current, 'setVolume', [newVol]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="aspect-video glass rounded-xl overflow-hidden border border-slate-800 relative group bg-black shadow-2xl">
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold mono text-white border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
        <span>FEED 01: GROUND PRIMARY (SLC-39B)</span>
      </div>
      
      <ControlBar 
        isMuted={isMuted} 
        isPlaying={isPlaying} 
        volume={volume}
        onToggleMute={toggleMute} 
        onTogglePlay={togglePlay} 
        onVolumeChange={handleVolumeChange}
        onToggleFullscreen={toggleFullscreen}
        size="sm"
      />

      <iframe
        ref={iframeRef}
        key={`feed-01-${videoId}`}
        className="w-full h-full border-0 bg-black"
        src={getEmbedUrl(videoId)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  );
};

export const SecondaryFeeds: React.FC<SharedProps> = ({ videoIds, forceSideBySide = false }) => {
  const titles = ['ORION EXTERIOR', 'INTERIM STAGE'];
  const [muteStates, setMuteStates] = useState<boolean[]>([true, true]);
  const [playStates, setPlayStates] = useState<boolean[]>([true, true]);
  const [volumes, setVolumes] = useState<number[]>([50, 50]);
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

  const handleVolumeChange = (idx: number, newVol: number) => {
    const newVolumes = [...volumes];
    newVolumes[idx] = newVol;
    setVolumes(newVolumes);

    if (muteStates[idx] && newVol > 0) {
      sendCommand(iframeRefs[idx].current, 'unMute');
      const newMuteStates = [...muteStates];
      newMuteStates[idx] = false;
      setMuteStates(newMuteStates);
    }
    sendCommand(iframeRefs[idx].current, 'setVolume', [newVol]);
  };

  const toggleFullscreen = (idx: number) => {
    if (!document.fullscreenElement) {
      containerRefs[idx].current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`grid ${forceSideBySide ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
      {videoIds.map((id, idx) => (
        <div 
          key={`feed-wrapper-${idx}`} 
          ref={containerRefs[idx]} 
          className="aspect-video glass rounded-lg overflow-hidden border border-slate-800 relative bg-black group shadow-lg"
        >
           <div className="absolute top-1.5 left-1.5 z-20 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[7px] font-bold mono text-white border border-white/10">
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              <span>F0{idx + 2}: {titles[idx]}</span>
           </div>

           <ControlBar 
              isMuted={muteStates[idx]} 
              isPlaying={playStates[idx]} 
              volume={volumes[idx]}
              onToggleMute={() => toggleMute(idx)} 
              onTogglePlay={() => togglePlay(idx)}
              onVolumeChange={(val) => handleVolumeChange(idx, val)}
              onToggleFullscreen={() => toggleFullscreen(idx)}
              size="xs" 
           />

           <iframe
              ref={iframeRefs[idx]}
              key={`feed-${idx + 1}-${id}`}
              className="w-full h-full border-0 bg-black"
              src={getEmbedUrl(id)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
        </div>
      ))}
    </div>
  );
};
