import { useState } from 'react';
import { Check, ChevronDown, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_SUBREDDITS = [
  { name: 'technology', label: 'Technology' },
  { name: 'worldnews', label: 'World News' },
  { name: 'cryptocurrency', label: 'Crypto' },
  { name: 'stocks', label: 'Stocks' },
  { name: 'science', label: 'Science' },
  { name: 'programming', label: 'Programming' },
  { name: 'artificial', label: 'AI' },
  { name: 'dataisbeautiful', label: 'Data Viz' }
];

interface SubredditSelectorProps {
  selected?: string[];
  onChange: (selected: string[]) => void;
}

export function SubredditSelector({ selected = [], onChange }: SubredditSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSubreddit = (subreddit: string) => {
    if (selected.includes(subreddit)) {
      onChange(selected.filter(s => s !== subreddit));
    } else {
      onChange([...selected, subreddit]);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-xl hover:bg-white/5 transition-all active:scale-95"
      >
        <ListFilter size={16} className="text-blue-400" />
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          {selected.length} Subreddits
        </span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-64 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-white/5 bg-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Monitoring Streams</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {POPULAR_SUBREDDITS.map(({ name, label }) => (
                  <button
                    key={name}
                    onClick={() => toggleSubreddit(name)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-500/10 rounded-xl transition-all group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-white text-sm font-medium">r/{label}</span>
                      <span className="text-[10px] text-gray-500 font-medium">reddit.com/r/{name}</span>
                    </div>
                    {selected.includes(name) && (
                      <div className="p-1 bg-blue-500 rounded-full">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-3 bg-black/20 text-center">
                <p className="text-[9px] text-gray-500 font-medium leading-tight">
                  Selection syncs with anomaly detection model for precision monitoring.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
