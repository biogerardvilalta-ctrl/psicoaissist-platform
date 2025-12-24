
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GoogleService {
    private oauth2Client;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') || 'http://localhost:3000/dashboard/settings';
        // Note: Frontend handles the code, calls backend.
        // Or backend handles redirect? Usually better if frontend sends 'code' to backend.

        if (clientId && clientSecret) {
            this.oauth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                redirectUri
            );
        }
    }

    getAuthUrl() {
        if (!this.oauth2Client) throw new BadRequestException('Google Credentials not configured');

        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline', // Crucial for refresh_token
            scope: scopes,
            prompt: 'consent', // Force consent prompt to ensure refresh_token is returned
        });
    }

    async handleAuthCallback(code: string, userId: string) {
        if (!this.oauth2Client) throw new BadRequestException('Google Credentials not configured');

        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);

            // Save tokens to user
            // We mainly need refresh_token for long-term access.
            // access_token expires quickly.

            if (tokens.refresh_token) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        googleRefreshToken: tokens.refresh_token,
                    }
                });
            } else {
                console.warn('No refresh token received from Google. User might have already authorized.');
                // If we don't get a refresh token, it means the user has already approved access and we didn't force consent.
                // But we prompt='consent' above so we should get it.
            }

            return { success: true };

        } catch (error) {
            console.error('Error retrieving access token', error);
            throw new BadRequestException('Failed to retrieve access token from Google');
        }
    }

    private getClientForUser(refreshToken: string) {
        if (!this.oauth2Client) throw new BadRequestException('Google Credentials not configured');

        const client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET')
        );
        client.setCredentials({ refresh_token: refreshToken });
        return client;
    }

    async listEvents(userId: string, timeMin: Date, timeMax: Date) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleRefreshToken: true, googleImportCalendar: true }
        });

        if (!user || !user.googleRefreshToken) {
            // Instead of throwing 401 (which logs out the user), return empty list
            return [];
        }

        if (user.googleImportCalendar === false) {
            return []; // Return empty if import is disabled
        }

        const auth = this.getClientForUser(user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            return response.data.items;
        } catch (error) {
            console.error('Failed to list Google events', error);
            // If refresh token is invalid, we should wipe it so UI updates
            throw new BadRequestException('Failed to fetch calendar events');
        }
    }

    async insertEvent(userId: string, eventData: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleRefreshToken: true }
        });

        if (!user || !user.googleRefreshToken) return null;

        const auth = this.getClientForUser(user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: eventData,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to insert Google event', error);
            return null;
        }
    }

    async updateEvent(userId: string, eventId: string, eventData: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleRefreshToken: true }
        });

        if (!user || !user.googleRefreshToken) return null;

        const auth = this.getClientForUser(user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: eventData,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update Google event', error);
            return null;
        }
    }

    async deleteEvent(userId: string, eventId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { googleRefreshToken: true }
        });

        if (!user || !user.googleRefreshToken) return;

        const auth = this.getClientForUser(user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
        } catch (error) {
            console.error('Failed to delete Google event', error);
        }
    }
}
