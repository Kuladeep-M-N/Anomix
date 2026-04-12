import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';

export function LiveIndicator() {
  const { isLiveMode, toggleLiveMode, lastUpdate } = useStore();

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-900/40 backdrop-blur-md rounded-full border border-white/5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={toggleLiveMode}>
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${isLiveMode ? 'bg-emerald-500' : 'bg-gray-500'} transition-colors duration-300`} />
          {isLiveMode && (
            <motion.div
              className="absolute inset-0 bg-emerald-500 rounded-full"
              animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isLiveMode ? 'text-emerald-400' : 'text-gray-400'}`}>
          {isLiveMode ? 'Live' : 'Paused'}
        </span>
      </div>
      
      <div className="w-[1px] h-3 bg-white/10" />
      
      <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
        Update: {formatDistanceToNow(lastUpdate)} ago
      </span>
    </div>
  );
}
