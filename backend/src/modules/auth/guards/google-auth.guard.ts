import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const state = req.query.state;


        return {
            state: state,
            prompt: 'select_account',
        };
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        if (err || !user) {
            const res = context.switchToHttp().getResponse();
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

            // Check specific error message or type
            let errorType = 'auth_failed';
            if (err && err.message && err.message.includes('No existe ninguna cuenta')) {
                errorType = 'account_not_found';
            }

            console.warn('Google Auth Failed:', err?.message || 'No user returned');
            return res.redirect(`${frontendUrl}/auth/login?error=${errorType}`);
        }
        return user;
    }
}
