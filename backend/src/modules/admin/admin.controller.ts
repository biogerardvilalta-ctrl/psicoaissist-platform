import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Post,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto, UpdateUserDto, AdminChangePasswordDto } from '../users/dto/users.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole, UserStatus, AuditAction, AdminTaskStatus, AdminTaskType, AdminTaskPriority, NotificationType } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) { }

  @Post('communicate')
  async sendCommunication(@Body() body: {
    type: 'EMAIL' | 'NOTIFICATION' | 'BOTH';
    target: 'ALL' | 'SPECIFIC';
    userIds?: string[];
    subject: string; // Used as title for notification
    message: string;
  }) {
    const { type, target, userIds, subject, message } = body;

    let recipients = [];

    if (target === 'ALL') {
      recipients = await this.prisma.user.findMany({
        where: {
          role: { notIn: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          status: UserStatus.ACTIVE
        },
        select: { id: true, email: true, firstName: true, preferredLanguage: true }
      });
    } else if (target === 'SPECIFIC') {
      if (!userIds || userIds.length === 0) {
        throw new BadRequestException('Debe seleccionar al menos un usuario');
      }
      recipients = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, firstName: true, preferredLanguage: true }
      });
    }

    const results = {
      total: recipients.length,
      emailsSent: 0,
      notificationsSent: 0
    };

    // Process asynchronously but await completion for the response (or make it a job)
    // For now, we process in loop
    for (const user of recipients) {
      // Send Email
      if (type === 'EMAIL' || type === 'BOTH') {
        try {
          await this.emailService.sendCustomEmail(user.email, subject, message, user.preferredLanguage);
          results.emailsSent++;
        } catch (e) {
          console.error(`Failed to send email to ${user.email}`, e);
        }
      }

      // Send Notification
      if (type === 'NOTIFICATION' || type === 'BOTH') {
        try {
          await this.notificationsService.create({
            userId: user.id,
            title: subject,
            message: message, // Plain text usually
            type: 'INFO' as NotificationType,
            data: { fromAdmin: true }
          });
          results.notificationsSent++;
        } catch (e) {
          console.error(`Failed to send notification to ${user.id}`, e);
        }
      }
    }

    return {
      success: true,
      message: `Enviado a ${recipients.length} usuarios`,
      details: results
    };
  }

  @Get('dashboard')
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      activeSubscriptions,
      totalRevenue,
      agendaManagersCount,
      usageStats,
      recentSignups,
      totalSessions,
      totalReports
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: { notIn: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }
        }
      }),
      this.prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          role: { notIn: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }
        }
      }),
      this.prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          role: { notIn: [UserRole.AGENDA_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN] }
        }
      }),
      this.calculateTotalRevenue(),
      this.prisma.user.count({ where: { role: UserRole.AGENDA_MANAGER } }),
      this.prisma.user.aggregate({
        _sum: {
          transcriptionMinutesUsed: true,
          simulatorUsageCount: true
        }
      }),
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
    const revenueData = await this.getRevenueChartData('6m');
    const recentActivity = await this.getSystemActivity();

    return {
      totalUsers,
      activeUsers,
      activeSubscriptions,
      agendaManagersCount,
      totalTranscriptionMinutes: usageStats?._sum?.transcriptionMinutesUsed ?? 0,
      totalSimulatorSessions: usageStats?._sum?.simulatorUsageCount ?? 0,
      totalRevenue,
      recentSignups,
      totalSessions,
      totalReports,
      subscriptionStats,
      revenueData,
      recentActivity
    };


  }

  @Get('stats/evolution')
  async getEvolutionStats(@Query('period') period: '1w' | '1m' | '3m' | '6m' | '1y' = '1m') {
    return this.getRevenueChartData(period);
  }

  @Get('stats/usage-evolution')
  async getUsageEvolutionStats(@Query('period') period: '1w' | '1m' | '3m' | '6m' | '1y' = '1m') {
    return this.getUsageChartData(period);
  }

  private async getUsageChartData(period: '1w' | '1m' | '3m' | '6m' | '1y' = '1m') {
    const now = new Date();
    const data = [];

    // Determine interval and iterations based on period
    let intervalType: 'day' | 'week' | 'month' = 'day';
    let iterations = 7;

    switch (period) {
      case '1w': // Last 7 days
        intervalType = 'day';
        iterations = 7;
        break;
      case '1m': // Last 30 days
        intervalType = 'day';
        iterations = 30;
        break;
      case '3m': // Last 3 months
        intervalType = 'week';
        iterations = 12;
        break;
      case '6m': // Last 6 months
        intervalType = 'month';
        iterations = 6;
        break;
      case '1y': // Last 12 months
        intervalType = 'month';
        iterations = 12;
        break;
      default:
        intervalType = 'month';
        iterations = 6;
    }

    // Pre-fetch relevant data
    // We need:
    // 1. Sessions with transcription for minutes usage
    // 2. Simulator Reports for simulator usage

    // Calculate max lookback date to optimize query
    const lookbackDate = new Date(now);
    if (intervalType === 'day') lookbackDate.setDate(lookbackDate.getDate() - iterations);
    if (intervalType === 'week') lookbackDate.setDate(lookbackDate.getDate() - (iterations * 7));
    if (intervalType === 'month') lookbackDate.setMonth(lookbackDate.getMonth() - iterations);


    const [sessions, simReports] = await Promise.all([
      this.prisma.session.findMany({
        where: {
          startTime: { gte: lookbackDate },
          encryptedTranscription: { not: null }, // Only count transcribed sessions
          status: { not: 'CANCELLED' }
        },
        select: {
          startTime: true,
          duration: true
        }
      }),
      this.prisma.simulationReport.findMany({
        where: {
          createdAt: { gte: lookbackDate }
        },
        select: {
          createdAt: true
        }
      })
    ]);

    for (let i = iterations - 1; i >= 0; i--) {
      let startDate: Date;
      let endDate: Date;
      let label: string;

      if (intervalType === 'day') {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        startDate = new Date(d);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        label = startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      } else if (intervalType === 'week') {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 7));
        endDate = new Date(d);
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        label = `${startDate.getDate()}/${startDate.getMonth() + 1}`;
      } else {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        startDate = new Date(d);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        label = monthNames[startDate.getMonth()];
        if (period === '1y' && i > 0 && startDate.getMonth() === 0) {
          label += ` '${startDate.getFullYear().toString().substring(2)}`;
        }
      }

      // Filter data for this period
      const periodSessions = sessions.filter(s => s.startTime >= startDate && s.startTime <= endDate);
      const periodSims = simReports.filter(s => s.createdAt >= startDate && s.createdAt <= endDate);

      // INCREMENTAL
      const newMinutes = periodSessions.reduce((acc, s) => acc + (s.duration ? s.duration / 60 : 0), 0);
      const newSimSessions = periodSims.length;

      // CUMULATIVE (Total up to end of this period)
      // Note: For CUMULATIVE in this context, it usually means "Year to Date" or "All time up to X". 
      // EvolutionCharts logic does:
      // Revenue Cumulative = Total Active MRR at that point.
      // Here, "Total Cumulative Transcribed Minutes" might just be sum of all time up to that point?
      // Or just sum of the chart so far?
      // Standard "Cumulative" usually implies integral of the graph.
      // Let's implement robust "All time up to endDate" but that requires querying ALL history which is heavy.
      // OPTIMIZATION: Just do cumulative of the *displayed period* or query slightly more?
      // Let's stick to the same logic as the Revenue Chart if possible.
      // BUT Revenue uses "Active Subscriptions" (Snapshot).
      // Usage is transactional. 
      // So "Cumulative" for usage usually means "Total used in history up to date".
      // To save performance, we will only sum what we fetched (which is bounded by lookbackDate).
      // This means the first point of the chart will start at 0 (or low) even if history exists.
      // Users usually want to see "growth during this period".
      // Let's implement Cumulative as "Sum of previous points in this specific chart".

      const previousTotalMinutes = data.length > 0 ? data[data.length - 1].totalMinutes : 0;
      const previousTotalSims = data.length > 0 ? data[data.length - 1].totalSimSessions : 0;

      data.push({
        label: label,
        totalMinutes: Math.round(previousTotalMinutes + newMinutes),
        newMinutes: Math.round(newMinutes),
        totalSimSessions: previousTotalSims + newSimSessions,
        newSimSessions: newSimSessions
      });
    }

    return data;
  }

  private async getRevenueChartData(period: '1w' | '1m' | '3m' | '6m' | '1y' = '1m') {
    const now = new Date();
    const data = [];

    // Determine interval and iterations based on period
    let intervalType: 'day' | 'week' | 'month' = 'day';
    let iterations = 7;

    switch (period) {
      case '1w': // Last 7 days
        intervalType = 'day';
        iterations = 7;
        break;
      case '1m': // Last 30 days
        intervalType = 'day';
        iterations = 30;
        break;
      case '3m': // Last 3 months (approx 12 weeks)
        intervalType = 'week';
        iterations = 12;
        break;
      case '6m': // Last 6 months
        intervalType = 'month';
        iterations = 6;
        break;
      case '1y': // Last 12 months
        intervalType = 'month';
        iterations = 12;
        break;
      default:
        intervalType = 'month';
        iterations = 6;
    }

    // Pre-fetch all potentially relevant subscriptions
    // Optimizing selection
    const allSubscriptions = await this.prisma.subscription.findMany({
      where: {
        createdAt: {
          lte: now
        }
      },
      select: {
        id: true,
        planType: true,
        createdAt: true,
        canceledAt: true,
        status: true,
        user: {
          select: {
            role: true,
            status: true
          }
        }
      }
    });

    const planPrices = {
      basic: 29,
      pro: 59,
      premium: 99,
      agenda_manager: 15,
      // yearly plans approx / 12 for monthly view, but strictly for 'revenue' chart often we want realized revenue or MRR. 
      // simple MRR:
      basic_annual: 290,
      pro_annual: 590,
      premium_annual: 990,
    };

    // Helper to get price (monthly equivalent for MRR logic)
    const getPrice = (planType: string) => {
      const lower = planType?.toLowerCase() || '';
      if (lower.includes('annual')) {
        // Simple MRR approximation: annual price / 12
        const base = lower.replace('_annual', '');
        return (planPrices[lower as keyof typeof planPrices] || (planPrices[base as keyof typeof planPrices] * 10)) / 12;
      }
      return planPrices[lower as keyof typeof planPrices] || 0;
    };

    for (let i = iterations - 1; i >= 0; i--) {
      let startDate: Date;
      let endDate: Date;
      let label: string;

      if (intervalType === 'day') {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        startDate = new Date(d);

        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        label = startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      } else if (intervalType === 'week') {
        // Weeks back
        // To align with "3 months back" roughly:
        const d = new Date(now);
        // Move back i weeks
        d.setDate(d.getDate() - (i * 7));
        // Normalize to start of that week (e.g. Monday) or just use the calculated day as anchor
        // Let's use simpler logic: "Week ending X"
        endDate = new Date(d);
        endDate.setHours(23, 59, 59, 999);

        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        label = `${startDate.getDate()}/${startDate.getMonth() + 1}`;
      } else {
        // Months
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        d.setDate(1); // First day of that month
        d.setHours(0, 0, 0, 0);
        startDate = new Date(d);

        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of that month
        endDate.setHours(23, 59, 59, 999);

        // Label: "Jan", "Feb" etc or "Ene", "Feb"
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        label = monthNames[startDate.getMonth()];
        // If spanning years (e.g. 5y), add year to label. For now 1y max so month is fine.
        if (period === '1y' && i > 0 && startDate.getMonth() === 0) {
          label += ` '${startDate.getFullYear().toString().substring(2)}`;
        }
      }

      // CUMULATIVE: Total Active Revenue & Subs at the END of the period
      const activeSubsAtEnd = allSubscriptions.filter(sub => {
        // Created before or at end date
        const created = sub.createdAt <= endDate;
        // Still active at end date (not cancelled, or cancelled AFTER end date)
        const active = !sub.canceledAt || sub.canceledAt > endDate;

        // --- NEW LOGIC: User Filter ---
        // Must be Active User and not a Restricted Role (Agenda Manager / Admin)
        const validUser =
          sub.user.status === 'ACTIVE' &&
          sub.user.role !== 'AGENDA_MANAGER' &&
          sub.user.role !== 'ADMIN' &&
          sub.user.role !== 'SUPER_ADMIN';

        return created && active && validUser;
      });

      // CUMULATIVE: Total Cancelled/Inactive at the END of the period
      // Subscriptions that were created <= endDate AND have a canceledAt <= endDate
      // Should we also count users who became Inactive/Suspended but sub is technically active?
      // For simplicity/consistency with "Active", we'll consider ANY sub that isn't in "Active" group as Inactive?
      // OR specifically "Cancelled Subscriptions".
      // User said: "Inactive: suspended+deleted".
      // Let's stick to "Cancelled Subscriptions" + "Subs of Inactive Users".
      // Ideally "Total" = Active + Inactive.
      // So Inactive = All - Active.

      const allSubsAtEnd = allSubscriptions.filter(sub => sub.createdAt <= endDate);
      // Let's explicitly calculate "Inactive" as remainder or explicit set?
      // User requested "sum of the two". If we have Active + Cancelled, sum is Total.
      // Let's calculate Cancelled as explicit cancellations for visual clarity, 
      // but maybe "Inactive" bucket is better.
      // Let's stick to "Cancelled or Invalid User Status".

      const inactiveSubsAtEnd = allSubsAtEnd.filter(sub => {
        const isActiveGroup = activeSubsAtEnd.find(a => a.id === sub.id);
        return !isActiveGroup;
      });

      const totalRevenue = activeSubsAtEnd.reduce((sum, sub) => sum + getPrice(sub.planType), 0);
      const totalSubscriptions = activeSubsAtEnd.length;
      const totalCancelled = inactiveSubsAtEnd.length;
      const totalAll = totalSubscriptions + totalCancelled;

      // INCREMENTAL: New Revenue & Subs created DURING the period
      const newSubsInPeriod = allSubscriptions.filter(sub =>
        sub.createdAt >= startDate && sub.createdAt <= endDate
      );

      // For incremental "Cancelled" view, it's ambiguous. "New Cancellations"?
      // Or "New Inactive Users"? 
      // Let's stick to explicitly cancelled/ended subs in period
      const newCancelledInPeriod = allSubscriptions.filter(sub =>
        sub.canceledAt && sub.canceledAt >= startDate && sub.canceledAt <= endDate
      );

      const newRevenue = newSubsInPeriod.reduce((sum, sub) => sum + getPrice(sub.planType), 0);
      const newSubscriptions = newSubsInPeriod.length;
      const newCancelled = newCancelledInPeriod.length;
      const newAll = newSubscriptions + newCancelled; // Logic debatable for incremental sum but valid visually

      data.push({
        label: label,
        totalRevenue: Math.round(totalRevenue),
        newRevenue: Math.round(newRevenue),
        totalSubscriptions: totalSubscriptions,
        totalCancelled: totalCancelled,
        totalAll: totalAll,
        newSubscriptions: newSubscriptions,
        newCancelled: newCancelled,
        newAll: newAll
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

    // 3. Recent Admin Tasks (Onboarding Packs)
    const recentTasks = await this.prisma.adminTask.findMany({
      where: {
        type: 'ONBOARDING_SETUP',
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

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
      })),
      ...recentTasks.map(t => ({
        id: `task-${t.id}`,
        type: 'pack_purchased',
        title: 'Pack On-boarding Contratado',
        description: `${t.user.firstName} ${t.user.lastName} (${t.user.email}) ha contratado el pack.`,
        timestamp: t.createdAt
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
        },
        {
          id: 'agenda_manager',
          name: 'Agenda Manager',
          price: 15,
          currency: 'EUR',
          interval: 'month',
          features: ['Gestión de Agenda', 'Sincronización', 'Multi-profesional']
        },
        {
          id: 'pack_minutes',
          name: 'Pack Minutos IA',
          price: 15, // 1500 cents
          currency: 'EUR',
          interval: 'one-time',
          features: ['500 Minutos Extra', 'Sin Caducidad', 'Uso en Transcripción']
        },
        {
          id: 'pack_sessions',
          name: 'Pack 10 Casos Clínicos',
          price: 15, // 15 EUR
          currency: 'EUR',
          interval: 'one-time',
          features: ['10 Casos Clínicos', 'Sin Caducidad', 'Análisis Avanzado']
        },
        {
          id: 'pack_onboarding',
          name: 'Pack Onboarding',
          price: 50,
          currency: 'EUR',
          interval: 'one-time',
          features: ['Configuración Inicial', 'Formación 1h', 'Soporte Prioritario']
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
    @Query('pack') pack?: string, // Added missing parameter
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
      if (role === 'PSYCHOLOGIST') {
        where.role = {
          in: ['PSYCHOLOGIST', 'PSYCHOLOGIST_BASIC', 'PSYCHOLOGIST_PRO', 'PSYCHOLOGIST_PREMIUM', 'CLINIC']
        };
      } else {
        where.role = role;
      }
    } else {
      // By default exclude admins if no role filter specified
      where.role = {
        notIn: ['ADMIN', 'SUPER_ADMIN']
      };
    }

    console.log('🔍 Filtering Users:', { plan, pack, role });

    if (plan) {
      if (plan.toUpperCase() === 'FREE') {
        where.OR = [
          { subscription: null },
          // Also check for explicit free subscription if it exists, ignoring status or requiring active?
          { subscription: { planType: { equals: 'free', mode: 'insensitive' } } }
        ];
      } else {
        where.subscription = {
          planType: {
            contains: plan, // Changed from equals to contains
            mode: 'insensitive'
          },
          // status: 'active', // Removed status check to ensure all users with this plan history/status appear (or let user filter by Status separately if needed)
        };
      }
    }

    if (pack) {
      if (pack === 'pack_minutes') {
        where.extraTranscriptionMinutes = { gt: 0 };
      } else if (pack === 'pack_sessions') {
        where.extraSimulatorCases = { gt: 0 };
      } else if (pack === 'agenda_manager') {
        where.agendaManagerEnabled = true;
      } else if (pack === 'pack_onboarding') {
        // Future/current implementation for onboarding pack if tracked
      }
    }

    console.log('🔍 Where Clause:', JSON.stringify(where, null, 2));

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

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    await this.logAdminAction('USER_CREATE', {
      createdUserId: user.id,
      email: user.email
    });
    return user;
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    await this.logAdminAction('USER_UPDATE', {
      updatedUserId: id,
      updates: Object.keys(updateUserDto)
    });
    return user;
  }

  @Patch('users/:id/password')
  async changeUserPassword(@Param('id') id: string, @Body() body: AdminChangePasswordDto) {
    const user = await this.usersService.adminChangePassword(id, body.password);
    await this.logAdminAction('USER_PASSWORD_RESET', {
      targetUserId: id
    });
    return user;
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

  @Patch('users/:id/verify')
  async verifyUser(@Param('id') id: string) {
    const user = await this.usersService.verifyUser(id);

    await this.logAdminAction('USER_VERIFY', {
      targetUserId: id
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
      agenda_manager: 15,
    };

    return subscriptions.reduce((total, sub) => {
      const price = planPrices[sub.planType?.toLowerCase() as keyof typeof planPrices] || 0;
      return total + price;
    }, 0);
  }

  private async getSubscriptionStats() {
    const stats = await this.prisma.subscription.groupBy({
      by: ['planType', 'status'],
      _count: true,
    });

    // Count Pack Users (Active if they have > 0 balance)
    const packMinutesCount = await this.prisma.user.count({
      where: { extraTranscriptionMinutes: { gt: 0 } }
    });

    const packSessionsCount = await this.prisma.user.count({
      where: { extraSimulatorCases: { gt: 0 } }
    });

    const result = stats.reduce((acc, stat) => {
      const planKey = (stat.planType || 'UNKNOWN').toUpperCase();
      if (!acc[planKey]) {
        acc[planKey] = {};
      }
      acc[planKey][stat.status.toUpperCase()] = stat._count;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Add Packs
    result['PACK_MINUTES'] = { 'ACTIVE': packMinutesCount };
    result['PACK_SESSIONS'] = { 'ACTIVE': packSessionsCount };
    result['PACK_ONBOARDING'] = { 'ACTIVE': 0 }; // Track if field added

    return result;
  }

  private async logAdminAction(action: string, metadata: any) {
    // In a real app, you'd have a dedicated audit log table
    console.log('Admin Action:', { action, metadata, timestamp: new Date() });
  }

  @Get('tasks')
  async getTasks(
    @Query('status') status?: AdminTaskStatus,
    @Query('type') type?: AdminTaskType,
    @Query('priority') priority?: AdminTaskPriority
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    return this.prisma.adminTask.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() data: { status?: AdminTaskStatus, priority?: AdminTaskPriority, assignedTo?: string }
  ) {
    return this.prisma.adminTask.update({
      where: { id },
      data: {
        ...data,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined
      },
      include: {
        user: true
      }
    });
  }
}