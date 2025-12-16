import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
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
}

export class ChangeRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}