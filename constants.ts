import { FocusPoint, FocusPointType, ToolMode } from './types';
import { Video, Music, Sliders, Wand2, Crop } from 'lucide-react';

export const VIDEO_DURATION = 15; // Approximate duration of ForBiggerBlazes.mp4

export const INITIAL_FOCUS_POINTS: FocusPoint[] = [
  {
    id: '1',
    timestamp: 0.5,
    x: 45,
    y: 55,
    type: FocusPointType.SYSTEM,
    aperture: 2.8,
    label: 'Character',
  },
  {
    id: '2',
    timestamp: 4.0,
    x: 20,
    y: 30,
    type: FocusPointType.SYSTEM,
    aperture: 5.6,
    label: 'Background Action',
  },
  {
    id: '3',
    timestamp: 8.0,
    x: 75,
    y: 60,
    type: FocusPointType.SYSTEM,
    aperture: 2.0,
    label: 'Foreground',
  },
  {
    id: '4',
    timestamp: 12.0,
    x: 50,
    y: 50,
    type: FocusPointType.SYSTEM,
    aperture: 4.0,
    label: 'Wide Shot',
  }
];

export const TOOLS = [
  { id: ToolMode.VIDEO, label: '视频', icon: Video },
  { id: ToolMode.AUDIO, label: '混音', icon: Music },
  { id: ToolMode.ADJUST, label: '调整', icon: Sliders },
  { id: ToolMode.FILTER, label: '滤镜', icon: Wand2 },
  { id: ToolMode.CROP, label: '裁剪', icon: Crop },
];