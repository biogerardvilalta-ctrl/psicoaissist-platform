import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ReportType, ReportStatus } from '@prisma/client';

export class CreateReportDto {
    @IsUUID()
    clientId: string;

    @IsString()
    title: string;

    @IsEnum(ReportType)
    reportType: ReportType;

    @IsOptional()
    @IsUUID()
    sessionId?: string;

    @IsOptional()
    @IsString()
    content?: string; // HTML or Markdown content
}

export class UpdateReportDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(ReportStatus)
    status?: ReportStatus;

    @IsOptional()
    @IsString()
    content?: string;
}

export class GenerateReportDraftDto {
    @IsUUID()
    clientId: string;

    @IsEnum(ReportType)
    reportType: ReportType;

    @IsArray()
    @IsUUID(undefined, { each: true })
    sessionIds: string[]; // Sessions to include in the analysis

    @IsOptional()
    @IsString()
    additionalInstructions?: string;
}
