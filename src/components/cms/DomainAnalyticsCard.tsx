import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface Props {
  domain: 'news' | 'com';
  days?: number;
}

const DomainAnalyticsCard: React.FC<Props> = ({ domain, days = 7 }) => {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['ga4-dashboard-mini', domain, days],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-analytics', {
        body: { days, domain },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    refetchInterval: 5 * 60_000,
  });

  const label = domain === 'com' ? 'bolakami.com' : 'bolakami.news';

  const errMsg = (() => {
    if (!error) return null;
    const m = (error as Error).message || '';
    if (/permission/i.test(m)) return 'Service account belum punya akses ke property GA4 ini.';
    if (/not configured|property id/i.test(m)) return 'Property ID GA4 belum dikonfigurasi.';
    return m;
  })();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          {label}
        </CardTitle>
        {report && (
          <Badge variant="outline" className="text-xs">
            {report.overview?.users?.toLocaleString() || 0} users · {days}d
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
          </div>
        )}

        {!isLoading && errMsg && (
          <div className="h-40 flex items-center justify-center text-center px-4">
            <p className="text-xs text-destructive">{errMsg}</p>
          </div>
        )}

        {!isLoading && !errMsg && report && (
          <>
            <div className="h-40">
              {report.daily?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.daily}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: string) => `${v.slice(4, 6)}/${v.slice(6, 8)}`}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} width={32} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Users" />
                    <Line type="monotone" dataKey="pageviews" stroke="#a78bfa" strokeWidth={2} dot={false} name="Pageviews" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Belum ada data
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
              <MiniMetric label="Users" value={report.overview?.users || 0} />
              <MiniMetric label="Sessions" value={report.overview?.sessions || 0} />
              <MiniMetric label="Pageviews" value={report.overview?.pageviews || 0} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MiniMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-sm font-semibold text-foreground tabular-nums">{value.toLocaleString()}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
  </div>
);

export default DomainAnalyticsCard;