import { ApiResponse, PaginatedResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    console.log('🌐 HTTP Request:', options.method, url);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(typeof window !== 'undefined' && localStorage.getItem('psychoai_access_token')
          ? { 'Authorization': `Bearer ${localStorage.getItem('psychoai_access_token')}` }
          : {}),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for JWT
      ...options,
    }

    console.log('📋 Request config:', config);

    try {
      const response = await fetch(url, config)
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ HTTP Error response:', errorData);

        // Throw custom ApiError
        throw new ApiError(
          errorData.message || `HTTP Error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      // Handle no content responses
      if (response.status === 204) {
        return {} as T
      }

      // Check for manually specified response responseType in options
      if ((options as any).responseType === 'blob') {
        return await response.blob() as any;
      }
      if ((options as any).responseType === 'text') {
        return await response.text() as any;
      }

      const responseData = await response.json();
      console.log('✅ Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ HTTP Request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const params = (options as any)?.params;
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<T>(`${endpoint}${query}`, {
      method: 'GET',
      ...options
    })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> { // Added options
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Create singleton instance
export const httpClient = new HttpClient(API_BASE_URL)

// Utility function for API responses
export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    message,
    success: true,
  }
}

// Utility function for paginated responses
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}