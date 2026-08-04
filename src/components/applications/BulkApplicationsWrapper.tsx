"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { Check, Minus } from "lucide-react";
import { BulkActionBar } from "./BulkActionBar";

interface BulkSelectionContextType {
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleAll: () => void;
}

const BulkSelectionContext = createContext<BulkSelectionContextType>({
  selectedIds: new Set(),
  toggleSelect: () => {},
  toggleAll: () => {},
});

export function useBulkSelection() {
  return useContext(BulkSelectionContext);
}

interface BulkApplicationsWrapperProps {
  children: React.ReactNode;
  applicationIds: string[];
}

export function BulkApplicationsWrapper({ children, applicationIds }: BulkApplicationsWrapperProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === applicationIds.length) {
        return new Set();
      }
      return new Set(applicationIds);
    });
  }, [applicationIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return (
    <BulkSelectionContext.Provider value={{ selectedIds, toggleSelect, toggleAll }}>
      {children}
      <BulkActionBar
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        onClear={clearSelection}
        onDone={() => setSelectedIds(new Set())}
      />
    </BulkSelectionContext.Provider>
  );
}

// ponytail: appearance-none + peer variants instead of a checkbox library — the
// browser still owns state, keyboard and a11y; only the paint is ours.
function Checkbox({
  label,
  checked,
  indeterminate = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="relative flex size-4 shrink-0 cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = indeterminate; }}
        onChange={onChange}
        className="peer size-4 cursor-pointer appearance-none rounded-[5px] border border-zinc-300 bg-white shadow-sm transition-colors checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:indeterminate:border-indigo-500 dark:indeterminate:bg-indigo-500 dark:hover:border-zinc-600"
      />
      <Check
        size={12}
        strokeWidth={3.5}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
      />
      <Minus
        size={12}
        strokeWidth={3.5}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-indeterminate:opacity-100"
      />
    </label>
  );
}

export function BulkCheckbox({ id }: { id: string }) {
  const { selectedIds, toggleSelect } = useBulkSelection();

  return (
    <Checkbox
      label="Select application"
      checked={selectedIds.has(id)}
      onChange={() => toggleSelect(id)}
    />
  );
}

export function BulkSelectAllCheckbox({ total }: { total: number }) {
  const { selectedIds, toggleAll } = useBulkSelection();

  return (
    <Checkbox
      label="Select all applications"
      checked={total > 0 && selectedIds.size === total}
      indeterminate={selectedIds.size > 0 && selectedIds.size < total}
      onChange={toggleAll}
    />
  );
}
