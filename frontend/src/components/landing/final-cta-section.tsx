'use client';

import { ArrowRight, Check, Play, Shield, Clock } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export function FinalCTASection() {
  const t = useTranslations('Landing.FinalCTA');

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient and mesh */}
      <div className="absolute inset-0 bg-blue-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

          <div className="lg:col-span-12 text-center">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 text-sm font-medium text-blue-200 mb-8 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-blue-400" />
              {t('badge')}
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('title.p1')} <br className="hidden md:block" />
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mt-2">
                {t('title.p2')}
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('description')}
            </p>

            {/* Value Props Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {[
                { label: t('features.setup'), icon: Check },
                { label: t('features.secure'), icon: Shield },
                { label: t('features.support'), icon: ArrowRight },
                { label: t('features.cancel'), icon: Check },
              ].map((prop, i) => (
                <div key={i} className="flex items-center justify-center gap-2 text-white/90 bg-white/5 rounded-lg py-3 backdrop-blur-sm border border-white/10">
                  <prop.icon className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-sm">{prop.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-900 shadow-xl transition-all hover:bg-blue-50 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
              >
                {t('cta.start')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <button
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm group"
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                {t('cta.demo')}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-blue-200 text-sm">
                {t('trust')}
              </p>
            </div>

            {/* Countdown / Offer - Optional visual element */}
            <div className="mt-12 inline-block">
              <div className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-2xl p-1 border border-white/10 backdrop-blur-md">
                <div className="bg-blue-950/80 rounded-xl px-8 py-4 flex flex-col md:flex-row items-center gap-6">
                  <div className="text-left">
                    <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-1">{t('countdown.title')}</p>
                    <p className="text-white font-medium">{t('countdown.description')}</p>
                  </div>
                  <div className="flex gap-3">
                    {/* Mock Countdown Values */}
                    <div className="bg-black/30 rounded-lg p-2 min-w-[60px]">
                      <span className="block text-2xl font-bold text-white font-mono">02</span>
                      <span className="text-[10px] text-blue-300 uppercase">{t('countdown.days')}</span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 min-w-[60px]">
                      <span className="block text-2xl font-bold text-white font-mono">14</span>
                      <span className="text-[10px] text-blue-300 uppercase">{t('countdown.hours')}</span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 min-w-[60px]">
                      <span className="block text-2xl font-bold text-white font-mono">35</span>
                      <span className="text-[10px] text-blue-300 uppercase">{t('countdown.minutes')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}