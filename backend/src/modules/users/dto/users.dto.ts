import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsBoolean, IsInt } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'contraseña123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: '12345678' })
  @IsString()
  professionalNumber: string;

  @ApiProperty({ example: 'España' })
  @IsString()
  country: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  // New Settings Fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enableReminders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  defaultDuration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  bufferTime?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workStartHour?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workEndHour?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  scheduleConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  hourlyRate?: number;

  @ApiProperty({ required: false })
  googleImportCalendar?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  brandingConfig?: any;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  lastLogin?: Date;

  // Settings Fields
  @ApiProperty({ required: false })
  enableReminders?: boolean;

  @ApiProperty({ required: false })
  defaultDuration?: number;

  @ApiProperty({ required: false })
  bufferTime?: number;

  @ApiProperty({ required: false })
  workStartHour?: string;

  @ApiProperty({ required: false })
  workEndHour?: string;

  @ApiProperty({ required: false })
  scheduleConfig?: any;

  @ApiProperty({ required: false })
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  dashboardLayout?: any;

  @ApiProperty({ required: false })
  hourlyRate?: number;

  @ApiProperty({ required: false })
  googleImportCalendar?: boolean;

  @ApiProperty({ required: false })
  brandingConfig?: any;

  @ApiProperty({ required: false, type: 'object', isArray: true })
  groupMembers?: { id: string; firstName: string; lastName: string }[];

  @ApiProperty({ required: false })
  simulatorUsageCount?: number;

  @ApiProperty({ required: false })
  agendaManagerEnabled?: boolean;

  @ApiProperty({ required: false })
  subscription?: {
    planType: string;
    status: string;
    currentPeriodEnd?: Date;
  };
}

// ... existing code ...
export class ChangeRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class CreateAgendaManagerDto {
  @ApiProperty({ example: 'manager@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'contraseña123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ana' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  lastName: string;
}

export class LinkProfessionalDto {
  @ApiProperty()
  @IsString()
  managerId: string;
}

export class AdminChangePasswordDto {
  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  password: string;
}