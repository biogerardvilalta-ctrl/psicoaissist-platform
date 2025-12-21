'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, User, MessageCircle, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AuditAPI, AuditLog } from '@/lib/audit-api';

interface ActivityItem {
  id: string;
  type: 'session' | 'note' | 'patient' | 'report' | 'other';
  title: string;
  subtitle: string;
  timestamp: Date;
}

const activityIcons = {
  session: Clock,
  note: MessageCircle,
  patient: User,
  report: FileText,
  other: AlertCircle
};

const activityColors = {
  session: 'bg-blue-100 text-blue-600',
  note: 'bg-green-100 text-green-600',
  patient: 'bg-purple-100 text-purple-600',
  report: 'bg-orange-100 text-orange-600',
  other: 'bg-gray-100 text-gray-600'
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Hace unos minutos';
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Fetch more items to ensure we have enough after filtering
        const response = await AuditAPI.getAll(20, 0);

        // Show ANY activity, not just sessions
        const recentLogs = response.items.slice(0, 5);

        const items = recentLogs.map(log => mapLogToActivity(log));
        setActivities(items);
      } catch (error) {
        console.error("Failed to fetch recent activity", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, []);

  function mapLogToActivity(log: AuditLog): ActivityItem {
    let type: ActivityItem['type'] = 'other';
    const rType = log.resourceType?.toUpperCase();

    if (rType === 'SESSION') type = 'session';
    else if (rType === 'CLIENT') type = 'patient';
    else if (rType === 'REPORT' || rType === 'REPORT_DRAFT') type = 'report';
    else if (rType === 'NOTE') type = 'note';

    let title = log.action;
    // Friendly titles
    if (log.action === 'CREATE') title = 'Nuevo registro';
    if (log.action === 'UPDATE') title = 'Actualización';
    if (log.action === 'DELETE') title = 'Eliminación';
    if (log.action === 'LOGIN') title = 'Inicio de sesión';

    // Override title based on details if available or just use details as subtitle
    const subtitle = log.metadata?.details || `${log.action} on ${log.resourceType}`;

    // Better title logic based on resource
    if (type === 'session') {
      if (log.action === 'CREATE') title = 'Sesión Programada';
      if (log.action === 'UPDATE') title = 'Sesión Actualizada';
      if (log.action === 'DELETE') title = 'Sesión Eliminada';
    } else if (type === 'patient') {
      if (log.action === 'CREATE') title = 'Nuevo Paciente';
      if (log.action === 'UPDATE') title = 'Datos de Paciente';
    } else if (type === 'report') {
      if (log.action === 'CREATE') title = 'Informe Creado';
      if (log.resourceType === 'REPORT_DRAFT') title = 'Borrador IA Generado';
    }

    return {
      id: log.id,
      type,
      title,
      subtitle: subtitle,
      timestamp: new Date(log.createdAt)
    };
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <p className="text-sm text-gray-500 mt-1">Últimas acciones en tu cuenta</p>
          </div>
          <Link href="/dashboard/activity" className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            <TrendingUp className="w-4 h-4 mr-1" />
            Ver todo
          </Link>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] || activityIcons.other;
              const colorClass = activityColors[activity.type] || activityColors.other;

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

            {activities.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay actividad reciente</p>
                <p className="text-xs text-gray-400">Las acciones que realices aparecerán aquí.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}