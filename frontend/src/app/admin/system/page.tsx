'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { Database, Server, Activity, HardDrive, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SystemPage() {
    const { isAdmin } = useRole();
    const [stats, setStats] = useState({
        dbStatus: 'Connected',
        dbLatency: '12ms',
        uptime: '99.9%',
        lastBackup: '2 hours ago',
        version: '1.2.0',
        nodeVersion: 'v18.16.0'
    });

    if (!isAdmin()) {
        return <div className="p-8 text-center text-red-600">Acceso Denegado</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Estado del Sistema y Base de Datos</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Database Status */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Database className="w-5 h-5 mr-2 text-blue-600" />
                                Base de Datos
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Online
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Estado</span>
                                <span className="font-medium text-gray-900">{stats.dbStatus}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Latencia</span>
                                <span className="font-medium text-gray-900">{stats.dbLatency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tipo</span>
                                <span className="font-medium text-gray-900">PostgreSQL</span>
                            </div>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-green-600" />
                                Salud del Sistema
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Healthy
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Uptime</span>
                                <span className="font-medium text-gray-900">{stats.uptime}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Versión App</span>
                                <span className="font-medium text-gray-900">{stats.version}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Node.js</span>
                                <span className="font-medium text-gray-900">{stats.nodeVersion}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security & Backups */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" />
                                Seguridad & Backups
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Último Backup</span>
                                <span className="font-medium text-gray-900">{stats.lastBackup}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">SSL</span>
                                <span className="font-medium text-green-600">Valid</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Firewall</span>
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Mock) */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Acciones de Mantenimiento</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                            onClick={() => alert("Cache limpiada correctamente")}
                        >
                            <HardDrive className="w-6 h-6 text-gray-500 mb-2" />
                            <div className="font-medium text-gray-900">Limpiar Caché</div>
                            <div className="text-xs text-gray-500">Liberar espacio temporal</div>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                            onClick={() => alert("Backup iniciado. Recibirás una notificación al completar.")}
                        >
                            <Database className="w-6 h-6 text-blue-500 mb-2" />
                            <div className="font-medium text-gray-900">Backup Manual</div>
                            <div className="text-xs text-gray-500">Crear copia de seguridad ahora</div>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                            onClick={() => alert("Logs de sistema exportados a CSV.")}
                        >
                            <Server className="w-6 h-6 text-purple-500 mb-2" />
                            <div className="font-medium text-gray-900">Exportar Logs</div>
                            <div className="text-xs text-gray-500">Descargar registro de actividad</div>
                        </button>
                        <button className="p-4 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 text-left transition-colors"
                            onClick={() => alert("Simulando reinicio de servicios...")}
                        >
                            <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
                            <div className="font-medium text-red-900">Reiniciar Servicios</div>
                            <div className="text-xs text-red-700">Solo en caso de emergencia</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
