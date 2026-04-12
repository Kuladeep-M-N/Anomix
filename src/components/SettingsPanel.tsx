import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Eye, Database, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { 
    sensitivity, setSensitivity, 
    zThreshold, setZThreshold,
    toggleDarkMode, isDarkMode
  } = useStore();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-black/20 border-r border-white/5 p-6 flex flex-col gap-2">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <SettingsIcon size={18} />
              Config
            </h2>
            <button className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider">
               <Shield size={14} /> Detection
            </button>
            <button className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
               <Bell size={14} /> Alerts
            </button>
            <button className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
               <Database size={14} /> Monitoring
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 space-y-8">
            <section>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-between">
                Algorithm Sensitivity
                <span className="text-blue-500 font-mono text-sm">{sensitivity}x</span>
              </h3>
              <input 
                type="range" 
                min="1" max="10" 
                value={sensitivity}
                onChange={(e) => setSensitivity(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-gray-500 text-[10px] font-bold uppercase mt-2 tracking-widest">
                Controls the ensemble weighting factor
              </p>
            </section>

            <section>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-between">
                Z-Score Threshold
                <span className="text-emerald-500 font-mono text-sm">{zThreshold}σ</span>
              </h3>
              <input 
                type="range" 
                min="2.0" max="5.0" step="0.1"
                value={zThreshold}
                onChange={(e) => setZThreshold(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-gray-500 text-[10px] font-bold uppercase mt-2 tracking-widest">
                Standard deviations for anomaly flagging
              </p>
            </section>

            <section className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Interface Appearance</h3>
                  <p className="text-gray-500 text-xs">Toggle dark theme and data density</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </section>

            <div className="flex gap-3 justify-end pt-4">
              <button onClick={onClose} className="px-6 py-2.5 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
                Cancel
              </button>
              <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
