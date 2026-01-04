import { IsString, IsEmail, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum PlanType {
  BASIC = 'basic',
  PRO = 'pro',
  BUSINESS = 'business',
  PREMIUM_PLUS = 'premium_plus',
  MINUTES_PACK = 'minutes_pack',
  SIMULATOR_PACK = 'simulator_pack',
}

export class CreateCheckoutSessionDto {
  @IsEnum(PlanType)
  plan: PlanType;

  @IsOptional()
  @IsEnum(['month', 'year'])
  interval?: 'month' | 'year';

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class CreateSubscriptionDto {
  @IsString()
  customerId: string;

  @IsEnum(PlanType)
  plan: PlanType;
}

export class UpdateSubscriptionDto {
  @IsString()
  subscriptionId: string;

  @IsEnum(PlanType)
  newPlan: PlanType;
}

export class WebhookDto {
  @IsString()
  signature: string;

  @IsObject()
  payload: any;
}