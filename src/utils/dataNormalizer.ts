import type { Platform, DataPoint } from '../store/useStore';

export const normalizeData = (
  platform: Platform,
  topic: string,
  engagementRaw: number,
  metrics: Record<string, any>,
  sentimentRaw = Math.random() * 2 - 1 // Default random sentiment between -1 and 1
): DataPoint => {
  // Normalize engagement to 0-100 scale
  // Assuming raw engagement can be high for some platforms, we clamp/scale it
  const engagement = Math.min(100, Math.max(0, engagementRaw / 10)); 

  return {
    timestamp: Date.now(),
    platform,
    topic,
    engagement,
    raw_metrics: metrics,
    sentiment: parseFloat(sentimentRaw.toFixed(2)),
    velocity: Math.random() * 10, // Simulated velocity
    isAnomaly: false // Will be set by detection logic
  };
};
