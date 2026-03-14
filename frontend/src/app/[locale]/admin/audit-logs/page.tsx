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
        { value: 'LOGIN', label: 'Login (Intento)' },
        { value: 'LOGIN_SUCCESS', label: 'Login Exitoso' },
        { value: 'LOGIN_FAILED', label: 'Login Fallido' },
        { value: 'FAILED_LOGIN', label: 'Login Fallido (Sistema)' },
        { value: 'LOGOUT', label: 'Logout' },
        { value: 'CREATE', label: 'Crear' },
        { value: 'READ', label: 'Leer/Acceder' },
        { value: 'UPDATE', label: 'Actualizar' },
        { value: 'DELETE', label: 'Eliminar' },
        { value: 'SUBSCRIPTION_CHANGE', label: 'Cambio Suscripción' },
        { value: 'PASSWORD_RESET', label: 'Reset Contraseña' },
        { value: 'EMAIL_VERIFICATION', label: 'Verificación Email' },
        { value: 'CONSENT_GRANTED', label: 'Consentimiento Otorgado' },
        { value: 'CONSENT_REVOKED', label: 'Consentimiento Revocado' },
        { value: 'DATA_EXPORT', label: 'Exportación Datos' },
        { value: 'DATA_IMPORT', label: 'Importación Datos' },
    ];

    const RESOURCES = [
        { value: 'User', label: 'Usuario' },
        { value: 'Subscription', label: 'Suscripción' },
        { value: 'Session', label: 'Sesión' },
        { value: 'Report', label: 'Informe' },
        { value: 'Client', label: 'Paciente' },
        { value: 'Payment', label: 'Pago' },
        { value: 'Auth', label: 'Autenticación' },
        { value: 'Consent', label: 'Consentimiento' },
        { value: 'Notification', label: 'Notificación' },
        { value: 'AdminTask', label: 'Tarea Admin' },
        { value: 'SimulationReport', label: 'Informe Simulación' }
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
                        <h1 className="text-2xl font-bold text-gray-900">Registros de Auditoría</h1>
                        <p className="mt-1 text-sm text-gray-600">Visualiza y filtra la actividad del sistema</p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search User */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Usuario</label>
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
                                    <option key={resource.value} value={resource.value}>
                                        {resource.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4 bg-gray-50 border-t border-b border-gray-100">
                                {logs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No se encontraron registros {errorOnly ? 'de error' : ''}
                                    </div>
                                ) : (
                                    logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="bg-white rounded-lg border shadow-sm p-4 space-y-3 cursor-pointer hover:border-blue-300 transition-colors"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {log.isSuccess ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                                    )}
                                                    <span className={`text-sm font-bold ${log.isSuccess ? 'text-gray-900' : 'text-red-700'}`}>
                                                        {ACTIONS.find(a => a.value === log.action)?.label || log.action}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="text-sm grid grid-cols-1 gap-1">
                                                <div className="flex items-center text-gray-600">
                                                    <span className="w-20 text-xs text-gray-400 uppercase">Usuario:</span>
                                                    <span className="truncate flex-1">{log.user?.email || 'Sistema'}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <span className="w-20 text-xs text-gray-400 uppercase">Recurso:</span>
                                                    <span className="truncate flex-1 font-mono text-xs">
                                                        {RESOURCES.find(r => r.value === log.resourceType)?.label || log.resourceType}
                                                    </span>
                                                </div>
                                            </div>

                                            {log.errorMessage ? (
                                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                                    Error: {log.errorMessage}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {log.metadata?.details || 'Sin detalles adicionales'}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción / Estado</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
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
                                                    <td className="px-3 py-4 whitespace-nowrap">
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
                                                    <td className="px-3 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 truncate max-w-[150px]" title={log.user?.email || 'Sistema'}>{log.user?.email || 'Sistema'}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[120px]">{log.user?.firstName}</div>
                                                    </td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {RESOURCES.find(r => r.value === log.resourceType)?.label || log.resourceType}
                                                    </td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.metadata?.details || ''}>
                                                        {log.errorMessage ? (
                                                            <span className="text-red-600 font-medium">{log.errorMessage}</span>
                                                        ) : (
                                                            <span className="text-gray-600">
                                                                {log.metadata?.details
                                                                    ? (log.metadata.details.length > 50 ? log.metadata.details.substring(0, 50) + '...' : log.metadata.details)
                                                                    : <span className="text-gray-400 italic">Ver detalles</span>
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
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
                            <h2 className="text-xl font-bold text-gray-900">Detalles</h2>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                        {RESOURCES.find(r => r.value === selectedLog.resourceType)?.label || selectedLog.resourceType}
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
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Información Adicional
                                </label>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                                        <div className="divide-y divide-gray-200">
                                            {Object.entries(selectedLog.metadata).map(([key, value]) => (
                                                <div key={key} className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase w-32 shrink-0 pt-0.5">
                                                        {key === 'details' ? 'Detalle' : key}
                                                    </span>
                                                    <div className="text-sm text-gray-800 font-mono whitespace-pre-wrap break-all">
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value, null, 2)
                                                            : String(value)
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm italic">
                                            No hay metadatos adicionales disponibles.
                                        </div>
                                    )}
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
