import { ArrowRight, Brain, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { HeroDemo } from './hero-demo';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-16 sm:pt-24 sm:pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Brain className="mr-2 h-4 w-4" />
              IA Ética para Psicólogos
            </div>

            {/* Title */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl leading-snug">
              <span className="block">Potencia tu</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                práctica psicológica
              </span>
              <span className="block">con IA responsable</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Transcripción automática, análisis inteligente y gestión segura de clientes.
              Diseñado por psicólogos, para psicólogos. Cumplimiento total con GDPR.
            </p>

            {/* Features list */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm text-gray-600">100% Confidencial</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="ml-2 text-sm text-gray-600">IA en Tiempo Real</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Análisis Inteligente</span>
              </div>
              <div className="flex items-center">
                <ArrowRight className="h-5 w-5 text-purple-500" />
                <span className="ml-2 text-sm text-gray-600">Fácil de Usar</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row sm:gap-4 items-center sm:items-start">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/simulator/try"
                className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                🎮 Probar Simulador
              </Link>
            </div>
            <div className="mt-4 text-center sm:text-left">
              <Link href="/clinics" className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-4">
                ¿Representas a una institución? Ver soluciones para clínicas
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center space-x-6 sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Psicólogos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Sesiones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Hero image/video */}
          <div className="mt-12 relative lg:mt-0 lg:col-span-6 flex items-center justify-center">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}