export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Términos y Condiciones de Servicio
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> 12 de diciembre de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 mb-4">
                Al acceder y utilizar PsychoAI, usted acepta estar sujeto a estos Términos y Condiciones.
                Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
              </p>
              <p className="text-gray-700 mb-6">
                Estos términos se aplican a todos los usuarios del servicio, incluyendo visitantes,
                usuarios registrados y profesionales de la salud mental.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-700 mb-4">
                PsychoAI es una plataforma de software como servicio (SaaS) que proporciona:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Transcripción automática de sesiones psicológicas</li>
                <li>Análisis de contenido mediante inteligencia artificial</li>
                <li>Generación automática de informes clínicos</li>
                <li>Herramientas de gestión de pacientes</li>
                <li>Analytics y métricas de práctica profesional</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Elegibilidad y Registro</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Requisitos de Elegibilidad</h3>
              <p className="text-gray-700 mb-4">
                Para usar PsychoAI, debe ser:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Un profesional licenciado en psicología o salud mental</li>
                <li>Mayor de 18 años</li>
                <li>Capaz de formar un contrato vinculante</li>
                <li>Autorizado para ejercer en su jurisdicción</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Verificación Profesional</h3>
              <p className="text-gray-700 mb-6">
                Nos reservamos el derecho de verificar sus credenciales profesionales y
                suspender el acceso si no puede demostrar su elegibilidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Planes y Facturación</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Planes de Suscripción</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Plan Básico:</strong> €29/mes, hasta 25 clientes</li>
                <li><strong>Plan Pro:</strong> €59/mes, clientes ilimitados</li>
                <li><strong>Plan Premium:</strong> €99/mes, funciones empresariales</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Facturación y Renovación</h3>
              <p className="text-gray-700 mb-4">
                Las suscripciones se renuevan automáticamente. Puede cancelar en cualquier momento
                desde su panel de control. Las cancelaciones son efectivas al final del período actual.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Reembolsos</h3>
              <p className="text-gray-700 mb-6">
                Ofrecemos reembolsos completos dentro de los primeros 14 días de su primera suscripción.
                Los reembolsos parciales pueden considerarse caso por caso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Uso Aceptable</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Uso Permitido</h3>
              <p className="text-gray-700 mb-4">Puede usar PsychoAI únicamente para:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Práctica profesional legítima de psicología</li>
                <li>Documentación de sesiones con consentimiento del paciente</li>
                <li>Generación de informes clínicos profesionales</li>
                <li>Análisis de su propia práctica profesional</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Uso Prohibido</h3>
              <p className="text-gray-700 mb-4">Está prohibido:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Compartir credenciales de acceso</li>
                <li>Realizar ingeniería inversa del software</li>
                <li>Usar el servicio para fines no médicos</li>
                <li>Intentar acceder a datos de otros usuarios</li>
                <li>Subir contenido malicioso o ilegal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Responsabilidades del Usuario</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Consentimiento del Paciente</h3>
              <p className="text-gray-700 mb-4">
                Usted es responsable de obtener el consentimiento apropiado de sus pacientes
                antes de usar PsychoAI para procesar sus datos.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Cumplimiento Profesional</h3>
              <p className="text-gray-700 mb-4">
                Debe cumplir con todas las regulaciones profesionales, éticas y legales
                aplicables en su jurisdicción.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.3 Seguridad de la Cuenta</h3>
              <p className="text-gray-700 mb-6">
                Es responsable de mantener la seguridad de su cuenta y notificar inmediatamente
                cualquier acceso no autorizado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Propiedad Intelectual</h2>
              <p className="text-gray-700 mb-4">
                PsychoAI y todo el software, contenido y materiales relacionados son propiedad
                de la empresa y están protegidos por leyes de propiedad intelectual.
              </p>
              <p className="text-gray-700 mb-6">
                Los datos que usted sube (transcripciones, notas, etc.) permanecen como su
                propiedad, pero nos otorga una licencia limitada para procesarlos y
                proporcionar el servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                <strong>DESCARGO DE GARANTÍAS:</strong> El servicio se proporciona "tal como está"
                sin garantías de ningún tipo. No garantizamos que el servicio sea ininterrumpido
                o libre de errores.
              </p>
              <p className="text-gray-700 mb-6">
                <strong>LIMITACIÓN DE RESPONSABILIDAD:</strong> En ningún caso seremos responsables
                por daños indirectos, incidentales, especiales o consecuentes que excedan el
                monto pagado por el servicio en los últimos 12 meses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Terminación</h2>
              <p className="text-gray-700 mb-4">
                Cualquier parte puede terminar estos términos en cualquier momento. Nos
                reservamos el derecho de suspender o terminar su cuenta por violación
                de estos términos.
              </p>
              <p className="text-gray-700 mb-6">
                Tras la terminación, tendrá 90 días para exportar sus datos antes de
                que sean eliminados permanentemente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Ley Aplicable</h2>
              <p className="text-gray-700 mb-6">
                Estos términos se regirán e interpretarán de acuerdo con las leyes de España.
                Cualquier disputa será resuelta en los tribunales de Madrid, España.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Para preguntas sobre estos términos:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">PsychoAI Legal</p>
                <p className="text-gray-700">Email: legal@psychoai.com</p>
                <p className="text-gray-700">Teléfono: +34 900 123 456</p>
                <p className="text-gray-700">Dirección: Calle Serrano 123, 28006 Madrid, España</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}