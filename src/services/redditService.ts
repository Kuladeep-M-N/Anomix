/**
 * Reddit Public JSON API Service
 * No authentication required - uses Reddit's public JSON endpoints
 */

const REDDIT_BASE_URL = 'https://www.reddit.com';
const REQUEST_DELAY = 2000; // 2 seconds between requests to respect rate limits

// Rate limiting helper
let lastRequestTime = 0;

export interface RedditPost {
  id: string;
  timestamp: number;
  platform: 'Reddit';
  subreddit: string;
  topic: string;
  url: string;
  engagement: number;
  sentiment: number;
  metrics: {
    upvotes: number;
    comments: number;
    upvote_ratio: number;
    awards: number;
    crossposts: number;
  };
  author: string;
  flair: string | null;
  is_video: boolean;
  thumbnail: string | null;
}

export interface RedditTimeSeries {
  timestamp: number;
  platform: 'Reddit';
  engagement: number;
  count: number;
  posts: RedditPost[];
}

export interface TrendingTopic {
  topic: string;
  count: number;
  totalEngagement: number;
}

export interface RedditTrendData {
  posts: RedditPost[];
  timeSeries: RedditTimeSeries[];
  trendingTopics: TrendingTopic[];
  lastUpdated: number;
  subreddits: string[];
  error?: string;
}

let isFirstRequest = true;

// List of reliable CORS proxies
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

async function rateLimitedFetch(url: string, retryCount = 0): Promise<any> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (!isFirstRequest && timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve =>
      setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest)
    );
  }
  isFirstRequest = false;
  lastRequestTime = Date.now();

  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (!isLocalhost && retryCount === 0) {
    try {
      const direct = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (direct.ok) return direct.json();
    } catch (_) {
      // Fall through to proxies
    }
  }

  const proxyFn = CORS_PROXIES[retryCount % CORS_PROXIES.length];
  const proxyUrl = proxyFn(url);

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    
    const data = await response.json();
    // Some proxies wrap the response (like allorigins)
    return data.contents ? JSON.parse(data.contents) : data;
  } catch (error) {
    if (retryCount < CORS_PROXIES.length - 1) {
      console.warn(`Proxy ${retryCount} failed, retrying with next...`, error);
      return rateLimitedFetch(url, retryCount + 1);
    }
    throw error;
  }
}


/**
 * Fetch hot posts from a subreddit
 * @param subreddit - Subreddit name (without r/)
 * @param limit - Number of posts to fetch (max 100)
 * @returns Array of normalized post data
 */
