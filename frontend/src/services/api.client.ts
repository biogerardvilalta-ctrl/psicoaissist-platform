import axios from 'axios';
import { toast } from '@/hooks/use-toast';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // for cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // We rely on cookies for token, or we could add an Authorization header if we stored it in localStorage.
    // The instructions say "afegir el token d'autenticació (des de cookies)", which means we can just use `withCredentials: true`.
    // Alternatively, if there's a specific way the token is passed, we handle it here.
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Auto refresh logic for 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, let the app handle the redirect (e.g., via auth context)
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      toast({
        title: 'Error de permisos',
        description: 'No tens permisos per realitzar aquesta acció.',
        variant: 'destructive',
      });
    }

    if (error.response?.status >= 500) {
      toast({
        title: 'Error de servidor',
        description: 'Hi ha hagut un error inesperat.',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);
