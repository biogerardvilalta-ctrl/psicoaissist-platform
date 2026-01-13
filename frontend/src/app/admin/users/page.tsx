'use client';

import { useState, useMemo, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import { useRole } from '@/hooks/useRole';
import { useAdminUsers } from '@/hooks/useAdmin';
import { UserFilters, AdminAPI } from '@/lib/admin-api';
import { Users, Search, Filter, MoreHorizontal, UserCheck, UserX, Mail, RefreshCw, CreditCard, Calendar } from 'lucide-react';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 30,
  BASIC: 600,
  PRO: 900,
  PREMIUM: 3000,
  PREMIUM_PLUS: 3000,
  CLINICS: 30000
};

const PLAN_CASE_LIMITS: Record<string, number> = {
  FREE: 0,
  BASIC: 0,
  PRO: 5,
  PREMIUM: -1,
  PREMIUM_PLUS: -1,
  CLINICS: -1
};

const getCaseLimit = (user: any) => {
  const plan = (user.subscription?.planType || 'FREE').toUpperCase();
  const baseLimit = PLAN_CASE_LIMITS[plan] || 0;
  if (baseLimit === -1) return -1;
  const extra = user.extraSimulatorCases || 0;
  return baseLimit + extra;
};

const getLimit = (user: any) => {
  const plan = (user.subscription?.planType || 'FREE').toUpperCase();
  const baseLimit = PLAN_LIMITS[plan] || 0;
  const extra = user.extraTranscriptionMinutes || 0;
  return baseLimit + extra;
};

