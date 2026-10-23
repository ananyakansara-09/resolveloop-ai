import axios, { type AxiosInstance } from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://msqssx7p-8000.inc1.devtunnels.ms';
// Normalize base URL: strip trailing /api and slashes so both /health and /api/... resolve accurately
export const API_BASE_URL = rawBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '') || 'https://msqssx7p-8000.inc1.devtunnels.ms';

// Real network mode by default (VITE_USE_MOCK_API=false)
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Axios instance configured per Backend Integration Guide
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Executes a real HTTP network call (visible in Network tab).
 * If the call fails (e.g. backend server is not running or returns an error),
 * it falls back to the mock service so the application UI remains functional.
 */
export async function executeApi<T>(
  networkCall: () => Promise<{ data: T }>,
  mockFallback: () => Promise<T>,
  options?: { endpointName?: string; forceMock?: boolean }
): Promise<T> {
  // If explicitly forced to mock without network
  if (options?.forceMock) {
    await new Promise(res => setTimeout(res, 150));
    return mockFallback();
  }

  try {
    // ALWAYS dispatch the real HTTP request (appears in browser Network tab)
    const response = await networkCall();
    return response.data;
  } catch (err: unknown) {
    // If backend connection fails, log warning and gracefully fall back to mock data
    console.warn(
      `[ResolveLoop API] Request to ${options?.endpointName || 'endpoint'} (${API_BASE_URL}) failed. Falling back to local data.`,
      err
    );
    return mockFallback();
  }
}
