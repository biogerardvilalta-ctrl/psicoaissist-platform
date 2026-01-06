import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    async create(data: {
        userId: string;
        title: string;
        message: string;
        type?: NotificationType;
        data?: any;
    }) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || 'INFO',
                data: data.data || {},
                isRead: false,
            },
        });

        // Send real-time update
        this.notificationsGateway.sendNotificationToUser(data.userId, notification);

        return notification;
    }

    async findAll(userId: string, limit = 20, offset = 0) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }

    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.notification.update({
            where: {
                id: notificationId,
                userId: userId, // Ensure ownership
            },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: { isRead: true },
        });
    }
}
