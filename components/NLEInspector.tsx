import React from 'react';
import { Diamond } from 'lucide-react';

interface NLEInspectorProps {
  focusX: number; // 0-100
  focusY: number; // 0-100
  aperture: number; // f-stop
  onParamChange: (param: 'x' | 'y' | 'aperture', value: number) => void;
  onAddKeyframe: () => void;
  hasKeyframeNow: boolean;
}

export const NLEInspector: React.FC<NLEInspectorProps> = ({
  focusX,
  focusY,
  aperture,
  onParamChange,
  onAddKeyframe,
  hasKeyframeNow
}) => {
  // Helper to render a parameter row matching the screenshot style
  const renderRow = (label: string, value: number, min: number, max: number, onChange: (v: number) => void, isFloat: boolean = true) => {
    return (
      <div className="flex items-center border-b border-gray-700 h-8 text-xs">
        {/* Label Column */}
        <div className="w-1/3 border-r border-gray-700 px-2 flex items-center bg-[#f0f0f0] text-black h-full select-none">
          {label}
        </div>
        
        {/* Value Column */}
        <div className="w-2/3 px-2 flex items-center gap-2 bg-white text-black h-full">
          <input 
            type="number" 
            step={isFloat ? "0.000001" : "0.1"}
            className="w-20 border border-gray-300 px-1 py-0.5 text-right outline-none focus:border-blue-500 font-mono text-[10px]"
            value={value.toFixed(6)}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
          <input 
            type="range" 
            min={min} 
            max={max} 
            step={isFloat ? "0.01" : "0.1"}
            className="flex-1 accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc] border-l border-r border-gray-400 select-none">
      {/* Header */}
      <div className="flex border-b border-gray-400 bg-[#e1e1e1]">
        <div className="w-1/3 px-2 py-1 font-bold text-gray-700 text-sm border-r border-gray-400 text-center">Param</div>
        <div className="w-2/3 px-2 py-1 font-bold text-gray-700 text-sm text-center">Value</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Fake Params for realism based on screenshot */}
        <div className="flex items-center border-b border-gray-700 h-8 text-xs">
          <div className="w-1/3 border-r border-gray-700 px-2 flex items-center bg-[#eef6ff] text-black h-full">SettingsScript</div>
          <div className="w-2/3 px-2 flex items-center justify-end gap-1 bg-white h-full">
              <button className="border border-gray-400 px-2 py-0.5 rounded text-[10px] bg-gray-100">Pop up</button>
              <div className="border border-gray-400 px-1 w-6 text-center text-[10px] bg-white">[]</div>
          </div>
        </div>

        {renderRow("AutoFitMode", 0, 0, 1, () => {}, false)}

        {/* Real Params */}
        <div className="bg-blue-50/50">
            {/* Effect Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-blue-100 border-b border-blue-200 border-t border-gray-300">
                <span className="font-bold text-xs text-blue-900">Cinematic Focus</span>
                <button 
                    onClick={onAddKeyframe}
                    className={`p-1 rounded hover:bg-blue-200 transition-colors ${hasKeyframeNow ? 'text-red-500' : 'text-gray-400'}`}
                    title="Add Keyframe"
                >
                    <Diamond size={14} fill={hasKeyframeNow ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Focus X (Normalized 0-1) */}
            {renderRow(
                "focus_x", 
                focusX / 100, 
                0, 
                1, 
                (v) => onParamChange('x', v * 100)
            )}

            {/* Focus Y (Normalized 0-1) */}
            {renderRow(
                "focus_y", 
                focusY / 100, 
                0, 
                1, 
                (v) => onParamChange('y', v * 100)
            )}

            {/* Aperture (Mapped to Slider 0-1 logic for UI consistency, but displaying f-stop) */}
            {/* Note: In NLEs, sliders usually go left-right. f/16 is left (0), f/2.0 is right (1) or vice versa. 
                Here we just map raw values for simplicity */}
            <div className="flex items-center border-b border-gray-700 h-8 text-xs">
                <div className="w-1/3 border-r border-gray-700 px-2 flex items-center bg-[#f0f0f0] text-black h-full">
                aperture (f/)
                </div>
                <div className="w-2/3 px-2 flex items-center gap-2 bg-white text-black h-full">
                <input 
                    type="number" 
                    step="0.1"
                    className="w-20 border border-gray-300 px-1 py-0.5 text-right outline-none focus:border-blue-500 font-mono text-[10px]"
                    value={aperture.toFixed(1)}
                    onChange={(e) => onParamChange('aperture', parseFloat(e.target.value))}
                />
                <input 
                    type="range" 
                    min={2.0} 
                    max={16.0} 
                    step={0.1}
                    className="flex-1 accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ direction: 'rtl' }} // f/2.0 on right, f/16 on left typically implies 'more bokeh' to right
                    value={aperture}
                    onChange={(e) => onParamChange('aperture', parseFloat(e.target.value))}
                />
                </div>
            </div>
        </div>

        {/* More Fake Params */}
        {renderRow("crop_width", 1.0, 0, 2, () => {})}
        {renderRow("horizontal_flip", 0, 0, 1, () => {}, false)}
        {renderRow("vertical_flip", 0, 0, 1, () => {}, false)}
      </div>
    </div>
  );
};
