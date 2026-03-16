'use client';

import { Brain, Shield, Mic, FileText, BarChart3, Users, Clock, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const featuresConfig = [
  {
    id: 'transcription',
    icon: Mic,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  {
    id: 'analysis',
    icon: Brain,
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-600',
    ring: 'ring-purple-100',
  },
  {
    id: 'reports',
    icon: FileText,
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  {
    id: 'security',
    icon: Shield,
    gradient: 'from-rose-500 to-rose-600',
    bgLight: 'bg-rose-50',
    iconColor: 'text-rose-600',
    ring: 'ring-rose-100',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    gradient: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-600',
    ring: 'ring-amber-100',
  },
  {
    id: 'clients',
    icon: Users,
    gradient: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    ring: 'ring-indigo-100',
  },
  {
    id: 'time',
    icon: Clock,
    gradient: 'from-pink-500 to-pink-600',
    bgLight: 'bg-pink-50',
    iconColor: 'text-pink-600',
    ring: 'ring-pink-100',
  },
  {
    id: 'privacy',
    icon: Lock,
    gradient: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    iconColor: 'text-teal-600',
    ring: 'ring-teal-100',
  },
];

export function FeaturesSection() {
  const t = useTranslations('Landing.Features');

  return (
    <section id="features" className="relative py-16 bg-white sm:py-20 lg:py-28">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

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

        {/* Features grid — 2 cols on mobile, 4 on desktop */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 stagger-children">
            {featuresConfig.map((feature) => (
              <div
                key={feature.id}
                className="group relative"
              >
                <div className="h-full p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  {/* Icon with gradient bg on hover */}
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgLight} ring-1 ${feature.ring} group-hover:shadow-sm transition-all duration-300`}>
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
                      {t(`items.${feature.id}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                      {t(`items.${feature.id}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust indicators */}
        <div className="mt-12 sm:mt-16 text-center animate-fade-in">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t('bottom.trial')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t('bottom.card')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t('bottom.support')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}