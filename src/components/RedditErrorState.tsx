import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface RedditErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export function RedditErrorState({ error, onRetry }: RedditErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-red-500/5 border border-red-500/20 rounded-3xl backdrop-blur-xl text-center space-y-4"
    >
      <div className="p-3 bg-red-500/10 rounded-2xl">
        <AlertCircle className="text-red-500" size={32} />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Reddit Data Sync Failed</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          {error || 'The Reddit public API is currently unavailable or the rate limit has been exceeded.'}
        </p>
      </div>
      
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 group"
      >
        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        Attempt Reconnection
      </button>
      
      <div className="pt-4 border-t border-white/5 w-full max-w-xs">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Fallback active: Using simulated data
        </p>
      </div>
    </motion.div>
  );
}
