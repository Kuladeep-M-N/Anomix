import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface RedditLiveIndicatorProps {
  lastUpdate: number | null;
  isLoading: boolean;
}

export function RedditLiveIndicator({ lastUpdate, isLoading }: RedditLiveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState('');
  
  useEffect(() => {
    if (!lastUpdate) return;
    
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(lastUpdate, { addSuffix: true }));
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [lastUpdate]);
  
  return (
    <div className="flex items-center gap-3 bg-gray-900/40 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-xl">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Fetching Reddit...
          </span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              LIVE Reddit Data
            </span>
            {timeAgo && (
              <span className="text-[10px] font-medium text-gray-500 lowercase border-l border-white/10 pl-2">
                updated {timeAgo}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
