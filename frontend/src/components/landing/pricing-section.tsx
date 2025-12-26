'use client';

import { Check, X, Star, Loader2, Users, Building, Zap } from 'lucide-react';
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
      'Agenda y facturación básica',
      'Notas clínicas manuales',
      'Soporte por email',
      'Almacenamiento 5GB',
    ],
    limitations: [
      'Sin IA avanzada (0 min/mes)',
      'Sin sesiones simultáneas',
      'Sin simulador de casos',
    ],
    cta: 'Comenzar 14 días gratis',
    popular: false,
    color: 'border-gray-200',
    buttonColor: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    description: 'La opción más popular para práctica profesional',
    features: [
      'Clientes ilimitados',
      'IA Completa (900 min/mes)',
      'Transcripción tiempo real ilimitada',
      'Sincronización Google Calendar',
      'Informes clínicos automaticos',
      'Simulador Clínico (5 casos/mes)',
      'Soporte prioritario',
      'Almacenamiento 50GB',
    ],
    limitations: [],
    cta: 'Prueba Pro 14 días gratis',
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500 relative',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'team',
    name: 'Equipo',
    price: 79,
    description: 'Para pequeños gabinetes con secretaría',
    features: [
      'Incluye 2 Profesionales + 1 Manager',
      'IA Compartida (2.000 min/mes)',
      'Agenda Manager incluido',
      'Calendario unificado de grupo',
      'Almacenamiento 100GB',
      '+20€ por profesional extra',
    ],
    limitations: [
      'Sin Simulador Clínico',
      'Sin API Access',
    ],
    cta: 'Prueba Equipo 14 días gratis',
    popular: false,
    color: 'border-indigo-500',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  {
    id: 'premium',
    name: 'Clínicas',
    price: 149,
    description: 'Centros que priorizan formación y control',
    features: [
      'Incluye 3 Profesionales + 1 Gestor',
      'Simulador Clínico Ilimitado',
      'IA Extendida (5.000 min/mes)',
      'API Access (HIS integration)',
      'Compliance avanzado',
      'Almacenamiento Ilimitado *',
      '+15€ por profesional extra',
    ],
    limitations: [],
    cta: 'Contactar Ventas',
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

    if (planId === 'premium') {
      router.push('/contact');
      return;
    }

    try {
      await createCheckoutSession({
        plan: planId as 'basic' | 'pro' | 'team',
      });
    } catch (err) {
      console.error('Error al crear la sesión de checkout:', err);
      alert(`Error al procesar el plan ${planId}: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-gray-50 sm:py-24">
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
            Comienza con <strong>14 días gratis</strong> en todos los planes. Sin sorpresas.
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
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-sm ${plan.color} border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full text-center">
                  <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <Star className="h-4 w-4 mr-1" />
                    Más popular
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Plan header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-xs text-gray-600 h-10">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600 text-sm">/mes</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="flex-1">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5" />
                        <span className="ml-3 text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={`limitation-${limitationIndex}`} className="flex items-start">
                        <X className="flex-shrink-0 h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="ml-3 text-xs text-gray-400">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA button */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonColor}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        ...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Extras y Servicios Adicionales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minute Pack Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Pack Minutos IA</h4>
                  <p className="text-sm text-gray-500">Solo para planes Pro+</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="block text-xl font-bold text-gray-900">15€</span>
                  <span className="text-xs text-gray-500">/500 min</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ¿Un mes con muchos pacientes? No te quedes sin IA. Añade minutos extra a tu plan cuando lo necesites para cubrir picos de trabajo.
              </p>
            </div>

            {/* Onboarding Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sesión Onboarding</h4>
                  <p className="text-sm text-gray-500">Puesta en marcha</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="block text-xl font-bold text-gray-900">50€</span>
                  <span className="text-xs text-gray-500">pago único</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Configuramos tu cuenta contigo en 45 min: importación de pacientes, enlace con Google Calendar y personalización. Garantía de funcionamiento.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-6">
            * Política de Uso Razonable (Fair Use) aplica al almacenamiento ilimitado (hasta 1TB) para garantizar la estabilidad del servicio.
          </p>
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-base text-gray-600">
            ¿Necesitas un plan a medida para una universidad u hospital?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contáctanos
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