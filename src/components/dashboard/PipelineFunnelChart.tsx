"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import type { FunnelStage } from "@/lib/queries";

const STAGE_COLORS = ["#a1a1aa", "#0ea5e9", "#f59e0b", "#10b981"];

export function PipelineFunnelChart({ data }: { data: FunnelStage[] }) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Add applications to see your pipeline funnel.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <ResponsiveContainer width="100%" height={256} minWidth={0} debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 60, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-zinc-500"
            width={90}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
            }}
            formatter={(value, _name, props) => {
              const stage = (props as unknown as { payload: FunnelStage }).payload;
              const rateText = stage.label === "Saved" ? "" : ` (${stage.rate}% conversion)`;
              return [`${value} apps${rateText}`, stage.label];
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={STAGE_COLORS[index]} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 12, fill: "currentColor" }}
              className="text-zinc-600 dark:text-zinc-400"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
