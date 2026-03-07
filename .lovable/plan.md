

## Problem: Two Issues

1. **Case mismatch is already fixed** -- the `.toLowerCase()` comparison on line 107 handles `"Prediksi"` vs `"prediksi"`. This part works.

2. **Real problem: `.limit(50)` on the query** (line 69) fetches only the 50 most recent articles regardless of category. Out of 88 published Prediksi articles, only ~12 appear in the top 50. The rest are cut off. This means:
   - Users see far fewer prediksi articles than exist
   - Load more button won't work properly since the source data is truncated

## Solution

Change the Supabase query in `Berita.tsx` to **filter by category at the database level** when a specific filter (like `prediksi`) is active. This way, the limit of 50 applies only to the relevant category, returning up to 50 prediksi articles instead of 12.

### File: `src/pages/Berita.tsx`

**Query change** (lines 61-75): Make the query category-aware using a case-insensitive filter via Supabase's `ilike`:

```typescript
const { data: allArticles, isLoading } = useQuery({
  queryKey: ['berita-articles', filter],
  queryFn: async () => {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published');
    
    // Filter by category at DB level for non-trending filters
    if (filter && filter !== 'trending') {
      query = query.ilike('category', filter);
    }
    
    const { data, error } = await query
      .order('published_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },
  staleTime: 1000 * 60 * 2,
});
```

Key changes:
- `queryKey` includes `filter` so each category has its own cache
- Uses `.ilike('category', filter)` for case-insensitive DB-level matching (`prediksi` matches `Prediksi`)
- Trending filter still fetches all articles (client-side region filtering remains)

**Client-side filter** (lines 102-108): Simplify since DB already filters for category routes:

```typescript
const filteredArticles = isTrending
  ? activeRegion === 'indonesia'
    ? (allArticles || []).filter(isIndonesianArticle)
    : (allArticles || []).filter(isInternationalArticle)
  : allArticles || [];
```

No other files need changes.

### Summary
- 1 file changed: `src/pages/Berita.tsx`
- Query now filters by category at DB level (case-insensitive)
- All 88 prediksi articles become accessible (up to limit of 50 per page)
- Trending route unchanged
- No breaking changes to other routes

