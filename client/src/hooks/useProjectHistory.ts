import { useCallback, useEffect, useState } from "react";
import type { ProjectHistoryItem } from "@/types";

const STORAGE_KEY = "isee-scout-history";

export function useProjectHistory() {
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      setHistory([]);
    }
  }, []);

  const persist = useCallback((items: ProjectHistoryItem[]) => {
    setHistory(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const saveItem = useCallback(
    (item: ProjectHistoryItem) => {
      persist([item, ...history.filter((h) => h.id !== item.id)]);
    },
    [history, persist]
  );

  const updateItem = useCallback(
    (item: ProjectHistoryItem) => {
      persist(history.map((h) => (h.id === item.id ? item : h)));
    },
    [history, persist]
  );

  const deleteItem = useCallback(
    (id: string) => {
      persist(history.filter((h) => h.id !== id));
    },
    [history, persist]
  );

  return { history, saveItem, updateItem, deleteItem };
}
