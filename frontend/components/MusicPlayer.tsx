'use client';

import { useState, useRef } from 'react';
import { Music, X, ChevronUp, ChevronDown, SkipForward, Volume2 } from 'lucide-react';

const LOFI_STATIONS = [
  {
    name: 'Lofi Hip Hop 📚',
    description: 'beats to study/relax to',
    videoId: 'jfKfPfyJRdk',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Chillhop Radio 🍃',
    description: 'jazzy beats & lofi vibes',
    videoId: '5yx6BWlEVcY',
    color: 'from-green-500 to-teal-500',
  },
  {
    name: 'Dark Academia 🎓',
    description: 'classical study music',
    videoId: 'oTTNMuMFz4A',
    color: 'from-amber-700 to-yellow-600',
  },
  {
    name: 'Synthwave Focus 🌆',
    description: 'retro electronic vibes',
    videoId: '4xDzrJKXOOY',
    color: 'from-blue-500 to-cyan-500',
  },
];

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const station = LOFI_STATIONS[currentStation];

  const nextStation = () => {
    setCurrentStation((prev) => (prev + 1) % LOFI_STATIONS.length);
    setIsPlaying(true);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
        >
          <Music className="w-6 h-6 text-white" />
          <span className="absolute -top-10 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            🎵 Lo-fi Music
          </span>
        </button>
      )}

      {/* Player Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden`}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${station.color} p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-white" />
              <div>
                <div className="font-bold text-white text-sm">{station.name}</div>
                <div className="text-white/70 text-xs">{station.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsPlaying(false); }}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="p-4 space-y-4">
              {/* YouTube Embed */}
              <div className="rounded-xl overflow-hidden bg-black aspect-video">
                <iframe
                  ref={iframeRef}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${station.videoId}?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=1&rel=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  key={`${station.videoId}-${isPlaying}`}
                  className="w-full h-full"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Volume2 className="w-4 h-4" />
                  <span>Live Stream</span>
                </div>
                <button
                  onClick={nextStation}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm text-white"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Station
                </button>
              </div>

              {/* Station Selector */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Stations</p>
                {LOFI_STATIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentStation(idx); setIsPlaying(true); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      currentStation === idx
                        ? 'bg-white/15 border border-white/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${s.color} ${currentStation === idx ? 'animate-pulse' : ''}`} />
                    <div>
                      <div className="text-sm text-white font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.description}</div>
                    </div>
                    {currentStation === idx && isPlaying && (
                      <div className="ml-auto flex gap-0.5">
                        {[1, 2, 3].map(b => (
                          <div key={b} className="w-1 bg-green-400 rounded-full animate-bounce" style={{ height: `${8 + b * 4}px`, animationDelay: `${b * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}