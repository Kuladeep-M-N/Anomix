import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Skull, Trash2, Rocket, Timer, MousePointer2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Alert } from '../store/useStore';

export function DemoControls() {
  const [isVisible, setIsVisible] = useState(false);
  const { addDataPoint, addAlert, selectedPlatform, data } = useStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + D to toggle demo controls
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
      }
      
      // Ctrl + Shift + A to inject dramatic anomaly
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        injectAnomaly();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, data, selectedPlatform]);

  const injectAnomaly = () => {
    const topic = 'Massive Coordinate Injection';
    const engagement = 800 + Math.random() * 200;
    
    const newPoint = {
      timestamp: Date.now(),
      platform: selectedPlatform,
      topic,
      engagement,
      raw_metrics: { bot_count: 5000, reach: 50000 },
      sentiment: -0.85,
      velocity: 95,
      isAnomaly: true,
      anomalyDetails: {
        confidence: 99.8,
        severity: 'CRITICAL' as const,
        algorithm: 'Ensemble',
        reasoning: 'Sudden 850% threshold violation via botnet activity'
      }
    };

    const alert: Alert = {
      id: `alert-demo-${Date.now()}`,
      timestamp: Date.now(),
      platform: selectedPlatform,
      topic,
      severity: 'CRITICAL',
      message: '🚨 CRITICAL: Massive coordinate trend injection detected. Likely state-sponsored botnet attack.',
      confidence: 99.8,
      status: 'NEW',
      metadata: {
        value: engagement,
        threshold: 3.0,
        algorithm: 'Ensemble'
      }
    };

    addDataPoint(newPoint);
    addAlert(alert);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed bottom-32 right-8 z-[200] w-64 bg-gray-900 border-2 border-blue-500/50 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)] p-6 backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-yellow-400 fill-yellow-400" size={18} />
            <h3 className="text-white font-bold text-sm tracking-tight">Demo Command Center</h3>
          </div>

          <div className="space-y-3">
            <button 
              onClick={injectAnomaly}
              className="w-full flex items-center justify-between p-4 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 rounded-2xl transition-all group"
            >
              <div className="text-left">
                <span className="block text-red-500 text-[10px] font-bold uppercase tracking-widest">Inject Anomaly</span>
                <span className="text-xs text-white/70">Ctrl+Shift+A</span>
              </div>
              <Skull className="text-red-500 group-hover:scale-125 transition-transform" size={18} />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 rounded-2xl transition-all group">
              <div className="text-left">
                <span className="block text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Load Scenario</span>
                <span className="text-xs text-white/70">Viral Growth</span>
              </div>
              <Rocket className="text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl transition-all group">
              <div className="text-left">
                <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest">Auto Alerts</span>
                <span className="text-xs text-white/70">OFF</span>
              </div>
              <Timer className="text-gray-500 group-hover:rotate-12 transition-transform" size={18} />
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 text-center">
             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Presentation Mode Active</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
