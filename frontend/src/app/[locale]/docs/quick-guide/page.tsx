import { Link } from '@/navigation';
import { ArrowLeft, Zap, CheckCircle2, HelpCircle, Users } from 'lucide-react';

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
                                        <li>Vaya a <strong>Ajustes &gt; Preferencias</strong>.</li>
                                        <li>Busque la sección <strong>Google Calendar</strong>.</li>
                                        <li>Active <strong>Importar eventos</strong>.</li>
                                        <li>Complete la autenticación con Google.</li>
                                    </ol>
                                    <p className="mt-2 text-xs text-slate-500 italic">
                                        *Truco: Esto permite que sus citas de PsicoAIssist aparezcan en su calendario.
                                    </p>
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

                        {/* Tips & Tricks Section (New) */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5" /> Trucos Configuración
                                </h3>
                                <ul className="space-y-3 text-sm text-amber-800">
                                    <li><strong>Cambiar Plan/Tarifa:</strong> En <em>Ajustes &gt; Facturación</em>. Consulte si es Basic, Pro, Premium o clínicas.</li>
                                    <li><strong>Vacaciones:</strong> En <em>Ajustes &gt; Agenda &gt; Bloqueos</em>. Use "Bloquear Día Completo" en lugar de borrar sesiones.</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Para Profesionales
                                </h3>
                                <ul className="space-y-3 text-sm text-blue-800">
                                    <li><strong>Notas Completas:</strong> La IA necesita contexto. Escriba notas post-sesión para mejorar los "Temas Recurrentes".</li>
                                    <li><strong>Marcar Asistencia:</strong> Use "Realizada" o "Cancelada". Las citas "Pendientes" no suman en estadísticas.</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Para Gestores
                                </h3>
                                <ul className="space-y-3 text-sm text-purple-800">
                                    <li><strong>Grupos:</strong> Cree grupos (ej. "Tardes") si gestiona muchos doctores para filtrar rápido.</li>
                                    <li><strong>Vista Unificada:</strong> Al seleccionar un grupo, verá una agenda combinada ideal para huecos.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Troubleshooting Section */}
                        <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <HelpCircle className="w-6 h-6 text-slate-600" />
                                <h2 className="text-2xl font-bold text-slate-900">¿Problemas Comunes?</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">"No veo mis citas de Google"</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Asegúrese de que el interruptor "Importar eventos" esté activado en Ajustes y que haya dado todos los permisos solicitados en la pantalla de Google.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">"El Dashboard está vacío"</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
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
