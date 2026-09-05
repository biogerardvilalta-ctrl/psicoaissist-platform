import { apiClient } from './api.client';

export interface SessionData {
  id?: string;
  clientId: string;
  date: string;
  status: string;
  // Adjust based on real data
}

export const sessionsService = {
  getSessions: async (filters?: any) => {
    const response = await apiClient.get<SessionData[]>('/sessions', { params: filters });
    return response.data;
  },

  getSession: async (id: string) => {
    const response = await apiClient.get<SessionData>(`/sessions/${id}`);
    return response.data;
  },

  createSession: async (data: Partial<SessionData>) => {
    const response = await apiClient.post<SessionData>('/sessions', data);
    return response.data;
  },

  updateSession: async (id: string, data: Partial<SessionData>) => {
    const response = await apiClient.put<SessionData>(`/sessions/${id}`, data);
    return response.data;
  },

  deleteSession: async (id: string) => {
    const response = await apiClient.delete(`/sessions/${id}`);
    return response.data;
  },

  startSession: async (id: string) => {
    const response = await apiClient.post(`/sessions/${id}/start`);
    return response.data;
  },

  endSession: async (id: string) => {
    const response = await apiClient.post(`/sessions/${id}/end`);
    return response.data;
  }
};
