import Link from 'next/link';
import { ArrowLeft, Book, AlertCircle } from 'lucide-react';

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
                    <div className="p-8 md:p-12 prose prose-slate max-w-none text-justify prose-li:marker:text-blue-500 prose-ul:list-disc prose-ol:list-decimal">
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
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">1</span>
                                Introducción
                            </h2>
                            <p className="leading-relaxed text-lg text-slate-600 mb-6">
                                PsicoAIssist es una solución integral que permite a psicólogos y terapeutas gestionar sus agendas,
                                pacientes y sesiones clínico-terapéuticas. Además de las funciones administrativas básicas, la plataforma
                                ofrece análisis avanzados mediante IA para detectar tendencias en el bienestar del paciente, temas
                                recurrentes y métricas de eficacia terapéutica.
                            </p>

                            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-800">Resumen de Capacidades del Sistema</h3>
                            <div className="grid md:grid-cols-2 gap-8 not-prose bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-2">🧠 Inteligencia Artificial y Clínica</h4>
                                    <ul className="space-y-3 text-sm text-slate-600 mb-6 pl-5">
                                        <li>• <strong>Transcripción:</strong> Audio a texto automático.</li>
                                        <li>• <strong>Análisis IA:</strong> Resúmenes, notas SOAP y puntos clave.</li>
                                        <li>• <strong>Analíticas:</strong> Detección de tendencias de ánimo y temas recurrentes.</li>
                                        <li>• <strong>Simulador:</strong> Roleplay con pacientes virtuales.</li>
                                    </ul>

                                    <h4 className="font-semibold text-blue-900 mb-2">📋 Gestión y Documentación</h4>
                                    <ul className="space-y-3 text-sm text-slate-600 mb-6 pl-5">
                                        <li>• <strong>Expediente Digital:</strong> Historial único y seguro.</li>
                                        <li>• <strong>Generación de Informes:</strong> PDFs clínicos en un clic.</li>
                                        <li>• <strong>Almacenamiento Seguro:</strong> Cifrado de datos sensibles.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-2">📅 Agenda y Negocio</h4>
                                    <ul className="space-y-3 text-sm text-slate-600 mb-6 pl-5">
                                        <li>• <strong>Calendario Inteligente:</strong> Citas, buffers y sincro con Google.</li>
                                        <li>• <strong>Control de Ingresos:</strong> Estimación de ganancias tiempo real.</li>
                                        <li>• <strong>Recordatorios:</strong> Emails automáticos anti-ausentismo.</li>
                                    </ul>

                                    <h4 className="font-semibold text-blue-900 mb-2">🚀 Extras y Equipos</h4>
                                    <ul className="space-y-3 text-sm text-slate-600 pl-5">
                                        <li>• <strong>Gestión de Equipos:</strong> Roles Manager/Doctor.</li>
                                        <li>• <strong>Branding:</strong> Tu logo en los informes.</li>
                                        <li>• <strong>Integraciones:</strong> API y SSO (Planes superiores).</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="roles" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">2</span>
                                Roles de Usuario
                            </h2>
                            <p className="leading-relaxed text-lg text-slate-600 mb-6">El sistema distingue principalmente entre dos roles con interfaces adaptadas:</p>

                            <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Professional (Doctor/a)</h3>
                                    <p className="text-blue-800 text-sm mb-4">Usuario principal (terapeuta/psicólogo).</p>
                                    <ul className="space-y-3 text-sm text-blue-700 pl-5">
                                        <li className="flex gap-2"><span className="shrink-0">✓</span> Gestión de sus propios pacientes</li>
                                        <li className="flex gap-2">✓ Dashboard analítico con IA</li>
                                        <li className="flex gap-2">✓ Configuración de facturación</li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Agenda Manager</h3>
                                    <p className="text-purple-800 text-sm mb-4">Rol administrativo para secretarios.</p>
                                    <ul className="space-y-3 text-sm text-purple-700 pl-5">
                                        <li className="flex gap-2"><span className="shrink-0">✓</span> Gestión de agendas de terceros</li>
                                        <li className="flex gap-2">✓ Creación de Grupos de Profesionales</li>
                                        <li className="flex gap-2">✕ Sin acceso a estadísticas clínicas</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="planes" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">3</span>
                                Planes y Suscripciones
                            </h2>
                            <p className="leading-relaxed text-lg text-slate-600 mb-6">PsicoAIssist ofrece cinco niveles de servicio, divididos en opciones individuales y para grupos. Puede consultar su plan actual en <strong>Perfil {'>'} Suscripción</strong>.</p>

                            <h3 className="mt-6 mb-4 text-xl font-bold text-slate-800">1. Planes Individuales</h3>
                            <div className="space-y-6 mb-8 not-prose">
                                {/* BASIC PLAN */}
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">🥉 Basic</h4>
                                            <p className="text-sm text-slate-500">Para iniciar la práctica privada</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900">29€<span className="text-xs text-slate-500 font-normal">/mes</span></p>
                                            <p className="text-xs text-green-600">290€/año (2 meses gratis)</p>
                                        </div>
                                    </div>
                                    {/* BASIC PLAN - COMPARATIVE MATRIX */}
                                    <div className="space-y-2 mt-4 text-sm text-slate-600">
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span>Pacientes Activos</span>
                                            <span className="font-semibold">25</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span>Transcripción (Solo Texto)</span>
                                            <span className="font-semibold">10 Horas</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100 opacity-50">
                                            <span>Análisis IA Avanzado</span>
                                            <span className="flex items-center text-red-400 font-medium"><span className="mr-1">✕</span> No</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100 opacity-50">
                                            <span>Simulador Clínico</span>
                                            <span className="flex items-center text-red-400 font-medium"><span className="mr-1">✕</span> No</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100 opacity-50">
                                            <span>Google Calendar Sync</span>
                                            <span className="flex items-center text-red-400 font-medium"><span className="mr-1">✕</span> No</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span>Almacenamiento</span>
                                            <span className="font-semibold">5GB</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span>Soporte</span>
                                            <span>Email</span>
                                        </div>
                                    </div>

                                    {/* DETAILED EXPLANATION BASIC */}
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h5 className="font-bold text-slate-800 mb-3 text-sm">Detalle de Características:</h5>
                                        <ul className="text-xs text-slate-600 space-y-4 pl-4">
                                            <li>
                                                <strong className="block text-slate-700 mb-1">10 Horas Transcripción (Literal)</strong>
                                                Ideal para convertir audio a texto simple. No incluye inteligencia artificial, por lo que no genera resúmenes ni detecta tendencias.
                                            </li>
                                            <li>
                                                <strong className="block text-slate-700">Límites Básicos</strong>
                                                Diseñado para arrancar. Sin acceso a herramientas avanzadas como Simulador o Sincronización de Calendario.
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* PRO PLAN */}
                                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 relative ring-1 ring-blue-500">
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-bl font-bold uppercase tracking-wide">Más Popular</div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-blue-800">🥈 Pro</h4>
                                            <p className="text-sm text-blue-600">Para psicólogos establecidos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-900">59€<span className="text-xs text-blue-500 font-normal">/mes</span></p>
                                            <p className="text-xs text-blue-600">590€/año (2 meses gratis)</p>
                                        </div>
                                    </div>
                                    {/* PRO PLAN - COMPARATIVE MATRIX */}
                                    <div className="space-y-2 mt-4 text-sm text-blue-800">
                                        <div className="flex justify-between items-center py-1 border-b border-blue-200/50">
                                            <span>Pacientes Activos</span>
                                            <span className="font-bold text-blue-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Ilimitados</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-blue-200/50">
                                            <span>Transcripción + IA Avanzada</span>
                                            <span className="font-bold text-blue-900 flex items-center"><span className="text-green-500 mr-1">✓</span> 15 Horas (900 min)</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-blue-200/50">
                                            <span>Análisis IA Avanzado</span>
                                            <span className="font-bold text-blue-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Incluido</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-blue-200/50">
                                            <span>Simulador Clínico</span>
                                            <span className="font-bold text-blue-900 flex items-center"><span className="text-green-500 mr-1">✓</span> 5 Casos/mes</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-blue-200/50">
                                            <span>Google Calendar Sync</span>
                                            <span className="font-bold text-blue-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Sí</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-blue-200/50">
                                            <span>Almacenamiento</span>
                                            <span className="font-semibold">50GB</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span>Soporte</span>
                                            <span>Prioritario</span>
                                        </div>
                                    </div>

                                    {/* DETAILED EXPLANATION PRO */}
                                    <div className="mt-6 pt-6 border-t border-blue-200/50">
                                        <h5 className="font-bold text-blue-900 mb-3 text-sm">Detalle de Características:</h5>
                                        <ul className="text-xs text-blue-800/80 space-y-4 pl-4">
                                            <li>
                                                <strong className="block text-blue-900 mb-1">15h (900 min) de Inteligencia Total</strong>
                                                Unificamos el tiempo: cada minuto grabado se transcribe Y se analiza por IA. No tienes que preocuparte por límites separados.
                                            </li>
                                            <li>
                                                <strong className="block text-blue-900">Google Calendar</strong>
                                                Sincronización bidireccional automática: tus citas aparecen en tu móvil y tus eventos personales bloquean huecos en la agenda.
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* PREMIUM PLUS PLAN */}
                                <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-purple-800">🥇 Premium Plus</h4>
                                            <p className="text-sm text-purple-600">Para especialistas intensivos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-purple-900">99€<span className="text-xs text-purple-500 font-normal">/mes</span></p>
                                            <p className="text-xs text-purple-600">990€/año (2 meses gratis)</p>
                                        </div>
                                    </div>
                                    {/* PREMIUM PLAN - COMPARATIVE MATRIX */}
                                    <div className="space-y-2 mt-4 text-sm text-purple-800">
                                        <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                                            <span>Pacientes Activos</span>
                                            <span className="font-bold text-purple-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Ilimitados</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                                            <span>Transcripción + IA Avanzada</span>
                                            <span className="font-bold text-purple-900 flex items-center"><span className="text-green-500 mr-1">✓</span> 50 Horas (3.000 min)</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                                            <span>Análisis IA Avanzado</span>
                                            <span className="font-bold text-purple-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Incluido</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                                            <span>Simulador Clínico</span>
                                            <span className="font-bold text-purple-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Ilimitado</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                                            <span>Google Calendar Sync</span>
                                            <span className="font-bold text-purple-900 flex items-center"><span className="text-green-500 mr-1">✓</span> Sí</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-purple-200/50">
                                            <span>Almacenamiento</span>
                                            <span className="font-semibold">1TB (1.000GB)</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span>Soporte</span>
                                            <span>Prioritario + Videollamada</span>
                                        </div>
                                    </div>

                                    {/* DETAILED EXPLANATION PREMIUM PLUS */}
                                    <div className="mt-6 pt-6 border-t border-purple-200/50">
                                        <h5 className="font-bold text-purple-900 mb-3 text-sm">Detalle de Características:</h5>
                                        <ul className="text-xs text-purple-800/80 space-y-4 pl-4">
                                            <li>
                                                <strong className="block text-purple-900 mb-1">50h (3.000 min) de IA</strong>
                                                Capacidad masiva para profesionales clínicos intensivos.
                                            </li>
                                            <li>
                                                <strong className="block text-purple-900">Simulador Ilimitado</strong>
                                                Entrena sin restricciones. Ideal para preparar casos complejos o uso docente.
                                            </li>
                                            <li>
                                                <strong className="block text-purple-900">Branding Personalizado</strong>
                                                Tus informes con tu logotipo y marca personal.
                                            </li>
                                            <li>
                                                <strong className="block text-purple-900">Soporte Premium</strong>
                                                Atención prioritaria por email y posibilidad de agendar videollamadas 1:1 para resolver dudas complejas o configurar tu cuenta.
                                            </li>
                                            <li>
                                                <strong className="block text-purple-900">Almacenamiento (1TB)</strong>
                                                Capacidad para miles de horas de audio y documentos. *Aplica una Política de Uso Razonable para garantizar la estabilidad del servicio y evitar abusos del sistema de archivos.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-800">2. Planes Grupales y Corporativos</h3>
                            <div className="space-y-6 mb-8 not-prose">
                                {/* BUSINESS PLAN */}
                                <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-indigo-800">👥 Business (Pequeños Equipos)</h4>
                                            <p className="text-sm text-indigo-600">Gabinetes de 2 psicólogos + gestión</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-indigo-900">129€<span className="text-xs text-indigo-500 font-normal">/mes</span></p>
                                            <p className="text-xs text-indigo-600">1.290€/año (+40€/usuario extra)</p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h5 className="font-semibold text-indigo-800 mb-2">Capacidad Compartida</h5>
                                            <ul className="space-y-1 text-indigo-700">
                                                <li>• Incluye <strong>2 Profesionales</strong> + 1 Manager</li>
                                                <li>• <strong>2.000</strong> Minutos IA Generativa (Análisis)/mes</li>
                                                <li>• <strong>15</strong> Casos Simulador/mes (Global)</li>
                                                <li>• <strong>100GB</strong> Almacenamiento</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-indigo-800 mb-2">Herramientas de Gestión</h5>
                                            <ul className="space-y-1 text-indigo-700">
                                                <li>• <strong>Panel de Agenda Manager</strong> (Gestión centralizada)</li>
                                                <li>• Calendario Unificado de Grupo</li>
                                                <li>• Roles y Permisos Avanzados</li>
                                                <li>• Facturación Unificada</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* DETAILED EXPLANATION BUSINESS */}
                                    <div className="mt-6 pt-6 border-t border-indigo-200/50">
                                        <h5 className="font-bold text-indigo-900 mb-3 text-sm">Detalle de Características:</h5>
                                        <ul className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-xs text-indigo-800/80 pl-4">
                                            <li>
                                                <strong className="block text-indigo-900 mb-1">Agenda Manager</strong>
                                                Rol especial para secretariado. Permite gestionar las citas de todos los profesionales desde un único panel sin ver datos clínicos sensibles.
                                            </li>
                                            <li>
                                                <strong className="block text-indigo-900">Pool Compartido (2.000 min)</strong>
                                                Los minutos de IA se comparten entre todos los miembros del equipo, optimizando el uso en gabinetes donde la actividad varía.
                                            </li>
                                            <li>
                                                <strong className="block text-indigo-900">Calendario Unificado</strong>
                                                Vista global de la disponibilidad de todos los terapeutas para asignar pacientes eficientemente.
                                            </li>
                                            <li>
                                                <strong className="block text-indigo-900">Usuarios Adicionales</strong>
                                                Puedes añadir más profesionales al equipo por una cuota reducida (+40€/mes/usuario).
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* CLINICS PLAN */}
                                <div className="p-6 bg-slate-100 rounded-xl border border-slate-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">🏥 Clínicas y Hospitales</h4>
                                            <p className="text-sm text-slate-600">Para organizaciones de más de 3 profesionales</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-slate-900">Consultar</p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <ul className="space-y-1 text-slate-700">
                                                <li>• Usuarios Ilimitados (Precio por asiento)</li>
                                                <li>• <strong>5.000+</strong> Minutos IA Generativa (Análisis)</li>
                                                <li>• Integración HIS/EHR vía API</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <ul className="space-y-1 text-slate-700">
                                                <li>• Compliance Avanzado (Auditoría RGPD y Logs)</li>
                                                <li>• Onboarding y Formación Dedicada</li>
                                                <li>• SLA Garantizado 99.9%</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* DETAILED EXPLANATION CLINICS */}
                                    <div className="mt-6 pt-6 border-t border-slate-300/50">
                                        <h5 className="font-bold text-slate-900 mb-3 text-sm">Detalle de Características:</h5>
                                        <ul className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-xs text-slate-600 pl-4">
                                            <li>
                                                <strong className="block text-slate-800 mb-1">API & Integración HIS</strong>
                                                Conectamos PsicoAIssist directamente con el software de gestión hospitalaria de tu centro.
                                            </li>
                                            <li>
                                                <strong className="block text-slate-800">Compliance Avanzado</strong>
                                                Auditorías de seguridad, registro detallado de accesos (Audit Logs) para inspecciones y gestión estricta de protección de datos (RGPD).
                                            </li>
                                            <li>
                                                <strong className="block text-slate-800">Formación Dedicada</strong>
                                                Nuestro equipo formará a tu staff clínico y administrativo para sacar el máximo partido a la herramienta.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-red-50 rounded-xl border border-red-100">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-red-900 mb-4">
                                    <AlertCircle className="h-5 w-5" />
                                    Política de Uso Razonable (Fair Use Policy)
                                </h3>
                                <p className="text-sm text-red-800 mb-4">
                                    Para garantizar la estabilidad del sistema y la calidad del servicio para todos los usuarios, los planes con características "Ilimitadas" están sujetos a los siguientes topes de seguridad mensual:
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border border-red-100">
                                        <span className="block text-xs text-red-600 font-semibold uppercase">Pacientes Activos</span>
                                        <span className="text-lg font-bold text-slate-800">5.000</span>
                                        <span className="text-xs text-slate-500 ml-1">expedientes</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-red-100">
                                        <span className="block text-xs text-red-600 font-semibold uppercase">Transcripción IA</span>
                                        <span className="text-lg font-bold text-slate-800">300</span>
                                        <span className="text-xs text-slate-500 ml-1">horas/mes</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-red-100">
                                        <span className="block text-xs text-red-600 font-semibold uppercase">Generación de Informes</span>
                                        <span className="text-lg font-bold text-slate-800">3.000</span>
                                        <span className="text-xs text-slate-500 ml-1">informes/mes</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-red-100">
                                        <span className="block text-xs text-red-600 font-semibold uppercase">Simulador Clínico</span>
                                        <span className="text-lg font-bold text-slate-800">500</span>
                                        <span className="text-xs text-slate-500 ml-1">casos/mes</span>
                                    </div>
                                </div>
                                <p className="text-xs text-red-700 mt-4 italic">
                                    * El uso por encima de estos límites se considera "no humano" o abusivo y puede conllevar la suspensión temporal de la cuenta o el contacto por parte de soporte para migrar a un plan Enterprise personalizado.
                                </p>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="primeros-pasos" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">4</span>
                                Primeros Pasos
                            </h2>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                                <h3 className="!mt-0 text-xl font-bold text-slate-800 mb-3 block">Acceso Inicial</h3>
                                <p className="leading-relaxed text-slate-600">Ingrese con sus credenciales (email y contraseña) en la página de inicio de sesión segura.</p>
                            </div>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Configuración Inicial (Recomendado)</h3>
                            <p>Antes de empezar a citar pacientes, diríjase a <strong>Ajustes (Settings)</strong> para configurar:</p>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                <li><strong>Horario Laboral:</strong> Defina su hora de inicio y fin, y la duración por defecto de sus sesiones.</li>
                                <li><strong>Tarifa:</strong> Establezca su precio por hora para que el sistema calcule sus ingresos estimados.</li>
                                <li><strong>Google Calendar:</strong> Active la sincronización bidireccional para que sus citas aparezcan en su calendario personal y viceversa.</li>
                            </ul>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="dashboard" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">5</span>
                                El Dashboard
                            </h2>
                            <p className="leading-relaxed text-lg text-slate-600 mb-6">El Dashboard es el centro de control principal y su diseño se adapta dinámicamente según su rol.</p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Para el Profesional</h3>
                            <p>
                                Es un panel modular y personalizable. Puede añadir o quitar "Widgets" desde la <strong>Librería de Widgets</strong>.
                            </p>
                            <h4 className="mt-4 mb-2 text-lg font-semibold text-slate-700 block">Widgets Disponibles:</h4>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                <li><strong>Operativos:</strong> Agenda de Hoy, Notas Pendientes, Agenda (7 días).</li>
                                <li><strong>Analíticos (Negocio):</strong> Ingresos Estimados, Tasa de Asistencia, Pacientes Activos.</li>
                                <li><strong>Clínicos (IA):</strong> Temas Recurrentes (análisis de notas), Tendencia de Bienestar, Técnicas Terapéuticas.</li>
                            </ul>

                            <div className="my-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 not-prose rounded-r">
                                <strong>Nota:</strong> Los widgets clínicos requieren que complete sus notas de sesión para que la IA pueda generar datos útiles.
                            </div>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Para el Agenda Manager</h3>
                            <p>Su dashboard muestra "Tarjetas de Profesionales". Haga clic en una tarjeta para gestionar la agenda específica de ese doctor.</p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="funcionalidades" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">6</span>
                                Funcionalidades Principales
                            </h2>
                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Gestión de Pacientes</h3>
                            <p>
                                En la sección <strong>Pacientes</strong>, cree nuevos expedientes, vea historiales y acceda a datos demográficos.
                            </p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Gestión de Sesiones</h3>
                            <p>
                                En <strong>Sesiones</strong>, use la vista de calendario para crear citas. Marque las sesiones como "Realizada" o "Cancelada" para mantener las estadísticas precisas.
                            </p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Simulador Clínico</h3>
                            <p>
                                Acceda desde el menú "Simulador" para practicar con pacientes virtuales. La IA le dará feedback sobre su empatía y técnica al terminar la sesión simulada.
                            </p>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="configuracion" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">7</span>
                                Configuración Detallada
                            </h2>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">📅 Agenda y Calendario</h3>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                <li><strong>Duración por Defecto:</strong> Tiempo estándar de sus sesiones (ej. 60 min).</li>
                                <li><strong>Buffer:</strong> Tiempo de descanso automático entre citas (ej. 10 min).</li>
                                <li><strong>Bloqueos:</strong> Use "Bloquear día completo" para vacaciones.</li>
                            </ul>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🔗 Google Calendar</h3>
                            <p>La integración permite:</p>
                            <ol className="list-decimal pl-5 space-y-3 marker:text-blue-500 font-medium">
                                <li><strong>Importar:</strong> Eventos de su Google Calendar personal bloquean huecos en PsicoAIssist.</li>
                                <li><strong>Exportar:</strong> Las sesiones creadas en PsicoAIssist aparecen en su Google Calendar.</li>
                            </ol>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🎨 Marca Personal (Solo Premium)</h3>
                            <p>Personalice la apariencia de sus informes clínicos para reflejar su identidad corporativa.</p>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                <li><strong>Nombre de la Empresa:</strong> Aparecerá en el encabezado de los informes.</li>
                                <li><strong>Colores Corporativos:</strong> Defina un color primario y secundario para los elementos gráficos del PDF.</li>
                                <li><strong>Logo:</strong> Active o desactive la visualización del icono de su marca.</li>
                            </ul>
                            <p className="text-sm text-slate-500 mt-2"><i>Nota: Esta funcionalidad es exclusiva para usuarios con plan Premium o superior.</i></p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🤖 Inteligencia Artificial</h3>
                            <p><strong>Idioma Preferido:</strong> Define en qué idioma generará la IA los informes automáticos.</p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🔔 Notificaciones</h3>
                            <p><strong>Recordatorios por Email:</strong> Si está activo, el sistema envía un correo al paciente 24h antes de la cita (requiere email en la ficha del paciente).</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
