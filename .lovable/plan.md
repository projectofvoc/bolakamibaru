
# Plan: Read to Earn | BOLAKAMI

## Ringkasan
Membangun sistem gamifikasi "Read to Earn" yang memungkinkan user mendapatkan poin dari aktivitas di platform BOLAKAMI (daily check-in, membaca berita, waktu aktif), kemudian poin dapat ditukarkan dengan hadiah/reward.

---

## Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐    │
│  │  Daily Check-in  │  │  Points Widget   │  │    Rewards Page        │    │
│  │     Pop-up       │  │   (Floating)     │  │  /rewards              │    │
│  │                  │  │                  │  │                        │    │
│  │  - Auto-show     │  │  - Points total  │  │  - Progress tracker    │    │
│  │  - 1x per day    │  │  - Loading ring  │  │  - Rewards catalog     │    │
│  │  - +1 point      │  │  - Time tracker  │  │  - Redemption history  │    │
│  └──────────────────┘  └──────────────────┘  └────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE DATABASE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  user_points    │  │  user_checkins   │  │    rewards               │   │
│  │                 │  │                  │  │                          │   │
│  │  - user_id      │  │  - user_id       │  │  - id, name, image       │   │
│  │  - total_points │  │  - checkin_date  │  │  - points_required       │   │
│  │  - updated_at   │  │  - points_earned │  │  - stock, is_active      │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────────────┘   │
│                                                                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  point_history  │  │  user_activity   │  │    reward_redemptions    │   │
│  │                 │  │                  │  │                          │   │
│  │  - user_id      │  │  - user_id       │  │  - user_id, reward_id    │   │
│  │  - points       │  │  - session_id    │  │  - points_spent          │   │
│  │  - source       │  │  - active_mins   │  │  - status                │   │
│  │  - created_at   │  │  - last_activity │  │  - created_at            │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CMS ADMIN                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        /cms/read-to-earn                              │  │
│  │                                                                       │  │
│  │  Tabs:                                                                │  │
│  │  [Dashboard] [Rewards] [Users] [Settings]                             │  │
│  │                                                                       │  │
│  │  - Analytics (total points distributed, redemptions, active users)    │  │
│  │  - Manage rewards (CRUD + stock management)                           │  │
│  │  - Monitor user progress dan points                                   │  │
│  │  - Configure point values (check-in, read time)                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### 1. Tabel `user_points` - Total poin user
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users, UNIQUE |
| total_points | integer | Default 0 |
| created_at | timestamp | |
| updated_at | timestamp | |

### 2. Tabel `user_checkins` - Rekam check-in harian
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | |
| checkin_date | date | UNIQUE constraint dengan user_id |
| points_earned | integer | Default 1 |
| created_at | timestamp | |

### 3. Tabel `point_history` - Log semua transaksi poin
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | |
| points | integer | Positif = dapat, negatif = redeem |
| source | text | 'checkin', 'read_time', 'redemption' |
| description | text | Keterangan detail |
| created_at | timestamp | |

### 4. Tabel `user_activity` - Track waktu aktif per sesi
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | |
| session_id | text | Session identifier |
| active_minutes | integer | Akumulasi menit aktif |
| last_activity_at | timestamp | |
| points_awarded | integer | Poin yang sudah diberikan untuk sesi ini |
| created_at | timestamp | |

### 5. Tabel `rewards` - Katalog hadiah
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Nama reward |
| description | text | Deskripsi |
| image_url | text | Gambar reward |
| points_required | integer | Poin yang dibutuhkan |
| stock | integer | Stok tersedia |
| is_active | boolean | |
| sort_order | integer | |
| created_at | timestamp | |

### 6. Tabel `reward_redemptions` - Histori penukaran
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | |
| reward_id | uuid | |
| points_spent | integer | |
| status | text | 'pending', 'approved', 'shipped', 'completed', 'rejected' |
| admin_notes | text | Catatan admin |
| created_at | timestamp | |
| updated_at | timestamp | |

### 7. Tabel `rte_settings` - Konfigurasi sistem
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| key | text | UNIQUE, e.g. 'checkin_points', 'read_time_minutes', 'read_time_points' |
| value | text | Nilai konfigurasi |
| updated_at | timestamp | |

