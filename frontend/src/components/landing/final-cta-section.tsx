import { ArrowRight, CheckCircle, Clock, Shield, Users } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Urgency indicator */}
        <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium mb-8">
          <Clock className="w-4 h-4 mr-2" />
          Oferta limitada: 14 días gratis + 50% descuento primer mes
        </div>

        {/* Main headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          ¿Listo para transformar
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            tu práctica psicológica?
          </span>
        </h2>

        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Únete a más de <strong>500 psicólogos</strong> que ya están ahorrando
          <strong> 3+ horas diarias</strong> y mejorando la calidad de su atención con PsychoAI.
        </p>

        {/* Value propositions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Setup Instantáneo</h3>
            <p className="text-sm text-blue-200">Listo en menos de 5 minutos</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">100% Seguro</h3>
            <p className="text-sm text-blue-200">GDPR & ISO 27001 certified</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Soporte 24/7</h3>
            <p className="text-sm text-blue-200">Equipo experto en español</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Sin Compromiso</h3>
            <p className="text-sm text-blue-200">Cancela cuando quieras</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="/register"
            className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg rounded-xl hover:from-yellow-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
          >
            Empezar gratis ahora
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="/demo"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          >
            Ver demo en vivo
          </a>
        </div>

        {/* Trust indicators */}
        <div className="text-center">
          <p className="text-blue-200 text-sm mb-4">
            ✓ Sin tarjeta de crédito necesaria • ✓ Configuración gratuita • ✓ Soporte incluido
          </p>

          {/* Customer logos/testimonials */}
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-xs text-blue-300">
              "Mejor herramienta para psicólogos"<br />
              <strong>- Dr. María González</strong>
            </div>
            <div className="text-xs text-blue-300">
              "Revolucionó mi consulta"<br />
              <strong>- Dr. Carlos Mendoza</strong>
            </div>
            <div className="text-xs text-blue-300">
              "Imprescindible para mi práctica"<br />
              <strong>- Dra. Ana Ruiz</strong>
            </div>
          </div>
        </div>

        {/* Countdown timer placeholder */}
        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            🔥 Oferta especial de lanzamiento
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-400">02</div>
              <div className="text-xs text-blue-200">Días</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">14</div>
              <div className="text-xs text-blue-200">Horas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">32</div>
              <div className="text-xs text-blue-200">Minutos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">18</div>
              <div className="text-xs text-blue-200">Segundos</div>
            </div>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            Consigue 50% de descuento en tu primera suscripción
          </p>
        </div>
      </div>
    </section>
  );
}