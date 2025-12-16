import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsUUID, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
}

export enum SessionType {
    INDIVIDUAL = 'INDIVIDUAL',
    GROUP = 'GROUP',
    COUPLE = 'COUPLE',
    FAMILY = 'FAMILY'
}

export class CreateSessionDto {
    @IsString()
    @IsNotEmpty()
    clientId: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsEnum(SessionType)
    @IsNotEmpty()
    sessionType: SessionType = SessionType.INDIVIDUAL;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    isMinor?: boolean;
}

export class UpdateSessionDto {
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsEnum(SessionStatus)
    status?: SessionStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    consentSigned?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    consentVersion?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isMinor?: boolean;
}

export class SessionResponseDto {
    id: string;
    clientId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    status: SessionStatus;
    sessionType: SessionType;
    notes?: string; // Decrypted notes
    clientName?: string; // For display
    isMinor?: boolean;
}
