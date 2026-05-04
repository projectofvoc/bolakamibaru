// Build a standalone HTML document representing the CMS Dashboard snapshot.
// Used for both HTML download and PDF export (via iframe + window.print).

export interface DailyPoint {
  date: string; // YYYYMMDD
  users?: number;
  pageviews?: number;
}

export interface DomainReport {
  overview?: { users?: number; sessions?: number; pageviews?: number };
  daily?: DailyPoint[];
}

export interface RecentArticle {
  id: string;
  title_id: string;
  status: string;
  views?: number | null;
  category?: string;
  slug?: string;
}

export interface DashboardSnapshot {
  generatedAt: Date;
  articleStats: {
    total: number;
    published: number;
    drafts: number;
    pending: number;
    totalViews: number;
    recent: RecentArticle[];
  };
  momentsActive: number;
  ga4: {
    news: DomainReport | null;
    com: DomainReport | null;
  };
}

const escapeHtml = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fmtNum = (n: number | null | undefined) => (n ?? 0).toLocaleString('id-ID');

const fmtDate = (d: Date) => {
  // 04 Mei 2026 14:32 WIB
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
};

const categoryLabel = (c?: string) => {
  switch (c) {
    case 'trending': return 'Trending';
    case 'daily': return 'Update Harian';
    case 'analisa': return 'Analisa';
    default: return c || '-';
  }
};

const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: 'Published' },
    draft: { bg: 'rgba(139,144,154,0.18)', color: '#b8bcc4', label: 'Draft' },
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'Pending' },
  };
  const cfg = map[s] || { bg: 'rgba(139,144,154,0.18)', color: '#b8bcc4', label: s };
  return `<span class="badge" style="background:${cfg.bg};color:${cfg.color}">${escapeHtml(cfg.label)}</span>`;
};

/**
 * Build inline SVG line chart for users + pageviews trend.
 * width/height in px. Returns full <svg>…</svg> string.
 */
