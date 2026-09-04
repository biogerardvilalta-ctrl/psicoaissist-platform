'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { Database, Server, Activity, HardDrive, ShieldCheck, AlertTriangle, Trash2, DownloadCloud, RotateCw } from 'lucide-react';
import { AdminAPI } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';

export default function SystemPage() {
    const { isAdmin } = useRole();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupData, setBackupData] = useState<any>(null);

    const [stats] = useState({
        dbStatus: 'Connected',
        dbLatency: '12ms',
        uptime: '99.9%',
        version: '1.2.0',
        nodeVersion: 'v18.16.0'
    });

    useEffect(() => {
        if (isAdmin()) {
            fetchBackups();
        }
    }, [isAdmin]);

    const fetchBackups = async () => {
        try {
            const data = await AdminAPI.getBackups();
            setBackupData(data);
        } catch (error) {
            console.error('Error fetching backups', error);
        }
    };

    const handleCreateBackup = async (type: 'app' | 'mail' | 'all') => {
        setIsBackingUp(true);
        try {
            const result = await AdminAPI.createBackup(type);
            toast({ title: 'Backup creado', description: result.message });
            fetchBackups();
        } catch (error: any) {
            toast({ title: 'Error al hacer backup', description: error.message, variant: 'destructive' });
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestoreBackup = async (filename: string) => {
        if (!confirm(`¿Estás SEGURO de restaurar ${filename}? Esta acción sobrescribirá la base de datos actual con los datos del backup.`)) return;

        try {
            const result = await AdminAPI.restoreBackup(filename);
            toast({ title: 'Backup restaurado', description: result.message });
        } catch (error: any) {
            toast({ title: 'Error al restaurar', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!confirm(`¿Eliminar el backup ${filename}?`)) return;

        try {
            await AdminAPI.deleteBackup(filename);
            toast({ title: 'Backup eliminado', description: `Se ha borrado ${filename}` });
            fetchBackups();
        } catch (error: any) {
            toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
        }
    };

    const handleCleanup = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar permanentemente los usuarios borrados? Esta acción NO se puede deshacer.')) return;

        setIsLoading(true);
        try {
            const result = await AdminAPI.cleanupSoftDeletedUsers();
            if (result.success) {
                toast({ title: "Limpieza completada", description: result.message });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || 'Error al limpiar usuarios', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin()) {
        return <div className="p-8 text-center text-red-600">Acceso Denegado</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Estado del Sistema y Backups</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Database Status */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Database className="w-5 h-5 mr-2 text-blue-600" />
                                Base de Datos
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Online</span>
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
                                <span className="font-medium text-gray-900">PostgreSQL + MySQL</span>
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
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Healthy</span>
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

                    {/* Security & Backups summary */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" />
                                Storage Backups
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Backups</span>
                                <span className="font-medium text-gray-900">{backupData?.totalBackups || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Espacio Usado</span>
                                <span className="font-medium text-gray-900">{backupData?.totalSize || '0 B'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Cron Diario</span>
                                <span className="font-medium text-green-600">Activo (02:00 AM)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backups Management */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">Gestión de Backups</h3>
                            <p className="text-sm text-gray-500">Crea copias manuales o restaura datos anteriores (PostgreSQL y Mailcow).</p>
                        </div>
                        <div className="flex space-x-2 mt-4 sm:mt-0">
                            <button
                                onClick={() => handleCreateBackup('app')}
                                disabled={isBackingUp}
                                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center text-sm font-medium transition-colors"
                            >
                                {isBackingUp ? <RotateCw className="w-4 h-4 mr-2 animate-spin" /> : <DownloadCloud className="w-4 h-4 mr-2" />}
                                Backup App
                            </button>
                            <button
                                onClick={() => handleCreateBackup('mail')}
                                disabled={isBackingUp}
                                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex items-center text-sm font-medium transition-colors"
                            >
                                {isBackingUp ? <RotateCw className="w-4 h-4 mr-2 animate-spin" /> : <DownloadCloud className="w-4 h-4 mr-2" />}
                                Backup Mail
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(!backupData?.backups || backupData.backups.length === 0) ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay backups disponibles aún</td>
                                    </tr>
                                ) : (
                                    backupData.backups.map((bkp: any) => (
                                        <tr key={bkp.name} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bkp.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${bkp.type === 'app' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {bkp.type === 'app' ? 'App (PostgreSQL)' : 'Correo (MySQL)'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bkp.sizeFormatted}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bkp.createdAt).toLocaleString('es-ES')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button onClick={() => handleRestoreBackup(bkp.name)} className="text-blue-600 hover:text-blue-900">Restaurar</button>
                                                <button onClick={() => handleDeleteBackup(bkp.name)} className="text-red-600 hover:text-red-900">Borrar</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions (Dangerous) */}
                <div className="bg-white rounded-lg shadow-sm border p-6 border-red-200">
                    <h3 className="font-semibold text-red-900 flex items-center mb-4">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                        Acciones de Peligro
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            className="p-4 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 text-left transition-colors relative"
                            onClick={handleCleanup}
                            disabled={isLoading}
                        >
                            <Trash2 className="w-6 h-6 text-red-500 mb-2" />
                            <div className="font-medium text-red-900">Limpiar Usuarios</div>
                            <div className="text-xs text-red-700">Eliminar permanentes</div>
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
