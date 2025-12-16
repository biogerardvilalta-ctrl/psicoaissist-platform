import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
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

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.reportsService.remove(id, req.user.id);
    }
}
