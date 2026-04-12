import { Dashboard } from '../components/Dashboard';
import { useRedditData } from '../hooks/useRedditData';
import { RedditLiveIndicator } from '../components/RedditLiveIndicator';
import { RedditErrorState } from '../components/RedditErrorState';

export default function MonitorPage() {
  const { data: redditData, isLoading, error, refresh } = useRedditData(true, 300000);

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
          {redditData.posts.length > 0
            ? `${redditData.posts.length} posts · ${redditData.subreddits.length} subreddits`
            : isLoading ? 'Fetching data...' : 'No data'}
        </span>
      </div>

      {/* Always render dashboard — Reddit data will populate when it arrives */}
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