function buildChartSVG(daily: DailyPoint[], width = 520, height = 180): string {
  if (!daily?.length) {
    return `<div class="chart-empty">Belum ada data</div>`;
  }

  const padL = 36, padR = 12, padT = 10, padB = 24;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const users = daily.map((d) => Number(d.users || 0));
  const pvs = daily.map((d) => Number(d.pageviews || 0));
  const maxV = Math.max(1, ...users, ...pvs);
  // Round max up to a friendly number
  const niceMax = (() => {
    const p = Math.pow(10, Math.floor(Math.log10(maxV)));
    return Math.ceil(maxV / p) * p;
  })();

  const xAt = (i: number) =>
    padL + (daily.length === 1 ? innerW / 2 : (i * innerW) / (daily.length - 1));
  const yAt = (v: number) => padT + innerH - (v / niceMax) * innerH;

  const pathFor = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

  // Y axis grid (4 lines)
  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => {
      const y = padT + innerH - t * innerH;
      const label = Math.round(niceMax * t).toLocaleString('id-ID');
      return `
        <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#2a2e38" stroke-dasharray="3 3" stroke-width="1"/>
        <text x="${padL - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#8b909a">${label}</text>
      `;
    })
    .join('');

  // X axis labels (first, mid, last)
  const xLabels = (() => {
    const idxs = daily.length <= 3
      ? daily.map((_, i) => i)
      : [0, Math.floor(daily.length / 2), daily.length - 1];
    return idxs
      .map((i) => {
        const d = daily[i].date;
        const lbl = `${d.slice(4, 6)}/${d.slice(6, 8)}`;
        return `<text x="${xAt(i)}" y="${height - 6}" text-anchor="middle" font-size="9" fill="#8b909a">${lbl}</text>`;
      })
      .join('');
  })();

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      ${gridLines}
      <path d="${pathFor(pvs)}" fill="none" stroke="#a78bfa" stroke-width="2"/>
      <path d="${pathFor(users)}" fill="none" stroke="#4ade80" stroke-width="2"/>
      ${xLabels}
    </svg>
  `;
}

function domainBlock(label: string, report: DomainReport | null): string {
  if (!report) {
    return `
      <div class="domain-card">
        <div class="domain-head">
          <span class="domain-title">${escapeHtml(label)}</span>
          <span class="domain-pill">Tidak tersedia</span>
        </div>
        <div class="chart-empty">Data GA4 tidak tersedia</div>
      </div>
    `;
  }
  const ov = report.overview || {};
  return `
    <div class="domain-card">
      <div class="domain-head">
        <span class="domain-title">${escapeHtml(label)}</span>
        <span class="domain-pill">${fmtNum(ov.users)} users · 7d</span>
      </div>
      ${buildChartSVG(report.daily || [])}
      <div class="domain-metrics">
        <div><div class="m-val">${fmtNum(ov.users)}</div><div class="m-lbl">USERS</div></div>
        <div><div class="m-val">${fmtNum(ov.sessions)}</div><div class="m-lbl">SESSIONS</div></div>
        <div><div class="m-val">${fmtNum(ov.pageviews)}</div><div class="m-lbl">PAGEVIEWS</div></div>
      </div>
    </div>
  `;
}

export function buildDashboardHTML(snapshot: DashboardSnapshot): string {
  const { articleStats, momentsActive, ga4, generatedAt } = snapshot;

  const statCards = [
    { label: 'Total Berita', value: articleStats.total, color: '#60a5fa' },
    { label: 'Published', value: articleStats.published, color: '#4ade80' },
    { label: 'Total Views', value: articleStats.totalViews, color: '#a78bfa' },
    { label: 'Momen Aktif', value: momentsActive, color: '#fb923c' },
  ]
    .map(
      (s) => `
      <div class="stat">
        <div class="stat-label">${escapeHtml(s.label)}</div>
        <div class="stat-value" style="color:${s.color}">${fmtNum(s.value)}</div>
      </div>`,
    )
    .join('');

  const recentRows = articleStats.recent.length
    ? articleStats.recent
        .map(
          (a) => `
        <tr>
          <td class="t-title">${escapeHtml(a.title_id)}</td>
          <td class="t-cat">${escapeHtml(categoryLabel(a.category))}</td>
          <td class="t-status">${statusBadge(a.status)}</td>
          <td class="t-views">${fmtNum(a.views)}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="4" class="empty">Belum ada berita</td></tr>`;

  const statusRows = [
    { label: 'Published', value: articleStats.published, color: '#4ade80' },
    { label: 'Draft', value: articleStats.drafts, color: '#b8bcc4' },
    { label: 'Pending Review', value: articleStats.pending, color: '#fbbf24' },
    { label: 'Momen Aktif', value: momentsActive, color: '#fb923c' },
  ]
    .map(
      (s) => `
        <div class="status-row">
          <span class="status-label">${escapeHtml(s.label)}</span>
          <span class="status-value" style="color:${s.color}">${fmtNum(s.value)}</span>
        </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>BolaKami CMS — Dashboard Report</title>
