import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PLAN_FEATURES, PlanLimits } from './plan-features';
import { addMonths, isBefore, isAfter } from 'date-fns';

import { UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsageLimitsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async getPlanFeatures(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    // Use the robust logic (Role Override > Subscription > Demo)
    const subscription = this.getEffectiveSubscription(user);
    if (!subscription) return null;

    return PLAN_FEATURES[subscription.planType.toLowerCase()];
  }

  private getEffectiveSubscription(user: any) {
    // Override: Check Role FIRST for administrative/manual entitlements
    // This ensures that if a user has a "Pro" role but a "Basic" subscription record, the Role wins.
    if (user?.role) {
      const role = user.role.toString().toUpperCase();
      // Map roles to plans
      if (role.includes('PREMIUM') || role.includes('PRO') || role.includes('TRIAL')) {
        let planType = 'basic';
        if (role.includes('PREMIUM')) planType = 'premium';
        else if (role.includes('PRO')) planType = 'pro';
        else if (role.includes('TRIAL')) planType = 'pro'; // Trial acts as Pro

        // Return a virtual active subscription
        return {
          planType: planType,
          status: 'active',
          currentPeriodStart: new Date(),
          // Valid for 1 year from now (rolling) to ensure it doesn't expire for admin-granted roles
          currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        };
      }
    }

    if (user?.subscription) return user.subscription;

    // Virtual Demo Subscription (Default for new users without sub/role)
    return {
      planType: 'DEMO',
      status: 'active',
      currentPeriodStart: user.createdAt,
      currentPeriodEnd: new Date(new Date(user.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    };
  }

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

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active' || subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check client limit
    if (planFeatures.maxClients !== PlanLimits.UNLIMITED) {
      if (user._count.clients >= planFeatures.maxClients) {
        throw new ForbiddenException(
          `Client limit reached. Your ${subscription.planType} plan allows up to ${planFeatures.maxClients} clients.`
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

    // Check for 75% Warning Trigger
    if (!user.clientWarningSent) {
      let limitToCheck = planFeatures.maxClients;
      if (limitToCheck === PlanLimits.UNLIMITED) {
        limitToCheck = PlanLimits.FAIR_USE_CLIENTS;
      }

      const usagePercent = (user._count.clients / limitToCheck) * 100;

      if (usagePercent >= 75) {
        // Fire and forget update to avoid blocking flow
        // But we need to update the user record to prevent spamming
        await this.prisma.user.update({
          where: { id: userId },
          data: { clientWarningSent: true }
        });
        await this.notifyAdmins(user, 'Pacientes Activos', user._count.clients, limitToCheck);
      }
    }
  }

  async checkTranscriptionLimit(userId: string, minutesToAdd: number = 0): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
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

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active' || subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    // Use currentPeriodStart for billing cycle, fallback to 1st of month if missing for some reason
    const periodStart = subscription.currentPeriodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const reportCount = await this.prisma.report.count({
      where: {
        userId: userId,
        createdAt: {
          gte: periodStart
        }
      }
    });

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check reports limit for current month
    if (planFeatures.reportsPerMonth !== PlanLimits.UNLIMITED) {
      if (reportCount >= planFeatures.reportsPerMonth) {
        throw new ForbiddenException(
          `Monthly report limit reached. Your ${subscription.planType} plan allows up to ${planFeatures.reportsPerMonth} reports per month.`
        );
      }
    }

    // Check for 75% Warning Trigger
    if (!user.reportWarningSent) {
      let limitToCheck = planFeatures.reportsPerMonth;
      if (limitToCheck === PlanLimits.UNLIMITED) {
        limitToCheck = PlanLimits.FAIR_USE_REPORTS;
      }

      const usagePercent = (reportCount / limitToCheck) * 100;

      if (usagePercent >= 75) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { reportWarningSent: true }
        });
        await this.notifyAdmins(user, 'Informes Generados', reportCount, limitToCheck);
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

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active' || subscription.currentPeriodEnd < new Date()) {
      throw new ForbiddenException('Active subscription required or trial expired');
    }

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
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

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active') return; // Should probably throw, but let's be safe

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
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

    // If no subscription, treat as DEMO
    const subscription = this.getEffectiveSubscription(user);

    if (!subscription) {
      return null; // Should not happen with above fallback, but kept for type safety if needed
    }

    // Calculate total duration in minutes then convert to hours for display, 
    // OR keep as minutes if frontend handles display.
    // The plan limit is in hours (e.g. 50, 200). 
    // Let's pass 'transcriptionMinutes' as well for precise tracking.

    const totalSeconds = user.sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
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
      planType: subscription.planType,
      planFeatures,
      currentUsage: {
        clients: user._count.clients,
        reportsThisMonth: user._count.reports,
        // transcriptionHours would be calculated from actual usage tracking
        transcriptionHours: Math.round(((user as any).transcriptionMinutesUsed || 0) / 60 * 10) / 10,
        transcriptionMinutes: (user as any).transcriptionMinutesUsed || 0,
        extraTranscriptionMinutes: extraTranscriptionMinutes, // Pass explicit extra for UI
        simulatorCases: user.simulatorUsageCount,
        extraSimulatorCases: extraSimulatorCases, // Explicitly return extra cases
        simulatorMinutes: user.simulatorMinutesUsed,
        limitResetDate: this.getNextMonthlyResetDate(subscription.currentPeriodStart),
        subscriptionStatus: subscription.status,
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
  async incrementTranscriptionUsage(userId: string, durationSeconds: number): Promise<{ limitExceeded: boolean; remainingMinutes?: number }> {
    const minutes = Math.ceil(durationSeconds / 60);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active') {
      return { limitExceeded: true };
    }

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
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

    // Check for 75% Warning Trigger
    let shouldTriggerWarning = false;
    const totalLimit = planLimit === PlanLimits.UNLIMITED ? PlanLimits.FAIR_USE_TRANSCRIPTION_MINUTES : (planLimit + extraMinutes);
    const newUsed = currentUsed + minutes;

    if (!user.transcriptionWarningSent) {
      const usagePercent = (newUsed / totalLimit) * 100;
      if (usagePercent >= 75) {
        shouldTriggerWarning = true;
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
        ...(decrementExtra > 0 ? { extraTranscriptionMinutes: { decrement: decrementExtra } } : {}),
        ...(shouldTriggerWarning ? { transcriptionWarningSent: true } : {})
      } as any
    });

    if (shouldTriggerWarning) {
      await this.notifyAdmins(user, 'Transcripción', Math.round(newUsed), Math.round(totalLimit));
    }

    // Calculate remaining (after update) to return strict status
    // newUsed is already calculated above
    const newExtra = Math.max(0, extraMinutes - decrementExtra);
    const newAvailable = planLimit === PlanLimits.UNLIMITED ? 99999 : Math.max(0, planLimit - newUsed) + newExtra;

    return { limitExceeded: false, remainingMinutes: newAvailable };
  }

  async incrementSimulatorUsage(userId: string): Promise<{ limitExceeded: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const subscription = this.getEffectiveSubscription(user);
    if (!subscription || subscription.status !== 'active') {
      return { limitExceeded: true }; // Or throw ForbiddenException
    }

    const planFeatures = PLAN_FEATURES[subscription.planType.toLowerCase()];
    if (!planFeatures) return { limitExceeded: true };

    const currentUsed = user.simulatorUsageCount || 0;
    const planLimit = planFeatures.simulatorCases;
    const extraCases = (user as any).extraSimulatorCases || 0;
    const referralBonus = (user.referralsCount || 0) * 5;

    // Effective Plan Limit includes referral bonuses but NOT extra packs (which are separate bucket usually, 
    // but in checkSimulatorLimit we treated them as one. 
    // Here we split them to know when to deduct from extra).
    // Actually, checkSimulatorLimit combined them: totalLimit = plan + referral + extra.
    // So if usage >= totalLimit, it fails.

    // For deduction logic:
    // If usage < (plan + referral), we just increment usage.
    // If usage >= (plan + referral), we increment usage AND decrement extra.

    const baseLimit = planFeatures.simulatorCases === PlanLimits.UNLIMITED
      ? 999999
      : planFeatures.simulatorCases + referralBonus;

    // Check strict global limit first
    const totalLimit = planFeatures.simulatorCases === PlanLimits.UNLIMITED
      ? 999999
      : baseLimit + extraCases;

    if (currentUsed >= totalLimit) {
      return { limitExceeded: true };
    }

    // Check for 75% Warning Trigger
    let shouldTriggerWarning = false;
    const newUsed = currentUsed + 1; // Anticipate the increment

    // For fair play warning, we care about the "Total Limit" (Plan + Referral + Extra) for capped plans,
    // OR the Fair Use Limit for unlimited plans.
    const warningLimitBase = planFeatures.simulatorCases === PlanLimits.UNLIMITED
      ? PlanLimits.FAIR_USE_SIMULATOR_CASES
      : (planFeatures.simulatorCases + referralBonus + extraCases);

    if (!user.simulatorWarningSent) {
      const usagePercent = (newUsed / warningLimitBase) * 100;
      if (usagePercent >= 75) {
        shouldTriggerWarning = true;
      }
    }

    // Determine if we are dipping into extras
    // We increase usage first.
    // If (currentUsed + 1) > baseLimit, we consume 1 extra.

    let decrementExtra = 0;
    if (planFeatures.simulatorCases !== PlanLimits.UNLIMITED) {
      if (currentUsed >= baseLimit) {
        decrementExtra = 1;
      }
    }

    // Safety check
    if (decrementExtra > extraCases) {
      decrementExtra = 0; // Should not happen if totalLimit checked correctly, but safe keeping
      // Or return limitExceeded?
      if (extraCases === 0 && decrementExtra > 0) return { limitExceeded: true };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        simulatorUsageCount: { increment: 1 },
        ...(decrementExtra > 0 ? { extraSimulatorCases: { decrement: decrementExtra } } : {}),
        ...(shouldTriggerWarning ? { simulatorWarningSent: true } : {})
      } as any
    });

    if (shouldTriggerWarning) {
      await this.notifyAdmins(user, 'Simulador', newUsed, totalLimit);
    }

    return { limitExceeded: false };
  }

  getNextMonthlyResetDate(periodStart: Date): Date {
    const now = new Date();
    let nextReset = new Date(periodStart);

    // If periodStart is invalid, return now
    if (isNaN(nextReset.getTime())) {
      return now;
    }

    // If periodStart is in the future (e.g. just subscribed?), return it.
    if (isAfter(nextReset, now)) {
      return nextReset;
    }

    // Advance by months until we pass 'now'
    while (isBefore(nextReset, now) || nextReset.getTime() === now.getTime()) {
      nextReset = addMonths(nextReset, 1);
    }

    return nextReset;
  }


  private async notifyAdmins(user: any, resourceName: string, used: number, limit: number) {
    try {
      // Find all admins
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN }
      });

      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.id,
          title: '⚠️ Alerta de Fair Use',
          message: `El usuario ${user.firstName} ${user.lastName} (${user.email}) ha superado el 75% de su límite de ${resourceName}. Uso: ${used}/${limit}.`,
          type: 'WARNING',
          data: {
            targetUserId: user.id,
            resource: resourceName,
            used,
            limit
          }
        });
      }
    } catch (error) {
      console.error('Failed to notify admins about usage limit:', error);
    }
  }
}