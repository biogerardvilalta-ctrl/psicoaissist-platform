import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ReportType, ReportStatus } from '@prisma/client';

export class CreateReportDto {
    @IsString()
    clientId: string;

    @IsString()
    title: string;

    @IsEnum(ReportType)
    reportType: ReportType;

    @IsOptional()
    @IsString()
    sessionId?: string;

    @IsOptional()
    @IsString()
    @IsOptional()
    @IsString()
    content?: string; // HTML or Markdown content

    @IsOptional()
    @IsEnum(ReportStatus)
    status?: ReportStatus;
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

    @IsOptional()
    @IsString()
    professionalSignature?: string;

    @IsOptional()
    @IsBoolean()
    humanReviewConfirmed?: boolean;
}

export class GenerateReportDraftDto {
    @IsString()
    clientId: string;

    @IsEnum(ReportType)
    reportType: ReportType;

    @IsArray()
    @IsString({ each: true })
    sessionIds: string[]; // Sessions to include in the analysis

    @IsOptional()
    @IsString()
    additionalInstructions?: string;
}
