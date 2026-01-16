import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Cancel icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pago Cancelado
        </h1>

        <p className="text-gray-600 mb-8">
          No se ha procesado ningún cargo. Tu suscripción no ha sido activada.
        </p>

        {/* Reasons */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-yellow-900 mb-2">Posibles motivos:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Cancelaste el proceso de pago</li>
            <li>• Hubo un error con tu método de pago</li>
            <li>• La sesión expiró</li>
            <li>• Problemas de conectividad</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/#pricing"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar nuevamente
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {/* Help section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Si tienes problemas con el pago o necesitas asistencia, estamos aquí para ayudarte.
          </p>
          <div className="space-y-2">
            <a
              href="mailto:soporte@psicoaissist.com"
              className="block text-sm text-blue-600 hover:underline"
            >
              📧 soporte@psicoaissist.com
            </a>
            <a
              href="/chat"
              className="block text-sm text-blue-600 hover:underline"
            >
              💬 Chat en vivo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}