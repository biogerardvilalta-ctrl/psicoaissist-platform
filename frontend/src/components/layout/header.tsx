'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Heart, LogIn, UserPlus, Building2, Scale } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PsicoAIssist</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link
              href="/#features"
              className="text-sm lg:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Características
            </Link>
            <Link
              href="/simulator/try"
              className="text-sm lg:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Simulador
            </Link>
            <Link
              href="/#pricing"
              className="text-sm lg:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Precios
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm lg:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Testimonios
            </Link>
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/docs"
                className="text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Documentación
              </Link>
              <Link
                href="/blog"
                className="text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/dashboard/compliance?tab=terms"
                className="flex items-center text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                <Scale className="w-4 h-4 mr-1.5" />
                Legal
              </Link>
            </div>
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <Link
              href="/clinics"
              className="hidden xl:inline-flex items-center px-3 py-1.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Building2 className="w-3 h-3 mr-1" />
              Para Clínicas
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-3 py-2 text-sm lg:text-base text-gray-700 font-medium hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Prueba gratis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 absolute top-16 left-0 right-0 bg-white shadow-lg z-40 px-4">
            <nav className="space-y-4">
              <Link
                href="/#features"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </Link>
              <Link
                href="/simulator/try"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Simulador
              </Link>
              <Link
                href="/#pricing"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Precios
              </Link>
              <Link
                href="/#testimonials"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonios
              </Link>
              <Link
                href="/docs"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentación
              </Link>
              <Link
                href="/blog"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                blog
              </Link>
              <Link
                href="/dashboard/compliance?tab=terms"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Scale className="w-4 h-4 mr-2" />
                  Legal
                </div>
              </Link>
              <Link
                href="/clinics"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Para Clínicas
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  href="/auth/login"
                  className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar sesión
                  </div>
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Prueba gratis
                  </div>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}