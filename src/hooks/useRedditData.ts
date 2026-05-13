import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRedditTrends } from '../services/redditService';
import type { RedditTrendData } from '../services/redditService';

// ─── Module-level singleton cache ────────────────────────────────────────────
// Persists across component mounts/unmounts (i.e. page navigation).
// Data is reused instantly on re-mount if < 5 minutes old.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface Cache {
  data: RedditTrendData | null;
  fetchedAt: number;
  promise: Promise<RedditTrendData> | null;
}

const cache: Cache = {
  data: null,
  fetchedAt: 0,
  promise: null,
};

const EMPTY_DATA: RedditTrendData = {
  posts: [],
  timeSeries: [],
  trendingTopics: [],
  subreddits: [],
  lastUpdated: Date.now(),
};

/**
 * Custom hook for fetching and managing Reddit data.
 * Uses a module-level cache so navigating away and back doesn't re-fetch.
 */
export function useRedditData(autoRefresh = true, refreshInterval = 300000) {
  const isFresh = cache.data && Date.now() - cache.fetchedAt < CACHE_TTL;

  // Start with cached data immediately — zero loading delay on revisit
  const [data, setData] = useState<RedditTrendData>(cache.data ?? EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(!isFresh);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(cache.fetchedAt || null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    // Skip fetch if cache is still fresh and not forced
    if (!force && cache.data && Date.now() - cache.fetchedAt < CACHE_TTL) {
      setData(cache.data);
      setIsLoading(false);
      return;
    }

    // Deduplicate: if a fetch is already in flight, wait for it
    if (!cache.promise) {
      cache.promise = fetchRedditTrends().finally(() => {
        cache.promise = null;
      });
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await cache.promise;

      if (!mountedRef.current) return;

      if (result.error) {
        setError(result.error);
      }
      
      // Update module-level cache
      cache.data = result;
      cache.fetchedAt = Date.now();

      setData(result);
      setLastUpdate(result.lastUpdated);

    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err.message || 'Unknown error');
      console.error('[useRedditData]', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  // On mount: use cache if fresh, otherwise fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  // Auto-refresh on interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true), // force bypass cache
    lastUpdate,
  };
}
