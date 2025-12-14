import { IsString, IsEmail, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum PlanType {
  BASIC = 'basic',
  PRO = 'pro',
  PREMIUM = 'premium',
}

export class CreateCheckoutSessionDto {
  @IsEnum(PlanType)
  plan: PlanType;

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