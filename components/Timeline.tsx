import React, { useRef, useEffect } from 'react';
import { FocusPoint, FocusPointType } from '../types';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  focusPoints: FocusPoint[];
  isPlaying: boolean;
  zoomLevel: number; // New prop for scaling
}

export const Timeline: React.FC<TimelineProps> = ({ currentTime, duration, onSeek, focusPoints, isPlaying, zoomLevel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Convert time to percentage position based on zoom
  const getPosition = (time: number) => (time / duration) * 100;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Calculate percentage based on the SCROLLED width
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percentage * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) { // dragging
      handleTimelineClick(e);
    }
  };

  // Auto-scroll to playhead if it goes out of view
  useEffect(() => {
    if (isPlaying && containerRef.current && zoomLevel > 1) {
       const playheadPos = (currentTime / duration) * containerRef.current.offsetWidth;
       const parent = containerRef.current.parentElement;
       if (parent) {
          const centerOffset = parent.offsetWidth / 2;
          if (playheadPos > centerOffset) {
             parent.scrollLeft = playheadPos - centerOffset;
          }
       }
    }
  }, [currentTime, duration, isPlaying, zoomLevel]);

  return (
    <div className="w-full relative select-none group">
      {/* Time Display Overlay */}
      <div className="flex justify-between text-xs font-mono text-gray-400 mb-2 px-1">
        <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
        <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
      </div>

      {/* Scrollable Container */}
      <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar pb-4 relative">
          <div 
            ref={containerRef}
            className="h-20 bg-gray-900/50 relative rounded-lg cursor-pointer border-y border-gray-800 transition-all duration-300"
            style={{ width: `${zoomLevel * 100}%` }}
            onMouseDown={handleTimelineClick}
            onMouseMove={handleMouseMove}
          >
            {/* Mock Filmstrip Images - Repeated based on zoom */}
            <div className="flex w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-300 overflow-hidden">
              {[...Array(Math.ceil(8 * zoomLevel))].map((_, i) => (
                <img 
                  key={i} 
                  src={`https://picsum.photos/100/60?random=${i}`} 
                  className="h-full object-cover flex-1 pointer-events-none border-r border-gray-800/30" 
                  alt="frame"
                />
              ))}
            </div>

            {/* Focus Points Markers (Dots) */}
            {focusPoints.map((point) => (
              <div
                key={point.id}
                className={`absolute bottom-8 w-3 h-3 rounded-full -translate-x-1/2 shadow-sm z-10 border border-black/20
                  ${point.type === FocusPointType.MANUAL ? 'bg-yellow-400' : 'bg-white'}`}
                style={{ left: `${getPosition(point.timestamp)}%` }}
              >
                 {/* Mini aperture label for manual points when zoomed in */}
                 {zoomLevel > 1.5 && (
                     <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] bg-black/70 px-1 rounded text-white">
                        ƒ{point.aperture}
                     </span>
                 )}
              </div>
            ))}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20 pointer-events-none"
              style={{ left: `${getPosition(currentTime)}%` }}
            >
              <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-white rounded-full shadow-md" />
              <div className="absolute -bottom-1 -left-1.5 w-4 h-4 bg-white rounded-full shadow-md" />
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-yellow-400 h-full opacity-50"></div>
            </div>
          </div>
          
          {/* Zoom Indicator / Ruler (Visual Only) */}
          <div className="h-4 w-full relative mt-1" style={{ width: `${zoomLevel * 100}%` }}>
             <div className="absolute inset-x-0 bottom-0 h-px bg-gray-800" />
             {[...Array(Math.floor(duration))].map((_, i) => (
                 <div 
                    key={i} 
                    className="absolute bottom-0 h-2 w-px bg-gray-600"
                    style={{ left: `${(i / duration) * 100}%` }}
                 />
             ))}
          </div>
      </div>
    </div>
  );
};