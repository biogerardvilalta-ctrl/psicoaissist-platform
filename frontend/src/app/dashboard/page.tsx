'use client';

import { useAuth } from '@/contexts/auth-context';
import { Heart, User, BarChart3, Calendar, Settings, LogOut, Bell } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="PSYCHOLOGIST">
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 space-y-3 sm:space-y-0">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PsycoAI</h1>
            </div>

            {/* User menu */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Notification */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* User info */}
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Settings and Logout */}
              <div className="flex items-center space-x-2">
                <a
                  href="/settings"
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full transition-colors"
                  title="Configuración"
                >
                  <Settings className="w-4 h-4" />
                </a>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-red-200 bg-white flex-shrink-0"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600">
            Tu asistente de inteligencia artificial para psicología está listo para ayudarte.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sesiones Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Próximas Citas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
            <p className="text-sm text-gray-500 mt-1">Comienza a usar PsycoAI con estas opciones</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nueva consulta */}
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Nueva Consulta AI</h4>
                  <p className="text-sm text-gray-500">Inicia una sesión con el asistente</p>
                </div>
              </button>

              {/* Gestión de pacientes */}
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Gestión de Pacientes</h4>
                  <p className="text-sm text-gray-500">Administra tu lista de pacientes</p>
                </div>
              </button>

              {/* Configuración */}
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Configuración</h4>
                  <p className="text-sm text-gray-500">Personaliza tu experiencia</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Welcome message for new users */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Bienvenido a PsycoAI! 🚀
              </h3>
              <p className="text-gray-600 mb-4">
                Tu plataforma de inteligencia artificial diseñada específicamente para profesionales de la psicología. 
                Aquí podrás acceder a herramientas avanzadas de IA para mejorar tu práctica clínica.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Asistente AI especializado en psicología
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Gestión segura de pacientes e historias clínicas
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Análisis y seguimiento de progreso
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}