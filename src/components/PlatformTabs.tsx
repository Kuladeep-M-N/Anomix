import { motion } from 'framer-motion';
import { Send, Hash, Camera, Music } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Platform } from '../store/useStore';

const PLATFORMS: { id: Platform; label: string; icon: any }[] = [
  { id: 'reddit', label: 'Reddit', icon: Hash },
  { id: 'twitter', label: 'Twitter', icon: Send },
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'tiktok', label: 'TikTok', icon: Music },
];

export function PlatformTabs() {
  const { selectedPlatform, setPlatform, alerts } = useStore();

  const getAlertCount = (platform: Platform) => {
    return alerts.filter(a => a.platform === platform && a.status === 'NEW').length;
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/5">
      {PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        const isActive = selectedPlatform === platform.id;
        const alertCount = getAlertCount(platform.id);

        return (
          <button
            key={platform.id}
            onClick={() => setPlatform(platform.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
              ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
            `}
          >
            <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
            <span className="text-sm font-medium">{platform.label}</span>
            
            {platform.id === 'reddit' && (
              <span className="px-1.5 py-0.5 text-[8px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md animate-pulse">
                LIVE
              </span>
            )}
            
            {alertCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {alertCount}
              </span>
            )}

            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-lg -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
