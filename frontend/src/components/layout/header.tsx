'use client';

import { useState } from 'react';
import { Menu, X, Heart, LogIn, UserPlus } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PsicoAIssist</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Precios
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Testimonios
            </a>
            <a
              href="/docs"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Documentación
            </a>
            <a
              href="/blog"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Blog
            </a>
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/admin"
              className="inline-flex items-center px-3 py-1.5 text-xs bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors"
            >
              Admin
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar sesión
            </a>
            <a
              href="/auth/register"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Prueba gratis
            </a>
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-4">
              <a
                href="#features"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#pricing"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Precios
              </a>
              <a
                href="#testimonials"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonios
              </a>
              <a
                href="/docs"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentación
              </a>
              <a
                href="/blog"
                className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </a>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <a
                  href="/login"
                  className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  className="block w-full text-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prueba gratis
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}