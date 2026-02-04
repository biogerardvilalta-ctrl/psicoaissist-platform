import { Brain, Shield, Mic, FileText, BarChart3, Users, Clock, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const featuresConfig = [
  {
    id: 'transcription',
    icon: Mic,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'analysis',
    icon: Brain,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'reports',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'security',
    icon: Shield,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'clients',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'time',
    icon: Clock,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'privacy',
    icon: Lock,
    color: 'bg-teal-100 text-teal-600',
  },
];

export function FeaturesSection() {
  const t = useTranslations('Landing.Features');

  return (
    <section id="features" className="py-16 bg-white sm:py-24">
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

        {/* Features grid */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuresConfig.map((feature, index) => (
              <div
                key={feature.id}
                className="relative group"
              >
                <div className="h-full p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t(`items.${feature.id}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {t(`items.${feature.id}.description`)}
                    </p>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10 group-hover:ring-blue-500/20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>✓ {t('bottom.trial')}</span>
            <span>•</span>
            <span>✓ {t('bottom.card')}</span>
            <span>•</span>
            <span>✓ {t('bottom.support')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}