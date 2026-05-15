"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDate } from "@/lib/utils/format";

interface Audit {
  id: string;
  name: string;
  status: string;
  overall_score: number | null;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  created_at: string;
  audit_type: string;
}

export function DashboardCharts({ audits }: { audits: Audit[] }) {
  const completed = audits.filter((a) => a.status === "completed" && a.overall_score !== null);

  // Score trend data (last 8 completed audits)
  const scoreTrend = completed.slice(-8).map((a) => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + "…" : a.name,
    score: a.overall_score ?? 0,
    date: formatDate(a.created_at),
  }));

  // Severity distribution
  const totalCritical = audits.reduce((s, a) => s + a.critical_count, 0);
  const totalHigh = audits.reduce((s, a) => s + a.high_count, 0);
  const totalMedium = audits.reduce((s, a) => s + a.medium_count, 0);
  const totalLow = audits.reduce((s, a) => s + a.low_count, 0);
  const totalIssues = totalCritical + totalHigh + totalMedium + totalLow;

  const severityData = [
    { name: "Critical", value: totalCritical, color: "#ef4444" },
    { name: "High", value: totalHigh, color: "#f97316" },
    { name: "Medium", value: totalMedium, color: "#eab308" },
    { name: "Low", value: totalLow, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Score trend */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">UX Score Trend</h3>
        {scoreTrend.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Complete audits to see score trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                cursor={{ fill: "hsl(var(--accent))" }}
              />
              <Bar
                dataKey="score"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Severity distribution */}
      {totalIssues > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Issue Severity Distribution</h3>
          <div className="flex items-center gap-6">
            <PieChart width={120} height={120}>
              <Pie
                data={severityData}
                cx={55}
                cy={55}
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {severityData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-2">
              {severityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((item.value / totalIssues) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
