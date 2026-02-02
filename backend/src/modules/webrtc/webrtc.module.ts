import { Module } from '@nestjs/common';
import { WebRTCController } from './webrtc.controller';
import { WebRTCService } from './webrtc.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [WebRTCController],
    providers: [WebRTCService],
})
export class WebRTCModule { }
