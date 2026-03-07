

## Problem: Case Mismatch

The database stores category as `"Prediksi"` (capital P), but the filter ID is `"prediksi"` (lowercase). The comparison `a.category === filter` is case-sensitive, so no articles match.

**Database evidence:**
- 88 published articles with `category = 'Prediksi'`
- Filter ID used: `'prediksi'`
- `'prediksi' === 'Prediksi'` → `false` → zero results

## Fix

**`src/pages/Berita.tsx`** -- Change the category comparison to be case-insensitive:

```typescript
: filter
  ? (allArticles || []).filter(a => a.category?.toLowerCase() === filter.toLowerCase())
  : allArticles || [];
```

This single change fixes the prediksi filter and also future-proofs any other category filters that might have casing differences.

No other files need changes -- `MoreNewsGrid.tsx` already uses `.eq('category', category)` with the value from `article.category` (which comes from the DB with correct casing), so related content will work correctly.

