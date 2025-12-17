'use client';

import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

export interface AdminActivityItem {
  id: string;
  type: 'user_registered' | 'subscription_created' | 'payment_completed' | 'error' | 'login';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface AdminActivityFeedProps {
  activities?: AdminActivityItem[];
}

const activityConfig = {
  user_registered: {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600',
    bgColor: 'bg-green-50'
  },
  subscription_created: {
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-600',
    bgColor: 'bg-blue-50'
  },
  payment_completed: {
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600',
    bgColor: 'bg-purple-50'
  },
  error: {
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
    bgColor: 'bg-red-50'
  },
  login: {
    icon: Activity,
    color: 'bg-gray-100 text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

// Demo data
const defaultActivities: AdminActivityItem[] = [
  {
    id: '1',
    type: 'user_registered',
    title: 'Nuevo usuario registrado',
    description: 'Ana García se registró como psicóloga',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '2',
    type: 'subscription_created',
    title: 'Nueva suscripción Pro',
    description: 'Carlos Mendoza actualizó a plan Pro',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '3',
    type: 'payment_completed',
    title: 'Pago completado',
    description: 'Plan Premium - €89.99',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '4',
    type: 'login',
    title: 'Administrador conectado',
    description: 'admin@psychoai.com inició sesión',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: '5',
    type: 'error',
    title: 'Error de pago detectado',
    description: 'Fallo en procesamiento de suscripción',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
  }
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Hace un momento';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays}d`;
}

export default function AdminActivityFeed({ activities = defaultActivities }: AdminActivityFeedProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Actividad del Sistema</h3>
            <p className="text-sm text-gray-500 mt-1">Eventos recientes en la plataforma</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">En vivo</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-12 bg-gray-200"></div>
                )}

                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  );
}