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
    const planLimit = planFeatures.transcriptionMinutes;
    const extraMinutes = (user as any).extraTranscriptionMinutes || 0;

    // Check transcription limit
    if (planLimit !== PlanLimits.UNLIMITED) {
      const available = Math.max(0, planLimit - usedMinutes) + extraMinutes;

      if (minutesToAdd > available) {
        throw new ForbiddenException(
          `Monthly transcription limit reached. Plan: ${planLimit}m. Extra: ${extraMinutes}m. Used: ${usedMinutes}m.`
        );
      }
    } else {
      // Fair Use Check for Unlimited
      const totalProjectedMinutes = usedMinutes + minutesToAdd;
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
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active' || user.subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    // Use currentPeriodStart for billing cycle, fallback to 1st of month if missing for some reason
    const periodStart = user.subscription.currentPeriodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const reportCount = await this.prisma.report.count({
      where: {
        userId: userId,
        createdAt: {
          gte: periodStart
        }
      }
    });

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check reports limit for current month
    if (planFeatures.reportsPerMonth !== PlanLimits.UNLIMITED) {
      if (reportCount >= planFeatures.reportsPerMonth) {
        throw new ForbiddenException(
          `Monthly report limit reached. Your ${user.subscription.planType} plan allows up to ${planFeatures.reportsPerMonth} reports per month.`
        );
      }
    } else {
      // Fair Use Check
      if (reportCount >= PlanLimits.FAIR_USE_REPORTS) {
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
      // Calculate effective limit including referral bonuses AND extra packs
      const referralBonus = (user.referralsCount || 0) * 5;
      const extraCases = (user as any).extraSimulatorCases || 0;
      const totalLimit = planFeatures.simulatorCases + referralBonus + extraCases;

      // Reset logic should ideally be handled by a scheduled task or on-access check like here
      // But we are reading from user.simulatorUsageCount which is reset manually or by logic in simulator service currently.
      // We will assume simulatorService handles the monthly reset logic OR we move it here.
      // For now, we trust simulatorUsageCount is accurate.

      if (user.simulatorUsageCount >= totalLimit) {
        throw new ForbiddenException(
          `Simulator cases limit reached (${totalLimit} cases/month including extras). Upgrade your plan or buy a pack.`
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
    const extraSimulatorCases = (user as any).extraSimulatorCases || 0;
    const simulatorCasesLimit = planFeatures.simulatorCases === PlanLimits.UNLIMITED
      ? 9999
      : planFeatures.simulatorCases + referralBonus + extraSimulatorCases;

    // Limits logic
    const extraTranscriptionMinutes = (user as any).extraTranscriptionMinutes || 0;
    const totalTranscriptionLimit = planFeatures.transcriptionMinutes === PlanLimits.UNLIMITED
      ? PlanLimits.UNLIMITED
      : planFeatures.transcriptionMinutes + extraTranscriptionMinutes;

    return {
      planType: user.subscription.planType,
      planFeatures,
      currentUsage: {
        clients: user._count.clients,
        reportsThisMonth: user._count.reports,
        // transcriptionHours would be calculated from actual usage tracking
        transcriptionHours: Math.round(((user as any).transcriptionMinutesUsed || 0) / 60 * 10) / 10,
        transcriptionMinutes: (user as any).transcriptionMinutesUsed || 0,
        extraTranscriptionMinutes: extraTranscriptionMinutes, // Pass explicit extra for UI
        simulatorCases: user.simulatorUsageCount,
        simulatorMinutes: user.simulatorMinutesUsed,
        limitResetDate: user.subscription.currentPeriodEnd,
        subscriptionStatus: user.subscription.status,
      },
      limits: {
        clients: planFeatures.maxClients,
        reportsPerMonth: planFeatures.reportsPerMonth,
        transcriptionHours: Math.round(totalTranscriptionLimit / 60),
        transcriptionMinutes: totalTranscriptionLimit, // This is Plan + Extra
        simulatorCases: simulatorCasesLimit,
        simulatorMinutes: planFeatures.simulatorMinutes
      },
    };
  }
  async incrementTranscriptionUsage(userId: string, durationSeconds: number): Promise<{ limitExceeded: boolean }> {
    const minutes = Math.ceil(durationSeconds / 60);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      return { limitExceeded: true };
    }

    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) return { limitExceeded: true };

    const currentUsed = (user as any).transcriptionMinutesUsed || 0;
    const planLimit = planFeatures.transcriptionMinutes;
    const extraMinutes = (user as any).extraTranscriptionMinutes || 0;

    // Check limit before update
    if (planLimit !== PlanLimits.UNLIMITED) {
      const available = Math.max(0, planLimit - currentUsed) + extraMinutes;
      if (minutes > available) {
        return { limitExceeded: true };
      }
    } else {
      if (currentUsed + minutes >= PlanLimits.FAIR_USE_TRANSCRIPTION_MINUTES) {
        return { limitExceeded: true };
      }
    }

    // Determine how much to deduct from Extra vs Count as Normal Usage
    // Actually, we ALWAYS increment 'transcriptionMinutesUsed' for stats.
    // But we need to decrement 'extraTranscriptionMinutes' ONLY if we are dipping into them.
    // Dip amount = max(0, (currentUsed + minutes) - planLimit) - max(0, currentUsed - planLimit)
    // Basically: newOverdraft - oldOverdraft.

    let decrementExtra = 0;
    if (planLimit !== PlanLimits.UNLIMITED) {
      const oldOverdraft = Math.max(0, currentUsed - planLimit);
      const newOverdraft = Math.max(0, (currentUsed + minutes) - planLimit);
      decrementExtra = newOverdraft - oldOverdraft;
    }

    // Safety check just in case
    if (decrementExtra > extraMinutes) {
      // This shouldn't happen due to the check above, but purely for robustness:
      decrementExtra = extraMinutes; // drain what's left
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        transcriptionMinutesUsed: { increment: minutes },
        ...(decrementExtra > 0 ? { extraTranscriptionMinutes: { decrement: decrementExtra } } : {})
      } as any
    });

    // Calculate remaining (after update) to return strict status
    const newUsed = currentUsed + minutes;
    const newExtra = Math.max(0, extraMinutes - decrementExtra);
    const newAvailable = planLimit === PlanLimits.UNLIMITED ? 99999 : Math.max(0, planLimit - newUsed) + newExtra;

    return { limitExceeded: false, remainingMinutes: newAvailable };
  }
}