import React from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export default function ReportsPage() {
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

            {/* Empty State / List Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No hay informes creados</h3>
                <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                    Comienza creando un informe de evolución o alta clínica para tus pacientes.
                </p>
                <div className="mt-6">
                    <Link
                        href="/dashboard/reports/new"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Crear mi primer informe &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
