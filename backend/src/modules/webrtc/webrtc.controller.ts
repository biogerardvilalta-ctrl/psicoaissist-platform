import { Controller, Get, UseGuards } from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('webrtc')
@UseGuards(JwtAuthGuard)
export class WebRTCController {
    constructor(private readonly webrtcService: WebRTCService) { }

    @Get('ice-config')
    getIceConfig() {
        return this.webrtcService.getIceConfig();
    }
}
