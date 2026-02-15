
# Fix: Klasemen Liga 1 dan Liga 2 Kosong

## Akar Masalah

API Football yang digunakan untuk liga Indonesia menggunakan **paket gratis** yang hanya mendukung data season **2022-2024**. Saat kita meminta season 2025, API mengembalikan error:

> "Free plans do not have access to this season, try from 2022 to 2024."

Response kosong ini kemudian **di-cache selama 30 menit**, sehingga semua request berikutnya juga menampilkan data kosong.

## Solusi

### File: `supabase/functions/sportmonks-standings/index.ts`

**1. Jangan cache response kosong dari API Football**

Saat ini, meski standings kosong (karena error API), hasilnya tetap di-cache. Ubah logika agar hanya meng-cache jika ada data valid:

```
if (!result || result.standings.length === 0) {
  // Return langsung tanpa cache
  return response kosong;
}
```

Ini berarti request berikutnya akan mencoba fetch ulang alih-alih mengembalikan data kosong dari cache.

**2. Tambahkan fallback ke season sebelumnya**

Jika season 2025 gagal (karena limitasi API), otomatis coba lagi dengan season 2024. Ini memastikan user tetap bisa melihat data terakhir yang tersedia.

Alur baru:
1. Coba fetch season 2025
2. Jika gagal/kosong, coba fetch season 2024
3. Jika masih gagal, tampilkan pesan bahwa data belum tersedia

**3. Hapus cache kosong yang sudah tersimpan**

Hapus entry cache `standings:liga-1:2025` dan `standings:liga-2:2025` yang saat ini menyimpan data kosong, agar perubahan langsung terasa.

### File: `src/hooks/useStandings.ts`

**4. Update default seasonStartYear**

Ubah default `seasonStartYear` dari 2025 ke 2024 untuk liga Indonesia, agar sesuai dengan batasan API Football paket gratis.

## Detail Teknis

| Perubahan | File | Deskripsi |
|-----------|------|-----------|
| Skip cache jika kosong | `sportmonks-standings/index.ts` | Tidak cache standings kosong akibat error |
| Season fallback | `sportmonks-standings/index.ts` | Coba season-1 jika season target gagal |
| Hapus stale cache | Database migration | DELETE dari api_cache untuk liga-1/liga-2 kosong |
| Default season | `useStandings.ts` | Gunakan 2024 sebagai default untuk liga Indo |

## Catatan Penting

Jika ingin data season 2025, perlu **upgrade paket API Football** ke paket berbayar. Solusi ini adalah workaround agar data terakhir yang tersedia tetap ditampilkan.
