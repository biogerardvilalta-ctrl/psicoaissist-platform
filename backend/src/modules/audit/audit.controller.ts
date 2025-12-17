
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async findAll(@Request() req, @Query('limit') limit: string, @Query('offset') offset: string) {
        const lim = limit ? parseInt(limit) : 20;
        const off = offset ? parseInt(offset) : 0;
        return this.auditService.findAll(req.user.id, lim, off);
    }
}
