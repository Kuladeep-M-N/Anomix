import { create } from 'zustand';

export type Platform = 'reddit' | 'twitter' | 'instagram' | 'tiktok';

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

  setPlatform: (platform) => set({ selectedPlatform: platform }),
  setData: (data) => set({ data }),
  addDataPoint: (point) => set((state) => ({ 
    data: [...state.data.slice(-200), point], // Keep last 200 points
    lastUpdate: Date.now() 
  })),
  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),
  addAlert: (alert) => set((state) => ({ 
    alerts: [alert, ...state.alerts].slice(0, 100) // Keep last 100 alerts
  })),
  updateAlertStatus: (id, status) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { ...a, status } : a)
  })),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setZThreshold: (zThreshold) => set({ zThreshold }),
  setAlgorithm: (activeAlgorithm) => set({ activeAlgorithm }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
