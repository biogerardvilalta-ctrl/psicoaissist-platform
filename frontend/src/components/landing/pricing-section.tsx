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
    gradient: '',
    buttonClass: 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300',
  },
  {
    id: 'pro',
    price: 59,
    popular: true,
    gradient: 'ring-2 ring-blue-500 ring-offset-2',
    buttonClass: 'bg-gradient-primary text-white shadow-glow-primary hover:shadow-elevated',
  },
  {
    id: 'premium',
    price: 99,
    popular: false,
    gradient: '',
    buttonClass: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  {
    id: 'clinics',
    price: 'Custom',
    popular: false,
    gradient: '',
    buttonClass: 'bg-gray-900 hover:bg-gray-800 text-white',
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
    if (planId === 'clinics') {
      router.push('/contact');
      return;
    }
    router.push(`/auth/register?plan=${planId}`);
  };

  return (
    <section id="pricing" className="relative py-16 bg-gray-50/80 sm:py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-100 mb-4">
            {t('badge')}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative bg-white p-1 rounded-xl border border-gray-200 shadow-card flex">
            <button
              onClick={() => setBillingInterval('month')}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${billingInterval === 'month'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('billing.monthly')}
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${billingInterval === 'year'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('billing.yearly')}
              <span className="ml-1.5 text-emerald-500 text-xs font-bold">{t('billing.save')}</span>
            </button>
          </div>
        </div>

        {/* Individual Plans Section */}
        <div className="relative mt-12 sm:mt-14 p-4 sm:p-6 lg:p-8 rounded-3xl border-2 border-indigo-100/80 bg-white/50 backdrop-blur-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full border border-indigo-200 shadow-sm uppercase tracking-wider">
              PLANES INDIVIDUALES
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
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
                  className={`relative bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col ${plan.gradient}`}
                  id={`plan-${plan.id}`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <div className="inline-flex items-center bg-gradient-primary text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-glow-primary">
                        <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                        Más popular
                      </div>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    {/* Plan header */}
                    <div className="text-center mb-5">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t(`plans.${plan.id}.name`)}</h3>
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed min-h-[2.5rem]">{t(`plans.${plan.id}.description`)}</p>
                      <div className="mt-4 flex flex-col items-center justify-center">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                            {typeof price === 'number' ? `€${price}` : price}
                          </span>
                          {typeof price === 'number' && (
                            <span className="text-gray-500 text-sm font-medium">/mes</span>
                          )}
                        </div>
                        {isAnnual && typeof plan.price === 'number' && (
                          <span className="text-xs text-emerald-600 font-semibold mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Facturado €{plan.price * 10}/año
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="flex-1">
                      <ul className="space-y-2.5 mb-5">
                        {features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                        {limitations.map((limitation, limitationIndex) => (
                          <li key={`limitation-${limitationIndex}`} className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                              <X className="h-2.5 w-2.5 text-gray-400" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA button */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={loading}
                        className={`w-full inline-flex justify-center items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonClass}`}
                        id={`plan-${plan.id}-cta`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
        <div className="mt-14 sm:mt-20">
          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Left Column: Clinics Plan (1/3) */}
            <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building className="w-4 h-4 text-gray-600" />
                </div>
                Planes para Organizaciones
              </h3>
              {plansConfig.filter(p => p.id === 'clinics').map((plan) => {
                const features = t.raw(`plans.${plan.id}.features`) as string[];
                return (
                  <div
                    key={plan.id}
                    className="relative flex flex-col p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 h-full"
                    id="plan-clinics"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t(`plans.${plan.id}.name`)}</h3>
                      <p className="mt-3 flex items-baseline text-gray-900">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">Custom</span>
                      </p>
                      <p className="mt-4 text-sm text-gray-500 leading-relaxed">{t(`plans.${plan.id}.description`)}</p>

                      <ul role="list" className="mt-5 space-y-3">
                        {features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6">
                      <a
                        href="mailto:suport@psicoaissist.com"
                        className="w-full inline-flex justify-center items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white"
                        id="plan-clinics-cta"
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
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">{t('extras.title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Agenda Manager Add-on */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-indigo-200 transition-all duration-300 group" id="extra-agenda">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl ring-1 ring-inset ring-indigo-100 group-hover:shadow-sm transition-all">
                      <Book className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{t('extras.agenda.title')}</h4>
                      <p className="text-xs text-gray-400">Solo para planes Pro+</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-lg sm:text-xl font-bold text-gray-900">15€</span>
                      <span className="text-xs text-gray-400">/mes</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {t('extras.agenda.description')}
                  </p>
                </div>

                {/* Minute Pack Card */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all duration-300 group" id="extra-minutes">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl ring-1 ring-inset ring-blue-100 group-hover:shadow-sm transition-all">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{t('extras.minutes.title')}</h4>
                      <p className="text-xs text-gray-400">Solo para planes Pro+</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-lg sm:text-xl font-bold text-gray-900">15€</span>
                      <span className="text-xs text-gray-400">/500 min</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {t('extras.minutes.description')}
                  </p>
                </div>

                {/* Onboarding Card */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-purple-200 transition-all duration-300 group" id="extra-onboarding">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl ring-1 ring-inset ring-purple-100 group-hover:shadow-sm transition-all">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{t('extras.onboarding.title')}</h4>
                      <p className="text-xs text-gray-400">Puesta en marcha</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-lg sm:text-xl font-bold text-gray-900">50€</span>
                      <span className="text-xs text-gray-400">pago único</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {t('extras.onboarding.description')}
                  </p>
                </div>

                {/* Simulator Pack Card */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-violet-200 transition-all duration-300 group" id="extra-simulator">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-violet-50 rounded-xl ring-1 ring-inset ring-violet-100 group-hover:shadow-sm transition-all">
                      <Star className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{t('extras.simulator.title')}</h4>
                      <p className="text-xs text-gray-400">Solo para planes Pro+</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-lg sm:text-xl font-bold text-gray-900">15€</span>
                      <span className="text-xs text-gray-400">/10 casos</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {t('extras.simulator.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div className="mt-10 sm:mt-14 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              {t('footer.contact')}{' '}
              <a href="mailto:suport@psicoaissist.com" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Contáctanos
              </a>
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t('footer.cancel')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t('footer.data')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}