<link href="https://fonts.cdnfonts.com/css/circular-std" rel="stylesheet" />
<style>
  :root {
    --bg: #0d0f14;
    --card: #1a1d24;
    --card-2: #20242d;
    --border: #2a2e38;
    --text: #e6e8ec;
    --muted: #8b909a;
    --primary: #4ade80;
    --violet: #a78bfa;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Circular Std', system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    max-width: 794px;
    margin: 0 auto;
    padding: 32px 28px 40px;
  }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 18px; margin-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-mark {
    width: 28px; height: 28px; border-radius: 6px;
    background: var(--primary); color: #0d0f14;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px;
  }
  .brand-text { font-weight: 700; letter-spacing: 0.5px; font-size: 16px; }
  .brand-sub { color: var(--muted); font-size: 11px; margin-top: 2px; }
  .header-meta { text-align: right; font-size: 11px; color: var(--muted); }
  .header-meta strong { color: var(--text); display: block; font-size: 12px; margin-bottom: 2px; }

  h2.section {
    font-size: 13px; font-weight: 600; color: var(--text);
    text-transform: uppercase; letter-spacing: 0.8px;
    margin: 24px 0 12px;
  }

  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  }
  .stat {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
  }
  .stat-label { font-size: 11px; color: var(--muted); margin-bottom: 6px; }
  .stat-value { font-size: 22px; font-weight: 700; line-height: 1.1; }

  .domains { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .domain-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px;
    break-inside: avoid;
  }
  .domain-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px;
  }
  .domain-title { font-weight: 600; font-size: 13px; color: var(--text); }
  .domain-pill {
    font-size: 10px; padding: 3px 8px; border-radius: 999px;
    border: 1px solid var(--border); color: var(--muted);
  }
  .chart-empty {
    height: 140px; display: flex; align-items: center; justify-content: center;
    color: var(--muted); font-size: 11px;
  }
  .domain-metrics {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
    margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);
    text-align: center;
  }
  .m-val { font-size: 14px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .m-lbl { font-size: 9px; color: var(--muted); letter-spacing: 0.6px; margin-top: 2px; }

  .grid-2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; }

  .panel {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
    break-inside: avoid;
  }
  .panel h3 {
    margin: 0 0 10px; font-size: 13px; font-weight: 600;
    color: var(--text);
  }

  table.recent {
    width: 100%; border-collapse: collapse; font-size: 11px;
  }
  table.recent th, table.recent td {
    text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  table.recent th { color: var(--muted); font-weight: 500; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .t-title { color: var(--text); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .t-cat, .t-status, .t-views { color: var(--muted); }
  .t-views { text-align: right; font-variant-numeric: tabular-nums; color: var(--text); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 500; }
  .empty { text-align: center; color: var(--muted); padding: 18px 0; }

  .status-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px; background: var(--card-2);
    border-radius: 8px; margin-bottom: 6px;
  }
  .status-row:last-child { margin-bottom: 0; }
  .status-label { font-size: 12px; color: var(--text); }
  .status-value { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }

  .footer {
    margin-top: 28px; padding-top: 14px;
    border-top: 1px solid var(--border);
    text-align: center; font-size: 10px; color: var(--muted);
  }

  @media print {
    @page { size: A4; margin: 14mm; }
    html, body { background: var(--bg) !important; }
    .page { padding: 0; max-width: none; }
    .stat, .domain-card, .panel { break-inside: avoid; }
  }
  @media (max-width: 640px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .domains, .grid-2 { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-mark">B</div>
        <div>
          <div class="brand-text">BOLAKAMI CMS</div>
          <div class="brand-sub">Dashboard Report</div>
        </div>
      </div>
      <div class="header-meta">
        <strong>Snapshot</strong>
        ${escapeHtml(fmtDate(generatedAt))}
      </div>
    </div>

    <h2 class="section">Ringkasan Konten</h2>
    <div class="stats">${statCards}</div>

    <h2 class="section">Ringkasan Pengunjung — 7 Hari Terakhir</h2>
    <div class="domains">
      ${domainBlock('bolakami.news', ga4.news)}
      ${domainBlock('bolakami.com', ga4.com)}
    </div>

    <h2 class="section">Aktivitas Terbaru</h2>
    <div class="grid-2">
      <div class="panel">
        <h3>Berita Terbaru</h3>
        <table class="recent">
          <thead>
            <tr><th>Judul</th><th>Kategori</th><th>Status</th><th style="text-align:right">Views</th></tr>
          </thead>
          <tbody>${recentRows}</tbody>
        </table>
      </div>
      <div class="panel">
        <h3>Ringkasan Status</h3>
        ${statusRows}
      </div>
    </div>

    <div class="footer">
      Generated by BolaKami CMS · bolakami.com · ${escapeHtml(fmtDate(generatedAt))}
    </div>
  </div>
</body>
</html>`;
}

export function exportFilename(prefix: string, ext: string, d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `${prefix}-${stamp}.${ext}`;
}