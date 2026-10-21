import axios, { type AxiosInstance } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Axios instance with default headers and timeout
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Safe API runner that attempts backend request first if mock is not forced,
 * and falls back to mock service if server is offline or in mock mode.
 */
export async function executeApi<T>(
  networkCall: () => Promise<{ data: T }>,
  mockFallback: () => Promise<T>,
  options?: { endpointName?: string; forceMock?: boolean }
): Promise<T> {
  const isMockMode = options?.forceMock ?? USE_MOCK_API;

  if (isMockMode) {
    // Artificial small delay for realistic UX transitions
    await new Promise(res => setTimeout(res, 250));
    return mockFallback();
  }

  try {
    const response = await networkCall();
    return response.data;
  } catch (err: unknown) {
    // If backend connection fails, fall back to mock service gracefully with a warning
    console.warn(`[ResolveLoop API] Network request failed for ${options?.endpointName || 'endpoint'}. Falling back to mock service.`, err);
    return mockFallback();
  }
}
