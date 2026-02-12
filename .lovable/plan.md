
# Fix: Format Session ID Predicto Widget

## Masalah
Session ID saat ini menggunakan `crypto.randomUUID()` (format UUID). User meminta format `"bok-" + Date.now()`.

## Perubahan

### File: `src/components/AICompanion.tsx` (baris 28)

Ganti:
```typescript
const newId = crypto.randomUUID();
```

Menjadi:
```typescript
const newId = `bok-${Date.now()}`;
```

Hanya 1 baris yang berubah. Logic localStorage dan pengiriman `sessionId` di request body tetap sama.
