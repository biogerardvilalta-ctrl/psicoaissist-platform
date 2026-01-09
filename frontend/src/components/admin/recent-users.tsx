'use client';

import { AdminUser } from '@/lib/admin-api';
import { User, Crown, Shield, Clock, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface RecentUsersProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onViewAll: () => void;
}

const planColors = {
  FREE: 'bg-gray-100 text-gray-800',
  BASIC: 'bg-blue-100 text-blue-800',
  PRO: 'bg-purple-100 text-purple-800',
  PREMIUM: 'bg-orange-100 text-orange-800'
};

const roleColors = {
  USER: 'bg-green-100 text-green-800',
  PSYCHOLOGIST: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-red-100 text-red-800',
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  AGENDA_MANAGER: 'bg-orange-100 text-orange-800',
  PROFESSIONAL_GROUP: 'bg-teal-100 text-teal-800'
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
}

export default function RecentUsers({ users, loading, error, onRefresh, onViewAll }: RecentUsersProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Usuarios Recientes</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Usuarios Recientes</h3>
            <p className="text-sm text-gray-500 mt-1">Últimos registros en la plataforma</p>
          </div>
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Ver todos →
          </button>
        </div>
      </div>

      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.role === 'ADMIN' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {user.role === 'PSYCHOLOGIST' && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.role}
                      </span>
                      {user.subscription && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[user.subscription.planType as keyof typeof planColors] || 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.subscription.planType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date and actions */}
                <div className="flex items-center space-x-2 text-right">
                  <div className="text-xs text-gray-500">
                    <p>Registro: {formatDate(user.createdAt)}</p>
                    {user.lastLogin && (
                      <p className="flex items-center justify-end mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(user.lastLogin)}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    {showDropdown === user.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left">
                            Ver detalles
                          </button>
                          <button className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left">
                            Editar usuario
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}