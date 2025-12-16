'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Download, Trash2, Search, Filter, Pencil } from 'lucide-react';
import { ReportsAPI, Report, REPORT_TYPE_LABELS } from '@/lib/reports-api';
import { ClientsAPI } from '@/lib/clients-api';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [clientMap, setClientMap] = useState<Record<string, string>>({});

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [reportsData, clientsData] = await Promise.all([
                    ReportsAPI.getAll(),
                    ClientsAPI.getAll()
                ]);

                setReports(reportsData);

                // Create a map of clientId -> clientName for easy lookup
                const map: Record<string, string> = {};
                clientsData.forEach((c: any) => {
                    map[c.id] = `${c.firstName} ${c.lastName}`;
                });
                setClientMap(map);

            } catch (error) {
                console.error("Failed to load reports", error);
                toast({ title: "Error", description: "No se pudieron cargar los informes.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [toast]);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (clientMap[report.clientId] || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || report.reportType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const handleDownload = async (id: string, title: string) => {
        try {
            const blob = await ReportsAPI.download(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed", e);
            toast({ title: "Error", description: "No se pudo descargar el PDF", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este informe?')) return;
        try {
            await ReportsAPI.delete(id);
            setReports(prev => prev.filter(r => r.id !== id));
            toast({ title: "Informe eliminado", description: "El informe se ha movido a la papelera." });
        } catch (e) {
            console.error("Delete failed", e);
            toast({ title: "Error", description: "No se pudo eliminar el informe", variant: "destructive" });
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Informes Clínicos</h1>
                    <p className="text-gray-500 mt-1">Gestiona y redacta informes legales y de evolución.</p>
                </div>
                <Link
                    href="/dashboard/reports/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Informe
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por título o paciente..."
                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="ALL">Todos los Tipos</option>
                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>

                <select
                    className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Todos los Estados</option>
                    <option value="COMPLETED">Completados</option>
                    <option value="DRAFT">Borradores</option>
                </select>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredReports.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No se encontraron informes</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        Intenta ajustar los filtros o crea un nuevo informe.
                    </p>
                </div>
            ) : (
                /* Data Table */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título / Paciente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{report.title}</div>
                                                <div className="text-sm text-gray-500">{clientMap[report.clientId] || 'Paciente desconocido'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.status === 'COMPLETED' ? 'Completado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {report.status === 'COMPLETED' ? (
                                            <button
                                                onClick={() => handleDownload(report.id, report.title)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Descargar PDF"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/dashboard/reports/new?edit=${report.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block"
                                                title="Editar Borrador"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="text-red-400 hover:text-red-600"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
