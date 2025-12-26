import Link from 'next/link';
import { Book, Zap, ArrowRight, FileText } from 'lucide-react';

export default function DocsIndexPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Centro de Documentación</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Todo lo que necesitas saber para sacar el máximo partido a PsicoAIssist.
                        Guías detalladas, tutoriales rápidos y referencias completas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Manual Card */}
                    <Link href="/docs/manual" className="group">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-8 border border-slate-200 h-full flex flex-col">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Book className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                Manual de Usuario
                            </h2>
                            <p className="text-slate-600 mb-6 flex-grow">
                                Documentación completa sobre todas las funcionalidades de la plataforma.
                                Aprende sobre roles, gestión de pacientes, facturación y análisis de IA.
                            </p>
                            <div className="flex items-center text-blue-600 font-medium">
                                Leer Manual <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Quick Guide Card */}
                    <Link href="/docs/quick-guide" className="group">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-8 border border-slate-200 h-full flex flex-col">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                                Guía Rápida
                            </h2>
                            <p className="text-slate-600 mb-6 flex-grow">
                                ¿Tienes prisa? Encuentra cómo realizar las tareas más comunes en menos de un minuto.
                                Crear citas, añadir pacientes y sincronizar calendario.
                            </p>
                            <div className="flex items-center text-amber-600 font-medium">
                                Ver Guía Rápida <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Tutorials Card */}
                    <Link href="/docs/tutorials" className="group">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-8 border border-slate-200 h-full flex flex-col">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <div className="text-purple-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                                Video Tutoriales
                            </h2>
                            <p className="text-slate-600 mb-6 flex-grow">
                                Guías visuales paso a paso. Desde la configuración inicial hasta el uso avanzado de estadísticas de IA.
                            </p>
                            <div className="flex items-center text-purple-600 font-medium">
                                Ver Tutoriales <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Reference Card */}
                    <Link href="/docs/reference" className="group">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-8 border border-slate-200 h-full flex flex-col">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                                Referencia y Glosario
                            </h2>
                            <p className="text-slate-600 mb-6 flex-grow">
                                Definiciones de métricas de IA, roles de usuario y documentación técnica para integraciones (API).
                            </p>
                            <div className="flex items-center text-emerald-600 font-medium">
                                Ver Referencia <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500">
                        ¿No encuentras lo que buscas? <Link href="/contact" className="text-blue-600 hover:underline">Contacta con soporte</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
