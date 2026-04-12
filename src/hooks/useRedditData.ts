import { useState, useEffect, useCallback } from 'react';
import { fetchRedditTrends } from '../services/redditService';
import type { RedditTrendData } from '../services/redditService';

/**
 * Custom hook for fetching and managing Reddit data
 * @param autoRefresh - Whether to automatically refresh data
 * @param refreshInterval - Refresh interval in milliseconds (default: 5 minutes)
 * @returns { data, isLoading, error, refresh, lastUpdate }
 */
export function useRedditData(autoRefresh = true, refreshInterval = 300000) {
  const [data, setData] = useState<RedditTrendData>({
    posts: [],
    timeSeries: [],
    trendingTopics: [],
    subreddits: [],
    lastUpdated: Date.now()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchRedditTrends();
      
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
        setLastUpdate(result.lastUpdated);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      console.error('Reddit data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);
  
  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdate
  };
}
