import { apiClient } from './api.client';

export interface ClientData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  // Adjust based on real data
}

export const clientsService = {
  getClients: async () => {
    const response = await apiClient.get<ClientData[]>('/clients');
    return response.data;
  },
  
  getClient: async (id: string) => {
    const response = await apiClient.get<ClientData>(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: Partial<ClientData>) => {
    const response = await apiClient.post<ClientData>('/clients', data);
    return response.data;
  },

  updateClient: async (id: string, data: Partial<ClientData>) => {
    const response = await apiClient.put<ClientData>(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id: string) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  }
};
