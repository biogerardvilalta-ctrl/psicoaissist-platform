import Link from 'next/link';
import { ArrowLeft, Book } from 'lucide-react';

export default function ManualPage() {
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
                    <div className="bg-slate-900 text-white p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Book className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-blue-200 font-medium">Documentación Oficial</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Manual de Usuario</h1>
                        <p className="text-slate-300 text-lg max-w-2xl">
                            Guía competa para dominar PsicoAIssist Platform, desde la configuración inicial hasta el análisis avanzado con IA.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 prose prose-slate max-w-none">
                        <nav className="p-6 bg-slate-50 rounded-xl mb-12 not-prose border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Índice de Contenidos</h3>
                            <ul className="space-y-2 text-slate-600">
                                <li><a href="#introduccion" className="hover:text-blue-600 hover:underline">1. Introducción</a></li>
                                <li><a href="#roles" className="hover:text-blue-600 hover:underline">2. Roles de Usuario</a></li>
                                <li><a href="#primeros-pasos" className="hover:text-blue-600 hover:underline">3. Primeros Pasos</a></li>
                                <li><a href="#dashboard" className="hover:text-blue-600 hover:underline">4. El Dashboard</a></li>
                                <li><a href="#funcionalidades" className="hover:text-blue-600 hover:underline">5. Funcionalidades Principales</a></li>
                                <li><a href="#configuracion" className="hover:text-blue-600 hover:underline">6. Configuración e Integraciones</a></li>
                            </ul>
                        </nav>

                        <section id="introduccion" className="scroll-mt-24">
                            <h2>1. Introducción</h2>
                            <p>
                                PsycoAI Platform es una solución integral que permite a psicólogos y terapeutas gestionar sus agendas,
                                pacientes y sesiones clínico-terapéuticas. Además de las funciones administrativas básicas, la plataforma
                                ofrece análisis avanzados mediante IA para detectar tendencias en el bienestar del paciente, temas
                                recurrentes y métricas de eficacia terapéutica.
                            </p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="roles" className="scroll-mt-24">
                            <h2>2. Roles de Usuario</h2>
                            <p>El sistema distingue principalmente entre dos roles con interfaces adaptadas:</p>

                            <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Professional (Doctor/a)</h3>
                                    <p className="text-blue-800 text-sm mb-4">Usuario principal (terapeuta/psicólogo).</p>
                                    <ul className="space-y-2 text-sm text-blue-700">
                                        <li className="flex gap-2">✓ Gestión de sus propios pacientes</li>
                                        <li className="flex gap-2">✓ Dashboard analítico con IA</li>
                                        <li className="flex gap-2">✓ Configuración de facturación</li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Agenda Manager</h3>
                                    <p className="text-purple-800 text-sm mb-4">Rol administrativo para secretarios.</p>
                                    <ul className="space-y-2 text-sm text-purple-700">
                                        <li className="flex gap-2">✓ Gestión de agendas de terceros</li>
                                        <li className="flex gap-2">✓ Creación de Grupos de Profesionales</li>
                                        <li className="flex gap-2">✕ Sin acceso a estadísticas clínicas</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="primeros-pasos" className="scroll-mt-24">
                            <h2>3. Primeros Pasos</h2>
                            <h3>Acceso</h3>
                            <p>Ingrese con sus credenciales (email y contraseña) en la página de inicio de sesión.</p>

                            <h3>Configuración Inicial (Recomendado)</h3>
                            <p>Antes de empezar a citar pacientes, diríjase a <strong>Ajustes (Settings)</strong> para configurar:</p>
                            <ul>
                                <li><strong>Horario Laboral:</strong> Defina su hora de inicio y fin, y la duración por defecto de sus sesiones.</li>
                                <li><strong>Tarifa:</strong> Establezca su precio por hora para que el sistema calcule sus ingresos estimados.</li>
                                <li><strong>Google Calendar:</strong> Active la sincronización bidireccional para que sus citas aparezcan en su calendario personal y viceversa.</li>
                            </ul>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="dashboard" className="scroll-mt-24">
                            <h2>4. El Dashboard</h2>
                            <p>El Dashboard es la pantalla principal y varía según su rol.</p>

                            <h3>Para el Profesional</h3>
                            <p>
                                Es un panel modular y personalizable. Puede añadir o quitar "Widgets" desde la <strong>Librería de Widgets</strong>.
                            </p>
                            <h4>Widgets Disponibles:</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Operativos:</strong> Agenda de Hoy, Notas Pendientes, Agenda (7 días).</li>
                                <li><strong>Analíticos (Negocio):</strong> Ingresos Estimados, Tasa de Asistencia, Pacientes Activos.</li>
                                <li><strong>Clínicos (AI):</strong> Temas Recurrentes (análisis de notas), Tendencia de Bienestar, Técnicas Terapéuticas.</li>
                            </ul>

                            <div className="my-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 not-prose rounded-r">
                                <strong>Nota:</strong> Los widgets clínicos requieren que complete sus notas de sesión para que la IA pueda generar datos útiles.
                            </div>

                            <h3>Para el Agenda Manager</h3>
                            <p>Su dashboard muestra "Tarjetas de Profesionales". Haga clic en una tarjeta para gestionar la agenda específica de ese doctor.</p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="funcionalidades" className="scroll-mt-24">
                            <h2>5. Funcionalidades Principales</h2>
                            <h3>Gestión de Pacientes</h3>
                            <p>
                                En la sección <strong>Pacientes</strong>, cree nuevos expedientes, vea historiales y acceda a datos demográficos.
                            </p>

                            <h3>Gestión de Sesiones</h3>
                            <p>
                                En <strong>Sesiones</strong>, use la vista de calendario para crear citas. Marque las sesiones como "Realizada" o "Cancelada" para mantener las estadísticas precisas.
                            </p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="configuracion" className="scroll-mt-24">
                            <h2>6. Configuración e Integraciones</h2>
                            <h3>Google Calendar</h3>
                            <p>La integración permite:</p>
                            <ol>
                                <li><strong>Importar:</strong> Eventos de su Google Calendar personal bloquean huecos en PsycoAI.</li>
                                <li><strong>Exportar:</strong> Las sesiones creadas en PsycoAI aparecen en su Google Calendar.</li>
                            </ol>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
