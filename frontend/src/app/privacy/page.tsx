export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> 12 de diciembre de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información que Recopilamos</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">1.1 Datos Personales</h3>
              <p className="text-gray-700 mb-4">
                Recopilamos información que usted nos proporciona directamente, incluyendo:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Nombre completo y información de contacto</li>
                <li>Número de colegiado profesional</li>
                <li>Especialidad médica</li>
                <li>Información de facturación y pago</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">1.2 Datos Clínicos</h3>
              <p className="text-gray-700 mb-4">
                Los datos clínicos de pacientes se procesan bajo estrictas medidas de seguridad:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Transcripciones de sesiones (encriptadas)</li>
                <li>Notas clínicas</li>
                <li>Informes generados</li>
                <li>Archivos de audio (opcional, encriptados)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Base Legal para el Procesamiento</h2>
              <p className="text-gray-700 mb-4">
                Procesamos sus datos personales bajo las siguientes bases legales del GDPR:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Consentimiento:</strong> Para funcionalidades opcionales</li>
                <li><strong>Ejecución contractual:</strong> Para proporcionar nuestros servicios</li>
                <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios</li>
                <li><strong>Cumplimiento legal:</strong> Para obligaciones regulatorias</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Uso de la Información</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Proporcionar servicios de transcripción e IA</li>
                <li>Generar informes clínicos automatizados</li>
                <li>Procesar pagos y gestionar suscripciones</li>
                <li>Proporcionar soporte técnico</li>
                <li>Mejorar nuestros algoritmos (datos anonimizados)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Protección de Datos</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Encriptación</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>AES-256 para datos en reposo</li>
                <li>TLS 1.3 para datos en tránsito</li>
                <li>Claves de encriptación rotadas periódicamente</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Acceso y Controles</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Autenticación de dos factores obligatoria</li>
                <li>Acceso basado en roles y necesidad de conocer</li>
                <li>Logs de auditoría completos</li>
                <li>Monitoreo de seguridad 24/7</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Compartir Información</h2>
              <p className="text-gray-700 mb-4">
                <strong>No vendemos, alquilamos o compartimos</strong> sus datos personales con terceros, excepto:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Proveedores de servicios necesarios (bajo estrictos acuerdos de confidencialidad)</li>
                <li>Cuando sea requerido por ley</li>
                <li>Con su consentimiento explícito</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Sus Derechos (GDPR)</h2>
              <p className="text-gray-700 mb-4">Bajo el GDPR, usted tiene derecho a:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Acceso:</strong> Obtener una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Restricción:</strong> Limitar el procesamiento de sus datos</li>
                <li><strong>Oposición:</strong> Objetar el procesamiento en ciertas circunstancias</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Retención de Datos</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>Datos de cuenta:</strong> Mientras mantenga su cuenta activa</li>
                <li><strong>Datos clínicos:</strong> Según regulaciones médicas aplicables</li>
                <li><strong>Datos de facturación:</strong> 7 años (requisito fiscal)</li>
                <li><strong>Logs de auditoría:</strong> 3 años</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferencias Internacionales</h2>
              <p className="text-gray-700 mb-6">
                Todos los datos se procesan y almacenan en servidores ubicados en la Unión Europea. 
                No realizamos transferencias internacionales de datos fuera del EEE sin las garantías 
                adecuadas del GDPR.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Para ejercer sus derechos o realizar consultas sobre privacidad:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">Delegado de Protección de Datos</p>
                <p className="text-gray-700">Email: dpo@psycoai.com</p>
                <p className="text-gray-700">Teléfono: +34 900 123 456</p>
                <p className="text-gray-700">Dirección: Calle Serrano 123, 28006 Madrid, España</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Autoridad de Control</h2>
              <p className="text-gray-700 mb-6">
                Tiene derecho a presentar una queja ante la Agencia Española de Protección de Datos (AEPD) 
                si considera que el tratamiento de sus datos personales no cumple con la normativa.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}