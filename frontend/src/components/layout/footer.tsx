import {
  Mail,
  Shield,
  Heart
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

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

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-3">
              <li>
                <a href="/docs" className="text-gray-300 hover:text-white transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="/legal?tab=gdpr" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/legal?tab=terms" className="text-gray-300 hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="/legal?tab=cookies" className="text-gray-300 hover:text-white transition-colors">
                  Política de Cookies
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
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
              <span>© {currentYear} PsicoAIssist. Todos los derechos reservados.</span>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>AES-256 Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}