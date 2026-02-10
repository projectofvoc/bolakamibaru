
# Sembunyikan Widget di Halaman CMS

## Perubahan

Di `src/components/PointsWidget.tsx`, tambahkan pengecekan `useLocation()` dari `react-router-dom`. Jika path dimulai dengan `/cms`, return `null` sehingga widget tidak di-render.

## Detail Teknis

| File | Perubahan |
|------|----------|
| `src/components/PointsWidget.tsx` | Import `useLocation`, tambahkan early return jika `pathname.startsWith('/cms')` |

Kode yang ditambahkan di awal komponen:

```typescript
import { useNavigate, useLocation } from 'react-router-dom';

// Di dalam komponen:
const location = useLocation();
if (location.pathname.startsWith('/cms')) return null;
```

Sederhana dan efektif -- widget tetap muncul di semua halaman publik (home, artikel, liga, klasemen, rewards) tapi tersembunyi di seluruh area admin CMS.
