"use client";

import dynamic from "next/dynamic";
import type { FunnelStage } from "@/lib/queries";

const PipelineFunnelChart = dynamic(
  () => import("./PipelineFunnelChart").then((m) => m.PipelineFunnelChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[256px] items-end gap-3 px-2">
        {[60, 80, 45, 25].map((h, i) => (
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

export function PipelineFunnelClient({ data }: { data: FunnelStage[] }) {
  return <PipelineFunnelChart data={data} />;
}
