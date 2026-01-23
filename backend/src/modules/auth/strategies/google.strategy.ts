import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const apiUrl = configService.get<string>('API_URL');
        if (!apiUrl) {
            console.warn('API_URL not set. Defaulting to local dev URL.');
        }
        const finalApiUrl = apiUrl || 'http://localhost:3001/api/v1';

        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_ID',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'PLACEHOLDER_SECRET',
            callbackURL: `${finalApiUrl}/auth/google/callback`,
            scope: ['email', 'profile'],
            passReqToCallback: true,
            authorizationParams: {
                prompt: 'select_account'
            },
        });
        const url = configService.get<string>('API_URL')
            ? `${configService.get<string>('API_URL')}/auth/google/callback`
            : 'http://localhost:3001/api/v1/auth/google/callback';
        console.log('--------------------------------------------------');
        console.log('GOOGLE STRATEGY CALLBACK URL:', url);
        console.log('--------------------------------------------------');
    }

    async validate(
        req: any,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        console.log('DEBUG GOOGLE STRATEGY VALIDATE');
        console.log('Req Query:', req.query);
        console.log('State:', req.query?.state);

        const { name, emails, photos } = profile;
        let isRegistering = false;
        let plan: string | undefined;
        let interval: string | undefined;

        try {
            const stateQuery = req.query?.state as string;
            if (stateQuery) {
                if (stateQuery === 'register') {
                    isRegistering = true;
                } else if (stateQuery.startsWith('{') || stateQuery.length > 20) {
                    // Try to parse as JSON (Base64 or raw)
                    let jsonStr = stateQuery;
                    try {
                        jsonStr = Buffer.from(stateQuery, 'base64').toString('utf-8');
                    } catch (e) {
                        console.warn('Failed to decode base64 state:', e);
                        // Fallback: treat as raw string if decoding fails
                        jsonStr = stateQuery;
                    }

                    try {
                        const stateObj = JSON.parse(jsonStr);
                        isRegistering = stateObj.action === 'register';

                        // Fallback: If plan acts as registration trigger
                        if (stateObj.plan && !isRegistering) {
                            console.log('Plan detected in state, forcing isRegistering=true');
                            isRegistering = true;
                        }

                        plan = stateObj.plan;
                        interval = stateObj.interval;
                        console.log('Decoded State:', { isRegistering, plan, interval });
                    } catch (e) {
                        console.warn('Failed to parse state JSON:', e);
                    }
                }
            }
        } catch (e) {
            console.error('Error processing state:', e);
        }

        console.log('Is Registering:', isRegistering);

        // Construct a user object from Google profile
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            refreshToken,
        };

        try {
            const validatedUser = await this.authService.validateGoogleUser(user, isRegistering, plan, interval);
            // Attach plan info to user so controller can see it
            done(null, { ...validatedUser, plan, interval });
        } catch (err) {
            done(err, false);
        }
    }
}
