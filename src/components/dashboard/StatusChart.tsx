"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/constants";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: "#a1a1aa",
  APPLIED: "#0ea5e9",
  INTERVIEWING: "#f59e0b",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
  ARCHIVED: "#71717a",
};

export function StatusChart({
  data,
}: {
  data: Record<ApplicationStatus, number>;
}) {
  const chartData = APPLICATION_STATUSES.map((s) => ({
    name: STATUS_LABELS[s],
    count: data[s] ?? 0,
    fill: STATUS_COLORS[s],
  }));
  const hasData = chartData.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Add an application to see your status breakdown.
      </div>
    );
  }

  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256} debounce={50}>
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-zinc-500"
            width={32}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
