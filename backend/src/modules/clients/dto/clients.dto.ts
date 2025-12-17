import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel } from '@prisma/client';

export class CreateClientDto {
    @ApiProperty({ example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Pérez' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional({ example: 'juan.perez@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+34600000000' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: '555-123-456' })
    @IsString()
    @IsOptional()
    emergencyContact?: string;

    @ApiPropertyOptional({ example: 'Ansiedad generalizada' })
    @IsString()
    @IsOptional()
    diagnosis?: string;

    @ApiPropertyOptional({ example: 'Referred by Dr. Smith' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ enum: RiskLevel, default: RiskLevel.LOW })
    @IsEnum(RiskLevel)
    @IsOptional()
    riskLevel?: RiskLevel;

    @ApiPropertyOptional({ example: '1990-01-01' })
    @IsString()
    @IsOptional()
    birthDate?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    sendEmailReminders?: boolean;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    sendWhatsappReminders?: boolean;
}

export class CreateClientEncryptedDto {
    @ApiProperty({ description: 'Base64 encoded string containing [IV(16b)][Tag(16b)][Cipher]' })
    @IsString()
    @IsNotEmpty()
    encryptedData: string;

    @ApiProperty({ description: 'ID of the encryption key used' })
    @IsString()
    @IsNotEmpty()
    keyId: string;

    @ApiPropertyOptional({ enum: RiskLevel, default: RiskLevel.LOW })
    @IsEnum(RiskLevel)
    @IsOptional()
    riskLevel?: RiskLevel;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    sendEmailReminders?: boolean;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    sendWhatsappReminders?: boolean;
}

export class UpdateClientDto extends CreateClientDto {
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class ClientResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ enum: RiskLevel })
    riskLevel: RiskLevel;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    tags: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ required: false })
    lastSessionAt?: Date;

    @ApiProperty()
    sendEmailReminders: boolean;

    @ApiProperty()
    sendWhatsappReminders: boolean;
}
