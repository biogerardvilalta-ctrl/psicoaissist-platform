import { Controller, Get, UseGuards } from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
// Ideally protected, but for guest access (patients) we might need it public or protected by a temporary token.
// For now, let's keep it public or minimally protected if possible, 
// but since patients access via public link, it might be open or token based.
// Given strict instructions not to break things, I'll leave it open or verify usage context.

@Controller('webrtc')
export class WebRTCController {
    constructor(private readonly webrtcService: WebRTCService) { }

    @Get('ice-config')
    getIceConfig() {
        return this.webrtcService.getIceConfig();
    }
}
