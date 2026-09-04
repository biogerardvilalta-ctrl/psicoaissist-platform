import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureGuard, RequireFeature } from '../auth/guards/feature.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @ApiOperation({ summary: 'Crear un nuevo informe' })
    @ApiResponse({ status: 201, description: 'Informe creado' })
    @Post()
    create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(req.user.id, createReportDto);
    }

    @ApiOperation({ summary: 'Listar todos los informes' })
    @ApiResponse({ status: 200, description: 'Lista de informes' })
    @Get()
    findAll(@Request() req) {
        return this.reportsService.findAll(req.user.id);
    }

    @ApiOperation({ summary: 'Obtener detalle de un informe' })
    @ApiResponse({ status: 200, description: 'Detalle del informe' })
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.reportsService.findOne(id, req.user.id);
    }

    @ApiOperation({ summary: 'Actualizar un informe' })
    @ApiResponse({ status: 200, description: 'Informe actualizado' })
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
        return this.reportsService.update(id, req.user.id, updateReportDto);
    }

    @ApiOperation({ summary: 'Generar borrador de informe con IA' })
    @ApiResponse({ status: 200, description: 'Borrador generado' })
    @Post('generate-draft')
    @RequireFeature('advancedAnalytics') // Only Pro/Premium can generate AI drafts
    generateDraft(@Request() req, @Body() generateReportDraftDto: any) { // Use valid DTO
        return this.reportsService.generateDraft(req.user.id, generateReportDraftDto);
    }

    @ApiOperation({ summary: 'Exportar todos los informes en PDF (ZIP)' })
    @ApiResponse({ status: 200, description: 'Archivo ZIP con informes' })
    @Get('export/all')
    async exportAll(@Request() req, @Res() res: Response) {
        try {
            const buffer = await this.reportsService.exportAllPdfs(req.user.id);

            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="mis-informes-${new Date().toISOString().split('T')[0]}.zip"`,
                'Content-Length': buffer.length,
            });

            res.end(buffer);
        } catch (error) {
            // Handle "No reports" or other errors
            if (error.status === 404) {
                throw error;
            }
            throw new BadRequestException('Error generating export');
        }
    }

    @ApiOperation({ summary: 'Descargar informe en formato PDF' })
    @ApiResponse({ status: 200, description: 'Archivo PDF del informe' })
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

    @ApiOperation({ summary: 'Descargar informe en formato Word (DOCX)' })
    @ApiResponse({ status: 200, description: 'Archivo DOCX del informe' })
    @Get(':id/download/word')
    async downloadWord(@Request() req, @Param('id') id: string, @Res() res: Response) {
        const buffer = await this.reportsService.downloadDocx(id, req.user.id);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="informe-${id}.docx"`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @ApiOperation({ summary: 'Eliminar un informe' })
    @ApiResponse({ status: 200, description: 'Informe eliminado' })
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.reportsService.remove(id, req.user.id);
    }
}
