import { useState, useCallback } from 'react';
import type { HistoryEntry, Architecture } from '../types';

const STORAGE_KEY = 'arch_mapper_history';
const MAX_ENTRIES = 20;

function loadFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadFromStorage);

  const addToHistory = useCallback((arch: Architecture) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: arch.title,
      projectType: arch.projectType,
      scale: arch.scale,
      createdAt: new Date().toISOString(),
      arch,
    };

    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