export async function fetchSubredditHot(subreddit = 'technology', limit = 50): Promise<RedditPost[]> {
  try {
    const url = `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=${limit}`;
    const data = await rateLimitedFetch(url);
    
    return normalizeRedditData(data, subreddit);
  } catch (error) {
    console.error(`Error fetching r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Fetch new posts from a subreddit
 * @param subreddit - Subreddit name
 * @param limit - Number of posts to fetch
 * @returns Array of normalized post data
 */
export async function fetchSubredditNew(subreddit = 'technology', limit = 50): Promise<RedditPost[]> {
  try {
    const url = `${REDDIT_BASE_URL}/r/${subreddit}/new.json?limit=${limit}`;
    const data = await rateLimitedFetch(url);
    
    return normalizeRedditData(data, subreddit);
  } catch (error) {
    console.error(`Error fetching r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Fetch top posts from a subreddit
 * @param subreddit - Subreddit name
 * @param timeframe - 'hour', 'day', 'week', 'month', 'year', 'all'
 * @param limit - Number of posts to fetch
 * @returns Array of normalized post data
 */
export async function fetchSubredditTop(
  subreddit = 'technology', 
  timeframe = 'day', 
  limit = 50
): Promise<RedditPost[]> {
  try {
    const url = `${REDDIT_BASE_URL}/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`;
    const data = await rateLimitedFetch(url);
    
    return normalizeRedditData(data, subreddit);
  } catch (error) {
    console.error(`Error fetching r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Fetch posts from multiple subreddits
 * @param subreddits - Array of subreddit names
 * @returns Combined array of posts from all subreddits
 */
export async function fetchMultipleSubreddits(subreddits = ['technology', 'worldnews']): Promise<RedditPost[]> {
  try {
    const promises = subreddits.map(sub => fetchSubredditHot(sub, 25));
    const results = await Promise.all(promises);
    
    // Flatten and sort by engagement
    return results
      .flat()
      .sort((a, b) => b.engagement - a.engagement);
  } catch (error) {
    console.error('Error fetching multiple subreddits:', error);
    return [];
  }
}

/**
 * Normalize Reddit API response to our app's data format
 * @param data - Raw Reddit JSON response
 * @param subreddit - Subreddit name
 * @returns Normalized post data
 */
function normalizeRedditData(data: any, subreddit: string): RedditPost[] {
  if (!data?.data?.children) {
    return [];
  }
  
  return data.data.children
    .filter((post: any) => post.kind === 't3') // Only link posts
    .map((post: any) => {
      const postData = post.data;
      
      // Calculate engagement score (weighted combination of upvotes and comments)
      const engagement = (postData.score * 0.7) + (postData.num_comments * 0.3);
      
      // Calculate sentiment based on upvote ratio
      // upvote_ratio > 0.8 = positive, 0.5-0.8 = neutral, < 0.5 = negative
      const sentiment = postData.upvote_ratio > 0.8 ? 0.5 : 
                       postData.upvote_ratio > 0.5 ? 0 : -0.5;
      
      return {
        id: postData.id,
        timestamp: postData.created_utc * 1000, // Convert to milliseconds
        platform: 'Reddit' as const,
        subreddit: postData.subreddit,
        topic: postData.title,
        url: `https://reddit.com${postData.permalink}`,
        engagement: Math.round(engagement),
        sentiment: sentiment,
        
        // Raw metrics for detailed analysis
        metrics: {
          upvotes: postData.score,
          comments: postData.num_comments,
          upvote_ratio: postData.upvote_ratio,
          awards: postData.total_awards_received || 0,
          crossposts: postData.num_crossposts || 0
        },
        
        // Metadata
        author: postData.author,
        flair: postData.link_flair_text || null,
        is_video: postData.is_video || false,
        thumbnail: postData.thumbnail !== 'self' ? postData.thumbnail : null
      };
    });
}

/**
 * Convert Reddit posts to time-series format for charts
 * Groups posts by hour and calculates hourly engagement
 * @param posts - Array of normalized Reddit posts
 * @returns Time-series data points
 */
export function convertToTimeSeries(posts: RedditPost[]): RedditTimeSeries[] {
  const hourlyBuckets: Record<number, RedditTimeSeries> = {};
  
  posts.forEach(post => {
    // Round timestamp to nearest hour
    const hourTimestamp = Math.floor(post.timestamp / 3600000) * 3600000;
    
    if (!hourlyBuckets[hourTimestamp]) {
      hourlyBuckets[hourTimestamp] = {
        timestamp: hourTimestamp,
        platform: 'Reddit' as const,
        engagement: 0,
        count: 0,
        posts: []
      };
    }
    
    hourlyBuckets[hourTimestamp].engagement += post.engagement;
    hourlyBuckets[hourTimestamp].count += 1;
    hourlyBuckets[hourTimestamp].posts.push(post);
  });
  
  // Convert to array and calculate average engagement per hour
  return Object.values(hourlyBuckets)
    .map(bucket => ({
      ...bucket,
      engagement: Math.round(bucket.engagement / bucket.count)
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get trending topics (most mentioned keywords in titles)
 * @param posts - Array of normalized Reddit posts
 * @param topN - Number of top topics to return
 * @returns Array of {topic, count, totalEngagement}
 */
export function extractTrendingTopics(posts: RedditPost[], topN = 10): TrendingTopic[] {
  const topicMap: Record<string, TrendingTopic> = {};
  
  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  posts.forEach(post => {
    const words = post.topic
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.forEach(word => {
      if (!topicMap[word]) {
        topicMap[word] = {
          topic: word,
          count: 0,
          totalEngagement: 0
        };
      }
      topicMap[word].count += 1;
      topicMap[word].totalEngagement += post.engagement;
    });
  });
  
  return Object.values(topicMap)
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, topN);
}

/**
 * Default subreddits to monitor for trends
 */
export const DEFAULT_SUBREDDITS = [
  'technology',
  'worldnews',
  'cryptocurrency',
  'stocks',
  'science',
  'programming',
  'artificial',
  'dataisbeautiful'
];

/**
 * High-quality static fallback data for when API is completely unreachable
 */
const STATIC_FALLBACK_POSTS: RedditPost[] = [
  {
    id: 'f1',
    timestamp: Date.now() - 3600000,
    platform: 'Reddit',
    subreddit: 'technology',
    topic: 'Artificial General Intelligence (AGI) predicted to arrive by 2029 by leading researchers',
    url: 'https://reddit.com/r/technology',
    engagement: 4250,
    sentiment: 0.5,
    metrics: { upvotes: 3500, comments: 850, upvote_ratio: 0.92, awards: 12, crossposts: 4 },
    author: 'tech_guru',
    flair: 'AI News',
    is_video: false,
    thumbnail: null
  },
  {
    id: 'f2',
    timestamp: Date.now() - 7200000,
    platform: 'Reddit',
    subreddit: 'worldnews',
    topic: 'Global climate treaty signed by 150 nations to phase out coal by 2040',
    url: 'https://reddit.com/r/worldnews',
    engagement: 3800,
    sentiment: 0.5,
    metrics: { upvotes: 3100, comments: 1200, upvote_ratio: 0.88, awards: 8, crossposts: 15 },
    author: 'news_bot',
    flair: 'Policy',
    is_video: false,
    thumbnail: null
  },
  {
    id: 'f3',
    timestamp: Date.now() - 10800000,
    platform: 'Reddit',
    subreddit: 'cryptocurrency',
    topic: 'Ethereum Layer 2 scaling solution hits record high throughput',
    url: 'https://reddit.com/r/cryptocurrency',
    engagement: 2100,
    sentiment: 0,
    metrics: { upvotes: 1800, comments: 450, upvote_ratio: 0.85, awards: 5, crossposts: 2 },
    author: 'crypto_analyst',
    flair: 'Technical',
    is_video: false,
    thumbnail: null
  },
  {
    id: 'f4',
    timestamp: Date.now() - 5400000,
    platform: 'Reddit',
    subreddit: 'science',
    topic: 'New breakthrough in room-temperature superconductivity verified by third party',
    url: 'https://reddit.com/r/science',
    engagement: 5100,
    sentiment: 0.5,
    metrics: { upvotes: 4500, comments: 1100, upvote_ratio: 0.95, awards: 25, crossposts: 30 },
    author: 'science_daily',
    flair: 'Physics',
    is_video: false,
    thumbnail: null
  }
];

/**
 * Main function to fetch comprehensive Reddit trend data
 * @returns Complete trend data with posts, time-series, and topics
 */
export async function fetchRedditTrends(): Promise<RedditTrendData> {
  try {
    const posts = await fetchMultipleSubreddits(DEFAULT_SUBREDDITS);
    
    // If we got no posts, use fallback data so the UI isn't empty
    const finalPosts = posts.length > 0 ? posts : STATIC_FALLBACK_POSTS;
    const isFallback = posts.length === 0;

    return {
      posts: finalPosts,
      timeSeries: convertToTimeSeries(finalPosts),
      trendingTopics: extractTrendingTopics(finalPosts),
      lastUpdated: Date.now(),
      subreddits: DEFAULT_SUBREDDITS,
      error: isFallback ? 'API limited - using fallback intelligence' : undefined
    };
  } catch (error: any) {
    console.error('Error fetching Reddit trends:', error);
    return {
      posts: STATIC_FALLBACK_POSTS,
      timeSeries: convertToTimeSeries(STATIC_FALLBACK_POSTS),
      trendingTopics: extractTrendingTopics(STATIC_FALLBACK_POSTS),
      lastUpdated: Date.now(),
      subreddits: DEFAULT_SUBREDDITS,
      error: `Connection failed (${error.message}) - Fallback active`
    };
  }
}

