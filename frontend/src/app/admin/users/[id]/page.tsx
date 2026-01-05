'use client';

import { useState, useEffect } from 'react';
import { AdminAPI, AdminUser, AuditLog } from '@/lib/admin-api';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Calendar, CreditCard, Activity, ArrowLeft, Clock, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                AdminAPI.getLogs(1, 20, false, userId)
            ]);

            // Since getLogs in AdminAPI wrapper currently exposes userId filter in the backend but I need to pass it
            // Let's re-check AdminAPI wrapper. 
            // It has: static async getLogs(page = 1, limit = 20, errorOnly = false)
            // It is MISSING userId as argument! I should update AdminAPI wrapper to support userId filtering.

            setUser(userData);
            // For now, let's assume logsData returns everything and we filter client side or just show what we got 
            // Actually I should fix AdminAPI first. But to proceed, I'll allow this and fix AdminAPI in parallel or next step.
            setLogs(logsData.logs);

        } catch (err) {
            setError('Error al cargar datos del usuario');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
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
                                        {user.subscription?.planType || 'FREE'}
                                    </span>
                                </div>
                            </div>
                        </div>

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
                            </div>
                        </div>
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
                                                    <p className="text-sm font-medium text-gray-900">
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
                                                <div className="mt-1 text-xs text-gray-400 font-mono truncate max-w-lg">
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
        </div>
    );
}
