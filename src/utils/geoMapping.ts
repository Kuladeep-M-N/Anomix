export interface Location {
  lat: number;
  lng: number;
  label: string;
}

const COUNTRY_COORDS: Record<string, { lat: number, lng: number }> = {
  'india': { lat: 20.5937, lng: 78.9629 },
  'usa': { lat: 37.0902, lng: -95.7129 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'uk': { lat: 55.3781, lng: -3.4360 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'brazil': { lat: -14.2350, lng: -51.9253 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'russia': { lat: 61.5240, lng: 105.3188 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'canada': { lat: 56.1304, lng: -106.3468 },
};

export function getSubredditLocation(subreddit: string, title: string = '', id: string = ''): Location {
  const cleanSub = subreddit.replace(/^r\//, '').toLowerCase();
  const cleanTitle = title.toLowerCase();
  
  // 1. Try to find a country mention in the title for "Particular place" feel
  for (const [country, coords] of Object.entries(COUNTRY_COORDS)) {
    if (cleanTitle.includes(country)) {
      return { ...coords, label: country.toUpperCase() };
    }
  }

  // 2. Otherwise, use the post ID to generate a TRULY UNIQUE global coordinate
  // This ensures posts are spread "All over the globe"
  const seed = (id || cleanSub).split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  
  // High-quality spherical distribution (Fibonacci Sphere-ish)
  const phi = Math.acos(1 - 2 * ((seed * 0.618033) % 1));
  const theta = 2 * Math.PI * ((seed * 0.381966) % 1);

  const lat = (phi * 180) / Math.PI - 90;
  const lng = (theta * 180) / Math.PI - 180;
  
  return { 
    lat, 
    lng, 
    label: cleanSub.toUpperCase() 
  };
}
