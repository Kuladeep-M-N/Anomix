import { create } from 'zustand';

export type Platform = 'reddit' | 'twitter' | 'instagram' | 'tiktok';
export type ActiveSpace = 'space-01' | 'space-02';

export interface DataPoint {
  timestamp: number;
  platform: Platform;
  topic: string;
  engagement: number;
  raw_metrics: Record<string, any>;
  sentiment: number;
  velocity: number;
  isAnomaly: boolean;
  anomalyDetails?: {
    confidence: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    algorithm: string;
    reasoning: string;
  };
}

export interface Alert {
  id: string;
  timestamp: number;
  platform: Platform;
  topic: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  confidence: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
  metadata: {
    value: number;
    threshold: number;
    algorithm: string;
  };
}

export interface BaselineSignalItem {
  keyword: string;
  volume: number;
  vector: 'up' | 'down' | 'steady';
  summary: string;
  threat_level: 'critical' | 'elevated' | 'emerging';
}

export interface VelocityAnomalyItem {
  keyword: string;
  spike: number;
  source: 'Signal' | 'Noise';
  vector: 'up' | 'down' | 'steady';
  summary: string;
  threat_level: 'critical' | 'elevated' | 'emerging';
}

export interface VelocityData {
  baseline_signal: BaselineSignalItem[];
  velocity_anomalies: VelocityAnomalyItem[];
  generated_at: number;
}

export interface GlobeFocusPoint {
  lat: number;
  lng: number;
  label: string;
}

interface AppState {
  selectedPlatform: Platform;
  data: DataPoint[];
  alerts: Alert[];
  isLiveMode: boolean;
  lastUpdate: number;
  sensitivity: number;
  zThreshold: number;
  activeAlgorithm: string;
  isDarkMode: boolean;

  // Space 02 - Velocity Matrix state
  activeSpace: ActiveSpace;
  selectedCountry: string | null;
  velocityData: VelocityData | null;
  globeFocusPoint: GlobeFocusPoint | null;

  // Actions
  setPlatform: (platform: Platform) => void;
  setData: (data: DataPoint[]) => void;
  addDataPoint: (point: DataPoint) => void;
  toggleLiveMode: () => void;
  addAlert: (alert: Alert) => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  setSensitivity: (val: number) => void;
  setZThreshold: (val: number) => void;
  setAlgorithm: (alg: string) => void;
  toggleDarkMode: () => void;

  // Space 02 actions
  setActiveSpace: (space: ActiveSpace) => void;
  setSelectedCountry: (country: string | null) => void;
  setVelocityData: (data: VelocityData | null) => void;
  setGlobeFocusPoint: (point: GlobeFocusPoint | null) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedPlatform: 'reddit',
  data: [],
  alerts: [],
  isLiveMode: true,
  lastUpdate: Date.now(),
  sensitivity: 3,
  zThreshold: 3,
  activeAlgorithm: 'Ensemble',
  isDarkMode: true,

  // Space 02 defaults
  activeSpace: 'space-01',
  selectedCountry: null,
  velocityData: null,
  globeFocusPoint: null,

  setPlatform: (platform) => set({ selectedPlatform: platform }),
  setData: (data) => set({ data }),
  addDataPoint: (point) => set((state) => ({
    data: [...state.data.slice(-200), point],
    lastUpdate: Date.now()
  })),
  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 100)
  })),
  updateAlertStatus: (id, status) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { ...a, status } : a)
  })),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setZThreshold: (zThreshold) => set({ zThreshold }),
  setAlgorithm: (activeAlgorithm) => set({ activeAlgorithm }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  // Space 02 actions
  setActiveSpace: (activeSpace) => set({ activeSpace }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setVelocityData: (velocityData) => set({ velocityData }),
  setGlobeFocusPoint: (globeFocusPoint) => set({ globeFocusPoint }),
}));
