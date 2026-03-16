'use client';

import { useState } from 'react';
import { ChevronDownIcon, HelpCircle, Mail } from 'lucide-react';
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

  const faqs = faqKeys.map((key) => ({
    id: key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
    category: t(`items.${key}.category`)
  }));

  return (
    <section id="faq" className="py-16 bg-gray-50/80 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-100 mb-4">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            {t('title')}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            {t('subtitle')}
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 stagger-children">
          {faqs.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-blue-200 shadow-soft ring-1 ring-blue-100/50'
                    : 'border-gray-200/80 shadow-card hover:shadow-soft hover:border-gray-300'
                }`}
                id={`faq-${faq.id}`}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-start justify-between gap-4 focus-ring rounded-xl"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug pr-2">
                      {faq.question}
                    </h3>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-2xs font-semibold text-blue-600 bg-blue-50 rounded-full ring-1 ring-inset ring-blue-100">
                      {faq.category}
                    </span>
                  </div>
                  <div className={`flex-shrink-0 mt-1 p-1 rounded-lg transition-all duration-300 ${isOpen ? 'bg-blue-50 rotate-180' : 'bg-gray-100'}`}>
                    <ChevronDownIcon className={`h-4 w-4 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                </button>

                {/* Answer with smooth expand (via CSS grid trick) */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                      <div className="text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact support */}
        <div className="mt-12 sm:mt-16 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100/60 text-center">
            <div className="inline-flex p-3 bg-white rounded-xl shadow-card mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              ¿No encuentras la respuesta que buscas?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos en menos de 24 horas.
            </p>
            <a
              href="mailto:suport@psicoaissist.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-primary text-white text-sm font-semibold rounded-xl shadow-glow-primary hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]"
              id="faq-contact-cta"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contáctanos
            </a>
          </div>
        </div>

        {/* Knowledge base link */}
        <div className="mt-6 text-center">
          <a
            href="/docs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 inline-flex items-center gap-1"
          >
            Ver documentación completa
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}