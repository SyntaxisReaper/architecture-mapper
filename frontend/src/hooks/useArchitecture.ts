import { useState, useCallback } from 'react';
import { generateArchitecture, refineArchitecture } from '../api/client';
import type { Architecture, GeneratePayload, RefinePayload } from '../types';

type ArchWithMeta = Architecture & { _archId?: string };

export function useArchitecture() {
  const [arch, setArch] = useState<Architecture | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

  const generate = useCallback(async (payload: GeneratePayload): Promise<ArchWithMeta | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateArchitecture({ ...payload, pastFeedbacks: payload.pastFeedbacks || [] }) as ArchWithMeta;
      setArch(result);
      setFeedbacks([]);
      return result;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err instanceof Error ? err.message : 'Something went wrong');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refine = useCallback(
    async (feedback: string, archId?: string): Promise<void> => {
      if (!arch) return;
      setLoading(true);
      setError(null);
      const newFeedbacks = [...feedbacks, feedback];
      try {
        const payload: RefinePayload & { archId?: string } = {
          existingArch: arch,
          feedback,
          pastFeedbacks: feedbacks,
          archId,
        };
        const result = await refineArchitecture(payload) as ArchWithMeta;
        setArch(result);
        setFeedbacks(newFeedbacks);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          (err instanceof Error ? err.message : 'Something went wrong');
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [arch, feedbacks]
  );

  const loadArch = useCallback((a: Architecture) => {
    setArch(a);
    setError(null);
    setFeedbacks([]);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { arch, loading, error, feedbacks, generate, refine, loadArch, clearError };
}
