'use client';

import { ArrowRight, Brain, Shield, Zap, Sparkles } from 'lucide-react';
import { Link } from '@/navigation';
import { HeroDemo } from './hero-demo';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('Landing.Hero');

  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24" id="hero">
      {/* Animated background decoration */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-60" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="sm:text-center lg:col-span-6 lg:text-left animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-glow-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>

            {/* Title */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl !leading-[1.1]">
              <span className="block">{t('title.p1')}</span>
              <span className="block text-gradient-primary pb-1">
                {t('title.p2')}
              </span>
              <span className="block">{t('title.p3')}</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base text-gray-600 sm:text-lg lg:text-xl max-w-xl sm:mx-auto lg:mx-0 leading-relaxed">
              {t('description')}
            </p>

            {/* Features list */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-md sm:mx-auto lg:mx-0">
              {[
                { icon: Shield, text: t('features.confidential'), color: 'text-emerald-500' },
                { icon: Zap, text: t('features.realtime'), color: 'text-amber-500' },
                { icon: Brain, text: t('features.analysis'), color: 'text-blue-500' },
                { icon: ArrowRight, text: t('features.easy'), color: 'text-purple-500' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-gray-100/80 shadow-card">
                  <feature.icon className={`h-4 w-4 flex-shrink-0 ${feature.color}`} />
                  <span className="text-sm text-gray-700 font-medium leading-tight">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-primary px-7 py-3.5 text-base font-semibold text-white shadow-glow-primary transition-all duration-300 hover:shadow-elevated hover:scale-[1.02] focus-ring w-full sm:w-auto btn-shimmer"
                id="hero-cta-register"
              >
                {t('cta.start')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/simulator/try"
                className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-gray-900 shadow-card transition-all duration-300 hover:border-gray-300 hover:shadow-soft hover:bg-white focus-ring w-full sm:w-auto"
                id="hero-cta-simulator"
              >
                🎮 {t('cta.simulator')}
              </Link>
            </div>
            <div className="mt-4 text-center lg:text-left">
              <Link href="/clinics" className="text-sm text-gray-500 hover:text-primary underline underline-offset-4 transition-colors duration-200">
                {t('cta.clinics')}
              </Link>
            </div>
          </div>

          {/* Hero Demo */}
          <div className="mt-12 lg:mt-0 lg:col-span-6 flex items-center justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}