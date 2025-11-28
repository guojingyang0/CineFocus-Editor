import React, { useRef, useEffect, useState } from 'react';
import { FocusPoint, FocusPointType } from '../types';

interface VideoOverlayProps {
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  activeFocusPoint: FocusPoint | null;
  onVideoClick: (x: number, y: number) => void;
  currentAperture: number;
}

// List of high-reliability video sources to try in order
const VIDEO_SOURCES = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4"
];

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  currentTime,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  activeFocusPoint,
  onVideoClick,
  currentAperture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Detect seeking behavior to disable smooth transitions for snappy scrubbing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeking = () => setIsSeeking(true);
    const handleSeeked = () => setIsSeeking(false);

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
        video.removeEventListener('seeking', handleSeeking);
        video.removeEventListener('seeked', handleSeeked);
    };
  }, [isLoaded]);

  // Sync currentTime from props to video element (handling Seek)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    const diff = Math.abs(video.currentTime - currentTime);
    
    // Only update video time if the difference is significant to avoid fighting 
    // with the video's own playback loop.
    const threshold = isPlaying ? 0.5 : 0.05;

    if (diff > threshold) {
        video.currentTime = currentTime;
    }
  }, [currentTime, isPlaying, isLoaded]);

  // Sync isPlaying prop with video element
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Only attempt to play/pause if the video is ready enough
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('Playback prevented or interrupted:', e);
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Handle click to set focus
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onVideoClick(x, y);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      if (d && !isNaN(d) && d !== Infinity) {
        onDurationChange(d);
      }
      setIsLoaded(true);
      setHasError(false);
    }
  };

  const handleError = () => {
    console.warn(`Video source ${sourceIdx} (${VIDEO_SOURCES[sourceIdx]}) failed to load.`);
    
    if (sourceIdx < VIDEO_SOURCES.length - 1) {
        console.log(`Attempting fallback source ${sourceIdx + 1}...`);
        // Use a small timeout to prevent rapid-fire loops if network is down
        setTimeout(() => {
            setSourceIdx(prev => prev + 1);
            setIsLoaded(false); 
        }, 100);
    } else {
        // All sources failed
        console.error("All video sources failed to load.");
        setHasError(true);
        setIsLoaded(false);
    }
  };

  // Simulate blur amount based on f-stop
  // Low f-stop (e.g., 2.0) = High Blur. High f-stop (e.g. 16) = Low Blur.
  const blurAmount = Math.max(0, (16 - currentAperture) * 0.8);

  // Cinematic Rack Focus Curve
  // Use transition when playing or idle, but remove it when actively seeking/scrubbing
  const transitionClass = isSeeking 
    ? '' 
    : 'transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]';

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group">
        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 text-white flex-col gap-2">
             <div className="text-red-400 font-bold">无法加载视频</div>
             <p className="text-xs text-gray-400">请检查网络连接或稍后重试</p>
             <button 
                onClick={() => {
                    setHasError(false);
                    setSourceIdx(0); // Retry from start
                    setIsLoaded(false);
                }}
                className="mt-2 px-4 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
             >
                重试
             </button>
          </div>
        )}

        {/* Loading State */}
        {!isLoaded && !hasError && (
           <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        {/* Main Video */}
        <video
            ref={videoRef}
            src={VIDEO_SOURCES[sourceIdx]}
            className="w-full h-full object-cover"
            playsInline
            poster="https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
            muted 
            loop={false}
            onTimeUpdate={() => videoRef.current && onTimeUpdate(videoRef.current.currentTime)}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
            onEnded={onEnded}
            // Add key to force re-render when source changes
            key={sourceIdx} 
        />

        {/* Depth of Field Simulation Layer */}
        {activeFocusPoint && isLoaded && !hasError && (
             <div 
                className={`absolute inset-0 pointer-events-none z-0 ${transitionClass}`}
                style={{
                    backdropFilter: `blur(${blurAmount}px)`,
                    WebkitBackdropFilter: `blur(${blurAmount}px)`,
                    // Radial gradient mask for focus area
                    maskImage: `radial-gradient(circle at ${activeFocusPoint.x}% ${activeFocusPoint.y}%, transparent 15%, black 45%)`,
                    WebkitMaskImage: `radial-gradient(circle at ${activeFocusPoint.x}% ${activeFocusPoint.y}%, transparent 15%, black 45%)`
                }}
             />
        )}

        {/* Interactive Layer */}
        <div 
            className="absolute inset-0 z-10 cursor-crosshair"
            onClick={handleClick}
        >
            {/* Focus Box */}
            {activeFocusPoint && isLoaded && !hasError && (
                <div 
                    className={`absolute border-2 transform -translate-x-1/2 -translate-y-1/2 ${transitionClass}
                    ${activeFocusPoint.type === FocusPointType.MANUAL 
                        ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                        : 'border-white/50 dashed'}
                    `}
                    style={{
                        left: `${activeFocusPoint.x}%`,
                        top: `${activeFocusPoint.y}%`,
                        width: '18%', 
                        height: '12%',
                        borderRadius: '12px'
                    }}
                >
                    {/* Corners */}
                    <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${activeFocusPoint.type === FocusPointType.MANUAL ? 'border-yellow-400' : 'border-white'}`}></div>
                    <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${activeFocusPoint.type === FocusPointType.MANUAL ? 'border-yellow-400' : 'border-white'}`}></div>
                    <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${activeFocusPoint.type === FocusPointType.MANUAL ? 'border-yellow-400' : 'border-white'}`}></div>
                    <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${activeFocusPoint.type === FocusPointType.MANUAL ? 'border-yellow-400' : 'border-white'}`}></div>
                    
                    {/* Label with Aperture Info */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap backdrop-blur-md border border-gray-700 pointer-events-none">
                        {activeFocusPoint.type === FocusPointType.MANUAL ? 'Focus Lock' : activeFocusPoint.label || 'Subject'} 
                        <span className="text-yellow-400 ml-1">ƒ{currentAperture.toFixed(1)}</span>
                    </div>
                </div>
            )}
        </div>
        
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
    </div>
  );
};