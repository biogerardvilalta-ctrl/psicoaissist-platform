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
                            Guía completa para dominar PsicoAIssist, desde la configuración inicial hasta el análisis avanzado con IA.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 prose prose-slate max-w-none">
                        <nav className="p-6 bg-slate-50 rounded-xl mb-12 not-prose border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Índice de Contenidos</h3>
                            <ul className="space-y-2 text-slate-600">
                                <li><a href="#introduccion" className="hover:text-blue-600 hover:underline">1. Introducción</a></li>
                                <li><a href="#roles" className="hover:text-blue-600 hover:underline">2. Roles de Usuario</a></li>
                                <li><a href="#planes" className="hover:text-blue-600 hover:underline">3. Planes y Suscripciones</a></li>
                                <li><a href="#primeros-pasos" className="hover:text-blue-600 hover:underline">4. Primeros Pasos</a></li>
                                <li><a href="#dashboard" className="hover:text-blue-600 hover:underline">5. El Dashboard</a></li>
                                <li><a href="#funcionalidades" className="hover:text-blue-600 hover:underline">6. Funcionalidades Principales</a></li>
                                <li><a href="#configuracion" className="hover:text-blue-600 hover:underline">7. Configuración Detallada</a></li>
                            </ul>
                        </nav>

                        <section id="introduccion" className="scroll-mt-24">
                            <h2>1. Introducción</h2>
                            <p>
                                PsicoAIssist es una solución integral que permite a psicólogos y terapeutas gestionar sus agendas,
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

                        <section id="planes" className="scroll-mt-24">
                            <h2>3. Planes y Suscripciones</h2>
                            <p>PsicoAIssist ofrece cinco niveles de servicio, divididos en opciones individuales y para grupos. Puede consultar su plan actual en <strong>Perfil {'>'} Suscripción</strong>.</p>

                            <h3 className="mt-6 mb-4 text-xl font-bold text-slate-800">1. Planes Individuales</h3>
                            <div className="grid md:grid-cols-3 gap-4 mb-8 not-prose">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h4 className="text-base font-bold text-slate-800 mb-1">🥉 Basic</h4>
                                    <p className="text-xl font-bold text-slate-900">29€<span className="text-xs text-slate-500 font-normal">/mes</span></p>
                                    <ul className="mt-3 space-y-2 text-xs text-slate-600">
                                        <li>• 25 Pacientes</li>
                                        <li>• 5GB Almacenamiento</li>
                                        <li>• Sin IA</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 relative overflow-hidden ring-1 ring-blue-500">
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-bl font-bold">POPULAR</div>
                                    <h4 className="text-base font-bold text-blue-800 mb-1">🥈 Pro</h4>
                                    <p className="text-xl font-bold text-blue-900">59€<span className="text-xs text-blue-500 font-normal">/mes</span></p>
                                    <ul className="mt-3 space-y-2 text-xs text-blue-700">
                                        <li>• Pacientes Ilimitados</li>
                                        <li>• 900 min IA/mes</li>
                                        <li>• 5 Casos Simulador</li>
                                        <li>• 50GB Almacenamiento</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                    <h4 className="text-base font-bold text-purple-800 mb-1">🥇 Premium</h4>
                                    <p className="text-xl font-bold text-purple-900">99€<span className="text-xs text-purple-500 font-normal">/mes</span></p>
                                    <ul className="mt-3 space-y-2 text-xs text-purple-700">
                                        <li>• IA Extendida (3.000 min)</li>
                                        <li>• Simulador Ilimitado</li>
                                        <li>• Soporte 24/7</li>
                                        <li>• 1TB Almacenamiento</li>
                                    </ul>
                                </div>
                            </div>

                            <h3 className="mt-6 mb-4 text-xl font-bold text-slate-800">2. Planes Grupales</h3>
                            <div className="grid md:grid-cols-2 gap-4 not-prose">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                    <h4 className="text-base font-bold text-indigo-800 mb-1">👥 Business</h4>
                                    <p className="text-xl font-bold text-indigo-900">129€<span className="text-xs text-indigo-500 font-normal">/mes</span></p>
                                    <ul className="mt-3 space-y-2 text-xs text-indigo-700">
                                        <li>• 2 Pros + 1 Manager</li>
                                        <li>• 2.000 min IA (Comp.)</li>
                                        <li>• Agenda Unificada</li>
                                        <li>• 100GB Almacenamiento</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-100 rounded-xl border border-slate-300">
                                    <h4 className="text-base font-bold text-slate-800 mb-1">🏥 Clínicas</h4>
                                    <p className="text-xl font-bold text-slate-900">A Medida</p>
                                    <ul className="mt-3 space-y-2 text-xs text-slate-700">
                                        <li>• 3+ Profesionales</li>
                                        <li>• 5.000+ min IA</li>
                                        <li>• API & Compliance</li>
                                        <li>• Onboarding Dedicado</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="primeros-pasos" className="scroll-mt-24">
                            <h2>4. Primeros Pasos</h2>
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
                            <h2>5. El Dashboard</h2>
                            <p>El Dashboard es la pantalla principal y varía según su rol.</p>

                            <h3>Para el Profesional</h3>
                            <p>
                                Es un panel modular y personalizable. Puede añadir o quitar "Widgets" desde la <strong>Librería de Widgets</strong>.
                            </p>
                            <h4>Widgets Disponibles:</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Operativos:</strong> Agenda de Hoy, Notas Pendientes, Agenda (7 días).</li>
                                <li><strong>Analíticos (Negocio):</strong> Ingresos Estimados, Tasa de Asistencia, Pacientes Activos.</li>
                                <li><strong>Clínicos (IA):</strong> Temas Recurrentes (análisis de notas), Tendencia de Bienestar, Técnicas Terapéuticas.</li>
                            </ul>

                            <div className="my-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 not-prose rounded-r">
                                <strong>Nota:</strong> Los widgets clínicos requieren que complete sus notas de sesión para que la IA pueda generar datos útiles.
                            </div>

                            <h3>Para el Agenda Manager</h3>
                            <p>Su dashboard muestra "Tarjetas de Profesionales". Haga clic en una tarjeta para gestionar la agenda específica de ese doctor.</p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="funcionalidades" className="scroll-mt-24">
                            <h2>6. Funcionalidades Principales</h2>
                            <h3>Gestión de Pacientes</h3>
                            <p>
                                En la sección <strong>Pacientes</strong>, cree nuevos expedientes, vea historiales y acceda a datos demográficos.
                            </p>

                            <h3>Gestión de Sesiones</h3>
                            <p>
                                En <strong>Sesiones</strong>, use la vista de calendario para crear citas. Marque las sesiones como "Realizada" o "Cancelada" para mantener las estadísticas precisas.
                            </p>

                            <h3>Simulador Clínico</h3>
                            <p>
                                Acceda desde el menú "Simulador" para practicar con pacientes virtuales. La IA le dará feedback sobre su empatía y técnica al terminar la sesión simulada.
                            </p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="configuracion" className="scroll-mt-24">
                            <h2>7. Configuración Detallada</h2>

                            <h3>📅 Agenda y Calendario</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Duración por Defecto:</strong> Tiempo estándar de sus sesiones (ej. 60 min).</li>
                                <li><strong>Buffer:</strong> Tiempo de descanso automático entre citas (ej. 10 min).</li>
                                <li><strong>Bloqueos:</strong> Use "Bloquear día completo" para vacaciones.</li>
                            </ul>

                            <h3 className="mt-6">🔗 Google Calendar</h3>
                            <p>La integración permite:</p>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li><strong>Importar:</strong> Eventos de su Google Calendar personal bloquean huecos en PsicoAIssist.</li>
                                <li><strong>Exportar:</strong> Las sesiones creadas en PsicoAIssist aparecen en su Google Calendar.</li>
                            </ol>

                            <h3 className="mt-6">🤖 Inteligencia Artificial</h3>
                            <p><strong>Idioma Preferido:</strong> Define en qué idioma generará la IA los informes automáticos.</p>

                            <h3 className="mt-6">🔔 Notificaciones</h3>
                            <p><strong>Recordatorios por Email:</strong> Si está activo, el sistema envía un correo al paciente 24h antes de la cita (requiere email en la ficha del paciente).</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
