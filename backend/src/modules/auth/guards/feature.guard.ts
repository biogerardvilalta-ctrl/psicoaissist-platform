import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PLAN_FEATURES } from '../../payments/plan-features';

export const RequireFeature = (feature: string) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('required-feature', feature, descriptor.value);
    } else {
      Reflect.defineMetadata('required-feature', feature, target);
    }
  };
};

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>('required-feature', context.getHandler());

    if (!requiredFeature) {
      return true; // No feature requirement
    }

    const request = context.switchToHttp().getRequest();
    // Support both 'id' (typical Passport) and 'sub' (JWT standard)
    const userId = request.user?.id || request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Get user's subscription
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // ADMIN Override: Admins have access to all features
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user has active subscription
    if (!user.subscription || user.subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }

    // Get plan features
    const planFeatures = PLAN_FEATURES[user.subscription.planType.toLowerCase()];
    if (!planFeatures) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    // Check specific features
    switch (requiredFeature) {
      case 'advancedAnalytics':
        if (!planFeatures.advancedAnalytics) {
          throw new ForbiddenException('Advanced analytics requires Pro or Premium plan');
        }
        break;

      case 'apiAccess':
        if (!planFeatures.apiAccess) {
          throw new ForbiddenException('API access requires Pro or Premium plan');
        }
        break;

      case 'customBranding':
        if (!planFeatures.customBranding) {
          throw new ForbiddenException('Custom branding requires Premium plan');
        }
        break;

      case 'ssoIntegration':
        if (!planFeatures.ssoIntegration) {
          throw new ForbiddenException('SSO integration requires Premium plan');
        }
        break;

      case 'prioritySupport':
        if (!planFeatures.prioritySupport) {
          throw new ForbiddenException('Priority support requires Premium plan');
        }
        break;

      default:
        // Unknown feature, allow by default
        return true;
    }

    return true;
  }
}