'use client';

import { Check, X, Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/usePayments';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    description: 'Perfecto para psicólogos independientes que comienzan',
    features: [
      'Hasta 25 clientes activos',
      'Transcripción básica',
      'Informes estándar',
      'Soporte por email',
      'Almacenamiento 5GB',
    ],
    limitations: [
      'Sin IA avanzada',
      'Sin sesiones simultáneas',
      'Sin simulador de casos',
      'Sin API access',
    ],
    cta: 'Comenzar Basic',
    popular: false,
    color: 'border-gray-300',
    buttonColor: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    description: 'La opción más popular para práctica profesional',
    features: [
      'Clientes ilimitados',
      'IA asistente completa',
      'Transcripción en tiempo real',
      'Sesiones simultáneas',
      'Analytics avanzados',
      'Informes personalizados',
      'Soporte prioritario',
      'Almacenamiento 50GB',
      'Backup automático',
    ],
    limitations: [],
    cta: 'Elegir Pro',
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    description: 'Para clínicas, formación y uso empresarial',
    features: [
      'Todo lo incluido en Pro',
      'Simulador completo de casos',
      'API access completo',
      'Usuarios múltiples',
      'Dashboard administrativo',
      'Integraciones avanzadas',
      'Soporte 24/7 dedicado',
      'Almacenamiento ilimitado',
      'Compliance personalizado',
      'Entrenamiento personalizado',
    ],
    limitations: [],
    cta: 'Elegir Premium',
    popular: false,
    color: 'border-purple-500',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
];

export default function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isClient, setIsClient] = useState(false);
  const { createCheckoutSession, loading, error } = usePayments();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectPlan = async (planId: string) => {
    console.log('Plan seleccionado:', planId);
    
    try {
      await createCheckoutSession({
        plan: planId as 'basic' | 'pro' | 'premium',
      });
    } catch (err) {
      console.error('Error al crear la sesión de checkout:', err);
      alert(`Error al procesar el plan ${planId}: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  return (
    <section className="py-16 bg-gray-50 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Precios
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Planes diseñados para cada etapa profesional
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Comienza gratis y escala según crezca tu práctica. Sin sorpresas, sin compromisos.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative bg-white p-1 rounded-lg border border-gray-200">
            <button className="relative px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
              Mensual
            </button>
            <button className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              Anual (2 meses gratis)
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-sm ${plan.color} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <Star className="h-4 w-4 mr-1" />
                    Más popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan header */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                </div>

                {/* CTA button */}
                <div className="mt-8">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonColor}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>

                {/* Features list */}
                <div className="mt-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                        <span className="ml-3 text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={`limitation-${limitationIndex}`} className="flex items-start">
                        <X className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                        <span className="ml-3 text-sm text-gray-400">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-base text-gray-600">
            ¿Necesitas algo específico?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contáctanos para un plan personalizado
            </Link>
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>✓ 14 días gratis en todos los planes</span>
            <span>✓ Cancela cuando quieras</span>
            <span>✓ Datos siempre tuyos</span>
          </div>
        </div>
      </div>
    </section>
  );
}