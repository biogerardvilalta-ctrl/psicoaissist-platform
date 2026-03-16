'use client';

import { ArrowRight, Check, Play, Shield, Clock } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export function FinalCTASection() {
  const t = useTranslations('Landing.FinalCTA');

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden" id="final-cta">
      {/* Background with gradient and mesh */}
      <div className="absolute inset-0 bg-gradient-cta" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-blue-200 mb-6 sm:mb-8 backdrop-blur-sm animate-fade-in-down">
            <Clock className="w-4 h-4 text-blue-300" />
            {t('badge')}
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 sm:mb-6 tracking-tight leading-tight animate-fade-in-up">
            {t('title.p1')} <br className="hidden md:block" />
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 mt-2">
              {t('title.p2')}
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-blue-100/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            {t('description')}
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-10 sm:mb-12">
            {[
              { label: t('features.setup'), icon: Check },
              { label: t('features.secure'), icon: Shield },
              { label: t('features.support'), icon: ArrowRight },
              { label: t('features.cancel'), icon: Check },
            ].map((prop, i) => (
              <div key={i} className="flex items-center justify-center gap-2 text-white/90 bg-white/5 rounded-xl py-3 px-3 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200">
                <prop.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm leading-tight">{prop.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base sm:text-lg font-bold text-gray-900 shadow-elevated transition-all duration-300 hover:bg-blue-50 hover:scale-[1.02] hover:shadow-2xl focus-ring"
              id="cta-main-register"
            >
              {t('cta.start')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <button
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 text-base sm:text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group"
              onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              id="cta-demo-button"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-4 h-4 fill-white" />
              </div>
              {t('cta.demo')}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <p className="text-blue-200/70 text-sm">
              {t('trust')}
            </p>
          </div>

          {/* Countdown / Offer */}
          <div className="mt-10 sm:mt-12 inline-block">
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl p-px border border-white/10 backdrop-blur-md">
              <div className="bg-blue-950/60 rounded-2xl px-5 sm:px-8 py-4 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="text-center md:text-left">
                  <p className="text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">{t('countdown.title')}</p>
                  <p className="text-white font-medium text-sm sm:text-base">{t('countdown.description')}</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  {[
                    { value: '02', label: t('countdown.days') },
                    { value: '14', label: t('countdown.hours') },
                    { value: '35', label: t('countdown.minutes') },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/30 rounded-xl p-2.5 min-w-[50px] sm:min-w-[60px]">
                      <span className="block text-xl sm:text-2xl font-bold text-white font-mono">{item.value}</span>
                      <span className="text-2xs text-blue-300 uppercase font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}