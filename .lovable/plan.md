

## Rencana: Template Khusus Artikel Prediksi di CMS

### Tujuan

Menambahkan fitur template konten untuk artikel Prediksi yang memudahkan penulis membuat artikel dengan struktur standar seperti di bola.net, meliputi:
- Head to Head
- Prediksi Lineup (Starting XI)
- 5 Laga Terakhir
- Prediksi Skor

### Struktur Referensi (bola.net)

Berdasarkan analisis artikel prediksi bola.net:
1. **Intro**: Konteks pertandingan (pekan ke-?, liga, venue, kick-off)
2. **Prediksi Starting XI**: Formasi dan lineup kedua tim
3. **Head to Head**: Statistik pertemuan + 5 laga terakhir masing-masing
4. **Prediksi Skor**: Analisis dan prediksi skor akhir
5. **Jadwal Live Streaming**: Info jadwal pertandingan

### Solusi yang Diusulkan

Menambahkan fitur "Insert Template" di CMSArticleEditor yang akan:
1. Mendeteksi kategori "Prediksi" dan menampilkan tombol khusus
2. Mengisi Rich Text Editor dengan template HTML terstruktur
3. Placeholder yang mudah diisi oleh penulis

### File yang Akan Dimodifikasi/Dibuat

| File | Aksi | Deskripsi |
|------|------|-----------|
| `src/pages/cms/CMSArticleEditor.tsx` | Modify | Tambah tombol "Insert Template Prediksi" dan dialog input tim |
| `src/lib/predictionTemplate.ts` | Create | Helper function untuk generate template HTML |

### Detail Implementasi

#### A. Buat Helper Template (`src/lib/predictionTemplate.ts`)

```typescript
interface PredictionTemplateData {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  matchday: string;
  venue: string;
  kickoffDate: string;
  kickoffTime: string;
}

export const generatePredictionTemplate = (data: PredictionTemplateData): string => {
  return `
<p><strong>Bolakami</strong> - <strong>${data.homeTeam}</strong> akan menjamu <strong>${data.awayTeam}</strong> 
pada ${data.matchday} <strong>${data.competition}</strong>. Pertandingan ini akan berlangsung di ${data.venue}, 
${data.kickoffDate}, pukul ${data.kickoffTime} WIB.</p>

<p>[Tulis konteks pertandingan: tekanan pada kedua tim, performa terakhir, momentum, dll.]</p>

<h2>🎽 Prediksi Starting XI ${data.homeTeam} vs ${data.awayTeam}</h2>

<p>[Tulis analisis kondisi pemain, cedera, dan ketersediaan squad kedua tim]</p>

<p><strong>${data.homeTeam} (Formasi):</strong><br/>
[Kiper]; [Bek 1], [Bek 2], [Bek 3]; [Gelandang 1], [Gelandang 2]; [Winger 1], [Gelandang Serang], [Winger 2]; [Striker]</p>

<p><strong>Pelatih:</strong> [Nama Pelatih]</p>

<p><strong>${data.awayTeam} (Formasi):</strong><br/>
[Kiper]; [Bek 1], [Bek 2], [Bek 3]; [Gelandang 1], [Gelandang 2]; [Winger 1], [Gelandang Serang], [Winger 2]; [Striker]</p>

<p><strong>Pelatih:</strong> [Nama Pelatih]</p>

<h2>📊 Head to Head ${data.homeTeam} vs ${data.awayTeam}</h2>

<p><strong>Catatan pertemuan di ${data.competition}:</strong></p>
<ul>
<li>${data.homeTeam} menang: [X]</li>
<li>Seri: [X]</li>
<li>${data.awayTeam} menang: [X]</li>
</ul>

<p><strong>5 pertemuan terakhir:</strong></p>
<ul>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
</ul>

<h2>📈 5 Laga Terakhir</h2>

<p><strong>5 laga terakhir ${data.homeTeam}:</strong></p>
<ul>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
</ul>

<p><strong>5 laga terakhir ${data.awayTeam}:</strong></p>
<ul>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
<li>[DD/MM/YY] [Tim A] [Skor] [Tim B]</li>
</ul>

<h2>🎯 Prediksi Skor ${data.homeTeam} vs ${data.awayTeam}</h2>

<p>[Tulis analisis mendalam: kekuatan dan kelemahan kedua tim, faktor kunci, prediksi jalannya pertandingan]</p>

<p><strong>Prediksi skor akhir: ${data.homeTeam} [X] - [X] ${data.awayTeam}</strong></p>

