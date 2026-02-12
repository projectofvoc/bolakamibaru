
# Tambah Session ID pada Widget Predicto

## Ringkasan
Generate `sessionId` unik sekali saat user pertama kali membuka chat Predicto. Session ID disimpan di `localStorage` agar persist antar refresh, dan dikirim di setiap request ke endpoint Predicto Widget.

## Perubahan

### File: `src/components/AICompanion.tsx`

**1. Generate dan simpan sessionId**

Saat komponen pertama kali mount, cek apakah sudah ada `sessionId` di `localStorage`. Jika belum, generate UUID baru dan simpan.

```typescript
const [sessionId] = useState<string>(() => {
  const STORAGE_KEY = 'predicto_session_id';
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
});
```

Setiap user/browser akan mendapat `sessionId` unik yang berbeda dan persist selama `localStorage` tidak dihapus.

**2. Kirim sessionId di setiap request**

Tambahkan `sessionId` ke request body di fungsi `callOpenAI`:

```json
{
  "message": "...",
  "sessionId": "a1b2c3d4-...",
  "conversationHistory": [...],
  "match_data": { ... },
  "is_live_analysis": true,
  "mode": "analisa"
}
```

## Detail Teknis

| Komponen | Perubahan |
|----------|-----------|
| State initialization | `useState` dengan lazy init dari `localStorage` |
| `localStorage` key | `predicto_session_id` |
| ID format | UUID v4 via `crypto.randomUUID()` |
| `callOpenAI` body | Tambah field `sessionId` |

Hanya satu file yang perlu diubah: `src/components/AICompanion.tsx`.
