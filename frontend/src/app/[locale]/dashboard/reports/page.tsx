'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { FileText, Plus, Download, Trash2, Search, Filter, Pencil } from 'lucide-react';
import { ReportsAPI, Report, REPORT_TYPE_LABELS, ReportType, ReportStatus } from '@/lib/reports-api';
import { ClientsAPI } from '@/lib/clients-api';
import { useToast } from '@/hooks/use-toast';
import { useTranslations, useLocale } from 'next-intl';

export default function ReportsPage() {
    const t = useTranslations('Reports');
    const locale = useLocale();
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
                toast({
                    title: t('errors.loadFailed'),
                    description: t('errors.loadFailedDesc'),
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [toast, t]);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (clientMap[report.clientId] || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || report.reportType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Helper to translate default titles for existing reports
    const formatReportTitle = (title: string) => {
        if (title.startsWith('Informe de Evolución')) {
            const datePart = title.split(' - ')[1] || '';
            return `${t('defaultTitles.evolution')} - ${datePart}`;
        }
        if (title.startsWith("Informe de Alta")) {
            const datePart = title.split(' - ')[1] || '';
            return `${t('defaultTitles.discharge')} - ${datePart}`;
        }
        return title;
    };

    const handleDownload = async (id: string, title: string, clientName?: string) => {
        try {
            const blob = await ReportsAPI.download(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const safeClient = clientName ? clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'report';
            const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            link.download = `${safeClient}_${safeTitle}_${dateStr}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed", e);
            toast({
                title: t('errors.downloadFailed'),
                description: t('errors.downloadPdfFailed'),
                variant: "destructive"
            });
        }
    };

    const handleDownloadWord = async (id: string, title: string, clientName?: string) => {
        try {
            const blob = await ReportsAPI.downloadWord(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const safeClient = clientName ? clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'report';
            const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            link.download = `${safeClient}_${safeTitle}_${dateStr}.docx`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download Word failed", e);
            toast({
                title: t('errors.downloadFailed'),
                description: t('errors.downloadWordFailed'),
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('table.actions.deleteConfirm'))) return;
        try {
            await ReportsAPI.delete(id);
            setReports(prev => prev.filter(r => r.id !== id));
            toast({
                title: t('table.actions.deleteSuccess'),
                description: t('table.actions.deleteSuccessDesc')
            });
        } catch (e) {
            console.error("Delete failed", e);
            toast({
                title: t('table.actions.deleteError'),
                description: t('table.actions.deleteErrorDesc'),
                variant: "destructive"
            });
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
                <Link
                    href="/dashboard/reports/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('newReport')}
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
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
                    <option value="ALL">{t('filters.allTypes')}</option>
                    {Object.values(ReportType).map((type) => (
                        <option key={type} value={type}>{t(`types.${type}`)}</option>
                    ))}
                </select>

                <select
                    className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">{t('filters.allStatuses')}</option>
                    <option value="COMPLETED">{t('filters.completed')}</option>
                    <option value="DRAFT">{t('filters.drafts')}</option>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('table.empty.title')}</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        {t('table.empty.description')}
                    </p>
                </div>
            ) : (
                /* Data Table */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.columns.titlePatient')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.columns.type')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.columns.date')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.columns.status')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{formatReportTitle(report.title)}</div>
                                                <div className="text-sm text-gray-500">{clientMap[report.clientId] || t('table.unknownPatient')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {t(`types.${report.reportType}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(report.createdAt).toLocaleString(locale, {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {report.status === 'COMPLETED' ? t('table.status.completed') : t('table.status.draft')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {report.status === 'COMPLETED' ? (
                                            <>
                                                <button
                                                    onClick={() => handleDownloadWord(report.id, report.title, clientMap[report.clientId])}
                                                    className="text-blue-600 hover:text-blue-800 mr-4"
                                                    title={t('table.actions.downloadWord')}
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(report.id, report.title, clientMap[report.clientId])}
                                                    className="text-red-600 hover:text-red-800 mr-4"
                                                    title={t('table.actions.downloadPdf')}
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                href={`/dashboard/reports/new?edit=${report.id}`}
                                                className="text-primary hover:text-primary/80 mr-4 inline-block"
                                                title={t('table.actions.edit')}
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="text-rose-400 hover:text-rose-600"
                                            title={t('table.actions.delete')}
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
