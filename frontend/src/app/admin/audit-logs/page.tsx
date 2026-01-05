'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminAPI, AuditLog } from '@/lib/admin-api';
import { AlertTriangle, Search, Filter, RefreshCw, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorOnly, setErrorOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminAPI.getLogs(page, 20, errorOnly);
            setLogs(data.logs);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, errorOnly]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Logs del Sistema</h1>
                        <p className="mt-1 text-sm text-gray-600">Registro de auditoría y errores (Site of Errors)</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <button
                            onClick={() => setErrorOnly(!errorOnly)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center transition-colors ${errorOnly
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <AlertTriangle className={`w-4 h-4 mr-2 ${errorOnly ? 'text-red-700' : 'text-gray-500'}`} />
                            {errorOnly ? 'Mostrando Errores' : 'Mostrar Solo Errores'}
                        </button>
                        <button
                            onClick={() => loadLogs()}
                            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando registros...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción / Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron registros {errorOnly ? 'de error' : ''}
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {log.isSuccess ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                                        )}
                                                        <span className={`text-sm font-medium ${log.isSuccess ? 'text-gray-900' : 'text-red-700'}`}>
                                                            {log.action}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{log.user?.email || 'Sistema'}</div>
                                                    <div className="text-xs text-gray-500">{log.user?.firstName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.resourceType}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {log.errorMessage ? (
                                                        <span className="text-red-600 font-medium">{log.errorMessage}</span>
                                                    ) : (
                                                        <span className="font-mono text-xs">{JSON.stringify(log.metadata || {})}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Mostrando {logs.length} de {total} registros
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50 bg-white"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={loading || logs.length < 20}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50 bg-white"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
