import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';

const testimonialsConfig = [
  {
    image: '/avatars/maria.jpg', // Placeholder
    rating: 5,
  },
  {
    image: '/avatars/carlos.jpg', // Placeholder
    rating: 5,
  },
  {
    image: '/avatars/ana.jpg', // Placeholder
    rating: 5,
  },
  {
    image: '/avatars/luis.jpg', // Placeholder
    rating: 5,
  },
  {
    image: '/avatars/elena.jpg', // Placeholder
    rating: 5,
  },
  {
    image: '/avatars/roberto.jpg', // Placeholder
    rating: 5,
  },
];

export function TestimonialsSection() {
  const t = useTranslations('Landing.Testimonials');

  // TODO: Enable this section in production once we have real testimonials
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const items = t.raw('items') as any[];

  // Names and locations placeholders/hardcoded for demo purposes as they weren't in JSON
  // If we wanted them translated we should have added them to JSON.
  // For now I will recreate the original names array logic inside the map or separate array.
  const authorData = [
    { name: 'Dr. María González', location: 'Madrid, España' },
    { name: 'Dr. Carlos Mendoza', location: 'Barcelona, España' },
    { name: 'Dra. Ana Ruiz', location: 'Valencia, España' },
    { name: 'Dr. Luis Martín', location: 'Sevilla, España' },
    { name: 'Dra. Elena Vázquez', location: 'Bilbao, España' },
    { name: 'Dr. Roberto Silva', location: 'Las Palmas, España' },
  ];

  return (
    <section id="testimonials" className="py-16 bg-white sm:py-24">
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

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">{t('stats.psychologists')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">15,000+</div>
            <div className="text-sm text-gray-600">{t('stats.sessions')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-gray-600">{t('stats.satisfaction')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">4.9/5</div>
            <div className="text-sm text-gray-600">{t('stats.rating')}</div>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {items.map((item, index) => {
            const config = testimonialsConfig[index] || testimonialsConfig[0];
            const author = authorData[index] || authorData[0];

            return (
              <div
                key={index}
                className="relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="h-8 w-8 text-gray-200" />
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  {[...Array(config.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-4 text-gray-900 leading-relaxed">
                  "{item.quote}"
                </blockquote>

                {/* Highlight */}
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {item.highlight}
                </div>

                {/* Author */}
                <div className="mt-6 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {author.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-semibold text-gray-900">
                      {author.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.role} • {author.location}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">
            {t('cta.title')}
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t('cta.trial')}
            </a>
            <a
              href="/case-studies"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('cta.cases')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}