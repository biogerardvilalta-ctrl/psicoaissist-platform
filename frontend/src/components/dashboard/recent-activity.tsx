'use client';

import { Calendar, Clock, User, MessageCircle, FileText, TrendingUp } from 'lucide-react';

interface RecentActivityProps {
  activities?: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'session' | 'note' | 'patient' | 'report';
  title: string;
  subtitle: string;
  timestamp: Date;
}

const activityIcons = {
  session: Clock,
  note: MessageCircle,
  patient: User,
  report: FileText
};

const activityColors = {
  session: 'bg-blue-100 text-blue-600',
  note: 'bg-green-100 text-green-600',
  patient: 'bg-purple-100 text-purple-600',
  report: 'bg-orange-100 text-orange-600'
};

// Datos de demo
const defaultActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'session',
    title: 'Sesión con Ana García',
    subtitle: 'Terapia cognitivo-conductual - 50 min',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
  },
  {
    id: '2',
    type: 'note',
    title: 'Nota de seguimiento',
    subtitle: 'Progreso en manejo de ansiedad',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 horas atrás
  },
  {
    id: '3',
    type: 'patient',
    title: 'Nuevo paciente registrado',
    subtitle: 'Carlos Mendoza - Primera consulta programada',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 día atrás
  },
  {
    id: '4',
    type: 'report',
    title: 'Informe generado',
    subtitle: 'Resumen mensual de sesiones',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 días atrás
  }
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Hace unos minutos';
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
}

export default function RecentActivity({ activities = defaultActivities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <p className="text-sm text-gray-500 mt-1">Últimas acciones en tu cuenta</p>
          </div>
          <div className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            <TrendingUp className="w-4 h-4 mr-1" />
            Ver todo
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {activity.subtitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay actividad reciente</p>
            <p className="text-xs text-gray-400">Comienza una sesión para ver tu actividad aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}