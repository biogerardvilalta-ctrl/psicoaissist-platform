import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PLAN_FEATURES, PlanLimits } from './plan-features';

@Injectable()
export class UsageLimitsService {
  constructor(private prisma: PrismaService) {}

  async checkClientLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        subscription: true,
        _count: {
          select: {
            clients: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check client limit
    if (planFeatures.maxClients !== PlanLimits.UNLIMITED) {
      if (user._count.clients >= planFeatures.maxClients) {
        throw new ForbiddenException(
          `Client limit reached. Your ${user.subscription.planType} plan allows up to ${planFeatures.maxClients} clients.`
        );
      }
    }
  }

  async checkTranscriptionLimit(userId: string, hoursToAdd: number = 1): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check transcription limit (simplified - in real app you'd track usage)
    if (planFeatures.transcriptionHours !== PlanLimits.UNLIMITED) {
      // Here you would implement actual usage tracking
      // For now, we'll just check the plan allows transcription
      console.log(`Checking transcription limit for user ${userId}: ${hoursToAdd} hours requested`);
    }
  }

  async checkReportsLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        subscription: true,
        _count: {
          select: {
            reports: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Current month
                }
              }
            }
          }
        }
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check reports limit for current month
    if (planFeatures.reportsPerMonth !== PlanLimits.UNLIMITED) {
      if (user._count.reports >= planFeatures.reportsPerMonth) {
        throw new ForbiddenException(
          `Monthly report limit reached. Your ${user.subscription.planType} plan allows up to ${planFeatures.reportsPerMonth} reports per month.`
        );
      }
    }
  }

  async getUserUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        subscription: true,
        _count: {
          select: {
            clients: {
              where: { isActive: true }
            },
            reports: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                }
              }
            }
          }
        }
      },
    });

    if (!user?.subscription) {
      return null;
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType];
    if (!planFeatures) {
      return null;
    }

    return {
      planType: user.subscription.planType,
      planFeatures,
      currentUsage: {
        clients: user._count.clients,
        reportsThisMonth: user._count.reports,
        // transcriptionHours would be calculated from actual usage tracking
        transcriptionHours: 0, // Placeholder
      },
      limits: {
        clients: planFeatures.maxClients,
        reportsPerMonth: planFeatures.reportsPerMonth,
        transcriptionHours: planFeatures.transcriptionHours,
      },
    };
  }
}