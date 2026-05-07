import { useState, useCallback } from 'react';
import { generateArchitecture, refineArchitecture } from '../api/client';
import type { Architecture, GeneratePayload, RefinePayload } from '../types';

type ArchWithMeta = Architecture & { _archId?: string };

function normalizeErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;

  if (err && typeof err === 'object') {
    const candidate = err as {
      response?: { data?: unknown };
      message?: unknown;
      error?: unknown;
      code?: unknown;
    };

    const data = candidate.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const payload = data as { error?: unknown; message?: unknown; code?: unknown };
      const responseMessage = payload.error ?? payload.message;
      if (typeof responseMessage === 'string') return responseMessage;
      if (responseMessage && typeof responseMessage === 'object') return JSON.stringify(responseMessage);
      if (payload.code && payload.error === undefined && payload.message === undefined) return String(payload.code);
    }

    if (typeof candidate.message === 'string') return candidate.message;
    if (typeof candidate.error === 'string') return candidate.error;
    if (candidate.message && typeof candidate.message === 'object') return JSON.stringify(candidate.message);
    if (candidate.error && typeof candidate.error === 'object') return JSON.stringify(candidate.error);
    if (candidate.code) return String(candidate.code);
  }

  return 'Something went wrong';
}

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
      setError(normalizeErrorMessage(err));
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
        setError(normalizeErrorMessage(err));
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
