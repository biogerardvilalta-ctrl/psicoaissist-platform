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
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_ID',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'PLACEHOLDER_SECRET',
            callbackURL: configService.get<string>('API_URL')
                ? `${configService.get<string>('API_URL')}/auth/google/callback`
                : 'http://localhost:3001/api/v1/auth/google/callback',
            scope: ['email', 'profile'],
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
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;

        // Construct a user object from Google profile
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            refreshToken,
        };

        // We don't validate/create here directly but pass the profile to the service
        // In a typical Passport flow, validate handles the user lookup/creation
        // But we might want to defer complex logic to AuthService
        try {
            // We'll add this method to AuthService shortly
            const validatedUser = await this.authService.validateGoogleUser(user);
            done(null, validatedUser);
        } catch (err) {
            done(err, false);
        }
    }
}
