import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Platform, DataPoint, Alert } from '../store/useStore';
import { getSimulationForPlatform } from '../utils/platformSimulators';
import { normalizeData } from '../utils/dataNormalizer';
import { detectEnsemble, detectZScore, detectIQR, detectMovingAverage, detectLSTM } from '../utils/anomalyDetection';

export function useLiveData(refreshInterval = 3000) {
  const { 
    selectedPlatform, 
    data, 
    addDataPoint, 
    addAlert, 
    isLiveMode, 
    activeAlgorithm,
    zThreshold 
  } = useStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performDetection = useCallback((allData: DataPoint[], newPoint: DataPoint) => {
    let result;
    
    switch (activeAlgorithm) {
      case 'Z-Score': result = detectZScore(allData, newPoint, zThreshold); break;
      case 'IQR': result = detectIQR(allData, newPoint); break;
      case 'Moving Average': result = detectMovingAverage(allData, newPoint); break;
      case 'LSTM-NN': result = detectLSTM(allData, newPoint); break;
      default: result = detectEnsemble(allData, newPoint); break;
    }

    if (result.isAnomaly) {
      newPoint.isAnomaly = true;
      newPoint.anomalyDetails = {
        confidence: result.confidence,
        severity: result.severity,
        algorithm: result.algorithm,
        reasoning: result.reasoning
      };

      // Also create an alert
      const alert: Alert = {
        id: `alert-${Date.now()}`,
        timestamp: Date.now(),
        platform: selectedPlatform,
        topic: newPoint.topic,
        severity: result.severity === 'CRITICAL' ? 'CRITICAL' : result.severity === 'HIGH' ? 'CRITICAL' : 'WARNING',
        message: result.reasoning,
        confidence: result.confidence,
        status: 'NEW',
        metadata: {
          value: newPoint.engagement,
          threshold: zThreshold,
          algorithm: result.algorithm
        }
      };
      addAlert(alert);
    }

    return newPoint;
  }, [activeAlgorithm, zThreshold, selectedPlatform, addAlert]);

  const updateData = useCallback(async () => {
    if (!isLiveMode) return;

    try {
      if (selectedPlatform === 'reddit') return; // Dashboard handles reddit bulk data
      
      const rawData = getSimulationForPlatform(selectedPlatform);

      const normalizedPoint = normalizeData(
        selectedPlatform,
        rawData.topic,
        rawData.engagement,
        rawData.metrics
      );

      const processedPoint = performDetection(data, normalizedPoint);
      addDataPoint(processedPoint);
    } catch (error) {
      console.error('Data update failed:', error);
    }
  }, [selectedPlatform, data, addDataPoint, isLiveMode, performDetection]);

  useEffect(() => {
    if (isLiveMode) {
      timerRef.current = setInterval(updateData, refreshInterval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveMode, updateData, refreshInterval]);

  // Initial data seed if empty
  useEffect(() => {
    if (data.length === 0) {
      const seedPoints = Array.from({ length: 40 }).map((_, i) => {
        const sim = getSimulationForPlatform(selectedPlatform);
        return normalizeData(selectedPlatform, sim.topic, sim.engagement, sim.metrics);
      });
      seedPoints.forEach(p => addDataPoint(p));
    }
  }, []);
}
