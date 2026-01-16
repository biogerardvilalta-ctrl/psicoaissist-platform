import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  @IsOptional() // Optional if encryptedData is present
  email?: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  @IsOptional() // Optional if encryptedData is present
  password?: string;

  @ApiProperty({ description: 'Datos de login encriptados (RSA-OAEP Base64)', required: false })
  @IsString()
  @IsOptional()
  encryptedData?: string;
}

export class RegisterDto {
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

  @ApiProperty({ required: false, example: 'REF12345' })
  @IsString()
  @IsOptional()
  referralCode?: string;
}

export class TokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
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

  @ApiProperty()
  status: string;

  @ApiProperty()
  enableReminders: boolean;

  @ApiProperty()
  defaultDuration: number;

  @ApiProperty()
  bufferTime: number;

  @ApiProperty()
  workStartHour: string;

  @ApiProperty()
  workEndHour: string;

  @ApiProperty()
  preferredLanguage: string;

  @ApiProperty({ required: false })
  scheduleConfig?: any;

  @ApiProperty()
  hourlyRate: number;

  @ApiProperty({ required: false })
  dashboardLayout?: string[];

  @ApiProperty({ required: false })
  referralCode?: string;

  @ApiProperty({ required: false })
  referralsCount?: number;

  @ApiProperty({ description: 'Suscripción del usuario', required: false })
  subscription?: any;

  @ApiProperty({ required: false })
  simulatorUsageCount?: number;

  @ApiProperty({ required: false })
  agendaManagerEnabled?: boolean;

  @ApiProperty({ required: false })
  hasOnboardingPack?: boolean;
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty()
  tokens: TokensDto;

  @ApiProperty()
  encryptionKey: {
    id: string;
    key: string;
  };
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  professionalNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  enableReminders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  defaultDuration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  bufferTime?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  workStartHour?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  workEndHour?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  scheduleConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  hourlyRate?: number;
}