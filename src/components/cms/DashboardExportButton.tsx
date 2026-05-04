import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileCode, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  buildDashboardHTML,
  exportFilename,
  type DashboardSnapshot,
  type DomainReport,
  type RecentArticle,
} from '@/lib/dashboardExport';

const fetchGa4 = async (domain: 'news' | 'com'): Promise<DomainReport | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('ga4-analytics', {
      body: { days: 7, domain },
    });
    if (error) throw error;
    if (data?.error) return null;
    return data as DomainReport;
  } catch {
    return null;
  }
};

const DashboardExportButton: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [busy, setBusy] = useState<null | 'pdf' | 'html'>(null);

  const buildSnapshot = async (): Promise<DashboardSnapshot> => {
    const articleStats = queryClient.getQueryData<{
      total: number;
      published: number;
      drafts: number;
      pending: number;
      totalViews: number;
      recent: RecentArticle[];
    }>(['cms-articles-stats']);

    const momentsStats = queryClient.getQueryData<{ total: number; active: number }>([
      'cms-moments-stats',
    ]);

    let news = queryClient.getQueryData<DomainReport>(['ga4-dashboard-mini', 'news', 7]);
    let com = queryClient.getQueryData<DomainReport>(['ga4-dashboard-mini', 'com', 7]);

    if (!news) news = (await fetchGa4('news')) || undefined;
    if (!com) com = (await fetchGa4('com')) || undefined;

    return {
      generatedAt: new Date(),
      articleStats: {
        total: articleStats?.total ?? 0,
        published: articleStats?.published ?? 0,
        drafts: articleStats?.drafts ?? 0,
        pending: articleStats?.pending ?? 0,
        totalViews: articleStats?.totalViews ?? 0,
        recent: articleStats?.recent ?? [],
      },
      momentsActive: momentsStats?.active ?? 0,
      ga4: {
        news: news ?? null,
        com: com ?? null,
      },
    };
  };

  const handleHTML = async () => {
    setBusy('html');
    try {
      const snap = await buildSnapshot();
      const html = buildDashboardHTML(snap);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename('bolakami-dashboard', 'html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ title: 'Export HTML berhasil', description: 'File telah diunduh.' });
    } catch (e) {
      toast({
        title: 'Export gagal',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  const handlePDF = async () => {
    setBusy('pdf');
    try {
      const snap = await buildSnapshot();
      const html = buildDashboardHTML(snap);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const cleanup = () => {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 500);
      };

      iframe.onload = async () => {
        try {
          const win = iframe.contentWindow;
          const doc = iframe.contentDocument;
          if (!win || !doc) {
            cleanup();
            return;
          }
          // Wait for fonts (Circular Std) to load inside iframe.
          try {
            // @ts-ignore - fonts API
            await doc.fonts?.ready;
          } catch {
            /* ignore */
          }
          // Small buffer for SVG paint.
          await new Promise((r) => setTimeout(r, 350));

          win.focus();
          win.print();

          // Listen for after print to cleanup; fallback timer too.
          const onAfter = () => {
            cleanup();
            win.removeEventListener('afterprint', onAfter);
          };
          win.addEventListener('afterprint', onAfter);
          setTimeout(cleanup, 60000);
        } catch {
          cleanup();
        }
      };

      iframe.srcdoc = html;

      toast({
        title: 'Menyiapkan PDF',
        description: 'Pilih "Save as PDF" pada dialog cetak browser.',
      });
    } catch (e) {
      toast({
        title: 'Export gagal',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!!busy} className="gap-2">
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handlePDF} disabled={!!busy} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-primary" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleHTML} disabled={!!busy} className="gap-2 cursor-pointer">
          <FileCode className="w-4 h-4 text-violet-400" />
          Export HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardExportButton;