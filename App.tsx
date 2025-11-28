import React, { useState, useMemo } from 'react';
import { Play, Pause, Volume2, MoreHorizontal, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Timeline } from './components/Timeline';
import { VideoOverlay } from './components/VideoOverlay';
import { FStopSlider } from './components/FStopSlider';
import { FocusPoint, FocusPointType, ToolMode } from './types';
import { INITIAL_FOCUS_POINTS, TOOLS, VIDEO_DURATION as FALLBACK_DURATION } from './constants';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DURATION); // Dynamic duration
  const [focusPoints, setFocusPoints] = useState<FocusPoint[]>(INITIAL_FOCUS_POINTS);
  const [activeTool, setActiveTool] = useState<ToolMode>(ToolMode.VIDEO);
  const [showFStop, setShowFStop] = useState(false);
  
  // New States for enhanced requirements
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  // Determine the active focus point
  const currentFocusPoint = useMemo(() => {
    // Find the closest previous point
    const active = [...focusPoints]
      .sort((a, b) => b.timestamp - a.timestamp)
      .find(p => p.timestamp <= currentTime + 0.1); 
    
    // Fallback if before first point
    return active || focusPoints[0] || null;
  }, [currentTime, focusPoints]);

  // Handle Aperture Change (Per Keyframe Logic)
  const handleApertureChange = (newAperture: number) => {
      if (!currentFocusPoint) return;

      // If the current point is very close (e.g. within 0.5s), update it directly
      // Otherwise, create a NEW keyframe with the new aperture
      const isCloseEnough = Math.abs(currentFocusPoint.timestamp - currentTime) < 0.5;

      if (isCloseEnough && currentFocusPoint.type === FocusPointType.MANUAL) {
          setFocusPoints(prev => prev.map(p => 
              p.id === currentFocusPoint.id ? { ...p, aperture: newAperture } : p
          ));
      } else {
          // Create new keyframe inheriting position but new aperture
          const newPoint: FocusPoint = {
              id: Date.now().toString(),
              timestamp: currentTime,
              x: currentFocusPoint.x,
              y: currentFocusPoint.y,
              type: FocusPointType.MANUAL,
              aperture: newAperture,
              label: 'Adjusted Aperture'
          };
          setFocusPoints(prev => [...prev, newPoint].sort((a, b) => a.timestamp - b.timestamp));
      }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    // Note: VideoOverlay will react to currentTime prop change and seek the video element
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
  };

  const handleVideoClick = (x: number, y: number) => {
    // Logic: If user taps, create a Manual Point that overrides system logic
    const newPoint: FocusPoint = {
      id: Date.now().toString(),
      timestamp: currentTime,
      x,
      y,
      type: FocusPointType.MANUAL,
      // Inherit aperture from previous point to prevent jarring jumps, or default to 2.8
      aperture: currentFocusPoint ? currentFocusPoint.aperture : 2.8,
      label: 'Manual Focus'
    };
    
    // Remove any existing manual points within a tiny threshold to avoid stacking
    const cleanPoints = focusPoints.filter(p => Math.abs(p.timestamp - currentTime) > 0.1);
    
    setFocusPoints([...cleanPoints, newPoint].sort((a, b) => a.timestamp - b.timestamp));
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const clearManualPoints = () => {
      // "One-click clear" requirement
      if(window.confirm("Remove all manual focus adjustments?")) {
          setFocusPoints(prev => prev.filter(p => p.type !== FocusPointType.MANUAL));
      }
  };

  const handleExport = () => {
      setIsExporting(true);
      setIsPlaying(false);
      // Simulate rendering time
      setTimeout(() => {
          setIsExporting(false);
          alert("Video exported to gallery with depth information!");
      }, 2500);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black text-white overflow-hidden relative border-x border-gray-900 shadow-2xl font-sans">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-4 py-4 pt-8 bg-gradient-to-b from-black/90 to-transparent">
        <button className="px-4 py-1 text-gray-300 text-sm font-medium hover:text-white transition-colors">
          取消
        </button>
        
        <div className="flex gap-6 items-center">
            <button 
                onClick={() => setShowFStop(!showFStop)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${showFStop ? 'text-yellow-400 bg-white/10 ring-1 ring-yellow-400/50' : 'text-gray-300'}`}
                title="Depth of Field"
            >
                <div className="font-serif italic font-bold text-xl">ƒ</div>
            </button>
            <button className="text-gray-300 hover:text-white">
                <Volume2 size={20} />
            </button>
            <button className="text-gray-300 hover:text-white">
                <MoreHorizontal size={20} />
            </button>
        </div>

        <button 
            onClick={handleExport}
            className="px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-95 transition-transform flex items-center gap-1"
        >
          {isExporting ? <Loader2 size={12} className="animate-spin" /> : '完成'}
        </button>
      </div>

      {/* Cinematic Badge */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-yellow-500/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-widest border border-yellow-300/50">
             电影效果
          </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 mt-0 mb-0 overflow-hidden mx-0 group">
        <VideoOverlay 
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onEnded={() => setIsPlaying(false)}
          activeFocusPoint={currentFocusPoint}
          onVideoClick={handleVideoClick}
          currentAperture={currentFocusPoint?.aperture || 2.8}
        />

        {/* Floating Controls Overlay (F-Stop) */}
        <FStopSlider 
            value={currentFocusPoint?.aperture || 2.8} 
            isVisible={showFStop}
            onChange={handleApertureChange}
        />

        {/* Center Play Button */}
        {!isPlaying && !isExporting && (
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
                <div 
                    className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md pointer-events-auto cursor-pointer hover:bg-black/60 transition-all border border-white/10 shadow-2xl" 
                    onClick={togglePlayback}
                >
                    <Play className="fill-white ml-1 text-white" size={32} />
                </div>
            </div>
        )}

        {/* Exporting Overlay */}
        {isExporting && (
            <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-yellow-400 mb-4" size={48} />
                <div className="text-yellow-400 font-medium tracking-wide">渲染景深中...</div>
                <div className="text-gray-500 text-xs mt-2">正在导出为标准视频</div>
            </div>
        )}
      </div>

      {/* Bottom Interface */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/95 border-t border-gray-800 pb-6 pt-2 backdrop-blur-xl">
        
        {/* Playback Controls Row */}
        <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-3">
                 <button onClick={togglePlayback} className="p-1 hover:text-yellow-400 transition-colors">
                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                 </button>
                 
                 {/* Zoom Controls */}
                 <div className="flex items-center bg-gray-800 rounded-lg p-0.5 ml-2">
                    <button 
                        onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <span className="text-[10px] text-gray-500 w-8 text-center font-mono">
                        {zoomLevel}x
                    </span>
                    <button 
                        onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))}
                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400"
                    >
                        <ZoomIn size={14} />
                    </button>
                 </div>
            </div>
            
            {/* Clear Focus Points Button */}
            {focusPoints.some(p => p.type === FocusPointType.MANUAL) && (
                <button 
                    onClick={clearManualPoints}
                    className="text-[10px] text-red-400 border border-red-900/50 bg-red-900/10 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-red-900/30 transition-colors"
                >
                    重置焦点
                </button>
            )}
        </div>

        {/* Timeline Component */}
        <div className="px-0 mb-4">
            <Timeline 
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                focusPoints={focusPoints}
                isPlaying={isPlaying}
                zoomLevel={zoomLevel}
            />
        </div>

        {/* Bottom Tab Bar */}
        <div className="flex justify-between items-center px-6 pt-2">
            {TOOLS.map((tool) => (
                <button 
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex flex-col items-center gap-1.5 transition-all group ${activeTool === tool.id ? 'text-yellow-400' : 'text-gray-500'}`}
                >
                    <div className={`p-1.5 rounded-full transition-transform group-active:scale-90 ${activeTool === tool.id ? 'bg-yellow-400/10' : ''}`}>
                        <tool.icon size={22} strokeWidth={activeTool === tool.id ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">{tool.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default App;