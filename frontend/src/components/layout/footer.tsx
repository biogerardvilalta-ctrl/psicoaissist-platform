'use client';

import {
  Mail,
  Shield,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Landing.Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white" id="main-footer">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">

          {/* Company info */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">PsicoAIssist</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm max-w-xs">
              {t('description')}
            </p>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg w-fit">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold">{t('security.secure')}</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{t('links.title')}</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/docs', label: t('links.docs') },
                { href: '/legal?tab=gdpr', label: t('links.privacy') },
                { href: '/legal?tab=terms', label: t('links.terms') },
                { href: '/legal?tab=cookies', label: t('links.cookies') },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{t('contact.title')}</h3>
            <div className="space-y-3">
              <a
                href="mailto:suport@psicoaissist.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors duration-200 group"
              >
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-800 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                suport@psicoaissist.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-gray-500 text-xs sm:text-sm">{t('copyright', { year: currentYear })}</span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>{t('security.gdpr')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>{t('security.encryption')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}