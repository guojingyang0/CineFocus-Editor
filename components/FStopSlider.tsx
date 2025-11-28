import React from 'react';

interface FStopSliderProps {
  value: number;
  onChange: (value: number) => void;
  isVisible: boolean;
}

const F_STOPS = [2.0, 2.8, 4.0, 5.6, 8.0, 11, 16];

export const FStopSlider: React.FC<FStopSliderProps> = ({ value, onChange, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-20 right-4 z-20 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-black/60 backdrop-blur-md rounded-full py-4 px-2 border border-gray-700">
        <div className="h-48 w-6 relative flex flex-col items-center justify-between">
          <input
            type="range"
            min="2.0"
            max="16.0"
            step="0.1"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute h-48 -rotate-180 w-full opacity-0 cursor-pointer z-10"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }} 
          />
          
          {/* Visual Track */}
          <div className="absolute top-0 bottom-0 w-1 bg-gray-600 rounded-full overflow-hidden">
             <div 
               className="w-full bg-yellow-400 absolute bottom-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
               style={{ height: `${((16 - value) / (16 - 2)) * 100}%` }}
             />
          </div>

          {/* Ticks */}
          {F_STOPS.map((stop) => (
             <div 
                key={stop}
                className="w-3 h-0.5 bg-gray-400 z-0 pointer-events-none"
                style={{ 
                    position: 'absolute',
                    bottom: `${((16 - stop) / (16 - 2)) * 100}%`
                }}
             />
          ))}
          
          {/* Knob */}
           <div 
            className="absolute w-5 h-5 bg-white rounded-full shadow-lg border-2 border-yellow-500 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ 
                bottom: `calc(${((16 - value) / (16 - 2)) * 100}% - 10px)` 
            }}
           />
        </div>
      </div>
      <div className="mt-2 font-mono text-yellow-400 text-sm font-bold bg-black/50 px-2 py-0.5 rounded">
        ƒ {value.toFixed(1)}
      </div>
    </div>
  );
};