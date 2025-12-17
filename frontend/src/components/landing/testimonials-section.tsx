import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Dr. María González',
    role: 'Psicóloga Clínica',
    location: 'Madrid, España',
    image: '/avatars/maria.jpg', // Placeholder
    rating: 5,
    quote: 'PsychoAI ha revolucionado mi práctica. La transcripción automática me ahorra 3 horas diarias y las sugerencias de IA son sorprendentemente acertadas.',
    highlight: 'Ahorra 3 horas diarias',
  },
  {
    name: 'Dr. Carlos Mendoza',
    role: 'Psicólogo Educativo',
    location: 'Barcelona, España',
    image: '/avatars/carlos.jpg', // Placeholder
    rating: 5,
    quote: 'Lo que más me gusta es la seguridad. Como psicólogo, la confidencialidad es crucial y PsychoAI cumple con todos los estándares. Mis clientes confían plenamente.',
    highlight: 'Máxima seguridad',
  },
  {
    name: 'Dra. Ana Ruiz',
    role: 'Psicóloga Forense',
    location: 'Valencia, España',
    image: '/avatars/ana.jpg', // Placeholder
    rating: 5,
    quote: 'Los informes automáticos son impresionantes. Mantienen el rigor profesional mientras me permiten enfocarme en la terapia, no en el papeleo.',
    highlight: 'Informes profesionales',
  },
  {
    name: 'Dr. Luis Martín',
    role: 'Director de Clínica',
    location: 'Sevilla, España',
    image: '/avatars/luis.jpg', // Placeholder
    rating: 5,
    quote: 'Desde que implementamos PsychoAI en nuestra clínica, la productividad aumentó un 40%. Los psicólogos pueden atender más pacientes sin sacrificar calidad.',
    highlight: '+40% productividad',
  },
  {
    name: 'Dra. Elena Vázquez',
    role: 'Psicóloga Online',
    location: 'Bilbao, España',
    image: '/avatars/elena.jpg', // Placeholder
    rating: 5,
    quote: 'Perfect para sesiones online. La transcripción funciona perfectamente por videollamada y puedo generar informes al instante. Mis pacientes están encantados.',
    highlight: 'Ideal para online',
  },
  {
    name: 'Dr. Roberto Silva',
    role: 'Psicólogo Deportivo',
    location: 'Las Palmas, España',
    image: '/avatars/roberto.jpg', // Placeholder
    rating: 5,
    quote: 'La IA comprende el contexto deportivo perfectamente. Me ayuda a identificar patrones en el rendimiento de mis atletas que antes me llevaban semanas detectar.',
    highlight: 'Detección de patrones',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Testimonios
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Más de 500 psicólogos confían en nosotros
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Descubre cómo PsychoAI está transformando la práctica psicológica en España y Latinoamérica.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">Psicólogos activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">15,000+</div>
            <div className="text-sm text-gray-600">Sesiones transcritas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-gray-600">Satisfacción</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">4.9/5</div>
            <div className="text-sm text-gray-600">Valoración media</div>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6">
                <Quote className="h-8 w-8 text-gray-200" />
              </div>

              {/* Rating */}
              <div className="flex items-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-4 text-gray-900 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Highlight */}
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                {testimonial.highlight}
              </div>

              {/* Author */}
              <div className="mt-6 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <div className="text-base font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">
            ¿Quieres ser el próximo testimonio de éxito?
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Prueba gratis 14 días
            </a>
            <a
              href="/case-studies"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Ver casos de estudio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}