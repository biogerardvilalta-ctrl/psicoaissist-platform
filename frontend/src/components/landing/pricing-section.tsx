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
      '10 Horas Transcripción (solo texto)',
      'Agenda y facturación básica',
      'Notas clínicas manuales',
      'Almacenamiento 5GB',
    ],
    limitations: [
      'Sin IA Generativa (0 min/mes)',
      'Sin Simulador Clínico',
      'Sin Sincronización Google Calendar',
    ],
    cta: 'Contratar Basic',
    popular: false,
    color: 'border-slate-200',
    buttonColor: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    description: 'La opción más popular para práctica profesional',
    features: [
      'Pacientes ilimitados',
      '15h (900 min) Transcripción + IA',
      'Sincronización Google Calendar',
      'Simulador Clínico (5 casos/mes)',
      'Almacenamiento 50GB',
      'Soporte Prioritario',
    ],
    limitations: [],
    cta: 'Contratar Pro',
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500 relative',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    description: 'Para especialistas con alto volumen de trabajo',
    features: [
      'Todo lo incluido en Pro',
      '50h (3.000 min) Transcripción + IA',
      'Simulador Clínico Ilimitado',
      'Almacenamiento 1TB',
      'Soporte Prioritario + Videollamada',
      'Branding Personalizado',
    ],
    limitations: [],
    cta: 'Contratar Premium',
    popular: false,
    color: 'border-purple-500',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  {
    id: 'business',
    name: 'Business',
    price: 129,
    description: 'Pequeños gabinetes (2 profesionales + manager)',
    features: [
      'Incluye 2 Profesionales + 1 Manager',
      'IA Compartida (2.000 min/mes)',
      'Agenda Manager incluido',
      'Calendario unificado de grupo',
      'Almacenamiento 100GB',
      '+40€ por profesional extra',
    ],
    limitations: [
      'Sin API Access',
    ],
    cta: 'Contratar Business',
    popular: false,
    color: 'border-indigo-500',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  {
    id: 'clinics',
    name: 'Clínicas',
    price: 'Custom',
    description: 'Centros que priorizan formación y control',
    features: [
      'Usuarios ilimitados (a medida)',
      'IA Corporativa (5.000+ min/mes)',
      'API Access (HIS integration)',
      'Compliance Avanzado (Auditoría RGPD) y SSO',
      'Onboarding dedicado',
      'Facturación unificada',
    ],
    limitations: [],
    cta: 'Contactar Ventas',
    popular: false,
    color: 'border-slate-800 bg-slate-50',
    buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white',
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

    if (planId === 'clinics') {
      router.push('/contact');
      return;
    }

    try {
      await createCheckoutSession({
        // @ts-ignore - IDs updated in frontend, backend type might need update
        plan: planId,
        interval: billingInterval,
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
            Empieza gratis con nuestro Plan Demo. Suscríbete cuando necesites más.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative bg-white p-1 rounded-lg border border-gray-200 flex">
            <button
              onClick={() => setBillingInterval('month')}
              className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${billingInterval === 'month'
                ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${billingInterval === 'year'
                ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Anual <span className="text-green-600 font-bold text-xs ml-1">(2 meses gratis)</span>
            </button>
          </div>
        </div>

        {/* Individual Plans Section */}
        <div className="relative mt-12 p-8 rounded-3xl border-2 border-indigo-100 bg-indigo-50/30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-4 py-1.5 rounded-full border border-indigo-200 shadow-sm">
              PLANES INDIVIDUALES
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.filter(p => ['basic', 'pro', 'premium'].includes(p.id)).map((plan) => {
              const isAnnual = billingInterval === 'year';
              const price = typeof plan.price === 'number'
                ? (isAnnual ? Math.round(plan.price * 10 / 12) : plan.price)
                : plan.price;

              return (
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
                      <div className="mt-4 flex flex-col items-center justify-center h-16">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-gray-900">{typeof price === 'number' ? `€${price}` : price}</span>
                          {typeof price === 'number' && <span className="text-gray-600 text-sm">/mes</span>}
                        </div>
                        {isAnnual && typeof plan.price === 'number' && (
                          <span className="text-xs text-green-600 font-medium mt-1">
                            Facturado €{plan.price * 10}/año
                          </span>
                        )}
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
              );
            })}
          </div>
        </div>

        {/* Team/Corporate Plans Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Building className="w-6 h-6 text-gray-400" />
              Planes para Equipos y Organizaciones
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {plans.filter(p => ['business', 'clinics'].includes(p.id)).map((plan) => {
              // Logic for team plans rendering (same card structure essentially or slightly different?)
              // Reusing same card structure for consistency but in 2 cols
              const isAnnual = billingInterval === 'year';
              const price = typeof plan.price === 'number'
                ? (isAnnual ? Math.round(plan.price * 10 / 12) : plan.price)
                : plan.price;

              return (
                <div
                  key={plan.name}
                  className={`relative bg-gray-50 rounded-2xl shadow-sm ${plan.color} border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col`}
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Plan header */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="mt-2 text-xs text-gray-600 h-10">{plan.description}</p>
                      <div className="mt-4 flex flex-col items-center justify-center h-16">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-gray-900">{typeof price === 'number' ? `€${price}` : price}</span>
                          {typeof price === 'number' && <span className="text-gray-600 text-sm">/mes</span>}
                        </div>
                        {isAnnual && typeof plan.price === 'number' && (
                          <span className="text-xs text-green-600 font-medium mt-1">
                            Facturado €{plan.price * 10}/año
                          </span>
                        )}
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
              );
            })}
          </div>
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