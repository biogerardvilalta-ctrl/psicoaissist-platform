import { Controller, Get, UseGuards } from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('WebRTC')
@ApiBearerAuth()
@Controller('webrtc')
@UseGuards(JwtAuthGuard)
export class WebRTCController {
    constructor(private readonly webrtcService: WebRTCService) { }

    @ApiOperation({ summary: 'Obtener configuración ICE para WebRTC' })
    @ApiResponse({ status: 200, description: 'Configuración ICE obtenida' })
    @Get('ice-config')
    getIceConfig() {
        return this.webrtcService.getIceConfig();
    }
}
