import { ApiResponse, PaginatedResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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
        ...(typeof window !== 'undefined' && localStorage.getItem('psycoai_access_token')
          ? { 'Authorization': `Bearer ${localStorage.getItem('psycoai_access_token')}` }
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
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ HTTP Error response:', errorData);
        throw new Error(
          errorData.message || `HTTP Error: ${response.status} ${response.statusText}`
        )
      }

      // Handle no content responses
      if (response.status === 204) {
        return {} as T
      }

      const responseData = await response.json();
      console.log('✅ Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ HTTP Request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<T>(`${endpoint}${query}`, {
      method: 'GET',
    })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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