---

## Komponen Frontend

### 1. Daily Check-in Pop-up
**File**: `src/components/DailyCheckinPopup.tsx`

Logika:
- Tampil otomatis saat user login dan belum check-in hari ini
- Cek tabel `user_checkins` apakah ada record untuk hari ini
- Jika belum, tampilkan pop-up dengan tombol "Klaim Poin"
- Setelah klaim, insert ke `user_checkins` dan update `user_points`
- Reset setiap pergantian hari (00:00 WIB)

UI:
- Modal dengan animasi
- Ikon kalender/gift
- Tampilkan streak check-in
- Tombol "Klaim +1 Poin"

### 2. Floating Points Widget
**File**: `src/components/PointsWidget.tsx`

Lokasi: Pojok kanan bawah, persistent di semua halaman

UI:
- Circular progress ring (menunjukkan progress menuju poin berikutnya)
- Total poin di tengah
- Logo BOLAKAMI mini
- Animasi loading saat tracking waktu
- Click → navigasi ke `/rewards`

Logika waktu aktif:
- Track waktu aktif user menggunakan visibility API
- Setiap 60 menit (konfigurasi dari CMS) → award 1 poin
- Progress bar menunjukkan persentase menuju poin berikutnya
- Simpan state di `user_activity`

### 3. Rewards Page
**File**: `src/pages/Rewards.tsx`

Sections:
- **Header**: Total poin, level user
- **Progress Card**: Check-in streak, waktu aktif hari ini
- **Rewards Grid**: Daftar hadiah yang bisa diredeem
- **History**: Riwayat penukaran dan status

UI:
- Responsive grid (1 kolom mobile, 2-3 kolom desktop)
- Card reward dengan gambar, nama, poin, tombol redeem
- Modal konfirmasi sebelum redeem
- Badge "Stok Habis" jika stock = 0

---

## Komponen CMS

### 1. CMS Read to Earn Dashboard
**File**: `src/pages/cms/CMSReadToEarn.tsx`

Tabs:
1. **Dashboard**
   - Total poin terdistribusi
   - Total redemption
   - Active users
   - Chart trend poin

2. **Rewards Management**
   - CRUD rewards
   - Upload gambar
   - Set poin required
   - Manage stock

3. **User Monitor**
   - Daftar user dengan poin
   - Filter/search
   - Detail histori per user

4. **Redemptions**
   - Daftar pengajuan redeem
   - Update status (approve/reject/shipped)
   - Catatan admin

5. **Settings**
   - Konfigurasi poin check-in
   - Konfigurasi menit untuk read time
   - Poin per read time

---

## Hooks & Services

### 1. useUserPoints Hook
```typescript
// src/hooks/useUserPoints.ts
- Fetch total poin user
- Fetch check-in status hari ini
- Mutation untuk claim check-in
- Real-time subscription untuk update poin
```

### 2. useActivityTracker Hook
```typescript
// src/hooks/useActivityTracker.ts
- Track waktu aktif menggunakan Page Visibility API
- Update setiap 1 menit ke database
- Award poin otomatis saat threshold tercapai
- Persist progress untuk loading ring
```

### 3. useRewards Hook
```typescript
// src/hooks/useRewards.ts
- Fetch daftar rewards
- Mutation untuk redeem
- Fetch histori redemption user
```

---

## File yang Akan Dibuat/Dimodifikasi

### File Baru:
1. `src/components/DailyCheckinPopup.tsx` - Pop-up check-in harian
2. `src/components/PointsWidget.tsx` - Floating widget poin
3. `src/pages/Rewards.tsx` - Halaman rewards & redeem
4. `src/pages/cms/CMSReadToEarn.tsx` - CMS management
5. `src/hooks/useUserPoints.ts` - Hook poin user
6. `src/hooks/useActivityTracker.ts` - Hook track aktivitas
7. `src/hooks/useRewards.ts` - Hook rewards

