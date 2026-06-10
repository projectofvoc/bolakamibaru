import jsPDF from 'jspdf';
import type { EventItem } from '@/components/EventCard';

const BG = '#0d0f14';
const CARD = '#1a1d24';
const PRIMARY = '#4ade80';
const TEXT = '#e5e7eb';
const MUTED = '#9ca3af';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'event';

const fmtRange = (start: string, end: string) => {
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  };
  const s = new Date(start).toLocaleDateString('id-ID', opts);
  const e = new Date(end).toLocaleDateString('id-ID', opts);
  return `${s} – ${e} WIB`;
};

async function loadImage(
  url: string,
): Promise<{ data: string; w: number; h: number; format: 'JPEG' | 'PNG' } | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const isPng = blob.type.includes('png');
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('image'));
      i.src = dataUrl;
    });
    return {
      data: dataUrl,
      w: img.naturalWidth,
      h: img.naturalHeight,
      format: isPng ? 'PNG' : 'JPEG',
    };
  } catch {
    return null;
  }
}

function paintPage(doc: jsPDF, pageW: number, pageH: number) {
  doc.setFillColor(BG);
  doc.rect(0, 0, pageW, pageH, 'F');
}

function drawFooter(
  doc: jsPDF,
  pageW: number,
  pageH: number,
  pageNum: number,
  totalPages: number,
) {
  const marginX = 14;
  doc.setDrawColor(PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(marginX, pageH - 14, pageW - marginX, pageH - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text('bolakami.com', marginX, pageH - 8);
  doc.text(`Halaman ${pageNum} / ${totalPages}`, pageW - marginX, pageH - 8, {
    align: 'right',
  });
}

function drawHeaderBar(doc: jsPDF, pageW: number) {
  doc.setFillColor(PRIMARY);
  doc.rect(0, 0, pageW, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor('#0d0f14');
  doc.text('BOLAKAMI', 14, 7.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Event & Komunitas', pageW - 14, 7.8, { align: 'right' });
}

export async function downloadEventPdf(event: EventItem): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentW = pageW - marginX * 2;

  paintPage(doc, pageW, pageH);
  drawHeaderBar(doc, pageW);

  let cursorY = 20;

  // Banner
  if (event.banner_url) {
    const img = await loadImage(event.banner_url);
    if (img) {
      const ratio = img.h / img.w;
      const imgH = Math.min(contentW * ratio, 90);
      const imgW = imgH / ratio;
      const xOff = marginX + (contentW - imgW) / 2;
      // subtle border
      doc.setFillColor(CARD);
      doc.roundedRect(marginX, cursorY, contentW, imgH + 4, 2, 2, 'F');
      doc.addImage(img.data, img.format, xOff, cursorY + 2, imgW, imgH);
      cursorY += imgH + 10;
    }
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor('#ffffff');
  const titleLines = doc.splitTextToSize(event.name, contentW);
  doc.text(titleLines, marginX, cursorY);
  cursorY += titleLines.length * 7 + 2;

  // Period
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(`Periode: ${fmtRange(event.start_date, event.end_date)}`, marginX, cursorY);
  cursorY += 6;

  // Divider
  doc.setDrawColor(PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(marginX, cursorY, marginX + 30, cursorY);
  cursorY += 6;

  // Description
  const description = (event.description || '').trim() || 'Tidak ada deskripsi.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(TEXT);
  const lineH = 5.2;
  const bottomLimit = pageH - 20;

  // Process paragraph by paragraph to preserve newlines
  const paragraphs = description.split(/\n/);
  for (const para of paragraphs) {
    const text = para.length === 0 ? ' ' : para;
    const lines = doc.splitTextToSize(text, contentW);
    for (const line of lines) {
      if (cursorY > bottomLimit) {
        doc.addPage();
        paintPage(doc, pageW, pageH);
        drawHeaderBar(doc, pageW);
        cursorY = 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(TEXT);
      }
      doc.text(line, marginX, cursorY);
      cursorY += lineH;
    }
  }

  // Footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(doc, pageW, pageH, i, total);
  }

  doc.save(`event-${slugify(event.name)}.pdf`);
}