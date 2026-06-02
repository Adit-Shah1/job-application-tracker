"use client";

import dynamic from "next/dynamic";

const StatusChart = dynamic(
  () => import("./StatusChart").then((m) => m.StatusChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-end gap-3 px-2">
        {[60, 90, 45, 75, 40, 55].map((h, i) => (
          <div
            key={i}
            className="skeleton h-full w-full rounded-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  }
);

export function StatusChartClient(
  props: React.ComponentProps<typeof StatusChart>
) {
  return <StatusChart {...props} />;
}
