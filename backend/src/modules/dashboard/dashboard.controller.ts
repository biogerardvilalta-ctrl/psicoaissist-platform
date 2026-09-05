import { Controller, Get, UseGuards,
  UseInterceptors, Req, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard_stats')
  @CacheTTL(60)
  @Get('stats')
    @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
    @ApiResponse({ status: 200 })
    getStats(@Req() req: Request & { user: any }, @Query('professionalId') professionalId?: string) {
        return this.dashboardService.getStats(req.user, professionalId);
    }
}
