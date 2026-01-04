'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: '¿Es PsicoAIssist seguro para datos confidenciales de pacientes?',
    answer: 'Absolutamente. PsicoAIssist cumple con GDPR, LOPD-GDD y estándares internacionales de seguridad. Utilizamos encriptación AES-256, servidores en Europa, y jamás almacenamos datos sin encriptar. Cada sesión se procesa de forma aislada y segura.',
    category: 'Seguridad'
  },
  {
    id: 2,
    question: '¿Cómo funciona la transcripción automática?',
    answer: 'Nuestro sistema de IA escucha la sesión en tiempo real y transcribe automáticamente. Reconoce el habla en español (incluyendo acentos regionales), identifica quién habla (terapeuta/paciente) y formatea el texto de manera profesional. La precisión es del 95%+. El audio se procesa en tiempo real y NO se graba ni almacena nunca en nuestros servidores.',
    category: 'Funcionalidad'
  },
  {
    id: 3,
    question: '¿Puedo personalizar los informes generados?',
    answer: 'Sí, completamente. Puedes crear plantillas personalizadas, ajustar el formato según tu práctica, añadir tu logo, modificar secciones y exportar en múltiples formatos (PDF, Word, etc.). Los informes se adaptan a tu estilo profesional.',
    category: 'Personalización'
  },
  {
    id: 4,
    question: '¿Qué pasa si cancelo mi suscripción?',
    answer: 'Conservas acceso a todos tus datos durante 90 días. Puedes exportar todas las sesiones, informes y notas en cualquier momento. No hay penalizaciones por cancelación y puedes reactivar tu cuenta cuando desees.',
    category: 'Facturación'
  },

  {
    id: 6,
    question: '¿Hay límite en el número de pacientes?',
    answer: 'Depende del plan. El plan Básico incluye hasta 25 pacientes, el Pro permite pacientes ilimitados, y el Premium añade funciones avanzadas para clínicas. Puedes cambiar de plan en cualquier momento.',
    category: 'Planes'
  },
  {
    id: 7,
    question: '¿Ofrecen soporte técnico en español?',
    answer: 'Sí, nuestro equipo de soporte habla español y está disponible por chat, email y videollamada. También ofrecemos formación gratuita para nuevos usuarios y documentación completa en español.',
    category: 'Soporte'
  },
  {
    id: 8,
    question: '¿Puedo integrar PsicoAIssist con mi sistema actual?',
    answer: 'Ofrecemos APIs y integraciones con los principales sistemas de gestión de clínicas. También puedes exportar datos para importar en tu sistema existente. Nuestro equipo técnico puede ayudarte con la integración.',
    category: 'Integración'
  },
  {
    id: 9,
    question: '¿Qué idiomas soporta el sistema?',
    answer: 'Principalmente Catalán, Español e Inglés con alta precisión. También soportamos francés, portugués e italiano. Estamos añadiendo más idiomas basándose en la demanda de nuestros usuarios.',
    category: 'Funcionalidad'
  },
  {
    id: 10,
    question: '¿Hay período de prueba gratuito?',
    answer: 'Disponemos de un Plan Demo de prueba de 14 días. Puedes probar las funcionalidades principales sin coste antes de elegir tu plan profesional.',
    category: 'Facturación'
  }
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <section className="py-16 bg-gray-50 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Preguntas Frecuentes
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Resolvemos tus dudas
          </p>
          <p className="mt-4 text-xl text-gray-600">
            Las respuestas a las preguntas más comunes sobre PsicoAIssist.
          </p>
        </div>

        {/* Category filter - Optional for future enhancement */}
        <div className="hidden md:flex justify-center mb-12">
          <div className="inline-flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md transition-colors">
              Todas
            </button>
            {categories.slice(0, 4).map(category => (
              <button
                key={category}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    {faq.category}
                  </span>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {openItems.includes(faq.id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>

              {openItems.includes(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="prose text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact support */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ¿No encuentras la respuesta que buscas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos en menos de 2 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:soporte@psicoaissist.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Enviar email
              </a>
              <a
                href="/chat"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                Chat en vivo
              </a>
            </div>
          </div>
        </div>

        {/* Knowledge base link */}
        <div className="mt-8 text-center">
          <a
            href="/docs"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Ver documentación completa →
          </a>
        </div>
      </div>
    </section>
  );
}