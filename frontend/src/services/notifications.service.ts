import { apiClient } from './api.client';

export interface NotificationData {
  id: string;
  read: boolean;
  message: string;
  // Adjust based on real data
}

export const notificationsService = {
  getNotifications: async () => {
    const response = await apiClient.get<NotificationData[]>('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  }
};
