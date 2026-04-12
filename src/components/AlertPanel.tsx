import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Search, Filter, ArrowUpRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Alert } from '../store/useStore';
import { format } from 'date-fns';

export function AlertPanel() {
  const { alerts, updateAlertStatus } = useStore();

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'WARNING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'INFO': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold tracking-tight">Active Alerts</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Priority Queue</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search size={16} />
           </button>
           <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Filter size={16} />
           </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <CheckCircle2 className="text-emerald-500/20 mb-4" size={48} />
              <h4 className="text-white font-medium">All Systems Normal</h4>
              <p className="text-gray-500 text-sm mt-1">No pending alerts detected</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`
                  p-4 rounded-2xl border transition-all duration-300 group cursor-pointer
                  ${alert.status === 'RESOLVED' ? 'opacity-50 grayscale' : 'hover:bg-white/5'}
                  ${getSeverityColor(alert.severity)}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <AlertCircle size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{alert.severity}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {format(alert.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
                
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {alert.topic} on {alert.platform}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {alert.message}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-black/20 text-[9px] font-bold text-gray-400">
                       {alert.metadata.algorithm}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/20 text-[9px] font-bold text-gray-400">
                       {alert.confidence.toFixed(0)}% Conf.
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {alert.status === 'NEW' && (
                      <button 
                        onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                        className="p-1 px-3 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      {alerts.length > 0 && (
        <div className="p-4 bg-black/20 border-t border-white/5 flex gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
           <span>Total: {alerts.length}</span>
           <span>Critical: {alerts.filter(a => a.severity === 'CRITICAL').length}</span>
        </div>
      )}
    </div>
  );
}
