'use client';

import { useState, useEffect } from 'react';
import { AdminAPI, AdminUser, AuditLog } from '@/lib/admin-api';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Calendar, CreditCard, Activity, ArrowLeft, Clock, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const PLAN_LIMITS: Record<string, number> = {
    FREE: 30,
    BASIC: 600,
    PRO: 900,
    PREMIUM: 3000,
    PREMIUM_PLUS: 3000,
    CLINICS: 30000
};

const getLimit = (user: any) => {
    const plan = (user.subscription?.planType || 'FREE').toUpperCase();
    const baseLimit = PLAN_LIMITS[plan] || 0;
    const extra = user.extraTranscriptionMinutes || 0;
    return baseLimit + extra;
};

function ChangePasswordModal({ userId, isOpen, onClose }: { userId: string; isOpen: boolean; onClose: () => void }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await AdminAPI.changeUserPassword(userId, password);
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setTimeout(onClose, 1500);
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al actualizar contraseña' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Cambiar Contraseña</h3>
                {message && (
                    <div className={`p-2 rounded mb-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        className="w-full border rounded p-2 mb-4"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        if (params?.id) {
            loadData(params.id as string);
        }
    }, [params?.id]);

    const loadData = async (userId: string) => {
        try {
            setLoading(true);
            const [userData, logsData] = await Promise.all([
                AdminAPI.getUser(userId),
                AdminAPI.getLogs({ page: 1, limit: 20, errorOnly: false, userId })
            ]);

            setUser(userData);
            setLogs(logsData.logs ? logsData.logs : []);

        } catch (err) {
            setError('Error al cargar datos del usuario');
            console.error(err);
        } finally {
            setLoading(false);
        }
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

    if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;
    if (!user) return <div className="p-8 text-center text-red-600">Usuario no encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Usuarios
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-blue-600">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                                <p className="text-sm text-gray-500 break-all">{user.email}</p>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        user.status === 'DELETED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
                                {user.status === 'DELETED' && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                                        <p className="font-bold mb-1">📅 Recuperación de Cuenta</p>
                                        {(() => {
                                            const deletionDate = new Date(user.updatedAt);
                                            const now = new Date();
                                            const diffTime = Math.abs(now.getTime() - deletionDate.getTime());
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            const remainingDays = 30 - diffDays;

                                            if (remainingDays > 0) {
                                                return <p>Quedan <strong>{remainingDays} días</strong> para la anonimización irreversible.</p>;
                                            } else {
                                                return <p><strong>Procesando anonimización...</strong> (Pendiente de cron)</p>;
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Registro
                                    </span>
                                    <span className="font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Último acceso
                                    </span>
                                    <span className="font-medium">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Plan
                                    </span>
                                    <span className="font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
                                            ? 'Admin'
                                            : ((user.subscription?.planType === 'agenda_manager' || user.role === 'AGENDA_MANAGER')
                                                ? 'Agenda Manager'
                                                : (user.subscription?.planType || 'FREE'))
                                        }
                                    </span>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-2">🔑</span> Cambiar Contraseña
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENDA_MANAGER' && user.subscription?.planType !== 'agenda_manager') && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Estadísticas de Uso
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 uppercase">Sesiones</p>
                                        <p className="text-xl font-bold text-blue-600">{user._count?.sessions || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 uppercase">Reportes</p>
                                        <p className="text-xl font-bold text-orange-600">{user._count?.reports || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 uppercase">Clientes</p>
                                        <p className="text-xl font-bold text-green-600">{user._count?.clients || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 uppercase">Transcripción</p>
                                        <p className="text-xl font-bold text-indigo-600">
                                            {Math.round(user.transcriptionMinutesUsed || 0)} / {getLimit(user)}m
                                        </p>
                                    </div>
                                    {(user.extraTranscriptionMinutes || 0) > 0 && (
                                        <div className="bg-blue-50 p-3 rounded-lg text-center col-span-2">
                                            <p className="text-xs text-blue-800 uppercase">Pack Minutos</p>
                                            <p className="text-lg font-bold text-blue-600">{user.extraTranscriptionMinutes} min extra</p>
                                        </div>
                                    )}
                                    {(user.extraSimulatorCases || 0) > 0 && (
                                        <div className="bg-purple-50 p-3 rounded-lg text-center col-span-2">
                                            <p className="text-xs text-purple-800 uppercase">Pack Casos</p>
                                            <p className="text-lg font-bold text-purple-600">{user.extraSimulatorCases} casos extra</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Recent Sessions */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Últimas Sesiones
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {user.sessions && user.sessions.length > 0 ? (
                                    user.sessions.map((session: any) => (
                                        <div key={session.id} className="px-6 py-3 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Sesión {session.sessionType}</p>
                                                    <p className="text-xs text-gray-500">{new Date(session.startTime).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {session.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center text-gray-500 text-sm">No hay sesiones recientes</div>
                                )}
                            </div>
                        </div>

                        {/* Audit Logs */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Registro de Actividad (Movimientos)
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <div key={log.id} className="px-6 py-3 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 break-words">
                                                        {log.action} <span className="text-gray-400">on</span> {log.resourceType}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    {log.isSuccess ? (
                                                        <span className="text-xs text-green-600 font-medium">Éxito</span>
                                                    ) : (
                                                        <span className="text-xs text-red-600 font-medium">{log.errorMessage || 'Error'}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {log.metadata && (
                                                <div className="mt-1 text-xs text-gray-400 font-mono break-all whitespace-pre-wrap">
                                                    {JSON.stringify(log.metadata)}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center text-gray-500 text-sm">No hay actividad reciente registrada</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {user && (
                <ChangePasswordModal
                    userId={user.id}
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />
            )}
        </div>
    );
}
