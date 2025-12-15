'use client';

import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string>('');
  const [planName, setPlanName] = useState<string>('');

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id') || '';
    const planParam = searchParams.get('plan') || '';
    
    setSessionId(sessionIdParam);
    
    // Convertir el plan type a nombre legible
    const planNames: Record<string, string> = {
      'basic': 'Plan Básico',
      'pro': 'Plan Pro',
      'premium': 'Plan Premium'
    };
    setPlanName(planNames[planParam] || planParam || 'Plan seleccionado');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pago Completado!
        </h1>
        
        <p className="text-gray-600 mb-4">
          Tu suscripción al <strong>{planName}</strong> ha sido activada exitosamente. Ya puedes acceder a todas las funciones de PsycoAI.
        </p>

        {/* Demo mode indicator */}
        {sessionId.includes('demo') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              🎭 <strong>Modo Demo</strong> - Esta es una simulación de pago con fines de prueba
            </p>
          </div>
        )}

        {/* What's next */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">¿Qué sigue?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Accede a tu dashboard personal</li>
            <li>✓ Configura tu perfil profesional</li>
            <li>✓ Comienza tu primera sesión</li>
            <li>✓ Explora las funciones de IA</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {/* Support info */}
        <p className="text-xs text-gray-500 mt-6">
          ¿Necesitas ayuda? <a href="/contact" className="text-blue-600 hover:underline">Contacta soporte</a>
        </p>
      </div>
    </div>
  );
}