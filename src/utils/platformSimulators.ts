export const PLATFORMS = {
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  REDDIT: 'reddit'
};

const TOPICS = [
  '#AI', '#TechNews', '#Crypto', '#ClimateChange', 
  '#SpaceX', '#Web3', '#Metaverse', '#CyberSecurity'
];

const getHourOfDay = () => new Date().getHours();

export const simulateTwitter = () => {
  const hour = getHourOfDay();
  // Peak activity: 12 PM - 2 PM and 7 PM - 9 PM
  const isPeak = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21);
  const baseActivity = isPeak ? 80 : 40;
  const variance = Math.random() * 20;
  const viralSpikes = Math.random() > 0.95 ? 100 : 0;
  const noise = Math.random() * 5;

  return {
    engagement: baseActivity + variance + viralSpikes + noise,
    metrics: {
      tweets: Math.floor(Math.random() * 1000),
      retweets: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 10000),
      replies: Math.floor(Math.random() * 2000)
    },
    topic: TOPICS[Math.floor(Math.random() * TOPICS.length)]
  };
};

export const simulateInstagram = () => {
  const hour = getHourOfDay();
  // Peak activity: 8 PM - 10 PM
  const isPeak = (hour >= 20 && hour <= 22);
  const isLow = (hour >= 3 && hour <= 6);
  
  let baseActivity = 50;
  if (isPeak) baseActivity = 90;
  if (isLow) baseActivity = 10;

  const pattern = Math.sin((hour / 24) * Math.PI * 2) * 20;
  
  return {
    engagement: baseActivity + pattern + (Math.random() * 10),
    metrics: {
      posts: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 20000),
      comments: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 500)
    },
    topic: TOPICS[Math.floor(Math.random() * TOPICS.length)]
  };
};

export const simulateTikTok = () => {
  const hour = getHourOfDay();
  // Peak: 6 PM - 11 PM
  const isPeak = (hour >= 18 && hour <= 23);
  const baseActivity = isPeak ? 70 : 30;
  
  // High volatility
  const viralBurst = Math.random() > 0.9 ? Math.random() * 200 : 0;
  const algoBoost = Math.random() > 0.98 ? 10 : 1;

  return {
    engagement: (baseActivity + viralBurst + (Math.random() * 30)) * algoBoost,
    metrics: {
      views: Math.floor(Math.random() * 100000),
      likes: Math.floor(Math.random() * 50000),
      shares: Math.floor(Math.random() * 10000),
      comments: Math.floor(Math.random() * 5000)
    },
    topic: TOPICS[Math.floor(Math.random() * TOPICS.length)]
  };
};

export const getSimulationForPlatform = (platform: string) => {
  switch (platform) {
    case PLATFORMS.TWITTER: return simulateTwitter();
    case PLATFORMS.INSTAGRAM: return simulateInstagram();
    case PLATFORMS.TIKTOK: return simulateTikTok();
    default: return simulateTwitter();
  }
};
