export interface Location {
  lat: number;
  lng: number;
  label: string;
}

const SUBREDDIT_MAP: Record<string, Location> = {
  'technology': { lat: 37.7749, lng: -122.4194, label: 'Silicon Valley' },
  'science': { lat: 46.2330, lng: 6.0556, label: 'CERN / Geneva' },
  'worldnews': { lat: 51.5074, lng: -0.1278, label: 'London' },
  'programming': { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
  'dataisbeautiful': { lat: 42.3601, lng: -71.0589, label: 'Boston' },
  'stocks': { lat: 40.7128, lng: -74.0060, label: 'New York City' },
  'wallstreetbets': { lat: 40.7128, lng: -74.0060, label: 'New York City' },
  'space': { lat: 28.5729, lng: -80.6490, label: 'Cape Canaveral' },
  'news': { lat: 38.9072, lng: -77.0369, label: 'DC Metro' },
  'gaming': { lat: 34.0522, lng: -118.2437, label: 'Los Angeles' },
  'india': { lat: 28.6139, lng: 77.2090, label: 'New Delhi' },
  'politics': { lat: 38.9072, lng: -77.0369, label: 'DC Metro' },
  'environment': { lat: -3.4653, lng: -62.2159, label: 'Amazon Basin' },
};

export function getSubredditLocation(subreddit: string): Location {
  const clean = subreddit.replace(/^r\//, '').toLowerCase();
  
  if (SUBREDDIT_MAP[clean]) {
    return SUBREDDIT_MAP[clean];
  }

  // Deterministic fallback based on name
  const hash = Array.from(clean).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const lat = ((hash % 120) - 60) + (Math.sin(hash) * 5); // Rough spread
  const lng = ((hash % 240) - 120) + (Math.cos(hash) * 5);
  
  return { lat, lng, label: 'Global Signal' };
}
