import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(req.user.id, createReportDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.reportsService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.reportsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
        return this.reportsService.update(id, req.user.id, updateReportDto);
    }

    @Post('generate-draft')
    generateDraft(@Request() req, @Body() generateReportDraftDto: any) { // Use valid DTO
        return this.reportsService.generateDraft(req.user.id, generateReportDraftDto);
    }

    @Get(':id/download')
    async download(@Request() req, @Param('id') id: string, @Res() res: Response) {
        const buffer = await this.reportsService.downloadPdf(id, req.user.id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="informe-${id}.pdf"`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.reportsService.remove(id, req.user.id);
    }
}
