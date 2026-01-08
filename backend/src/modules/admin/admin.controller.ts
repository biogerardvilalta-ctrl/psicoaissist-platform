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
import { UserRole, UserStatus, AuditAction } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('dashboard')
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      activeSubscriptions,
      totalRevenue,
      recentSignups,
      totalSessions,
      totalReports
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.calculateTotalRevenue(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          }
        }
      }),
      this.prisma.session.count(),
      this.prisma.report.count()
    ]);

    const subscriptionStats = await this.getSubscriptionStats();
    const revenueData = await this.getRevenueChartData();
    const recentActivity = await this.getSystemActivity();

    return {
      totalUsers,
      activeUsers,
      activeSubscriptions,
      totalRevenue,
      recentSignups,
      totalSessions,
      totalReports,
      subscriptionStats,
      revenueData,
      recentActivity
    };
  }

  private async getRevenueChartData() {
    const months = 6;
    const now = new Date();
    const data = [];

    // Pre-fetch all potentially relevant subscriptions (active or recently cancelled)
    // optimizing by not selecting everything, just what we need
    const allSubscriptions = await this.prisma.subscription.findMany({
      where: {
        createdAt: {
          lte: now
        }
      },
      select: {
        planType: true,
        createdAt: true,
        canceledAt: true,
        status: true // useful for double checking
      }
    });

    const planPrices = {
      basic: 29,
      pro: 59,
      premium: 99,
      minutes_pack: 15, // assuming packs might be stored here or ignored. adapting to subscription model.
      agenda_manager_pack: 15
    };

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('es-ES', { month: 'short' });
      // Capitalize first letter
      const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Revenue Calculation (Approximated MRR for that month)
      // A subscription contributes to revenue if it existed before end of month AND (was not cancelled OR cancelled after start of month)
      const activeSubsInMonth = allSubscriptions.filter(sub => {
        const createdBeforeMonthEnd = sub.createdAt <= endOfMonth;
        const notCancelledBeforeMonthStart = !sub.canceledAt || sub.canceledAt >= startOfMonth;
        return createdBeforeMonthEnd && notCancelledBeforeMonthStart;
      });

      const revenue = activeSubsInMonth.reduce((sum, sub) => {
        const price = planPrices[sub.planType?.toLowerCase()] || 0;
        return sum + price;
      }, 0);

      // New Subscriptions (Created in this specific month)
      const newSubsCount = allSubscriptions.filter(sub =>
        sub.createdAt >= startOfMonth && sub.createdAt <= endOfMonth
      ).length;

      data.push({
        month: monthLabel,
        revenue: revenue,
        subscriptions: newSubsCount
      });
    }

    return data;
  }

  private async getSystemActivity() {
    // 1. Recent Users
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // 2. Recent Subscriptions
    const recentSubs = await this.prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    // 3. Recent Audit Logs (Errors or Logins) - Optional, grabbing errors for interest
    // Disabled for now to keep it simple and focused on growth/activity, 
    // but the Feed component supports errors.

    // Transform to common format
    const activities = [
      ...recentUsers.map(u => ({
        id: `user-${u.id}`,
        type: 'user_registered',
        title: 'Nuevo usuario registrado',
        description: `${u.firstName} ${u.lastName} se registró como ${u.role.toLowerCase()}`,
        timestamp: u.createdAt
      })),
      ...recentSubs.map(s => ({
        id: `sub-${s.id}`,
        type: 'subscription_created',
        title: `Nueva suscripción ${s.planType}`,
        description: `${s.user.firstName} ${s.user.lastName} activó el plan ${s.planType}`,
        timestamp: s.createdAt
      }))
    ];

    // Sort by date desc and take top 10
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  @Get('logs')
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('userId') userId?: string,
    @Query('errorOnly') errorOnly?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    console.log('📥 getLogs Query Params:', { page, limit, userId, errorOnly, action, resource, search, startDate, endDate });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (errorOnly === 'true') {
      where.OR = [
        { isSuccess: false },
        { errorMessage: { not: null } }
      ];
    }

    if (action) {
      // Find matching enum values
      const matchingActions = Object.values(AuditAction).filter(a =>
        a.toString().toLowerCase().includes(action.toLowerCase())
      );

      if (matchingActions.length > 0) {
        where.action = { in: matchingActions };
      } else {
        // No action matches the search term, return empty result
        return {
          logs: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0,
          },
        };
      }
    }

    if (resource) {
      where.resourceType = {
        contains: resource,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('plans')
  getPlans() {
    // Return hardcoded plan details for now
    return {
      plans: [
        {
          id: 'basic',
          name: 'Basic',
          price: 29,
          currency: 'EUR',
          interval: 'month',
          features: ['3 Clients', 'Basic Reports', 'Community Access']
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 59,
          currency: 'EUR',
          interval: 'month',
          features: ['Unlimited Clients', 'Advanced Reports', 'Priority Support']
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 99,
          currency: 'EUR',
          interval: 'month',
          features: ['All Pro features', 'White Labeling', 'API Access']
        }
      ]
    };
  }

  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
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

    if (role) {
      where.role = role;
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