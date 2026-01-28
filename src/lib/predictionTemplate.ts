export interface PredictionTemplateData {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  matchday: string;
  venue: string;
  kickoffDate: string;
  kickoffTime: string;
}

export const generatePredictionTemplate = (data: PredictionTemplateData): string => {
  return `<p><strong>Bolakami</strong> - <strong>${data.homeTeam}</strong> akan menjamu <strong>${data.awayTeam}</strong> pada ${data.matchday} <strong>${data.competition}</strong>. Pertandingan ini akan berlangsung di ${data.venue}, ${data.kickoffDate}, pukul ${data.kickoffTime} WIB.</p>

<p>[Tulis konteks pertandingan: tekanan pada kedua tim, performa terakhir, momentum, dll.]</p>

<h2>🎽 Prediksi Starting XI ${data.homeTeam} vs ${data.awayTeam}</h2>

<p>[Tulis analisis kondisi pemain, cedera, dan ketersediaan squad kedua tim]</p>

<p><strong>${data.homeTeam} (Formasi):</strong><br/>[Kiper]; [Bek 1], [Bek 2], [Bek 3]; [Gelandang 1], [Gelandang 2]; [Winger 1], [Gelandang Serang], [Winger 2]; [Striker]</p>

<p><strong>Pelatih:</strong> [Nama Pelatih]</p>

<p><strong>${data.awayTeam} (Formasi):</strong><br/>[Kiper]; [Bek 1], [Bek 2], [Bek 3]; [Gelandang 1], [Gelandang 2]; [Winger 1], [Gelandang Serang], [Winger 2]; [Striker]</p>

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
</ul>`;
};

export const generatePredictionTitle = (homeTeam: string, awayTeam: string, kickoffDate: string): string => {
  return `Prediksi ${homeTeam} vs ${awayTeam}: Head to Head, Lineup & Skor ${kickoffDate}`;
};

export const generatePredictionExcerpt = (homeTeam: string, awayTeam: string, competition: string, venue: string): string => {
  return `Simak prediksi lengkap ${homeTeam} vs ${awayTeam} di ${competition}: analisis head to head, prediksi lineup starting XI, 5 laga terakhir, dan prediksi skor pertandingan yang digelar di ${venue}.`;
};
