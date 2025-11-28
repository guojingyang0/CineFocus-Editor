export enum FocusPointType {
  SYSTEM = 'SYSTEM',
  MANUAL = 'MANUAL',
}

export interface FocusPoint {
  id: string;
  timestamp: number; // in seconds
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: FocusPointType;
  aperture: number; // f-stop value
  label?: string; // e.g., "Person A"
  isTracking?: boolean; // New: indicates if this point initiates a tracking sequence
}

export enum ToolMode {
  VIDEO = 'video',
  AUDIO = 'audio',
  ADJUST = 'adjust',
  FILTER = 'filter',
  CROP = 'crop',
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}