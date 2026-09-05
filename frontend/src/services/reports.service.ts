import { apiClient } from './api.client';

export interface ReportData {
  id?: string;
  sessionId: string;
  content: string;
  // Adjust based on real data
}

export const reportsService = {
  getReports: async () => {
    const response = await apiClient.get<ReportData[]>('/reports');
    return response.data;
  },

  getReport: async (id: string) => {
    const response = await apiClient.get<ReportData>(`/reports/${id}`);
    return response.data;
  },

  createReport: async (data: Partial<ReportData>) => {
    const response = await apiClient.post<ReportData>('/reports', data);
    return response.data;
  },

  updateReport: async (id: string, data: Partial<ReportData>) => {
    const response = await apiClient.put<ReportData>(`/reports/${id}`, data);
    return response.data;
  },

  exportPDF: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}/export/pdf`, { responseType: 'blob' });
    return response.data;
  },

  exportDOCX: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}/export/docx`, { responseType: 'blob' });
    return response.data;
  }
};
