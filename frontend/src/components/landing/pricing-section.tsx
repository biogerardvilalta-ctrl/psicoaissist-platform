'use client';

import { Check, X, Star, Loader2, Users, Building, Zap, Book } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/usePayments';
import { useTranslations } from 'next-intl';

const plansConfig = [
  {
    id: 'basic',
    price: 29,
    popular: false,
    color: 'border-slate-200',
    buttonColor: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200',
  },
  {
    id: 'pro',
    price: 59,
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500 relative',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'premium',
    price: 99,
    popular: false,
    color: 'border-purple-500',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  {
    id: 'clinics',
    price: 'Custom',
    popular: false,
    color: 'border-slate-800 bg-slate-50',
    buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white',
  },
];

export default function PricingSection() {
  const t = useTranslations('Landing.Pricing');
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

    // Redirect to register for all plans as per request
    router.push(`/auth/register?plan=${planId}`);
  };

  return (
    <section id="pricing" className="py-16 bg-gray-50 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            {t('badge')}
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('title')}
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            {t('description')}
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
              {t('billing.monthly')}
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${billingInterval === 'year'
                ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('billing.yearly')} <span className="text-green-600 font-bold text-xs ml-1">{t('billing.save')}</span>
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
            {plansConfig.filter(p => ['basic', 'pro', 'premium'].includes(p.id)).map((plan) => {
              const isAnnual = billingInterval === 'year';
              const price = typeof plan.price === 'number'
                ? (isAnnual ? Math.round(plan.price * 10 / 12) : plan.price)
                : plan.price;

              const features = t.raw(`plans.${plan.id}.features`) as string[];
              const limitations = (t.raw(`plans.${plan.id}`) as any).limitations as string[] || [];

              return (
                <div
                  key={plan.id}
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
                      <h3 className="text-xl font-bold text-gray-900">{t(`plans.${plan.id}.name`)}</h3>
                      <p className="mt-2 text-xs text-gray-600 h-10">{t(`plans.${plan.id}.description`)}</p>
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
                        {features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5" />
                            <span className="ml-3 text-xs text-gray-600">{feature}</span>
                          </li>
                        ))}
                        {limitations.map((limitation, limitationIndex) => (
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
                          t(`plans.${plan.id}.cta`)
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          {t('footer.fairuse')}
        </p>

        {/* Team/Corporate Plans Section */}
        <div className="mt-16">

          {/* Combined Section: Clinics & Extras */}
          <div className="mt-20 lg:flex lg:gap-8 lg:items-start max-w-7xl mx-auto">

            {/* Left Column: Clinics Plan (1/3) */}
            <div className="w-full lg:w-1/3 mb-10 lg:mb-0">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-500" />
                Planes para Organizaciones
              </h3>
              {plansConfig.filter(p => p.id === 'clinics').map((plan) => {
                const features = t.raw(`plans.${plan.id}.features`) as string[];
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col p-8 bg-white border rounded-2xl shadow-sm transition-all h-full ${'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{t(`plans.${plan.id}.name`)}</h3>
                      <p className="mt-4 flex items-baseline text-gray-900">
                        <span className="text-4xl font-extrabold tracking-tight">Custom</span>
                      </p>
                      <p className="mt-6 text-gray-500">{t(`plans.${plan.id}.description`)}</p>

                      <ul role="list" className="mt-6 space-y-4">
                        {features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex">
                            <Check className="flex-shrink-0 h-4 w-4 text-green-500 mt-1" />
                            <span className="ml-3 text-sm text-gray-500">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8">
                      <a
                        href="mailto:ventas@psicoaissist.com"
                        className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors bg-slate-900 hover:bg-slate-800 text-white`}
                      >
                        {t(`plans.${plan.id}.cta`)}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Extras (2/3) */}
            <div className="w-full lg:w-2/3">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('extras.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agenda Manager Add-on */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Book className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t('extras.agenda.title')}</h4>
                      <p className="text-sm text-gray-500">Solo para planes Pro+</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="block text-xl font-bold text-gray-900">15€</span>
                      <span className="text-xs text-gray-500">/mes</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('extras.agenda.description')}
                  </p>
                </div>

                {/* Minute Pack Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t('extras.minutes.title')}</h4>
                      <p className="text-sm text-gray-500">Solo para planes Pro+</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="block text-xl font-bold text-gray-900">15€</span>
                      <span className="text-xs text-gray-500">/500 min</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('extras.minutes.description')}
                  </p>
                </div>

                {/* Onboarding Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t('extras.onboarding.title')}</h4>
                      <p className="text-sm text-gray-500">Puesta en marcha</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="block text-xl font-bold text-gray-900">50€</span>
                      <span className="text-xs text-gray-500">pago único</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('extras.onboarding.description')}
                  </p>
                </div>

                {/* Simulator Pack Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-violet-300 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-violet-100 rounded-lg">
                      <Star className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t('extras.simulator.title')}</h4>
                      <p className="text-sm text-gray-500">Solo para planes Pro+</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="block text-xl font-bold text-gray-900">15€</span>
                      <span className="text-xs text-gray-500">/10 casos</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('extras.simulator.description')}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom note */}
          <div className="mt-12 text-center">
            <p className="text-base text-gray-600">
              {t('footer.contact')}{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contáctanos
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
              {/* <span>✓ 14 días gratis en todos los planes</span> */}
              <span>✓ {t('footer.cancel')}</span>
              <span>✓ {t('footer.data')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}