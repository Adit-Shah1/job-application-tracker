"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { Search } from "lucide-react";

export function ApplicationsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          size={15}
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search company, role, location…"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex gap-2">
        <Select
          defaultValue={searchParams.get("status") ?? "ALL"}
          onChange={(e) => update("status", e.target.value)}
          className="min-w-[140px]"
        >
          <option value="ALL">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get("priority") ?? "ALL"}
          onChange={(e) => update("priority", e.target.value)}
          className="min-w-[130px]"
        >
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get("sort") ?? "recent"}
          onChange={(e) => update("sort", e.target.value)}
          className="min-w-[140px]"
        >
          <option value="recent">Recently updated</option>
          <option value="oldest">Oldest first</option>
          <option value="company">Company A–Z</option>
          <option value="status">Status</option>
        </Select>
      </div>
    </div>
  );
}
