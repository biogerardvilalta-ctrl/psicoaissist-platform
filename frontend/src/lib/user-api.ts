import { httpClient } from './http-client';
import { User } from '@/types/auth';

export class UserAPI {
    private static BASE_URL = '/api/v1/users';

    static async updateDashboardLayout(userId: string, layout: string[]): Promise<User> {
        return httpClient.patch<User>(`${this.BASE_URL}/${userId}/dashboard-layout`, { layout });
    }
}
