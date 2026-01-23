
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  videoIds: string[];
}

const LiveFeeds: React.FC<Props> = ({ videoIds }) => {
  const titles = [
    'PRIMARY GROUND COMMAND',
    'ORION EXTERIOR CAM',
    'LAUNCH COMPLEX 39B'
  ];

  // State to track individual video statuses
  const [muteStates, setMuteStates] = useState<boolean[]>([true, true, true]);
  const [playStates, setPlayStates] = useState<boolean[]>([true, true, true]);

  // Refs to access the iframes for postMessage
  const iframeRefs = [
    useRef<HTMLIFrameElement>(null),
    useRef<HTMLIFrameElement>(null),
    useRef<HTMLIFrameElement>(null)
  ];

  const getEmbedUrl = (id: string) => {
    // enablejsapi=1 is essential for programmatic control via postMessage.
    // origin=... is critical to prevent Error 153 when enablejsapi is active.
    const origin = window.location.origin;
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(origin)}`;
  };

  const sendCommand = (idx: number, func: string) => {
    const iframe = iframeRefs[idx].current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: []
        }), '*');
      } catch (e) {
        console.error("Failed to send command to YouTube player:", e);
      }
    }
  };

  const toggleMute = (idx: number) => {
    const isCurrentlyMuted = muteStates[idx];
    sendCommand(idx, isCurrentlyMuted ? 'unMute' : 'mute');
    const newMuteStates = [...muteStates];
    newMuteStates[idx] = !isCurrentlyMuted;
    setMuteStates(newMuteStates);
  };

  const togglePlay = (idx: number) => {
    const isCurrentlyPlaying = playStates[idx];
    sendCommand(idx, isCurrentlyPlaying ? 'pauseVideo' : 'playVideo');
    const newPlayStates = [...playStates];
    newPlayStates[idx] = !isCurrentlyPlaying;
    setPlayStates(newPlayStates);
  };

  const ControlBar = ({ idx, size = 'md' }: { idx: number, size?: 'sm' | 'md' }) => (
    <div className={`absolute bottom-2 right-2 flex items-center space-x-2 z-20 transition-opacity opacity-0 group-hover:opacity-100`}>
      <button 
        onClick={() => togglePlay(idx)}
        className={`${size === 'sm' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[10px]'} bg-black/80 border border-slate-700 hover:border-blue-500 rounded text-slate-300 mono uppercase font-bold transition-all active:scale-95`}
      >
        {playStates[idx] ? 'Pause' : 'Play'}
      </button>
      <button 
        onClick={() => toggleMute(idx)}
        className={`${size === 'sm' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[10px]'} bg-black/80 border border-slate-700 hover:border-blue-500 rounded text-slate-300 mono uppercase font-bold transition-all active:scale-95`}
      >
        {muteStates[idx] ? 'Unmute' : 'Mute'}
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Main Feed */}
      <div className="col-span-3 lg:col-span-2">
        <div className="aspect-video glass rounded-xl overflow-hidden border border-slate-800 relative group bg-black shadow-2xl">
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold mono text-white border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>FEED 01: {titles[0]}</span>
          </div>
          
          <ControlBar idx={0} />

          <iframe
            ref={iframeRefs[0]}
            key={`feed-01-${videoIds[0]}`}
            className="w-full h-full border-0 bg-black"
            src={getEmbedUrl(videoIds[0])}
            title={titles[0]}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>

      {/* Side Feeds */}
      <div className="col-span-3 lg:col-span-1 flex flex-col gap-4">
        {videoIds.slice(1, 3).map((id, idx) => (
          <div key={`feed-wrapper-${idx}`} className="flex-1 aspect-video glass rounded-xl overflow-hidden border border-slate-800 relative bg-black group shadow-lg">
             <div className="absolute top-2 left-2 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold mono text-white border border-white/10">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                <span>FEED 0{idx + 2}: {titles[idx + 1]}</span>
             </div>

             <ControlBar idx={idx + 1} size="sm" />

             <iframe
                ref={iframeRefs[idx + 1]}
                key={`feed-${idx + 1}-${id}`}
                className="w-full h-full border-0 bg-black"
                src={getEmbedUrl(id)}
                title={titles[idx + 1]}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeeds;
