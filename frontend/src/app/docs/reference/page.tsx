import Link from 'next/link';
import { ArrowLeft, BookOpen, Code, Database } from 'lucide-react';

export default function ReferencePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/docs" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Documentación
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="bg-slate-900 text-white p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-slate-300 font-medium">Referencia Técnica</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Glosario y Referencia</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Definiciones clave y detalles técnicos para usuarios avanzados y desarrolladores.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-slate max-w-none">

                            <section className="mb-12">
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                                    <Database className="w-6 h-6 text-blue-600" />
                                    Glosario de Términos
                                </h2>
                                <div className="grid gap-6">
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <h3 className="font-bold text-slate-900">Agenda Manager</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Rol de usuario con permisos para gestionar calendarios de otros profesionales ("Managed Professionals"), pero sin acceso a datos clínicos confidenciales mostrados en las estadísticas detalladas.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <h3 className="font-bold text-slate-900">Temas Recurrentes (AI)</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Algoritmo de procesamiento de lenguaje natural que analiza las notas de sesión anónimizadas para extraer patrones temáticos (ej. "Ansiedad laboral", "Conflicto familiar") y visualizarlos en el dashboard.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <h3 className="font-bold text-slate-900">Sentiment Analysis</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Métrica de bienestar calculada analizando el tono emocional de las notas clínicas. Se presenta como una tendencia (Positiva, Neutra, Negativa) a lo largo del tiempo.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <hr className="my-8" />

                            <section>
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                                    <Code className="w-6 h-6 text-purple-600" />
                                    API Reference (Básico)
                                </h2>
                                <p className="text-slate-600 mb-4">
                                    PsycoAIssist ofrece una API RESTful para integraciones personalizadas.
                                    Para obtener acceso completo a la documentación de la API (Swagger), contacte con soporte.
                                </p>

                                <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto text-sm text-slate-300 font-mono">
                                    <p className="mb-2 text-slate-500">{/* Endpoint de ejemplo para obtener sesiones */}</p>
                                    <p><span className="text-purple-400">GET</span> /api/v1/sessions</p>
                                    <p className="mt-2 text-slate-500">{/* Headers requeridos */}</p>
                                    <p>Authorization: Bearer &lt;YOUR_API_TOKEN&gt;</p>
                                    <p>Content-Type: application/json</p>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
