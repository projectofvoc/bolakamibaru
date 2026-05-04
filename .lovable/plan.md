## Tujuan

Membuat akun baru `headcreativedepartment@gmail.com` dengan password `Head1984!` dan memberinya role **admin** (super admin) — setara dengan akun admin utama Bolakami, sehingga punya akses penuh ke seluruh menu CMS (Dashboard, Analytics, Articles, Moments, Liga, Read to Earn, Advertise, Banners, Navigation, Social Media, OG Preview, API, Users, Bot Sender, Integrations).

## Konteks Hasil Pengecekan

Saat saya cek database (`auth.users` join `public.user_roles`), **tidak ada baris** untuk `headcreativedepartment@gmail.com` maupun `admin@bolakami.com`. Artinya:

- Akun `headcreativedepartment@gmail.com` memang belum ada → harus dibuat dari nol.
- Akun referensi yang Anda sebut (`admin@bolakami.com`) juga tidak terdaftar dengan email persis itu. Kemungkinan email super admin asli Anda berbeda (mis. tanpa `@bolakami.com`, atau `admin@bolakami.work`). Hal ini tidak menghalangi pembuatan akun baru — saya akan tetap memberi role `admin` penuh, yang merupakan level tertinggi pada sistem RBAC project ini (enum: `admin` > `author` > `user`).

## Langkah Implementasi

### 1. Eksekusi pembuatan user via Supabase Admin API

Jalankan skrip Node sekali-pakai (`/tmp/create-admin.ts`) di sandbox yang:

a. Memakai `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (sudah tersedia sebagai secret).
b. Memanggil `supabaseAdmin.auth.admin.createUser({ email: 'headcreativedepartment@gmail.com', password: 'Head1984!', email_confirm: true })` — `email_confirm: true` agar user bisa langsung login tanpa proses verifikasi email.
c. Insert ke `public.user_roles` `{ user_id: <id baru>, role: 'admin' }`.
d. Idempotent: jika user sudah ada (error "already registered"), lewati pembuatan dan langsung pastikan baris role `admin` ada (insert dengan `ON CONFLICT (user_id, role) DO NOTHING` style — atau cek dulu lalu insert).

### 2. Verifikasi

Setelah skrip jalan, query verifikasi:

```sql
SELECT u.email, u.email_confirmed_at, array_agg(ur.role) AS roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'headcreativedepartment@gmail.com'
GROUP BY u.email, u.email_confirmed_at;
```

Harus mengembalikan: email terkonfirmasi (`email_confirmed_at` ≠ null) dan `roles` mengandung `admin`.

### 3. Konfirmasi ke user

Beri tahu Anda bahwa akun siap dipakai untuk login di `/auth` dengan kredensial yang Anda berikan, dan akan otomatis bisa membuka `/cms` plus seluruh menu Admin (termasuk halaman **Users** untuk mengelola akun lain ke depannya).

## Catatan Keamanan

- Password `Head1984!` akan disimpan ter-hash oleh Supabase Auth (bcrypt). Saya tidak akan mencatat / log plaintext password.
- Setelah login pertama, sangat disarankan Anda mengganti password dari halaman akun untuk mengurangi risiko (password ini sudah saya lihat di chat).
- Tidak ada perubahan schema database — hanya **data insert** ke `auth.users` (via Admin API) dan `public.user_roles`. Tidak perlu migrasi.

## File yang Akan Dibuat/Diubah

- `(/tmp only)` skrip eksekusi sekali-pakai — **tidak** masuk ke repo project. Tidak ada file source code project yang perlu diubah.
