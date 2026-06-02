"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { Search } from "lucide-react";

const SEARCH_DEBOUNCE_MS = 250;

export function ApplicationsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => update("search", v),
      SEARCH_DEBOUNCE_MS
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          size={15}
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search company, role, location…"
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:gap-2">
        <Select
          defaultValue={searchParams.get("status") ?? "ALL"}
          onChange={(e) => update("status", e.target.value)}
          className="w-full sm:w-auto sm:min-w-[140px]"
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
          className="w-full sm:w-auto sm:min-w-[130px]"
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
          className="w-full sm:w-auto sm:min-w-[140px]"
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
