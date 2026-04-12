import { Dashboard } from '../components/Dashboard';
import { useRedditData } from '../hooks/useRedditData';
import { RedditLiveIndicator } from '../components/RedditLiveIndicator';
import { RedditErrorState } from '../components/RedditErrorState';
import { Loader2 } from 'lucide-react';

export default function MonitorPage() {
  const { data: redditData, isLoading, error, refresh } = useRedditData(true, 300000);

  const isInitialLoad = isLoading && redditData.posts.length === 0;

  if (isInitialLoad) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '16px',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
        <p style={{ fontSize: '0.875rem' }}>Loading live Reddit data...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Live indicator strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 32px',
          borderBottom: '0.5px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <RedditLiveIndicator lastUpdate={redditData.lastUpdated} isLoading={isLoading} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
          {redditData.posts.length} posts · {redditData.subreddits.length} subreddits
        </span>
      </div>

      {error ? (
        <div style={{ padding: '32px' }}>
          <RedditErrorState error={error} onRetry={refresh} />
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
