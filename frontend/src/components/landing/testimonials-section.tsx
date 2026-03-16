'use client';

import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';

const testimonialsConfig = [
  { image: '/avatars/maria.jpg', rating: 5, gradient: 'from-blue-500 to-indigo-600' },
  { image: '/avatars/carlos.jpg', rating: 5, gradient: 'from-purple-500 to-pink-600' },
  { image: '/avatars/ana.jpg', rating: 5, gradient: 'from-emerald-500 to-teal-600' },
  { image: '/avatars/luis.jpg', rating: 5, gradient: 'from-amber-500 to-orange-600' },
  { image: '/avatars/elena.jpg', rating: 5, gradient: 'from-rose-500 to-pink-600' },
  { image: '/avatars/roberto.jpg', rating: 5, gradient: 'from-cyan-500 to-blue-600' },
];

export function TestimonialsSection() {
  const t = useTranslations('Landing.Testimonials');

  // TODO: Enable this section in production once we have real testimonials
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const items = t.raw('items') as any[];

  const authorData = [
    { name: 'Dr. María González', location: 'Madrid, España' },
    { name: 'Dr. Carlos Mendoza', location: 'Barcelona, España' },
    { name: 'Dra. Ana Ruiz', location: 'Valencia, España' },
    { name: 'Dr. Luis Martín', location: 'Sevilla, España' },
    { name: 'Dra. Elena Vázquez', location: 'Bilbao, España' },
    { name: 'Dr. Roberto Silva', location: 'Las Palmas, España' },
  ];

  return (
    <section id="testimonials" className="relative py-16 bg-white sm:py-20 lg:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full translate-x-1/2 translate-y-1/2 opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-100 mb-4">
            {t('badge')}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600 sm:text-lg leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {[
            { value: '500+', color: 'text-blue-600', label: t('stats.psychologists') },
            { value: '15,000+', color: 'text-emerald-600', label: t('stats.sessions') },
            { value: '98%', color: 'text-purple-600', label: t('stats.satisfaction') },
            { value: '4.9/5', color: 'text-amber-600', label: t('stats.rating') },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className={`text-2xl sm:text-3xl font-bold ${stat.color} animate-count-up`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials grid */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 stagger-children">
          {items.map((item, index) => {
            const config = testimonialsConfig[index] || testimonialsConfig[0];
            const author = authorData[index] || authorData[0];

            return (
              <div
                key={index}
                className="relative bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
                id={`testimonial-${index}`}
              >
                {/* Quote icon */}
                <div className="absolute top-5 right-5 sm:top-6 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-blue-100" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5">
                  {[...Array(config.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-4 text-sm sm:text-base text-gray-800 leading-relaxed font-medium">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                {/* Highlight */}
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium ring-1 ring-inset ring-blue-100">
                  {item.highlight}
                </div>

                {/* Author */}
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {author.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {author.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {item.role} • {author.location}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center animate-fade-in">
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            {t('cta.title')}
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center px-7 py-3 bg-gradient-primary text-white text-sm font-semibold rounded-xl shadow-glow-primary hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]"
              id="testimonials-cta-trial"
            >
              {t('cta.trial')}
            </a>
            <a
              href="/case-studies"
              className="inline-flex items-center justify-center px-7 py-3 border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              id="testimonials-cta-cases"
            >
              {t('cta.cases')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}