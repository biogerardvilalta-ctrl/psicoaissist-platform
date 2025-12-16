'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function NewReportPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Nuevo Informe Clínico</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <p className="text-center text-gray-500">
                    El asistente de creación de informes estará disponible pronto.
                </p>
                <button 
                  onClick={() => router.back()}
                  className="mt-4 w-full justify-center inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Volver
                </button>
            </div>
        </div>
    );
}
