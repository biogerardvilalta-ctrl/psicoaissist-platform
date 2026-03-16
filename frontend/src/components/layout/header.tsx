'use client';

import { Link } from '@/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Heart, LogIn, UserPlus, Building2, Scale, ChevronRight } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('Landing.Header');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: '/#features', label: t('nav.features') },
    { href: '/simulator/try', label: t('nav.simulator') },
    { href: '/#pricing', label: t('nav.pricing') },
    ...(process.env.NODE_ENV !== 'production' ? [{ href: '/#testimonials', label: t('nav.testimonials') }] : []),
    { href: '/docs', label: t('nav.docs') },
    { href: '/blog', label: t('nav.blog') },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-strong shadow-soft border-b border-gray-200/50'
            : 'bg-white/60 backdrop-blur-sm'
        }`}
        id="main-header"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" id="header-logo">
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Psico<span className="text-gradient-primary">AIssist</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" id="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/70 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/legal?tab=terms"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/70 transition-all duration-200"
              >
                <Scale className="w-3.5 h-3.5 mr-1.5" />
                {t('nav.legal')}
              </Link>
              <div className="ml-1">
                <LanguageSwitcher />
              </div>
            </nav>

            {/* Desktop CTA buttons */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0" id="desktop-cta">
              <Link
                href="/clinics"
                className="hidden xl:inline-flex items-center px-3 py-1.5 text-xs bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                id="clinics-cta"
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                {t('cta.clinics')}
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 text-sm text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100/70 rounded-lg transition-all duration-200"
                id="login-cta"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('cta.login')}
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:shadow-glow-primary transition-all duration-300 hover:scale-[1.02] btn-shimmer"
                id="register-cta"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('cta.tryFree')}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus-ring"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 bg-white shadow-elevated animate-fade-in-down max-h-[calc(100vh-4rem)] overflow-y-auto" id="mobile-menu">
            <div className="px-4 py-5 space-y-1">
              {/* Nav Links */}
              <nav className="space-y-1 stagger-children">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}

                <Link
                  href="/legal?tab=terms"
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Scale className="w-4 h-4 mr-2.5 text-gray-500" />
                    {t('nav.legal')}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/clinics"
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2.5 text-gray-500" />
                    {t('cta.clinics')}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </nav>

              {/* Language */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                <span className="text-sm font-medium text-gray-600">{t('nav.language')}</span>
                <LanguageSwitcher />
              </div>

              {/* CTA Section */}
              <div className="pt-4 space-y-3 border-t border-gray-100 mt-3">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center w-full px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('cta.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center w-full px-4 py-3.5 bg-gradient-primary text-white font-semibold rounded-xl shadow-glow-primary transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('cta.tryFree')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}