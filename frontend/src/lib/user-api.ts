import { httpClient } from './http-client';
import { User } from '@/types/auth';

export class UserAPI {
    private static BASE_URL = '/api/v1/users';

    static async updateDashboardLayout(userId: string, layout: string[]): Promise<User> {
        return httpClient.patch<User>(`${this.BASE_URL}/${userId}/dashboard-layout`, { layout });
    }

    // --- Agenda Manager Methods ---

    static async createAgendaManager(data: { email: string; firstName: string; lastName: string; password: string }): Promise<User> {
        return httpClient.post<User>(`${this.BASE_URL}/agenda-managers`, data);
    }

    static async getMyAgendaManagers(): Promise<User[]> {
        return httpClient.get<User[]>(`${this.BASE_URL}/me/agenda-managers`);
    }

    static async deleteAgendaManager(managerId: string): Promise<void> {
        return httpClient.delete<void>(`${this.BASE_URL}/agenda-managers/${managerId}`);
    }

    static async getManagedProfessionals(): Promise<User[]> {
        return httpClient.get<User[]>(`${this.BASE_URL}/me/managed-professionals`);
    }

    static async linkProfessional(managerId: string): Promise<void> {
        return httpClient.post<void>(`${this.BASE_URL}/agenda-managers/${managerId}/link`, {});
    }

    static async createProfessionalGroup(name: string, memberIds: string[]): Promise<User> {
        return httpClient.post<User>(`${this.BASE_URL}/professional-groups`, { name, memberIds });
    }

    static async deleteProfessionalGroup(groupId: string): Promise<void> {
        return httpClient.delete<void>(`${this.BASE_URL}/professional-groups/${groupId}`);
    }
}
