import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Heart,
  Twitter,
  Linkedin,
  Youtube,
  Instagram
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PsicoAIssist</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Transformando la práctica psicológica con inteligencia artificial.
              Ayudamos a profesionales de la salud mental a optimizar su tiempo
              y mejorar la atención a sus pacientes.
            </p>
            <div className="flex items-center space-x-2 text-green-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm">100% Seguro y Confidencial</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Producto</h3>
            <ul className="space-y-3">
              <li>
                <a href="/features" className="text-gray-300 hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="/integrations" className="text-gray-300 hover:text-white transition-colors">
                  Integraciones
                </a>
              </li>
              <li>
                <a href="/security" className="text-gray-300 hover:text-white transition-colors">
                  Seguridad
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-300 hover:text-white transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="/roadmap" className="text-gray-300 hover:text-white transition-colors">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="/docs" className="text-gray-300 hover:text-white transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="/tutorials" className="text-gray-300 hover:text-white transition-colors">
                  Tutoriales
                </a>
              </li>
              <li>
                <a href="/community" className="text-gray-300 hover:text-white transition-colors">
                  Comunidad
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/status" className="text-gray-300 hover:text-white transition-colors">
                  Estado del Sistema
                </a>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href="mailto:hola@psicoaissist.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  hola@psicoaissist.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href="tel:+34900123456"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +34 900 123 456
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div className="text-gray-300">
                  <div>Calle Serrano 123</div>
                  <div>28006 Madrid, España</div>
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Síguenos</h4>
              <div className="flex space-x-3">
                <a
                  href="https://twitter.com/psicoaissist"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/psicoaissist"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@psicoaissist"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/psicoaissist"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter signup */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Mantente al día con PsicoAIssist
              </h3>
              <p className="text-gray-400">
                Recibe las últimas noticias, actualizaciones y consejos directamente en tu email.
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-8">
              <form className="flex space-x-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 min-w-0 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Suscribirse
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-gray-400 text-sm">
              © {currentYear} PsicoAIssist. Todos los derechos reservados.
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm">
                <li>
                  <a href="/dashboard/compliance?tab=gdpr" className="text-gray-400 hover:text-white transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="/dashboard/compliance?tab=terms" className="text-gray-400 hover:text-white transition-colors">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="/dashboard/compliance?tab=cookies" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="/dashboard/compliance?tab=legal-justification" className="text-gray-400 hover:text-white transition-colors">
                    Legal
                  </a>
                </li>
                <li>
                  <a href="/dashboard/compliance?tab=gdpr" className="text-gray-400 hover:text-white transition-colors">
                    Política de Privacitat/GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center space-x-8 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>AES-256 Encryption</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}