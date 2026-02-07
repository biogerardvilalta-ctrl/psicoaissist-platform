'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FAQSection() {
  const t = useTranslations('FAQ');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqKeys = ['security', 'transcription', 'customization', 'cancellation', 'limits', 'support', 'integration', 'languages', 'trial'];

  const faqs = faqKeys.map((key, index) => ({
    id: key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
    category: t(`items.${key}.category`)
  }));

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <section className="py-16 bg-gray-50 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            {t('title')}
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('subtitle')}
          </p>
          <p className="mt-4 text-xl text-gray-600">
            {t('description')}
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
              Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos en menos de 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:suport@psicoaissist.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Contáctanos
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