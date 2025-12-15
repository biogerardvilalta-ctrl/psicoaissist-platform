
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/sessions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { RolesGuard } from '../../auth/guards/roles.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(req.user.id, createSessionDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.sessionsService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.sessionsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
        return this.sessionsService.update(id, req.user.id, updateSessionDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.sessionsService.remove(id, req.user.id);
    }
}
