import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'contraseña123' })
  @IsString()
  @MinLength(6)
  password: string;
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
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty()
  tokens: TokensDto;
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