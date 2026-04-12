import type { DataPoint } from '../store/useStore';

export interface AnomalyResult {
  isAnomaly: boolean;
  confidence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  algorithm: string;
  reasoning: string;
}

// Z-Score Detection
export function detectZScore(data: DataPoint[], currentPoint: DataPoint, threshold = 3): AnomalyResult {
  const values = data.map(d => d.engagement);
  if (values.length < 5) return { isAnomaly: false, confidence: 0, severity: 'LOW', algorithm: 'Z-Score', reasoning: 'Insufficient data' };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
  const zScore = Math.abs(currentPoint.engagement - mean) / (stdDev || 1);

  const isAnomaly = zScore > threshold;
  const confidence = Math.min(100, (zScore / threshold) * 80);
  
  let severity: AnomalyResult['severity'] = 'LOW';
  if (zScore > threshold * 2) severity = 'CRITICAL';
  else if (zScore > threshold * 1.5) severity = 'HIGH';
  else if (zScore > threshold) severity = 'MEDIUM';

  return {
    isAnomaly,
    confidence,
    severity,
    algorithm: 'Z-Score',
    reasoning: `Value at ${zScore.toFixed(2)}σ deviation from mean`
  };
}

// IQR (Interquartile Range) Method
export function detectIQR(data: DataPoint[], currentPoint: DataPoint, factor = 1.5): AnomalyResult {
  const values = [...data.map(d => d.engagement)].sort((a, b) => a - b);
  if (values.length < 10) return { isAnomaly: false, confidence: 0, severity: 'LOW', algorithm: 'IQR', reasoning: 'Insufficient data' };

  const q1 = values[Math.floor(values.length / 4)];
  const q3 = values[Math.floor(values.length * 3 / 4)];
  const iqr = q3 - q1;
  const lowerBound = q1 - factor * iqr;
  const upperBound = q3 + factor * iqr;

  const isAnomaly = currentPoint.engagement < lowerBound || currentPoint.engagement > upperBound;
  const confidence = isAnomaly ? 85 : 0;
  
  return {
    isAnomaly,
    confidence,
    severity: isAnomaly ? 'HIGH' : 'LOW',
    algorithm: 'IQR',
    reasoning: `Value outside [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}] range`
  };
}

// Moving Average Deviation
export function detectMovingAverage(data: DataPoint[], currentPoint: DataPoint, windowSize = 12, threshold = 2.5): AnomalyResult {
  const lastPoints = data.slice(-windowSize).map(d => d.engagement);
  if (lastPoints.length < windowSize / 2) return { isAnomaly: false, confidence: 0, severity: 'LOW', algorithm: 'Moving Average', reasoning: 'Insufficient data' };

  const movingAvg = lastPoints.reduce((a, b) => a + b, 0) / lastPoints.length;
  const movingStd = Math.sqrt(lastPoints.map(x => Math.pow(x - movingAvg, 2)).reduce((a, b) => a + b) / lastPoints.length);
  
  const deviation = Math.abs(currentPoint.engagement - movingAvg);
  const isAnomaly = deviation > threshold * (movingStd || 1);
  const confidence = isAnomaly ? 90 : 0;

  return {
    isAnomaly,
    confidence,
    severity: isAnomaly ? 'CRITICAL' : 'LOW',
    algorithm: 'Moving Average',
    reasoning: `Deviation ${deviation.toFixed(1)} exceeded threshold`
  };
}

// Simulated LSTM (Neural Network)
export function detectLSTM(data: DataPoint[], currentPoint: DataPoint): AnomalyResult {
  // Simulate neural network output
  // We use polynomial regression simulation + randomness
  const lastValue = data.length > 0 ? data[data.length - 1].engagement : 50;
  const prediction = lastValue + (Math.random() * 4 - 2);
  const error = Math.abs(currentPoint.engagement - prediction);
  
  const isAnomaly = error > 15;
  const confidence = Math.max(70, Math.random() * 100);

  return {
    isAnomaly,
    confidence: isAnomaly ? confidence : 0,
    severity: isAnomaly ? 'HIGH' : 'LOW',
    algorithm: 'LSTM-NN',
    reasoning: `Model predicted ${prediction.toFixed(1)}, received ${currentPoint.engagement.toFixed(1)}`
  };
}

// Ensemble Detection
export function detectEnsemble(data: DataPoint[], currentPoint: DataPoint): AnomalyResult {
  const results = [
    detectZScore(data, currentPoint),
    detectIQR(data, currentPoint),
    detectMovingAverage(data, currentPoint),
    detectLSTM(data, currentPoint)
  ];

  const anomalies = results.filter(r => r.isAnomaly);
  if (anomalies.length >= 2) {
    const mainAnomaly = anomalies.reduce((prev, curr) => prev.confidence > curr.confidence ? prev : curr);
    return {
      ...mainAnomaly,
      algorithm: 'Ensemble',
      reasoning: `Multiple algorithms (${anomalies.length}/4) flagged this point. ${mainAnomaly.reasoning}`
    };
  }

  return { isAnomaly: false, confidence: 0, severity: 'LOW', algorithm: 'Ensemble', reasoning: 'Agreement not met' };
}
