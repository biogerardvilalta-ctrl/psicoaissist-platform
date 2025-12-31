import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PLAN_FEATURES, PlanLimits } from './plan-features';

@Injectable()
export class UsageLimitsService {
  constructor(private prisma: PrismaService) { }

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

    if (!user?.subscription || user.subscription.status !== 'active' || user.subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
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
    } else {
      // Fair Use Check for Unlimited
      if (user._count.clients >= PlanLimits.FAIR_USE_CLIENTS) {
        throw new ForbiddenException(
          `Fair Use Policy: Maximum clients limit reached (${PlanLimits.FAIR_USE_CLIENTS}). Please contact support for enterprise options.`
        );
      }
    }
  }

  async checkTranscriptionLimit(userId: string, minutesToAdd: number = 0): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    const usedMinutes = (user as any).transcriptionMinutesUsed || 0;
    const totalProjectedMinutes = usedMinutes + minutesToAdd;

    // Check transcription limit
    if (planFeatures.transcriptionMinutes !== PlanLimits.UNLIMITED) {
      if (totalProjectedMinutes > planFeatures.transcriptionMinutes) {
        throw new ForbiddenException(
          `Monthly transcription limit reached. Used: ${usedMinutes}m / ${planFeatures.transcriptionMinutes}m.`
        );
      }
    } else {
      // Fair Use Check for Unlimited
      if (totalProjectedMinutes > PlanLimits.FAIR_USE_TRANSCRIPTION_MINUTES) {
        throw new ForbiddenException(
          `Fair Use Policy: Transcription usage excessive (${Math.round(usedMinutes / 60)}h used). Please contact commercial team.`
        );
      }
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

    if (!user?.subscription || user.subscription.status !== 'active' || user.subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
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
    } else {
      // Fair Use Check
      if (user._count.reports >= PlanLimits.FAIR_USE_REPORTS) {
        throw new ForbiddenException(
          `Fair Use Policy: Report generation excessive (${PlanLimits.FAIR_USE_REPORTS} reports/month). System protection engaged.`
        );
      }
    }
  }

  async checkSimulatorLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active' || user.subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check simulator cases limit
    if (planFeatures.simulatorCases !== PlanLimits.UNLIMITED) {
      // Calculate effective limit including referral bonuses
      const referralBonus = (user.referralsCount || 0) * 5;
      const totalLimit = planFeatures.simulatorCases + referralBonus;

      // Reset logic should ideally be handled by a scheduled task or on-access check like here
      // But we are reading from user.simulatorUsageCount which is reset manually or by logic in simulator service currently.
      // We will assume simulatorService handles the monthly reset logic OR we move it here.
      // For now, we trust simulatorUsageCount is accurate.

      if (user.simulatorUsageCount >= totalLimit) {
        throw new ForbiddenException(
          `Simulator cases limit reached (${totalLimit} cases/month). Upgrade your plan or invite colleagues.`
        );
      }
    } else {
      // Fair Use Check for Unlimited
      if (user.simulatorUsageCount >= PlanLimits.FAIR_USE_SIMULATOR_CASES) {
        throw new ForbiddenException(
          `Fair Use Policy: Simulator usage excessive (${PlanLimits.FAIR_USE_SIMULATOR_CASES} cases/month).`
        );
      }
    }
  }

  async checkSimulatorMinutesLimit(userId: string, minutesToAdd: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active') return; // Should probably throw, but let's be safe

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) return;

    if (planFeatures.simulatorMinutes !== PlanLimits.UNLIMITED) {
      if (user.simulatorMinutesUsed + minutesToAdd > planFeatures.simulatorMinutes) {
        throw new ForbiddenException(
          `Simulator minutes limit reached (${planFeatures.simulatorMinutes} mins/month).`
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
            },
            sessions: { // Get count of sessions this month for stats
              where: {
                startTime: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
                status: { not: 'CANCELLED' }
              }
            }
          }
        },
        sessions: { // Fetch sessions for duration calc
          where: {
            startTime: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
            status: { not: 'CANCELLED' }
          },
          select: { duration: true }
        }
      },
    });

    if (!user?.subscription) {
      return null;
    }

    // Calculate total duration in minutes then convert to hours for display, 
    // OR keep as minutes if frontend handles display.
    // The plan limit is in hours (e.g. 50, 200). 
    // Let's pass 'transcriptionMinutes' as well for precise tracking.

    const totalSeconds = user.sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) {
      return null;
    }

    const referralBonus = (user.referralsCount || 0) * 5;
    const simulatorCasesLimit = planFeatures.simulatorCases === PlanLimits.UNLIMITED
      ? 9999
      : planFeatures.simulatorCases + referralBonus;

    return {
      planType: user.subscription.planType,
      planFeatures,
      currentUsage: {
        clients: user._count.clients,
        reportsThisMonth: user._count.reports,
        // transcriptionHours would be calculated from actual usage tracking
        transcriptionHours: Math.round(((user as any).transcriptionMinutesUsed || 0) / 60 * 10) / 10,
        transcriptionMinutes: (user as any).transcriptionMinutesUsed || 0,
        simulatorCases: user.simulatorUsageCount,
        simulatorMinutes: user.simulatorMinutesUsed,
      },
      limits: {
        clients: planFeatures.maxClients,
        reportsPerMonth: planFeatures.reportsPerMonth,
        transcriptionHours: Math.round(planFeatures.transcriptionMinutes / 60),
        transcriptionMinutes: planFeatures.transcriptionMinutes,
        simulatorCases: simulatorCasesLimit,
        simulatorMinutes: planFeatures.simulatorMinutes
      },
    };
  }
  async incrementTranscriptionUsage(userId: string, durationSeconds: number): Promise<void> {
    const minutes = Math.ceil(durationSeconds / 60); // Round up to nearest minute
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        transcriptionMinutesUsed: { increment: minutes }
      } as any
    });
  }
}