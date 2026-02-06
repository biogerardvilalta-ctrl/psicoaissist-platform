'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AuthAPI } from '@/lib/auth-api';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { usePayments } from '@/hooks/usePayments';

function VerifyEmailContent() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verificando tu correo electrónico...');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { loginWithTokens } = useAuth();
    const { createCheckoutSession } = usePayments();

    const token = searchParams.get('token');
    const plan = searchParams.get('plan');
    const interval = searchParams.get('interval');

    // Use a ref to prevent double execution in React Strict Mode which might be causing issues
    const processingRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        if (processingRef.current) return;
        processingRef.current = true;

        const verify = async () => {
            try {
                const response = await AuthAPI.verifyEmail(token);
                // response is AuthResponse { user, tokens, encryptionKey }

                if (response.tokens) {
                    // Auto Login
                    await loginWithTokens(response.user, response.tokens, response.encryptionKey);

                    setStatus('success');
                    setMessage('¡Email verificado! Redirigiendo...');

                    // Redirect logic
                    if (plan && plan !== 'demo') {
                        setMessage('¡Verificado! Redirigiendo al pago...');
                        try {
                            await createCheckoutSession({
                                plan: plan as any,
                                interval: (interval as 'month' | 'year') || 'month'
                            });
                            // Checkout session handles redirect
                        } catch (err) {
                            console.error("Auto-checkout failed", err);
                            // Fallback
                            router.push('/dashboard?error=checkout_failed');
                        }
                    } else {
                        // Default redirect
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 1500);
                    }
                } else {
                    // Should not happen for verified user unless backend changes
                    setStatus('success');
                    setMessage('Email verificado. Por favor inicia sesión.');
                }

            } catch (error) {
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Error al verificar el email.');
                processingRef.current = false; // Allow retry if error
            }
        };

        verify();
    }, [token, loginWithTokens, router, plan, interval, createCheckoutSession]);

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
            {status === 'verifying' && (
                <>
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando...</h2>
                    <p className="text-gray-600">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Verificado!</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="space-y-3">
                        <Link
                            href="/auth/login"
                            className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Volver al Login
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
