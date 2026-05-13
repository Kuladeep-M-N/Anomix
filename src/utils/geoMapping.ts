export interface Location {
  lat: number;
  lng: number;
  label: string;
}

const SUBREDDIT_MAP: Record<string, Location> = {
  // Tech & Innovation
  'technology': { lat: 37.7749, lng: -122.4194, label: 'Silicon Valley' },
  'programming': { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
  'artificial': { lat: 37.3382, lng: -121.8863, label: 'San Jose' },
  'machinelearning': { lat: 34.0522, lng: -118.2437, label: 'Los Angeles' },
  
  // Science & Discovery
  'science': { lat: 46.2330, lng: 6.0556, label: 'CERN / Geneva' },
  'space': { lat: 28.5729, lng: -80.6490, label: 'Cape Canaveral' },
  'nasa': { lat: 29.5593, lng: -95.0900, label: 'Houston' },
  'physics': { lat: 52.3676, lng: 4.9041, label: 'Amsterdam' },
  
  // Finance & Markets
  'stocks': { lat: 40.7128, lng: -74.0060, label: 'New York City' },
  'wallstreetbets': { lat: 40.7128, lng: -74.0060, label: 'New York City' },
  'cryptocurrency': { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  'bitcoin': { lat: 25.2048, lng: 55.2708, label: 'Dubai' },
  
  // News & Politics
  'worldnews': { lat: 51.5074, lng: -0.1278, label: 'London' },
  'news': { lat: 38.9072, lng: -77.0369, label: 'DC Metro' },
  'politics': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'europe': { lat: 50.8503, lng: 4.3517, label: 'Brussels' },
  
  // Culture & Lifestyle
  'gaming': { lat: 37.5665, lng: 126.9780, label: 'Seoul' },
  'movies': { lat: 34.0522, lng: -118.2437, label: 'Hollywood' },
  'music': { lat: 36.1627, lng: -86.7816, label: 'Nashville' },
  'art': { lat: 41.9028, lng: 12.4964, label: 'Rome' },
  'food': { lat: 35.6895, lng: 139.6917, label: 'Tokyo' },
  
  // Regions
  'india': { lat: 28.6139, lng: 77.2090, label: 'New Delhi' },
  'unitedkingdom': { lat: 53.4808, lng: -2.2426, label: 'Manchester' },
  'canada': { lat: 43.6532, lng: -79.3832, label: 'Toronto' },
  'australia': { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
  'brazil': { lat: -23.5505, lng: -46.6333, label: 'São Paulo' },
  'germany': { lat: 52.5200, lng: 13.4050, label: 'Berlin' },
  
  // Nature
  'environment': { lat: -3.4653, lng: -62.2159, label: 'Amazon Basin' },
  'earthporn': { lat: 64.9631, lng: -19.0208, label: 'Iceland' },
  'dataisbeautiful': { lat: 42.3601, lng: -71.0589, label: 'Boston' },
};

export function getSubredditLocation(subreddit: string): Location {
  const clean = subreddit.replace(/^r\//, '').toLowerCase();
  
  if (SUBREDDIT_MAP[clean]) {
    return SUBREDDIT_MAP[clean];
  }

  // Improved Spherical Fallback (Deterministic pseudo-random spread)
  const hash = Array.from(clean).reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  
  // Use golden ratio or similar to spread points more evenly
  const phi = (Math.sqrt(5) + 1) / 2;
  const lat = (Math.asin(2 * ((hash * phi) % 1) - 1) * 180) / Math.PI;
  const lng = (((hash * phi * phi) % 1) * 360) - 180;
  
  return { lat, lng, label: 'Global Signal' };
}
