import React, { useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Trash2, ArrowLeftRight, Settings } from 'lucide-react';
import { FocusPoint } from '../types';

interface NLETimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  focusPoints: FocusPoint[];
}

export const NLETimeline: React.FC<NLETimelineProps> = ({
  currentTime,
  duration,
  onSeek,
  isPlaying,
  focusPoints
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Assume timeline view width represents full duration for this demo
    // In a real app, this would account for scroll and zoom
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percentage * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) { // dragging
      handleTimelineClick(e);
    }
  };

  const getPos = (time: number) => (time / duration) * 100;

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] border-t border-gray-400 select-none text-gray-800">
      {/* Toolbar */}
      <div className="h-8 bg-[#e1e1e1] border-b border-gray-300 flex items-center px-2 justify-between">
         <div className="flex gap-1">
            <div className="flex border border-gray-400 bg-white rounded overflow-hidden">
                <button className="px-2 py-0.5 hover:bg-blue-100 border-r border-gray-300"><Plus size={14} /></button>
                <button className="px-2 py-0.5 hover:bg-blue-100"><Trash2 size={14} /></button>
            </div>
            <button className="px-2 py-0.5 border border-gray-400 bg-white rounded hover:bg-blue-100 ml-2">Reset</button>
            <button className="px-2 py-0.5 border border-gray-400 bg-white rounded hover:bg-blue-100 ml-1 rounded-full"><div className="w-2 h-2 bg-gray-500 rounded-full"></div></button>
         </div>
         
         <div className="flex items-center gap-2 text-xs">
            <span>实事播放帧率: 60.00</span>
            <div className="flex items-center bg-white border border-gray-400 px-1 rounded">
                <span>FPS: 30.0</span>
            </div>
         </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex overflow-hidden relative">
          {/* Left Headers */}
          <div className="w-32 bg-[#2d2d2d] flex flex-col text-white text-xs border-r border-black z-20">
              <div className="h-6 bg-[#3d3d3d] border-b border-black px-2 flex items-center justify-between">
                <span>00:00:00:00</span>
                <Trash2 size={10} />
              </div>
              {/* Tracks Headers */}
              <div className="h-16 border-b border-black bg-[#252526] flex items-center px-2 justify-between relative">
                 <span className="font-bold text-gray-400">Video 2</span>
                 <div className="flex gap-0.5">
                    <span className="border border-gray-500 px-1 text-[10px]">L</span>
                    <span className="border border-gray-500 px-1 text-[10px]">E</span>
                 </div>
              </div>
              <div className="h-16 border-b border-black bg-[#2d2d2d] flex items-center px-2 justify-between relative">
                 <span className="font-bold text-gray-200">Video 0</span>
                 <div className="flex gap-0.5">
                    <span className="border border-gray-500 px-1 text-[10px]">L</span>
                    <span className="border border-gray-500 px-1 text-[10px] bg-blue-900">E</span>
                 </div>
              </div>
              <div className="h-16 border-b border-black bg-[#252526] flex items-center px-2 justify-between relative">
                 <span className="font-bold text-gray-400">Audio 1</span>
                 <div className="flex gap-0.5">
                    <span className="border border-gray-500 px-1 text-[10px]">L</span>
                    <span className="border border-gray-500 px-1 text-[10px]">M</span>
                    <span className="border border-gray-500 px-1 text-[10px]">S</span>
                 </div>
              </div>
          </div>

          {/* Right Tracks */}
          <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden" ref={containerRef} onMouseDown={handleTimelineClick} onMouseMove={handleMouseMove}>
             
             {/* Ruler */}
             <div className="h-6 bg-[#2d2d2d] border-b border-black w-full relative">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute bottom-0 h-2 w-px bg-gray-500" style={{ left: `${i * 5}%` }}>
                        <span className="absolute -top-3 -left-4 text-[9px] text-gray-400 font-mono w-8 text-center">
                            00:00:{Math.floor(i * duration / 20).toString().padStart(2, '0')}
                        </span>
                    </div>
                ))}
             </div>

             {/* Track Content: Video 2 (Empty) */}
             <div className="h-16 border-b border-black w-full relative"></div>

             {/* Track Content: Video 0 (Main) */}
             <div className="h-16 border-b border-black w-full relative py-1">
                 <div className="h-full bg-[#3a5f8f] border-2 border-[#4caf50] opacity-90 absolute left-0 w-full rounded-sm overflow-hidden flex items-center px-2">
                    <span className="text-xs text-white truncate drop-shadow-md">
                        aespa - [GISELLE FaceCam] Armageddon KBS Music Bank 240531.mp4
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none"></div>
                 </div>
                 
                 {/* Keyframes Visualization on Clip */}
                 {focusPoints.map(fp => (
                     <div 
                        key={fp.id}
                        className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-black z-10
                            ${fp.type === 'MANUAL' ? 'bg-yellow-400' : 'bg-white'}
                        `}
                        style={{ left: `${getPos(fp.timestamp)}%` }}
                     />
                 ))}
             </div>

             {/* Track Content: Audio 1 */}
             <div className="h-16 border-b border-black w-full relative py-1">
                <div className="h-full bg-[#00838f] absolute left-0 w-full rounded-sm flex items-center px-2 opacity-80">
                     <span className="text-xs text-white truncate drop-shadow-md z-10">
                        Audio Stream 1 (AAC)
                     </span>
                     {/* Fake Waveform */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-30 gap-px">
                        {[...Array(100)].map((_, i) => (
                             <div key={i} className="w-1 bg-black" style={{ height: `${Math.random() * 80 + 20}%`}}></div>
                        ))}
                     </div>
                </div>
             </div>

             {/* Playhead */}
             <div 
                className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none"
                style={{ left: `${getPos(currentTime)}%` }}
             >
                <div className="absolute -top-0 -left-1.5 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"></div>
             </div>
          </div>
      </div>
    </div>
  );
};
