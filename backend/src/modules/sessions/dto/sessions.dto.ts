import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
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

    @IsOptional()
    @IsString()
    notes?: string;
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
}
