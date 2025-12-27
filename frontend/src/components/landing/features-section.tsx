import { Brain, Shield, Mic, FileText, BarChart3, Users, Clock, Lock } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Transcripción Automática',
    description: 'Convierte tus sesiones habladas en texto con 95% de precisión. Compatible con español e inglés.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Brain,
    title: 'Análisis IA Ético',
    description: 'Sugerencias inteligentes basadas en técnicas terapéuticas validadas. Sin reemplazar tu criterio profesional.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: FileText,
    title: 'Informes Automáticos',
    description: 'Genera informes profesionales siguiendo estándares psicológicos. Personalizable según tu práctica.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Shield,
    title: 'Seguridad Total',
    description: 'Cifrado AES-256, cumplimiento GDPR. Tus datos y los de tus clientes están protegidos.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Inteligentes',
    description: 'Visualiza el progreso de tus clientes con métricas objetivas y gráficos interactivos.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: Users,
    title: 'Gestión de Clientes',
    description: 'Organiza expedientes, historial clínico y sesiones en un sistema intuitivo y seguro.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Clock,
    title: 'Ahorra Tiempo',
    description: 'Reduce el tiempo administrativo en un 70%. Más tiempo para lo que realmente importa.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Lock,
    title: 'Privacidad Absoluta',
    description: 'Solo tú tienes acceso a tu información. Ni nosotros podemos ver tus datos clínicos.',
    color: 'bg-teal-100 text-teal-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Características
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Todo lo que necesitas para una práctica moderna
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Diseñado específicamente para psicólogos, con herramientas que respetan la ética profesional.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
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
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {feature.description}
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
            <span>✓ 14 días de prueba gratuita</span>
            <span>•</span>
            <span>✓ Sin tarjeta de crédito</span>
            <span>•</span>
            <span>✓ Soporte en español</span>
          </div>
        </div>
      </div>
    </section>
  );
}