// Unified Modal for Create and Edit
function UserModal({
  isOpen,
  onClose,
  onSuccess,
  userToEdit = null
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: any | null;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'PSYCHOLOGIST',
    country: 'España',
    professionalNumber: '',
    // Usage Limits
    transcriptionMinutesUsed: 0,
    extraTranscriptionMinutes: 0,
    simulatorUsageCount: 0,
    extraSimulatorCases: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when userToEdit changes
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        email: userToEdit.email || '',
        password: '', // Password empty on edit unless changing
        firstName: userToEdit.firstName || '',
        lastName: userToEdit.lastName || '',
        role: userToEdit.role || 'PSYCHOLOGIST',
        country: userToEdit.country || 'España',
        professionalNumber: userToEdit.professionalNumber || '',
        transcriptionMinutesUsed: userToEdit.transcriptionMinutesUsed || 0,
        extraTranscriptionMinutes: userToEdit.extraTranscriptionMinutes || 0,
        simulatorUsageCount: userToEdit.simulatorUsageCount || 0,
        extraSimulatorCases: userToEdit.extraSimulatorCases || 0
      });
    } else {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'PSYCHOLOGIST',
        country: 'España',
        professionalNumber: '',
        transcriptionMinutesUsed: 0,
        extraTranscriptionMinutes: 0,
        simulatorUsageCount: 0,
        extraSimulatorCases: 0
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (userToEdit) {
        // Update existing user
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password; // Don't send empty password

        await AdminAPI.updateUser(userToEdit.id, updateData);
        if (updateData.password) {
          await AdminAPI.changeUserPassword(userToEdit.id, updateData.password);
        }
      } else {
        // Create new user
        await AdminAPI.createUser(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al ${userToEdit ? 'actualizar' : 'crear'} usuario`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{userToEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" required className="mt-1 block w-full border rounded-md p-2"
                value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input type="text" required className="mt-1 block w-full border rounded-md p-2"
                value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required className="mt-1 block w-full border rounded-md p-2"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {userToEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            </label>
            <input
              type="password"
              required={!userToEdit}
              minLength={6}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder={userToEdit ? 'Dejar en blanco para mantener actual' : ''}
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select className="mt-1 block w-full border rounded-md p-2"
              value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              <option value="PSYCHOLOGIST">Psicólogo</option>
              <option value="ADMIN">Administrador</option>
              <option value="AGENDA_MANAGER">Gestor de Agenda</option>
            </select>
          </div>


          {/* Usage Limits Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Uso y Límites</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Minutos Transcritos (Usados)</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full border rounded-md p-2 text-sm"
                  value={formData.transcriptionMinutesUsed}
                  onChange={e => setFormData({ ...formData, transcriptionMinutesUsed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Minutos Extra (Pack)</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full border rounded-md p-2 text-sm"
                  value={formData.extraTranscriptionMinutes}
                  onChange={e => setFormData({ ...formData, extraTranscriptionMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Casos Simulador (Usados)</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full border rounded-md p-2 text-sm"
                  value={formData.simulatorUsageCount}
                  onChange={e => setFormData({ ...formData, simulatorUsageCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Casos Extra (Pack)</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full border rounded-md p-2 text-sm"
                  value={formData.extraSimulatorCases}
                  onChange={e => setFormData({ ...formData, extraSimulatorCases: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Guardando...' : (userToEdit ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
}

export default function UsersPage() {
  const { isAdmin } = useRole();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserFilters['status']>('ALL');
  const [roleFilter, setRoleFilter] = useState<UserFilters['role']>('ALL');
  const [planFilter, setPlanFilter] = useState<string>(searchParams.get('plan') || 'ALL');
  const [packFilter, setPackFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);


  // Memoizar los filtros para evitar recreación en cada render
  const filters = useMemo<UserFilters>(() => ({
    search: searchQuery || undefined,
    status: statusFilter,
    role: roleFilter,
    plan: planFilter !== 'ALL' ? planFilter : undefined,
    pack: packFilter !== 'ALL' ? packFilter : undefined,
    limit: 50
  }), [searchQuery, statusFilter, roleFilter, planFilter, packFilter]);

  const { users, loading, error, refetch } = useAdminUsers(filters);

  // Cerrar dropdowns cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = document.querySelectorAll('[data-dropdown]');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target as Node)) {
          const menu = dropdown.querySelector('.absolute');
          if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionName = user.status === 'ACTIVE' ? 'suspender' : 'activar';

    if (confirm(`¿Estás seguro de que deseas ${actionName} al usuario ${user.firstName} ${user.lastName}?`)) {
      try {
        await AdminAPI.updateUser(user.id, { status: newStatus });
        refetch();
      } catch (err) {
        alert('Error al cambiar el estado del usuario');
      }
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (confirm(`¿Estás SEGURO de eliminar al usuario ${user.firstName} ${user.lastName}? Esta acción no se puede deshacer.`)) {
      try {
        await AdminAPI.deleteUser(user.id);
        refetch();
      } catch (err) {
        alert('Error al eliminar usuario');
      }
    }
  };


  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-500">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserX className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // The useAdminUsers hook will automatically refetch with new filters
  };

  const handleStatusFilter = (status: UserFilters['status']) => {
    setStatusFilter(status);
  };

  const handleRoleFilter = (role: UserFilters['role']) => {
    setRoleFilter(role);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      DELETED: 'bg-red-100 text-red-800',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      SUSPENDED: 'Suspendido',
      DELETED: 'Eliminado',
      PENDING_REVIEW: 'Pendiente'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPlanBadge = (planType: string) => {
    // Check if user is Agenda Manager by role if plan is free/missing
    // Note: This relies on where this function is called. We need user object.
    // Since getPlanBadge only takes planType string, we should change call sites or handle it differently.
    // However, looking at the code, we call it with `user.subscription?.planType || 'FREE'`.
    // If we want to override, we should do it at the CALL SITE.

    // Just returning badge styling here.
    const colors: Record<string, string> = {
      FREE: 'bg-gray-100 text-gray-800',
      BASIC: 'bg-blue-100 text-blue-800',
      PRO: 'bg-indigo-100 text-indigo-800',
      PREMIUM: 'bg-purple-100 text-purple-800',
      AGENDA_MANAGER: 'bg-pink-100 text-pink-800', // Added specific color
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[planType.toUpperCase()] || colors.FREE}`}>
        {planType.toUpperCase() === 'AGENDA_MANAGER' ? 'Agenda Manager' : planType.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-2">Administra los usuarios registrados en la plataforma</p>
            </div>
            <button
              onClick={handleCreateUser}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Crear Usuario
            </button>
          </div>
        </div>

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
          userToEdit={editingUser}
        />

        {/* Status Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'ALL', name: 'Todos' },
              { id: 'ACTIVE', name: 'Activos' },
              { id: 'SUSPENDED', name: 'Suspendidos' },
              { id: 'DELETED', name: 'Eliminados' },
              { id: 'INACTIVE', name: 'Inactivos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as UserFilters['status'])}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${statusFilter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Status Filter - Removed from here as it is now in Tabs */}
              <div className="flex items-center space-x-3">
                <Filter className="h-4 w-4 text-gray-400" />

                {/* Role Filter */}
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={roleFilter}
                  onChange={(e) => handleRoleFilter(e.target.value as UserFilters['role'])}
                >
                  <option value="ALL">Todos los roles</option>
                  <option value="PSYCHOLOGIST">Psicólogos</option>
                  <option value="AGENDA_MANAGER">Gestor de Agenda</option>
                  <option value="ADMIN">Administradores</option>
                </select>

                {/* Plan Filter */}
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="ALL">Todos los planes</option>
                  <option value="FREE">Gratuito</option>
                  <option value="BASIC">Basic</option>
                  <option value="PRO">Pro</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="CLINICS">Clinics</option>
                </select>

                {/* Pack Filter */}
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={packFilter}
                  onChange={(e) => setPackFilter(e.target.value)}
                >
                  <option value="ALL">Todos los packs</option>
                  <option value="agenda_manager">Agenda Manager</option>
                  <option value="pack_minutes">Pack Minutos</option>
                  <option value="pack_sessions">Pack Sesiones</option>
                  <option value="pack_onboarding">Pack Onboarding</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Table Header with Results Count */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Usuarios
                <span className="ml-2 text-sm text-gray-500">
                  ({users?.length || 0} {users?.length === 1 ? 'usuario' : 'usuarios'})
                </span>
              </h3>
              {(searchQuery || statusFilter !== 'ALL' || roleFilter !== 'ALL' || planFilter !== 'ALL' || packFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setRoleFilter('ALL');
                    setPlanFilter('ALL');
                    setPackFilter('ALL');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            {(searchQuery || statusFilter !== 'ALL' || roleFilter !== 'ALL' || planFilter !== 'ALL' || packFilter !== 'ALL') && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Búsqueda: "{searchQuery}"
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Estado: {statusFilter === 'ACTIVE' ? 'Activos' : statusFilter === 'INACTIVE' ? 'Inactivos' : statusFilter === 'SUSPENDED' ? 'Suspendidos' : statusFilter === 'DELETED' ? 'Eliminados' : statusFilter}
                  </span>
                )}
                {roleFilter !== 'ALL' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Rol: {roleFilter === 'PSYCHOLOGIST' ? 'Psicólogos' : roleFilter === 'AGENDA_MANAGER' ? 'Gestor de Agenda' : roleFilter === 'ADMIN' ? 'Administradores' : roleFilter}
                  </span>
                )}
                {planFilter !== 'ALL' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Plan: {planFilter}
                  </span>
                )}
                {packFilter !== 'ALL' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    Pack: {packFilter === 'agenda_manager' ? 'Agenda Manager' : packFilter === 'pack_minutes' ? 'Minutos' : packFilter === 'pack_sessions' ? 'Sesiones' : packFilter}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="overflow-x-auto pb-40">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso (Ses/Rep/Packs)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packs Extra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENDA_MANAGER' && user.subscription?.planType !== 'agenda_manager') ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{user._count?.sessions || 0}</span>
                            <span className="text-xs">sesiones</span>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-gray-900">{user._count?.reports || 0}</span>
                            <span className="text-xs">reportes</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Trans: {Math.round(user.transcriptionMinutesUsed || 0)} / {getLimit(user)} min
                          </div>
                          <div className="text-xs text-gray-500">
                            Casos: {user.simulatorUsageCount || 0} / {getCaseLimit(user) === -1 ? '∞' : getCaseLimit(user)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'AGENDA_MANAGER' ? 'bg-pink-100 text-pink-800' :
                        user.role.startsWith('PSYCHOLOGIST') ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {user.role === 'AGENDA_MANAGER' ? 'Gestor de Agenda' :
                          user.role.startsWith('PSYCHOLOGIST') ? 'Psicólogo' :
                            user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENDA_MANAGER') ? (
                        getPlanBadge(user.subscription?.planType || 'FREE')
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {/* Only show Agenda Manager pack for Psychologists, not for the Agenda Manager user themselves */}
                        {(user.agendaManagerEnabled || user.subscription?.planType === 'agenda_manager') && user.role !== 'AGENDA_MANAGER' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                            Agenda Manager
                          </span>
                        )}
                        {(user.extraTranscriptionMinutes || 0) > 0 && user.role !== 'AGENDA_MANAGER' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Pack Minutos
                          </span>
                        )}
                        {(user.extraSimulatorCases || 0) > 0 && user.role !== 'AGENDA_MANAGER' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Pack Casos
                          </span>
                        )}
                        {/* Note: Pack Onboarding detection is not yet available in user model */}
                        {!((user.agendaManagerEnabled || user.subscription?.planType === 'agenda_manager') && user.role !== 'AGENDA_MANAGER' || (user.extraTranscriptionMinutes || 0) > 0 || (user.extraSimulatorCases || 0) > 0) && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastLogin || new Date().toISOString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left" data-dropdown>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const dropdown = e.currentTarget.nextElementSibling;
                            if (dropdown) {
                              dropdown.classList.toggle('hidden');
                            }
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <div className="hidden absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <a
                              href={`/admin/users/${user.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Ver detalles y movimientos
                            </a>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Editar usuario
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left ${user.status === 'ACTIVE' ? 'text-red-700' : 'text-green-700'}`}
                            >
                              {user.status === 'ACTIVE' ? 'Suspender' : 'Activar'} usuario
                            </button>
                            <a
                              href={`mailto:${user.email}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Enviar email
                            </a>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              Eliminar usuario
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u =>
                    u.status === 'ACTIVE' &&
                    u.role !== 'ADMIN' &&
                    u.role !== 'SUPER_ADMIN'
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u =>
                    u.status === 'ACTIVE' &&
                    u.role !== 'AGENDA_MANAGER' &&
                    u.role !== 'ADMIN' &&
                    u.role !== 'SUPER_ADMIN'
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gestores de Agenda</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'AGENDA_MANAGER').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u =>
                    u.status === 'SUSPENDED' || u.status === 'DELETED'
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}