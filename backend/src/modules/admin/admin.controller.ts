import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  UseGuards, 
  Query 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('dashboard')
  async getDashboardStats() {
    const [
      totalUsers,
      activeSubscriptions,
      totalRevenue,
      recentSignups
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.calculateTotalRevenue(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          }
        }
      })
    ]);

    const subscriptionStats = await this.getSubscriptionStats();

    return {
      totalUsers,
      activeSubscriptions,
      totalRevenue,
      recentSignups,
      subscriptionStats,
    };
  }

  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.subscription = {
        planType: plan,
        status: 'active',
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          subscription: true,
          _count: {
            select: {
              clients: true,
              sessions: true,
              reports: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => ({
        ...user,
        passwordHash: undefined, // Remove sensitive data
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        clients: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        sessions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reports: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            clients: true,
            sessions: true,
            reports: true,
          }
        }
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      passwordHash: undefined,
    };
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string }
  ) {
    const user = await this.usersService.update(id, { 
      status: body.status as any 
    });

    // Log admin action
    await this.logAdminAction('USER_STATUS_CHANGE', {
      targetUserId: id,
      newStatus: body.status,
      reason: body.reason,
    });

    return user;
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Body() body: { reason: string }) {
    // Soft delete or hard delete based on requirements
    await this.usersService.remove(id);

    await this.logAdminAction('USER_DELETE', {
      targetUserId: id,
      reason: body.reason,
    });

    return { message: 'User deleted successfully' };
  }

  @Get('subscriptions')
  async getSubscriptions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('plan') plan?: string,
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (plan) {
      where.planType = plan;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  @Patch('subscriptions/:id/cancel')
  async cancelSubscription(@Param('id') id: string, @Body() body: { reason: string }) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel via Stripe and update database
    await this.paymentsService.cancelSubscription(subscription.user.id);

    await this.logAdminAction('SUBSCRIPTION_CANCEL', {
      subscriptionId: id,
      userId: subscription.userId,
      reason: body.reason,
    });

    return { message: 'Subscription cancelled successfully' };
  }

  private async calculateTotalRevenue(): Promise<number> {
    // This is a simplified calculation
    // In a real app, you'd calculate from actual payments/invoices
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'active' },
    });

    const planPrices = {
      basic: 29,
      pro: 59,
      premium: 99,
    };

    return subscriptions.reduce((total, sub) => {
      const price = planPrices[sub.planType as keyof typeof planPrices] || 0;
      return total + price;
    }, 0);
  }

  private async getSubscriptionStats() {
    const stats = await this.prisma.subscription.groupBy({
      by: ['planType', 'status'],
      _count: true,
    });

    return stats.reduce((acc, stat) => {
      if (!acc[stat.planType]) {
        acc[stat.planType] = {};
      }
      acc[stat.planType][stat.status] = stat._count;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }

  private async logAdminAction(action: string, metadata: any) {
    // In a real app, you'd have a dedicated audit log table
    console.log('Admin Action:', { action, metadata, timestamp: new Date() });
  }
}