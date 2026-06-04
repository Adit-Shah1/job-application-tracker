"use client";

import { useState, useCallback, createContext, useContext } from "react";
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

export function BulkCheckbox({ id }: { id: string }) {
  const { selectedIds, toggleSelect } = useBulkSelection();
  const checked = selectedIds.has(id);

  return (
    <label className="flex cursor-pointer items-center" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggleSelect(id)}
        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
      />
    </label>
  );
}

export function BulkSelectAllCheckbox({ total }: { total: number }) {
  const { selectedIds, toggleAll } = useBulkSelection();
  const allSelected = total > 0 && selectedIds.size === total;
  const someSelected = selectedIds.size > 0 && selectedIds.size < total;

  return (
    <label className="flex cursor-pointer items-center" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={allSelected}
        ref={(el) => { if (el) el.indeterminate = someSelected; }}
        onChange={toggleAll}
        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
      />
    </label>
  );
}
