import {
    Controller,
    Get,
    Post,
    Param,
    Patch,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @ApiOperation({ summary: 'Get user notifications' })
    @Get()
    async getNotifications(
        @Request() req,
        @Query('limit') limit = '20',
        @Query('offset') offset = '0',
    ) {
        return this.notificationsService.findAll(
            req.user.id,
            parseInt(limit),
            parseInt(offset),
        );
    }

    @ApiOperation({ summary: 'Get unread count' })
    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }

    @ApiOperation({ summary: 'Mark specific notification as read' })
    @Patch(':id/read')
    async markAsRead(@Request() req, @Param('id') id: string) {
        return this.notificationsService.markAsRead(req.user.id, id);
    }

    @ApiOperation({ summary: 'Mark all notifications as read' })
    @Patch('read-all')
    async markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @ApiOperation({ summary: 'Send a test notification (Dev only)' })
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Post('test')
    async testNotification(@Request() req) {
        return this.notificationsService.create({
            userId: req.user.id,
            title: 'notifications.test_notification.title',
            message: 'notifications.test_notification.message',
            type: 'SUCCESS',
        });
    }
}
