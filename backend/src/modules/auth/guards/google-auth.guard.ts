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
            console.error('GoogleAuthGuard Error:', err);
            console.error('GoogleAuthGuard User:', user);
            console.error('GoogleAuthGuard Info:', info);

            const res = context.switchToHttp().getResponse();
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

            // Check specific error message or type
            let errorType = 'auth_failed';
            if (err && err.message && err.message.includes('No existe ninguna cuenta')) {
                errorType = 'account_not_found';
            }

            console.warn('Google Auth Failed: returning error object to controller');
            // Return an error object that the controller can handle, INSTEAD of redirecting here
            // This prevents the "Headers already sent" error caused by NestJS trying to handle the "false" return
            return {
                _isError: true,
                message: err?.message || 'Authentication failed',
                info: info,
                errorType: errorType
            };
        }
        return user;
    }
}
