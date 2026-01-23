
export enum MissionPhase {
  PRE_LAUNCH = 'PRE_LAUNCH',
  ASCENT = 'ASCENT',
  ORBIT = 'ORBIT',
  LUNAR_FLYBY = 'LUNAR_FLYBY',
  RETURN = 'RETURN',
  SPLASHDOWN = 'SPLASHDOWN'
}

export interface TimelineEvent {
  label: string;
  offsetSeconds: number; // Seconds relative to T-0
  endOffsetSeconds?: number;
  description?: string;
  category?: 'countdown' | 'ascent' | 'transit' | 'lunar' | 'recovery';
}

export interface TelemetryData {
  timestamp: number;
  altitude: number;
  velocity: number;
  fuel: number;
  heartRate: number;
}

export interface MissionUpdate {
  time: string;
  source: string;
  message: string;
  type: 'telemetry' | 'comms' | 'system';
}
