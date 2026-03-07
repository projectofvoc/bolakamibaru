

## Plan: Fix Prediksi Route Filtering

### Problem
Line 102-106 in `Berita.tsx`: `filteredArticles` only filters for `trending` (by region). For all other filters including `prediksi`, it returns **all articles** unfiltered.

### Schema Confirmation
Articles table has `category` field (text, default `'daily'`). The `filterTypes` array in `Berita.tsx` includes `prediksi` as a filter value. Prediction articles use `category = 'prediksi'`.

### Changes

#### 1. `src/pages/Berita.tsx` -- Fix filteredArticles logic (line 102-106)

Replace the filtering to apply category filter for non-trending filters:

```typescript
const filteredArticles = isTrending
  ? activeRegion === 'indonesia'
    ? (allArticles || []).filter(isIndonesianArticle)
    : (allArticles || []).filter(isInternationalArticle)
  : filter
    ? (allArticles || []).filter(a => a.category === filter)
    : allArticles || [];
```

This fixes `prediksi`, `daily`, and any other category-based filter.

#### 2. `src/components/MoreNewsGrid.tsx` -- Add optional `category` prop

- Accept `category?: string` prop
- When provided, add `.eq('category', category)` to the Supabase query
- Include `category` in `queryKey` for cache separation

#### 3. `src/pages/NewsDetail.tsx` -- Pass category to related news

- Pass `category={article.category}` to `<MoreNewsGrid />` so related articles on a prediksi detail page only show other prediksi articles

### Files changed
- `src/pages/Berita.tsx` -- 1 block (filtering logic)
- `src/components/MoreNewsGrid.tsx` -- Add prop + query filter
- `src/pages/NewsDetail.tsx` -- Pass category prop

### What stays the same
- No database changes needed
- No new routes
- Regular news routes unaffected
- SEO slugs unchanged

