'use client';

import { Heart, User, FileText, Calendar, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  hoverColor: string;
  action: () => void;
}

export default function QuickActions() {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'new-session',
      title: 'Nueva Sesión AI',
      description: 'Inicia una consulta con el asistente',
      icon: Heart,
      color: 'bg-blue-100 group-hover:bg-blue-200 text-blue-600',
      hoverColor: 'hover:border-blue-500 hover:bg-blue-50',
      action: () => {
        router.push('/dashboard/sessions');
      }
    },
    {
      id: 'manage-patients',
      title: 'Gestión de Pacientes',
      description: 'Administra tu lista de pacientes',
      icon: User,
      color: 'bg-green-100 group-hover:bg-green-200 text-green-600',
      hoverColor: 'hover:border-green-500 hover:bg-green-50',
      action: () => {
        router.push('/dashboard/clients');
      }
    },
    {
      id: 'generate-report',
      title: 'Generar Informe',
      description: 'Crea reportes y análisis',
      icon: FileText,
      color: 'bg-purple-100 group-hover:bg-purple-200 text-purple-600',
      hoverColor: 'hover:border-purple-500 hover:bg-purple-50',
      action: () => {
        router.push('/dashboard/reports/new');
      }
    },
    {
      id: 'schedule-appointment',
      title: 'Programar Cita',
      description: 'Agenda nueva consulta',
      icon: Calendar,
      color: 'bg-orange-100 group-hover:bg-orange-200 text-orange-600',
      hoverColor: 'hover:border-orange-500 hover:bg-orange-50',
      action: () => {
        router.push('/dashboard/sessions/new');
      }
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
            <p className="text-sm text-gray-500 mt-1">Comienza a usar PsycoAI con estas opciones</p>
          </div>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <Plus className="w-4 h-4 mr-1" />
            Personalizar
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors group ${action.hoverColor}`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${action.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <div className="mt-3 flex items-center justify-center text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                  Hacer clic para continuar
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}