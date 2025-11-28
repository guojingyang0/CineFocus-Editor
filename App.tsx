import React, { useState, useMemo } from 'react';
import { Play, Pause, Volume2, MoreHorizontal, ZoomIn, ZoomOut, Loader2, Monitor, Smartphone, FolderOpen, Image as ImageIcon, Music, Type, Box, Diamond } from 'lucide-react';
import { Timeline } from './components/Timeline';
import { VideoOverlay } from './components/VideoOverlay';
import { FStopSlider } from './components/FStopSlider';
import { NLEInspector } from './components/NLEInspector';
import { NLETimeline } from './components/NLETimeline';
import { FocusPoint, FocusPointType, ToolMode, UIMode } from './types';
import { INITIAL_FOCUS_POINTS, TOOLS, VIDEO_DURATION as FALLBACK_DURATION } from './constants';

const App: React.FC = () => {
  const [uiMode, setUiMode] = useState<UIMode>(UIMode.MOBILE);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DURATION);
  const [focusPoints, setFocusPoints] = useState<FocusPoint[]>(INITIAL_FOCUS_POINTS);
  const [activeTool, setActiveTool] = useState<ToolMode>(ToolMode.VIDEO);
  const [showFStop, setShowFStop] = useState(false);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  // -- Logic for Focus Point Interpolation/Selection --
  
  const currentFocusPoint = useMemo(() => {
    // For NLE mode, we might want interpolation, but for now let's stick to the closest previous point
    const active = [...focusPoints]
      .sort((a, b) => b.timestamp - a.timestamp)
      .find(p => p.timestamp <= currentTime + 0.1); 
    
    return active || focusPoints[0] || {
        id: 'default',
        timestamp: 0,
        x: 50,
        y: 50,
        type: FocusPointType.SYSTEM,
        aperture: 2.8,
        label: 'Default'
    };
  }, [currentTime, focusPoints]);

  const hasKeyframeNow = useMemo(() => {
      // Check if there is an explicit keyframe roughly at current time
      return focusPoints.some(p => Math.abs(p.timestamp - currentTime) < 0.1);
  }, [currentTime, focusPoints]);

  // -- Handlers --

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Unified Handler for creating/updating keyframes
  const upsertKeyframe = (updates: Partial<FocusPoint>) => {
    const isCloseEnough = Math.abs(currentFocusPoint.timestamp - currentTime) < 0.2;

    if (isCloseEnough && currentFocusPoint.type === FocusPointType.MANUAL) {
        // Update existing nearby manual keyframe
        setFocusPoints(prev => prev.map(p => 
            p.id === currentFocusPoint.id ? { ...p, ...updates } : p
        ));
    } else {
        // Create new keyframe
        const newPoint: FocusPoint = {
            id: Date.now().toString(),
            timestamp: currentTime,
            x: currentFocusPoint.x,
            y: currentFocusPoint.y,
            aperture: currentFocusPoint.aperture,
            label: 'Keyframe',
            ...updates,
            type: FocusPointType.MANUAL // Enforce manual for user edits
        };
        setFocusPoints(prev => [...prev, newPoint].sort((a, b) => a.timestamp - b.timestamp));
    }
  };

  const handleVideoClick = (x: number, y: number) => {
    // If in NLE mode, pausing might be better to adjust precisely
    // if (uiMode === UIMode.NLE) setIsPlaying(false);
    
    // Create manual point
    const newPoint: FocusPoint = {
      id: Date.now().toString(),
      timestamp: currentTime,
      x,
      y,
      type: FocusPointType.MANUAL,
      aperture: currentFocusPoint.aperture,
      label: 'Manual Focus'
    };
    
    // Clean nearby points to avoid stacking
    const cleanPoints = focusPoints.filter(p => Math.abs(p.timestamp - currentTime) > 0.1);
    setFocusPoints([...cleanPoints, newPoint].sort((a, b) => a.timestamp - b.timestamp));
  };

  const handleNLEParamChange = (param: 'x' | 'y' | 'aperture', value: number) => {
      upsertKeyframe({ [param]: value });
  };

  const handleAddKeyframe = () => {
      upsertKeyframe({}); // Just create a keyframe with current values
  };

  const handleExport = () => {
      setIsExporting(true);
      setIsPlaying(false);
      setTimeout(() => {
          setIsExporting(false);
          alert("Video exported!");
      }, 2500);
  };

  // --- Render Mobile Layout ---
  const renderMobile = () => (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black text-white overflow-hidden relative border-x border-gray-900 shadow-2xl font-sans">
      {/* ... (Existing Header) ... */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-4 py-4 pt-8 bg-gradient-to-b from-black/90 to-transparent">
        <button className="px-4 py-1 text-gray-300 text-sm font-medium hover:text-white transition-colors">Cancel</button>
        <div className="flex gap-6 items-center">
             <button onClick={() => setUiMode(UIMode.NLE)} title="Switch to NLE Mode" className="text-yellow-400 hover:text-white"><Monitor size={20} /></button>
            <button 
                onClick={() => setShowFStop(!showFStop)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${showFStop ? 'text-yellow-400 bg-white/10 ring-1 ring-yellow-400/50' : 'text-gray-300'}`}
            >
                <div className="font-serif italic font-bold text-xl">ƒ</div>
            </button>
        </div>
        <button onClick={handleExport} className="px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-95 transition-transform flex items-center gap-1">
          {isExporting ? <Loader2 size={12} className="animate-spin" /> : 'Done'}
        </button>
      </div>

      {/* Cinematic Badge */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-yellow-500/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-widest border border-yellow-300/50">
             Cinematic Mode
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

        <FStopSlider 
            value={currentFocusPoint?.aperture || 2.8} 
            isVisible={showFStop}
            onChange={(val) => upsertKeyframe({ aperture: val })}
        />

        {!isPlaying && !isExporting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md pointer-events-auto cursor-pointer hover:bg-black/60 transition-all border border-white/10 shadow-2xl" onClick={togglePlayback}>
                    <Play className="fill-white ml-1 text-white" size={32} />
                </div>
            </div>
        )}
      </div>

      {/* Bottom Interface */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/95 border-t border-gray-800 pb-6 pt-2 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-3">
                 <button onClick={togglePlayback} className="p-1 hover:text-yellow-400 transition-colors">
                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                 </button>
                 <div className="flex items-center bg-gray-800 rounded-lg p-0.5 ml-2">
                    <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))} className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><ZoomOut size={14} /></button>
                    <span className="text-[10px] text-gray-500 w-8 text-center font-mono">{zoomLevel}x</span>
                    <button onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))} className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><ZoomIn size={14} /></button>
                 </div>
            </div>
        </div>
        <div className="px-0 mb-4">
            <Timeline currentTime={currentTime} duration={duration} onSeek={handleSeek} focusPoints={focusPoints} isPlaying={isPlaying} zoomLevel={zoomLevel} />
        </div>
        <div className="flex justify-between items-center px-6 pt-2">
            {TOOLS.map((tool) => (
                <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTool === tool.id ? 'text-yellow-400' : 'text-gray-500'}`}>
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

  // --- Render NLE Layout ---
  const renderNLE = () => (
    <div className="flex flex-col h-screen w-full bg-[#f0f0f0] text-gray-800 overflow-hidden font-sans">
        {/* Top Menubar */}
        <div className="h-8 bg-white border-b border-gray-300 flex items-center px-2 text-xs select-none">
            <div className="flex gap-4 mr-8">
                <span className="font-bold">File</span>
                <span>Advanced</span>
                <span>Streaming</span>
                <span>Log</span>
                <span>Edit</span>
                <span>Record</span>
                <span>UI Mode</span>
                <span>Tools</span>
            </div>
            <div className="flex-1"></div>
            <button onClick={() => setUiMode(UIMode.MOBILE)} className="flex items-center gap-1 text-blue-600 hover:underline">
                <Smartphone size={14} /> Switch to Mobile
            </button>
        </div>

        {/* Toolbar */}
        <div className="h-10 bg-[#fbfbfb] border-b border-gray-300 flex items-center px-2 gap-1 overflow-x-auto">
            {['Info', 'Media', 'Text', 'Trans', 'FX', 'Sticker', 'Split', 'Canvas'].map(label => (
                <button key={label} className="px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 text-xs text-gray-700 whitespace-nowrap">
                    {label}
                </button>
            ))}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
                <label className="flex items-center gap-1"><input type="checkbox" /> Adaptive</label>
                <label className="flex items-center gap-1"><input type="checkbox" /> FullSpeed</label>
                <label className="flex items-center gap-1"><input type="checkbox" /> Loop</label>
            </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left: Tree View (Mock) */}
            <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
                <div className="h-6 bg-[#e1e1e1] border-b border-gray-300 px-2 flex items-center text-xs font-bold text-gray-700">Timeline Tree</div>
                <div className="flex-1 overflow-y-auto p-1 text-xs font-mono">
                    <div className="pl-0 cursor-pointer hover:bg-blue-100 flex items-center gap-1"><FolderOpen size={12} /> Timeline</div>
                    <div className="pl-4 cursor-pointer hover:bg-blue-100 flex items-center gap-1"><ImageIcon size={12} /> Video Track 0</div>
                    <div className="pl-8 text-blue-600 bg-blue-50 cursor-pointer flex items-center gap-1"><Diamond size={10} /> Clip 0</div>
                    <div className="pl-4 cursor-pointer hover:bg-blue-100 flex items-center gap-1"><Music size={12} /> Audio Track 1</div>
                    <div className="pl-4 cursor-pointer hover:bg-blue-100 flex items-center gap-1"><Box size={12} /> Video Track 2</div>
                </div>
                {/* Effect Stack (Mock) */}
                <div className="h-1/3 border-t border-gray-300 flex flex-col">
                    <div className="flex items-center gap-2 p-1 border-b border-gray-200 bg-gray-50">
                        <input type="checkbox" checked readOnly />
                        <span className="text-xs">crop-pan-zoom</span>
                    </div>
                    <div className="flex items-center gap-2 p-1 border-b border-gray-200 bg-gray-50">
                        <input type="checkbox" checked readOnly />
                        <span className="text-xs">transform</span>
                    </div>
                    <div className="flex items-center gap-2 p-1 border-b border-gray-200 bg-blue-100">
                        <input type="checkbox" checked readOnly />
                        <span className="text-xs font-bold text-blue-800">Cinematic Focus</span>
                    </div>
                </div>
            </div>

            {/* Middle: Inspector */}
            <div className="w-80 bg-[#f0f0f0] border-r border-gray-300 flex flex-col">
                <NLEInspector 
                    focusX={currentFocusPoint.x}
                    focusY={currentFocusPoint.y}
                    aperture={currentFocusPoint.aperture}
                    onParamChange={handleNLEParamChange}
                    onAddKeyframe={handleAddKeyframe}
                    hasKeyframeNow={hasKeyframeNow}
                />
            </div>

            {/* Right: Player */}
            <div className="flex-1 bg-[#2d2d2d] flex flex-col p-2">
                <div className="text-xs text-gray-400 mb-1">Visual Toolbox</div>
                <div className="flex-1 bg-black relative border border-gray-600 shadow-inner overflow-hidden">
                     {/* Reuse Video Overlay, but constrain it */}
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
                </div>
                {/* Player Controls */}
                <div className="h-10 bg-[#e1e1e1] border border-gray-400 mt-2 flex items-center px-2 gap-2 rounded-sm">
                    <button onClick={togglePlayback} className="hover:text-blue-600">
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <div className="w-px h-4 bg-gray-400 mx-1"></div>
                    <span className="text-xs font-mono">
                        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}:{(currentTime % 1 * 30).toFixed(0).padStart(2, '0')}
                    </span>
                    <input 
                        type="range" 
                        min={0} max={duration} step={0.01} 
                        value={currentTime} 
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-gray-400 accent-blue-600" 
                    />
                </div>
            </div>
        </div>

        {/* Bottom: Timeline */}
        <div className="h-64 border-t border-gray-400 flex flex-col">
             <NLETimeline 
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                isPlaying={isPlaying}
                focusPoints={focusPoints}
             />
        </div>
    </div>
  );

  return uiMode === UIMode.MOBILE ? renderMobile() : renderNLE();
};

export default App;