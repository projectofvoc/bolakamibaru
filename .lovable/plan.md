

## Plan: Fix Analytics Data Accuracy + Add Article Publish Stats

### Problem 1: Analytics showing wrong numbers
The `get-analytics` edge function uses `.select('*')` which hits the **Supabase default limit of 1,000 rows**. Real data: 5,266 sessions and 8,368 pageviews in 30 days, but the dashboard shows 1,000/1,000.

### Problem 2: Missing article publish counts
Need to add cards showing articles published in last 30 and 7 days.

---

### Changes

#### 1. Edge Function: `supabase/functions/get-analytics/index.ts`

**Fix row limit issue** by using `count: 'exact'` with range-based pagination for the aggregation queries, or better yet, use **database-level aggregation via RPC/SQL** to avoid fetching all rows:

- For **total visitors**: Use `.select('session_id', { count: 'exact', head: true })` to get count without fetching rows
- For **total pageviews**: Same approach with `head: true` for count only
- For **trend data**: Keep fetching rows but with `.range(0, 9999)` to bypass the 1000 limit (or paginate)
- For **bounce rate, duration**: Fetch sessions with `.select('*').range(0, 9999)` to get all rows
- Add **article counts** (30d and 7d) to the response by querying `articles` table

Key changes:
- Replace `.select('*')` with `.select('*').range(0, 9999)` for sessions and pageviews to bypass 1000-row limit
- Add `articlesPublished30d` and `articlesPublished7d` counts to the response
- Query articles with `status = 'published'` and `published_at` date filter

#### 2. Frontend: `src/pages/cms/CMSAnalytics.tsx`

- Update the `AnalyticsData` interface to include `articlesPublished30d` and `articlesPublished7d`
- Add 2 new stat cards after the existing 5-card grid (or expand to 7 cards in a new row)
- Cards will show:
  - "Berita 30 Hari" with count and subtitle "Last 30 days"
  - "Berita 7 Hari" with count and subtitle "Last 7 days"
- Use `Newspaper` icon from lucide-react, matching existing card style
- Grid layout: keep existing 5 cards in first row, add 2 new cards below

### Technical Details

**Edge function data fix** - the critical change:
```typescript
// Instead of: .select('*') which caps at 1000
// Use: .select('*', { count: 'exact' }).range(0, 9999)
const { data: sessions, count: sessionCount } = await supabase
  .from('analytics_sessions')
  .select('*', { count: 'exact' })
  .gte('started_at', startDate)
  .lte('started_at', `${endDate}T23:59:59.999Z`)
  .range(0, 9999);
```

**Article count queries** added to edge function:
```typescript
const { count: articles30d } = await supabase
  .from('articles')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'published')
  .gte('published_at', thirtyDaysAgo);

const { count: articles7d } = await supabase
  .from('articles')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'published')
  .gte('published_at', sevenDaysAgo);
```

### Files Changed
- `supabase/functions/get-analytics/index.ts` -- Fix 1000-row limit, add article counts
- `src/pages/cms/CMSAnalytics.tsx` -- Add 2 article stat cards, consume new data fields

### What stays the same
- No database migrations needed
- No new tables or RLS changes
- All existing charts and cards unchanged
- Auto-refresh behavior unchanged

