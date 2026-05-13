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

  // 2. Otherwise, use high-entropy hashing to ensure a TRULY RANDOM global spread
  // This breaks the "linear spiral" pattern seen previously
  let h = 0;
  const str = id || cleanSub || 'global';
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  
  // Scramble the hash further to ensure high entropy
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= (h >>> 16);

  // Map to spherical coordinates with high spread
  const u = (Math.abs(h) % 1000000) / 1000000;
  const v = (Math.abs(Math.imul(h, 0x9e3779b1)) % 1000000) / 1000000;

  const lat = (Math.acos(2 * u - 1) * 180) / Math.PI - 90;
  const lng = (v * 360) - 180;
  
  return { 
    lat, 
    lng, 
    label: cleanSub.toUpperCase() 
  };
}
