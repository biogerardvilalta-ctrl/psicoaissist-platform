import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebRTCService {
    constructor(private configService: ConfigService) { }

    getIceConfig() {
        // 1. Get Secret and Realm from Config
        // Note: These should be added to .env
        const secret = this.configService.get<string>('TURN_SECRET') || 'replace_this_with_a_secure_secret_in_production_env';
        // If we use 'use-auth-secret' in coturn, we need to generate credentials.

        const ttl = 24 * 3600; // 24 hours
        const now = Math.floor(Date.now() / 1000);
        const timeToExpire = now + ttl;

        const username = `${timeToExpire}:guest`;
        const hmac = crypto.createHmac('sha1', secret);
        hmac.setEncoding('base64');
        hmac.write(username);
        hmac.end();
        const password = hmac.read();

        const turnServer = {
            urls: [
                'turn:psicoaissist.com:3478?transport=udp',
                'turn:psicoaissist.com:3478?transport=tcp'
            ],
            username: username,
            credential: password,
        };

        // Include Google STUN as backup/primary for quick connectivity
        const iceServers = [
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                ]
            },
            turnServer
        ];

        return { iceServers };
    }
}
