

## Ganti Link LIVE ke ayonontonbola.xyz

### Problem
Link tombol LIVE di header saat ini mengarah ke `https://stream.bolakami.com/`. Perlu diganti ke `https://ayonontonbola.xyz`.

### Changes

**1. Database: Update `nav_items` table**
- Update path untuk item "Live" di tabel `nav_items` menjadi `https://ayonontonbola.xyz`

```sql
UPDATE public.nav_items SET path = 'https://ayonontonbola.xyz' WHERE label_id = 'Live';
```

**2. Frontend fallback: `src/components/Header.tsx` (line 167)**
- Ubah fallback URL dari `https://stream.bolakami.com/` ke `https://ayonontonbola.xyz`

| File | Perubahan |
|------|-----------|
| DB `nav_items` | Update path Live → `https://ayonontonbola.xyz` |
| `src/components/Header.tsx` | Update fallback URL line 167 |

