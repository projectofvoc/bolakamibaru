// Analytics tracking utilities

const SESSION_KEY = 'analytics_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = 'analytics_last_activity';

export function getOrCreateSessionId(): string {
  const existingSession = sessionStorage.getItem(SESSION_KEY);
  const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  
  // Check if session is still valid (within timeout)
  if (existingSession && lastActivity) {
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
    if (timeSinceLastActivity < SESSION_TIMEOUT) {
      // Update last activity
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      return existingSession;
    }
  }
  
  // Create new session
  const newSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem(SESSION_KEY, newSessionId);
  sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  
  return newSessionId;
}

export function parseDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

export function parseBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  
  return 'Other';
}

export function parseOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  
  return 'Other';
}

export function parseReferrerSource(referrer: string): string {
  if (!referrer) return 'direct';
  
  const url = referrer.toLowerCase();
  
  // Social media
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'social';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'social';
  if (url.includes('instagram.com')) return 'social';
  if (url.includes('linkedin.com')) return 'social';
  if (url.includes('tiktok.com')) return 'social';
  if (url.includes('youtube.com')) return 'social';
  if (url.includes('whatsapp.com') || url.includes('wa.me')) return 'social';
  if (url.includes('t.me') || url.includes('telegram')) return 'social';
  
  // Search engines
  if (url.includes('google.')) return 'organic';
  if (url.includes('bing.com')) return 'organic';
  if (url.includes('yahoo.')) return 'organic';
  if (url.includes('duckduckgo.com')) return 'organic';
  if (url.includes('baidu.com')) return 'organic';
  
  return 'referral';
}

interface TrackEventParams {
  sessionId: string;
  eventType: 'pageview' | 'session_start' | 'session_end';
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/track-analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      console.error('Failed to track event:', await response.text());
    }
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.error('Analytics tracking error:', error);
  }
}

export function trackPageview(pagePath: string, pageTitle?: string): void {
  const sessionId = getOrCreateSessionId();
  
  trackEvent({
    sessionId,
    eventType: 'pageview',
    pagePath,
    pageTitle: pageTitle || document.title,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  });
}

export function trackSessionEnd(): void {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) return;
  
  // Use sendBeacon for reliable delivery on page unload
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const data = JSON.stringify({
    sessionId,
    eventType: 'session_end',
    pagePath: window.location.pathname,
    userAgent: navigator.userAgent,
  });
  
  navigator.sendBeacon(
    `${supabaseUrl}/functions/v1/track-analytics`,
    new Blob([data], { type: 'application/json' })
  );
}
