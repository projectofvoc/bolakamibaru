import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';

/**
 * Component that tracks pageviews and sessions.
 * Place this inside BrowserRouter to access useLocation.
 */
export function AnalyticsTracker() {
  useAnalyticsTracker();
  return null;
}