<h2>📺 Jadwal Live Streaming</h2>
<ul>
<li><strong>Kompetisi:</strong> ${data.competition}</li>
<li><strong>Pertandingan:</strong> ${data.homeTeam} vs ${data.awayTeam}</li>
<li><strong>Tempat:</strong> ${data.venue}</li>
<li><strong>Hari, tanggal:</strong> ${data.kickoffDate}</li>
<li><strong>Jam kick-off:</strong> ${data.kickoffTime} WIB</li>
<li><strong>Live streaming:</strong> [Platform]</li>
</ul>
`;
};
```

#### B. Update CMSArticleEditor.tsx

Perubahan yang akan dilakukan:

1. **Tambah State Baru:**
```typescript
const [showPredictionTemplate, setShowPredictionTemplate] = useState(false);
const [predictionData, setPredictionData] = useState({
  homeTeam: '',
  awayTeam: '',
  competition: '',
  matchday: '',
  venue: '',
  kickoffDate: '',
  kickoffTime: '',
});
```

2. **Tambah Tombol "Use Template" di Card Konten:**
Akan muncul ketika kategori adalah "Prediksi"
```tsx
{form.category === 'Prediksi' && (
  <Button 
    type="button"
    variant="outline"
    onClick={() => setShowPredictionTemplate(true)}
    className="gap-2"
  >
    <Target className="w-4 h-4" />
    Gunakan Template Prediksi
  </Button>
)}
```

3. **Tambah Dialog Input Data Pertandingan:**
Modal dengan form untuk mengisi:
- Tim Tuan Rumah
- Tim Tamu
- Kompetisi/Liga
- Pekan ke-
- Venue/Stadion
- Tanggal Pertandingan
- Waktu Kick-off

4. **Handler untuk Insert Template:**
```typescript
const handleInsertPredictionTemplate = () => {
  const templateContent = generatePredictionTemplate(predictionData);
  setForm(prev => ({ ...prev, content_id: templateContent }));
  
  // Auto-generate title
  const autoTitle = `Prediksi ${predictionData.homeTeam} vs ${predictionData.awayTeam} ${predictionData.kickoffDate}`;
  setForm(prev => ({ ...prev, title_id: autoTitle }));
  
  setShowPredictionTemplate(false);
  toast({ title: 'Template berhasil diterapkan!' });
};
```

### UI Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│  CMSArticleEditor                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Kategori: [Prediksi ▼]                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🇮🇩 Konten Artikel                                       │    │
│  │                                                          │    │
│  │ Judul *: [________________________________]              │    │
│  │                                                          │    │
│  │ Ringkasan: [______________________________]              │    │
│  │                                                          │    │
│  │ ┌──────────────────────────────────────────────────┐    │    │
│  │ │ [🎯 Gunakan Template Prediksi]                   │    │    │
│  │ └──────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │ Konten *:                                                │    │
│  │ ┌──────────────────────────────────────────────────┐    │    │
│  │ │ [Rich Text Editor]                               │    │    │
│  │ │ ...template akan di-insert di sini...            │    │    │
│  │ └──────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Dialog: Input Data Pertandingan                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tim Tuan Rumah *: [Manchester United        ]                  │
│  Tim Tamu *:       [Chelsea                   ]                  │
│  Kompetisi *:      [Premier League            ]                  │
│  Pekan ke-:        [Pekan ke-5               ]                  │
│  Stadion/Venue *:  [Old Trafford             ]                  │
│  Tanggal:          [Sabtu, 20 September 2025 ]                  │
│  Waktu Kick-off:   [23:30                    ]                  │
│                                                                  │
│                           [Batal]  [Terapkan Template]          │
└─────────────────────────────────────────────────────────────────┘
```

### Hasil Template yang Dihasilkan

Setelah penulis mengisi data pertandingan, konten editor akan terisi dengan:

1. **Intro paragraph** dengan placeholder untuk konteks
2. **Heading "Prediksi Starting XI"** dengan placeholder lineup
3. **Heading "Head to Head"** dengan struktur statistik
4. **Heading "5 Laga Terakhir"** dengan bullet points
5. **Heading "Prediksi Skor"** dengan placeholder analisis
6. **Heading "Jadwal Live Streaming"** dengan info pertandingan

Penulis tinggal mengedit placeholder `[...]` dengan data aktual.

### Keuntungan Pendekatan Ini

1. **Konsistensi**: Semua artikel prediksi mengikuti struktur yang sama
2. **Efisiensi**: Penulis tidak perlu membuat struktur dari awal
3. **Profesional**: Struktur mengikuti standar media bola profesional (bola.net)
4. **Fleksibel**: Penulis tetap bisa mengedit/menambah konten sesuai kebutuhan
5. **SEO-friendly**: Heading terstruktur dengan baik untuk SEO

