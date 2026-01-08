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

    const ACTIONS = [
        { value: 'LOGIN', label: 'Login' },
        { value: 'LOGIN_SUCCESS', label: 'Login Exitoso' },
        { value: 'LOGIN_FAILED', label: 'Login Fallido' },
        { value: 'LOGOUT', label: 'Logout' },
        { value: 'CREATE', label: 'Crear' },
        { value: 'UPDATE', label: 'Actualizar' },
        { value: 'DELETE', label: 'Eliminar' },
        { value: 'SUBSCRIPTION_CHANGE', label: 'Cambio Suscripción' },
        { value: 'PASSWORD_RESET', label: 'Reset Contraseña' },
        { value: 'EMAIL_VERIFICATION', label: 'Verificación Email' },
        { value: 'CONSENT_GRANTED', label: 'Consentimiento Otorgado' },
        { value: 'CONSENT_REVOKED', label: 'Consentimiento Revocado' },
    ];

    const RESOURCES = [
        'User',
        'Subscription',
        'Session',
        'Report',
        'Client',
        'Payment',
        'Auth'
    ];

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminAPI.getLogs({
                page,
                limit: 20,
                errorOnly,
                action: actionFilter || undefined,
                resource: resourceFilter || undefined,
                search: searchFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setLogs(data.logs);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, errorOnly, actionFilter, resourceFilter, searchFilter, startDate, endDate]);

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
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search User */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar Usuario</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Nombre o email..."
                                    className="pl-9 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Acción</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                            >
                                <option value="">Todas</option>
                                {ACTIONS.map((action) => (
                                    <option key={action.value} value={action.value}>
                                        {action.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Resource Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Recurso</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                                value={resourceFilter}
                                onChange={(e) => setResourceFilter(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {RESOURCES.map((resource) => (
                                    <option key={resource} value={resource}>
                                        {resource}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setErrorOnly(!errorOnly)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center transition-colors ${errorOnly
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <AlertTriangle className={`w-3 h-3 mr-2 ${errorOnly ? 'text-red-700' : 'text-gray-500'}`} />
                                {errorOnly ? 'Solo Errores' : 'Errores'}
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    setActionFilter('');
                                    setResourceFilter('');
                                    setSearchFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                    setErrorOnly(false);
                                    setPage(1);
                                }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
                            >
                                Limpiar filtros
                            </button>
                            <button
                                onClick={() => loadLogs()}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                            >
                                <RefreshCw className="w-3 h-3 mr-1.5" />
                                Actualizar
                            </button>
                        </div>
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
                                            <tr
                                                key={log.id}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {log.isSuccess ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                                        )}
                                                        <span className={`text-sm font-medium ${log.isSuccess ? 'text-gray-900' : 'text-red-700'}`}>
                                                            {ACTIONS.find(a => a.value === log.action)?.label || log.action}
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
                                                        <span className="font-mono text-xs text-gray-400">Clic para ver detalles</span>
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

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Detalles del Log</h2>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg flex items-start space-x-3 ${selectedLog.isSuccess ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                {selectedLog.isSuccess ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                )}
                                <div>
                                    <h3 className={`font-medium ${selectedLog.isSuccess ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                        {ACTIONS.find(a => a.value === selectedLog.action)?.label || selectedLog.action}
                                    </h3>
                                    {selectedLog.errorMessage && (
                                        <p className="mt-1 text-sm text-red-700 font-medium">
                                            Error: {selectedLog.errorMessage}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Fecha y Hora
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedLog.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Usuario
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedLog.user ? (
                                            <>
                                                <span className="font-medium">{selectedLog.user.email}</span>
                                                <span className="text-gray-500 block text-xs">ID: {selectedLog.userId}</span>
                                            </>
                                        ) : (
                                            'Sistema / Anónimo'
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Tipo de Recurso
                                    </label>
                                    <p className="text-sm text-gray-900 font-mono">
                                        {selectedLog.resourceType}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Log ID
                                    </label>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {selectedLog.id}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    Metadatos / Payload
                                </label>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-xs text-green-400 font-mono">
                                        {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm shadow-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
