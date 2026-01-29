

## Rencana Implementasi: Caching Website BOLAKAMI

### Prinsip Utama
- **Tidak mengubah struktur data yang sudah ada**
- **Tidak mengubah return type dari hooks**
- **Hanya menambahkan layer caching tanpa mengubah logic bisnis**

---

### Fase 1: Frontend Caching (React Query)

#### 1.1 Buat QueryClient Terpusat

**File baru: `src/lib/queryClient.ts`**

Konfigurasi default caching:
- `staleTime`: 2 menit (data dianggap fresh)
- `gcTime`: 30 menit (data disimpan di memory)
- `refetchOnWindowFocus`: false (tidak refetch saat focus window)
- `retry`: 2 (retry 2x jika gagal)

#### 1.2 Update App.tsx

Import QueryClient dari file baru, menggantikan inline definition.

#### 1.3 Tambah staleTime ke Queries yang Ada

| Component/Hook | staleTime | Alasan |
|----------------|-----------|--------|
| `HeroDashboard.tsx` (articles) | 2 menit | Fresh tapi tidak terlalu sering |
| `NewsGrid.tsx` | 3 menit | Content jarang berubah |
| `MoreNewsGrid.tsx` | 3 menit | Content jarang berubah |
| `Berita.tsx` | 2 menit | Halaman listing |
| `NewsDetail.tsx` | 5 menit | Artikel individual |
| `PopularNewsSidebar.tsx` | 5 menit | Popular articles |

#### 1.4 Refactor useLiveScores.ts

**Perubahan struktur (tetap menjaga return type yang sama):**

```typescript
// SEBELUM (useState/useEffect manual)
const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 60000);
  return () => clearInterval(interval);
}, []);
return { liveMatches, loading, error, refetch };

// SESUDAH (React Query dengan interval)
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['live-scores', leagueId],
  queryFn: fetchLiveScores,
  staleTime: 30 * 1000,      // 30 detik
  refetchInterval: 60 * 1000, // Auto refetch setiap 60 detik
});
return { 
  liveMatches: data ?? [], // Tetap return array kosong jika undefined
  loading: isLoading, 
  error, 
  refetch 
};
```

**Return type tetap identik** - komponen yang menggunakan hook ini tidak perlu diubah.

---

### Fase 2: Server-Side Caching (Database)

#### 2.1 Buat Tabel api_cache

**Migration SQL:**

```sql
-- Tabel untuk menyimpan cache API responses
CREATE TABLE IF NOT EXISTS public.api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk lookup cepat
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache(expires_at);

-- RLS: Disable karena hanya diakses dari Edge Functions dengan service role
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Policy untuk service role (Edge Functions)
CREATE POLICY "Service role can manage cache" ON public.api_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Function untuk cleanup expired cache (bisa dipanggil secara periodik)
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.api_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
```

**Tabel ini sepenuhnya baru dan tidak mempengaruhi tabel yang sudah ada.**

---

### Fase 3: Edge Functions Caching

#### 3.1 Helper Function Pattern

Setiap Edge Function akan menggunakan pattern yang sama:

```typescript
// Cache helper - ditambahkan di setiap Edge Function
async function getCachedOrFetch<T>(
  supabaseClient: any,
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  // 1. Check cache
  const { data: cached } = await supabaseClient
    .from('api_cache')
    .select('cache_value')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return { data: cached.cache_value as T, fromCache: true };
  }
  
  // 2. Fetch fresh data
  console.log(`[Cache MISS] ${cacheKey}`);
  const freshData = await fetchFn();
  
  // 3. Store in cache (upsert)
  await supabaseClient.from('api_cache').upsert({
    cache_key: cacheKey,
    cache_value: freshData,
    expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  }, { onConflict: 'cache_key' });
  
  return { data: freshData, fromCache: false };
}
```

#### 3.2 Edge Functions yang Diupdate

| Edge Function | Cache Key | TTL | Catatan |
|---------------|-----------|-----|---------|
| `sportmonks-livescore` | `livescore:{date}` | 30 detik | Data live |
| `apifootball-livescore` | `apifb-livescore:{date}` | 30 detik | Fallback API |
| `sportmonks-standings` | `standings:{leagueId}:{seasonId}` | 30 menit | Klasemen |
| `sportmonks-fixtures` | `fixtures:{leagueId}:{date}` | 5 menit | Jadwal |

**Response format tidak berubah** - frontend tidak perlu dimodifikasi untuk menerima response.

---

### Daftar File yang Dimodifikasi

| File | Aksi | Perubahan |
|------|------|-----------|
| `src/lib/queryClient.ts` | **Create** | QueryClient dengan default config |
| `src/App.tsx` | Modify | Import queryClient dari lib |
| `src/hooks/useLiveScores.ts` | Modify | Migrate ke React Query (return type sama) |
| `src/components/HeroDashboard.tsx` | Modify | Tambah staleTime: 2 menit |
| `src/components/NewsGrid.tsx` | Modify | Tambah staleTime: 3 menit |
| `src/components/MoreNewsGrid.tsx` | Modify | Tambah staleTime: 3 menit |
| `src/components/PopularNewsSidebar.tsx` | Modify | Tambah staleTime: 5 menit |
| `src/pages/Berita.tsx` | Modify | Tambah staleTime: 2 menit |
| `src/pages/NewsDetail.tsx` | Modify | Tambah staleTime: 5 menit |
| `supabase/functions/sportmonks-livescore/index.ts` | Modify | Tambah caching layer |
| `supabase/functions/apifootball-livescore/index.ts` | Modify | Tambah caching layer |
| `supabase/functions/sportmonks-standings/index.ts` | Modify | Tambah caching layer |
| `supabase/functions/sportmonks-fixtures/index.ts` | Modify | Tambah caching layer |
| **Migration** | **Create** | Tabel api_cache + cleanup function |

---

### Jaminan Keamanan Data

1. **Tabel yang ada tidak disentuh**: articles, users, dll tetap utuh
2. **Return types identik**: Semua hook mengembalikan data dalam format yang sama
3. **Fallback ke fresh data**: Jika cache gagal, sistem tetap fetch data baru
4. **Graceful degradation**: Error caching tidak menghentikan aplikasi

---

### Estimasi Hasil

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| API Calls ke Sportmonks | Setiap request | Berkurang ~90% |
| Load time (repeat visit) | 2-3 detik | 0.5-1 detik |
| API quota usage | Tinggi | Sangat rendah |
| Data freshness | Real-time | Max 30s-30min delay |

