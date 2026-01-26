
## Rencana: Kontrol Akses CMS Berdasarkan Role

### Masalah yang Ditemukan

1. **Tombol CMS muncul untuk semua user yang login**
   - Saat ini di `Header.tsx`, kondisi hanya `{user ? ...}` - artinya semua user yang login akan melihat tombol CMS
   - Seharusnya hanya user dengan role `admin` atau `author` yang bisa melihat tombol CMS

2. **CMSUsers.tsx memerlukan User ID (UUID) untuk menambah role**
   - Ini tidak praktis karena admin harus mencari UUID user terlebih dahulu
   - Request: Admin ingin menambahkan user baru dengan email dan password langsung

### Data Saat Ini di Database

| Email | User ID | Roles |
|-------|---------|-------|
| adminbolakami@gmail.com | 6c392d67-... | admin, author |
| volkmanxd@gmail.com | b5f38442-... | (tidak ada) |

### Solusi yang Akan Diimplementasikan

#### A. Header.tsx - Sembunyikan Tombol CMS untuk User Biasa

**Perubahan:**
1. Tambahkan query untuk mengambil roles user yang sedang login
2. Kondisi tombol CMS berubah dari `{user ? ...}` menjadi `{user && hasAccess ? ...}`
3. `hasAccess` = user memiliki role `admin` atau `author`

**Kode:**
```typescript
// Tambah query untuk cek role user
const { data: userRoles = [] } = useQuery({
  queryKey: ['user-roles', user?.id],
  queryFn: async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    if (error) throw error;
    return data;
  },
  enabled: !!user,
});

const hasCMSAccess = userRoles.some(r => 
  r.role === 'admin' || r.role === 'author'
);

// Ubah kondisi render tombol CMS
{hasCMSAccess && (
  <a href="/cms" ...>
    <Settings />
    <span>CMS</span>
  </a>
)}
```

#### B. CMSUsers.tsx - Tambah User Baru dengan Email + Password

**Flow Baru untuk Menambah CMS User:**

```text
┌─────────────────────────────────────────────────────────────┐
│  OPSI 1: Tambah User Baru (Create Account)                  │
│  ─────────────────────────────────────────                  │
│  1. Admin input email + password + role                     │
│  2. Sistem membuat akun baru via Supabase Admin API         │
│  3. Sistem otomatis assign role ke user baru                │
│  4. User baru bisa login dengan email/password tersebut     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  OPSI 2: Assign Role ke User Existing                       │
│  ─────────────────────────────────────                      │
│  1. Admin input email user yang sudah ada                   │
│  2. Sistem cari user di database berdasarkan email          │
│  3. Jika ditemukan, assign role baru                        │
└─────────────────────────────────────────────────────────────┘
```

**Perubahan yang Diperlukan:**

1. **Buat Edge Function `admin-create-user`**
   - Menggunakan Supabase Admin API dengan `SUPABASE_SERVICE_ROLE_KEY`
   - Menerima: email, password, role
   - Membuat user baru dengan `auth.admin.createUser()`
   - Otomatis insert role ke `user_roles` table
   - Hanya bisa dipanggil oleh user dengan role `admin`

2. **Update CMSUsers.tsx**
   - Tambah form untuk create user baru (email + password + role)
   - Tambah form untuk assign role ke existing user (email + role)
   - Tampilkan email user di list, bukan hanya UUID

#### C. Tampilkan Email di List User Roles

**Masalah:** Saat ini `CMSUsers.tsx` hanya menampilkan User ID (UUID) yang tidak informatif

**Solusi:** 
- Edge function baru `get-users-with-roles` yang join `user_roles` dengan `auth.users` 
- Return data dengan format: `{ user_id, email, role, created_at }`

### File yang Akan Dibuat/Dimodifikasi

| File | Aksi | Deskripsi |
|------|------|-----------|
| `src/components/Header.tsx` | Modify | Tambah role check, sembunyikan CMS button untuk user biasa |
| `src/pages/cms/CMSUsers.tsx` | Modify | Form create user + tampilkan email |
| `supabase/functions/admin-create-user/index.ts` | Create | Edge function untuk create user dengan admin API |
| `supabase/functions/get-cms-users/index.ts` | Create | Edge function untuk get users dengan email |

### Keamanan

1. **Edge function `admin-create-user` hanya bisa diakses oleh admin**
   - Validasi JWT token
   - Cek role user = `admin` sebelum proses

2. **RLS policies sudah ada di `user_roles`**
   - Hanya admin yang bisa manage roles
   - User biasa hanya bisa view role sendiri

### Ringkasan Perubahan User Experience

**Sebelum:**
- Login dengan akun apapun -> Tombol CMS muncul
- CMSUsers memerlukan UUID untuk tambah role

**Sesudah:**
- Login dengan akun biasa -> Tombol CMS **TIDAK** muncul
- Login dengan `adminbolakami@gmail.com` -> Tombol CMS muncul
- CMSUsers bisa:
  1. Buat akun CMS baru dengan email + password
  2. Assign role ke user existing dengan email
  3. Lihat list user dengan email (bukan UUID)