### File Dimodifikasi:
1. `src/App.tsx` - Tambah route `/rewards`
2. `src/pages/Index.tsx` - Tambah `<PointsWidget />` dan `<DailyCheckinPopup />`
3. `src/pages/cms/CMSLayout.tsx` - Tambah menu "Read to Earn"
4. `src/pages/cms/index.ts` - Export CMSReadToEarn
5. `src/contexts/LanguageContext.tsx` - Tambah translations

---

## Flow Detail

### Daily Check-in Flow:
```text
User Login
    ↓
Check user_checkins WHERE user_id = X AND checkin_date = TODAY
    ↓
┌─ Belum ada record ───────────────────┐
│                                      │
│  Show Daily Check-in Pop-up          │
│           ↓                          │
│  User Click "Klaim"                  │
│           ↓                          │
│  INSERT user_checkins                │
│  INSERT point_history                │
│  UPDATE user_points.total_points += 1│
│           ↓                          │
│  Show Success Animation              │
│  Close Pop-up                        │
│                                      │
└──────────────────────────────────────┘
    
┌─ Sudah ada record ───────────────────┐
│  Don't show pop-up                   │
└──────────────────────────────────────┘
```

### Read Time Earning Flow:
```text
User Di Platform (logged in)
    ↓
Page Visibility = visible
    ↓
Start/Resume Timer
    ↓
Every 1 minute → Update user_activity.active_minutes
    ↓
Check: active_minutes >= threshold (e.g., 60)?
    ↓
┌─ YES ────────────────────────────────┐
│  Award Point:                        │
│  - INSERT point_history              │
│  - UPDATE user_points                │
│  - UPDATE user_activity.points_awarded│
│  - Reset active_minutes              │
│  - Show notification                 │
└──────────────────────────────────────┘
    ↓
Continue tracking for next point
```

### Redemption Flow:
```text
User di /rewards
    ↓
Click "Redeem" pada reward
    ↓
Check: user_points >= reward.points_required?
    ↓
┌─ YES ────────────────────────────────┐
│  Show Confirmation Modal             │
│           ↓                          │
│  User Confirm                        │
│           ↓                          │
│  INSERT reward_redemptions           │
│  INSERT point_history (negative)     │
│  UPDATE user_points                  │
│  UPDATE rewards.stock -= 1           │
│           ↓                          │
│  Show Success, update UI             │
└──────────────────────────────────────┘
    
┌─ NO ─────────────────────────────────┐
│  Show "Poin tidak cukup" message     │
└──────────────────────────────────────┘
```

---

## RLS Policies

### user_points
- SELECT: `user_id = auth.uid()` (user lihat poin sendiri) + admin lihat semua
- UPDATE: Hanya via database function (trigger)
- INSERT: Hanya via database function

### user_checkins
- SELECT: `user_id = auth.uid()` + admin
- INSERT: `user_id = auth.uid()` (user hanya bisa insert untuk diri sendiri)

### rewards
- SELECT: `is_active = true` (public) + admin lihat semua
- INSERT/UPDATE/DELETE: Admin only

### reward_redemptions
- SELECT: `user_id = auth.uid()` + admin
- INSERT: `user_id = auth.uid()`
- UPDATE: Admin only (untuk update status)

---

## Estimasi Implementasi

| Task | Estimasi |
|------|----------|
| Database schema + migrations | 15-20 menit |
| DailyCheckinPopup component | 15 menit |
| PointsWidget component | 20-25 menit |
| Rewards page | 25-30 menit |
| CMS Read to Earn page | 30-40 menit |
| Hooks (points, activity, rewards) | 20 menit |
| Integration & testing | 15 menit |
| **Total** | **~2.5-3 jam** |

---

## Catatan Penting

1. **Mobile Responsive**: Semua komponen menggunakan Tailwind responsive prefixes
2. **Widget Fixed Position**: `fixed bottom-4 right-4 z-50` untuk persistent widget
3. **Activity Tracking**: Menggunakan `visibilitychange` event dan `setInterval`
4. **Safe Area**: Widget akan respect safe-area-inset untuk iPhone notch
5. **Color Scheme**: Mengikuti tema BOLAKAMI (primary green #4ade80, dark background)
