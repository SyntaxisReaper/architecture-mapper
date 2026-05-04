import axios from 'axios';
import type { Architecture, GeneratePayload, RefinePayload } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase JWT token for authenticated requests
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export async function generateArchitecture(payload: GeneratePayload): Promise<Architecture> {
  const { data } = await api.post<Architecture>('/api/generate', payload);
  return data;
}

export async function refineArchitecture(
  payload: RefinePayload & { archId?: string }
): Promise<Architecture> {
  const { data } = await api.post<Architecture>('/api/refine', payload);
  return data;
}

export async function fetchCloudHistory() {
  const { data } = await api.get('/api/history');
  return data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
}
