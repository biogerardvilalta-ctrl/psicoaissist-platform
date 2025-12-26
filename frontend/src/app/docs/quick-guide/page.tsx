import Link from 'next/link';
import { ArrowLeft, Zap, CheckCircle2, HelpCircle } from 'lucide-react';

export default function QuickGuidePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/docs" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Documentación
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-amber-100 font-medium">Cheat Sheet</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Guía Rápida</h1>
                        <p className="text-amber-100 text-lg max-w-2xl">
                            Acciones frecuentes en menos de un minuto. Todo lo directo y al grano.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">

                        {/* Quick Actions Grid */}
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">📅 Gestión de Agenda</h2>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">Crear una Nueva Cita</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        <li>Vaya a <strong>Sesiones</strong> en el menú.</li>
                                        <li>Haga clic en un hueco vacío o en <strong>"Nueva Sesión"</strong>.</li>
                                        <li>Seleccione el <strong>Paciente</strong> y confirme hora.</li>
                                        <li className="text-green-600 font-medium flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> ¡Listo!
                                        </li>
                                    </ol>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">Sincronizar Google Calendar</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        <li>Vaya a <strong>Ajustes > Preferencias</strong>.</li>
                                        <li>Busque la sección <strong>Google Calendar</strong>.</li>
                                        <li>Active <strong>Importar eventos</strong>.</li>
                                        <li>Complete la autenticación con Google.</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">👥 Pacientes y Dashboard</h2>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">Añadir Paciente</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        <li>Click en <strong>Clientes</strong>.</li>
                                        <li>Botón <strong>"Añadir Paciente"</strong>.</li>
                                        <li>Rellene Nombre y Email obligatorios.</li>
                                        <li>Guardar.</li>
                                    </ol>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">Personalizar Dashboard</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        <li>En página <strong>Inicio</strong>.</li>
                                        <li>Botón <strong>"Librería de Widgets"</strong>.</li>
                                        <li>Active/Desactive los paneles deseados.</li>
                                        <li>Se guarda automáticamente.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Troubleshooting Section */}
                        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                            <div className="flex items-center gap-3 mb-6">
                                <HelpCircle className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-bold text-blue-900">¿Problemas Comunes?</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-2">"No veo mis citas de Google"</h4>
                                    <p className="text-blue-700/80 text-sm leading-relaxed">
                                        Asegúrese de que el interruptor "Importar eventos" esté activado en Ajustes y que haya dado todos los permisos solicitados en la pantalla de Google.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-2">"El Dashboard está vacío"</h4>
                                    <p className="text-blue-700/80 text-sm leading-relaxed">
                                        Si acaba de registrarse, es normal. Cree su primer paciente y primera sesión para empezar a ver datos y gráficas.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
