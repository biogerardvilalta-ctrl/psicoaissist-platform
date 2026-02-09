import { Link } from '@/navigation';
import { ArrowLeft, Book, AlertCircle, Play, Mic, CheckCircle2 } from 'lucide-react';

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
                                <li><a href="#exportacion" className="hover:text-blue-600 hover:underline">7. Privacidad y Exportación</a></li>
                                <li><a href="#configuracion" className="hover:text-blue-600 hover:underline">8. Configuración Detallada</a></li>
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
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Professional (Psicólogo/a)</h3>
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
                            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-900 not-prose rounded-r">
                                <strong>Idiomas:</strong> La plataforma está disponible en Español, Catalán e Inglés. Puede cambiar el idioma de la interfaz desde el icono del mundo 🌐 en la <strong>barra de navegación superior</strong>.
                            </div>

                            <div className="my-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 not-prose rounded-r flex gap-3">
                                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                                <div>
                                    <strong>Política de Reinicio Mensual:</strong> Todos los contadores de uso (minutos de transcripción, casos de simulador, etc.) son mensuales y se reinician a cero en la fecha de renovación de su suscripción.
                                    <br />
                                    <span className="underline font-semibold">Los recursos no consumidos NO son acumulables para el mes siguiente.</span>
                                </div>
                            </div>

                            <h3 className="mt-6 mb-4 text-xl font-bold text-slate-800">1. Planes Individuales</h3>
                            <div className="space-y-6 mb-8 not-prose">
                                {/* DEMO PLAN */}
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">🌱 Demo (Gratuito)</h4>
                                            <p className="text-sm text-slate-500">Para probar la plataforma</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900">0€<span className="text-xs text-slate-500 font-normal">/para siempre</span></p>
                                            <p className="text-xs text-orange-600">Límite 14 días</p>
                                        </div>
                                    </div>
                                    {/* DEMO PLAN - COMPARATIVE MATRIX */}
                                    <div className="space-y-2 mt-4 text-sm text-slate-600">
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span>Pacientes Activos</span>
                                            <span className="font-semibold">3</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                            <span>Transcripción + IA</span>
                                            <span className="font-semibold">30 Minutos</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100 opacity-50">
                                            <span>Informes</span>
                                            <span className="font-semibold">5/mes</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-100 opacity-50">
                                            <span>Simulador Clínico</span>
                                            <span className="flex items-center text-red-400 font-medium"><span className="mr-1">✕</span> No</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span>Soporte</span>
                                            <span>Email</span>
                                        </div>
                                    </div>
                                </div>

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
                                            <h4 className="text-lg font-bold text-purple-800">🥇 Premium</h4>
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


                                {/* CLINICS PLAN */}
                                <div className="p-6 bg-slate-100 rounded-xl border border-slate-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">🏥 Para Centros de Salud, Universidades y Hospitales</h4>
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
                                                <li>• Simulador Clínico (casos a medida)</li>
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

                            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-800">3. Extras y Complementos</h3>
                            <div className="grid md:grid-cols-2 gap-4 mb-8 not-prose">
                                {/* Agenda Manager */}
                                <div className="p-5 bg-white rounded-xl border border-indigo-200 shadow-sm">
                                    <h4 className="font-bold text-indigo-900 mb-2">👤 Agenda Manager</h4>
                                    <p className="text-2xl font-bold text-indigo-700 mb-1">15€<span className="text-sm font-normal text-slate-500">/mes</span></p>
                                    <p className="text-xs text-slate-500 mb-4">Disponible para planes Pro+</p>
                                    <p className="text-sm text-slate-600 mb-2 font-medium">Incluye:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        <li>• <strong>1 Usuario Administrativo</strong> extra</li>
                                        <li>• Gestión de citas y calendario</li>
                                        <li>• Sin acceso a historias clínicas (Privacidad)</li>
                                    </ul>
                                </div>

                                {/* Minute Pack */}
                                <div className="p-5 bg-white rounded-xl border border-blue-200 shadow-sm">
                                    <h4 className="font-bold text-blue-900 mb-2">⚡ Pack Minutos IA</h4>
                                    <p className="text-2xl font-bold text-blue-700 mb-1">15€<span className="text-sm font-normal text-slate-500">/pack</span></p>
                                    <p className="text-xs text-slate-500 mb-4">Disponible para planes Pro+</p>
                                    <p className="text-sm text-slate-600 mb-2 font-medium">Incluye:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        <li>• <strong>500 Minutos</strong> de IA extra</li>
                                        <li>• No caducan (mientras suscripción activa)</li>
                                        <li>• Para picos de trabajo puntuales</li>
                                    </ul>
                                </div>

                                {/* Onboarding */}
                                <div className="p-5 bg-white rounded-xl border border-purple-200 shadow-sm">
                                    <h4 className="font-bold text-purple-900 mb-2">🚀 Onboarding Assistit</h4>
                                    <p className="text-2xl font-bold text-purple-700 mb-1">50€<span className="text-sm font-normal text-slate-500">/único</span></p>
                                    <p className="text-xs text-slate-500 mb-4">Servicio de Puesta en Marcha</p>
                                    <p className="text-sm text-slate-600 mb-2 font-medium">Incluye:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        <li>• Sesión 1:1 de 45 minutos</li>
                                        <li>• Configuración inicial y migración de datos</li>
                                        <li>• Formación básica de uso</li>
                                    </ul>
                                </div>

                                {/* Simulator Pack */}
                                <div className="p-5 bg-white rounded-xl border border-violet-200 shadow-sm">
                                    <h4 className="font-bold text-violet-900 mb-2">🎓 Pack Simulador</h4>
                                    <p className="text-2xl font-bold text-violet-700 mb-1">15€<span className="text-sm font-normal text-slate-500">/pack</span></p>
                                    <p className="text-xs text-slate-500 mb-4">Disponible para planes Pro+</p>
                                    <p className="text-sm text-slate-600 mb-2 font-medium">Incluye:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        <li>• <strong>10 Casos Clínicos</strong> adicionales</li>
                                        <li>• Práctica ilimitada en esos casos</li>
                                        <li>• Feedback detallado de IA</li>
                                    </ul>
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
                                En <strong>Sesiones</strong>, use la vista de calendario para crear citas.
                            </p>
                            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose">
                                <h4 className="font-bold text-slate-900 mb-4">Flujo de una Sesión Estándar</h4>
                                <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                                    <li className="mb-10 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                                            <Play className="w-4 h-4 text-blue-600" />
                                        </span>
                                        <h5 className="font-bold text-slate-900 mb-1">1. Iniciar Sesión</h5>
                                        <p className="text-sm text-slate-600">
                                            Al llegar el paciente, pulse el botón de <strong>Iniciar</strong> en la cita. Esto abre el panel de sesión y activa el cronómetro.
                                        </p>
                                    </li>
                                    <li className="mb-10 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full -left-4 ring-4 ring-white">
                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                        </span>
                                        <h5 className="font-bold text-slate-900 mb-1">2. Consentimiento y Verificaciones</h5>
                                        <p className="text-sm text-slate-600">
                                            Aparecerá una ventana emergente obligatoria. Debe marcar las casillas de:
                                        </p>
                                        <ul className="list-disc pl-4 mt-2 text-xs text-slate-500 space-y-1">
                                            <li><strong>Consentimiento Informado:</strong> El paciente autoriza el uso de IA.</li>
                                            <li><strong>Paciente Menor:</strong> Si aplica, active esta casilla para ajustar la protección de datos.</li>
                                        </ul>
                                    </li>
                                    <li className="mb-10 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-red-100 rounded-full -left-4 ring-4 ring-white">
                                            <Mic className="w-4 h-4 text-red-600" />
                                        </span>
                                        <h5 className="font-bold text-slate-900 mb-1">3. Grabación y Activación IA</h5>
                                        <p className="text-sm text-slate-600">
                                            <strong>Importante:</strong> La IA no escucha automáticamente. Debe pulsar el botón <strong>Grabar</strong> (micrófono) cuando quiera que empiece la transcripción y el análisis.
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                            * Puede pausar y reanudar la grabación en cualquier momento de la sesión.
                                        </p>
                                    </li>
                                    <li className="ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        </span>
                                        <h5 className="font-bold text-slate-900 mb-1">4. Finalizar y Generar Informes</h5>
                                        <p className="text-sm text-slate-600">
                                            Al terminar, pulse <strong>Finalizar Sesión</strong>. El sistema procesará el audio capturado y generará automáticamente:
                                        </p>
                                        <ul className="list-disc pl-4 mt-2 text-xs text-slate-500 space-y-1">
                                            <li>Transcripción completa.</li>
                                            <li>Resumen de la sesión.</li>
                                            <li>Informe de IA (según su plan).</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                Marque las sesiones canceladas o no presentadas como "Cancelada" para que no computen en sus estadísticas ni facturación.
                            </p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Videoconsulta y Telemedicina</h3>
                            <p>
                                La plataforma incluye un sistema de videollamadas integrado que permite realizar sesiones remotas.
                            </p>
                            <div className="my-6 space-y-4 not-prose">
                                <div className="flex gap-4 items-start p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 shrink-0">
                                        <Play className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">1. Iniciar Sesión</h4>
                                        <p className="text-slate-600 text-xs mt-1">Al entrar en la sala, pulse <strong>Iniciar Sesión</strong>. Esto activa el cronómetro de duración y cambia el estado de la cita a "En Curso".</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 shrink-0">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">2. Iniciar Grabación (IA)</h4>
                                        <p className="text-slate-600 text-xs mt-1">Para obtener transcripción y análisis de IA, pulse <strong>Grabar</strong>. Es necesario para que se generen los resúmenes automáticos. (Requiere consentimiento).</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-700 shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">3. Finalizar Sesión</h4>
                                        <p className="text-slate-600 text-xs mt-1">Al terminar, pulse <strong>Finalizar Sesión</strong>. El sistema guardará todo, marcará la cita como "Completada" y generará el informe clínico con IA (si su plan lo permite).</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Análisis IA de Sesiones</h3>
                            <p>
                                La IA actúa como un "espejo" del contenido de la sesión, proporcionando 5 tipos de información para asistir al profesional, sin sustituir nunca su criterio:
                            </p>
                            <div className="space-y-4 text-slate-600 my-6 not-prose">
                                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <span className="bg-slate-100 p-1 rounded">📝</span> Resumen Fáctico
                                    </h4>
                                    <p className="text-sm mt-1">Síntesis objetiva de lo hablado en la sesión, ideal para copiar a la historia clínica reduciendo el tiempo de redacción.</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <span className="bg-slate-100 p-1 rounded">🎭</span> Elementos Emocionales y Narrativos
                                    </h4>
                                    <p className="text-sm mt-1">Detecta palabras clave (tristeza, rabia...) y patrones discursivos (absolutos tipo "siempre", rumiación) para alertar de posibles incongruencias.</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <span className="bg-slate-100 p-1 rounded">🏷️</span> Temas Emergentes
                                    </h4>
                                    <p className="text-sm mt-1">Clasifica automáticamente el contenido en áreas temáticas (Ansiedad, Trauma, Autoestima) para no perder de vista ejes latentes.</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <span className="bg-slate-100 p-1 rounded">💡</span> Sugerencias de Tests (Orientativo)
                                    </h4>
                                    <p className="text-sm mt-1">Si detecta indicadores de un tema (ej. Ansiedad), sugiere valorar instrumentos validados (BAI, STAI), sin "asignarlos" automáticamente.</p>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-amber-900 flex items-center gap-2">
                                        <span className="bg-amber-100 p-1 rounded">🚩</span> Marcadores de Riesgo
                                    </h4>
                                    <p className="text-sm text-amber-800 mt-1">Identifica lenguaje de riesgo potencial (autolesión, ideación) para revisión prioritaria del profesional.</p>
                                </div>
                            </div>



                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">Simulador Clínico</h3>
                            <p>
                                Acceda desde el menú "Simulador" para practicar con pacientes virtuales. La IA le dará feedback sobre su empatía y técnica al terminar la sesión simulada. Las sesiones tienen una duración máxima de 45 minutos.
                            </p>
                            <div className="mt-4 bg-slate-50 border-l-4 border-indigo-400 p-4 rounded-r">
                                <strong>Disponibilidad por Plan:</strong>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-700">
                                    <li><strong>Basic:</strong> No incluido.</li>
                                    <li><strong>Pro/Start:</strong> 5 casos prácticos al mes.</li>
                                    <li><strong>Premium/Clinics:</strong> Casos ilimitados.</li>
                                </ul>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />



                        <hr className="my-8 border-slate-200" />

                        <section id="exportacion" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">7</span>
                                Privacidad y Exportación de Datos
                            </h2>
                            <p className="leading-relaxed text-lg text-slate-600 mb-6 font-medium">
                                PsicoAIssist le permite descargar toda su información en cualquier momento, garantizando su derecho a la portabilidad de datos (RGPD).
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">📊 Exportar Datos (CSV/Excel)</h3>
                                    <p className="text-slate-600 text-sm mb-4">Descarga una hoja de cálculo con el listado completo de sus sesiones.</p>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        <li className="flex gap-2">✓ <strong>Datos Desencriptados:</strong> Nombres reales de clientes y contenido de notas.</li>
                                        <li className="flex gap-2">✓ <strong>Formato:</strong> Compatible con Excel, Numbers y Google Sheets.</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">📂 Exportar Informes (PDF)</h3>
                                    <p className="text-slate-600 text-sm mb-4">Genera un archivo ZIP comprimido con todos sus documentos.</p>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        <li className="flex gap-2">✓ <strong>Todos los Informes:</strong> Incluye historial completo.</li>
                                        <li className="flex gap-2">✓ <strong>Formato:</strong> Archivos PDF individuales organizados.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="my-8 border-slate-200" />

                        <section id="configuracion" className="scroll-mt-24">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                                <span className="bg-blue-600 text-white text-lg px-4 py-1 rounded-full shadow-sm font-mono">8</span>
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

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🎨 Marca Personal y Personalización de Informes (Solo Premium)</h3>
                            <p>Personalice la apariencia de sus informes clínicos (PDF y Word) para reflejar su identidad corporativa.</p>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                <li><strong>Nombre de la Empresa:</strong> Aparecerá en el encabezado de todos los documentos generados.</li>
                                <li><strong>Colores Corporativos:</strong> Defina un color primario y secundario que se aplicará a títulos y elementos gráficos del informe.</li>
                                <li><strong>Logo:</strong> Suba su logotipo para que aparezca en la esquina superior de sus informes.</li>
                            </ul>
                            <p className="text-sm text-slate-500 mt-2"><i>Nota: Esta funcionalidad es exclusiva para usuarios con plan Premium o superior.</i></p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🤖 Inteligencia Artificial</h3>
                            <p><strong>Idioma de la IA:</strong> El idioma de los análisis e informes generados por la Inteligencia Artificial se sincroniza automáticamente con el idioma seleccionado en la interfaz (barra de navegación superior).</p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🔔 Notificaciones</h3>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                <li><strong>Recordatorios a Pacientes:</strong> El sistema envía un correo al paciente 24h antes de la cita (requiere email en la ficha del paciente).</li>
                                <li><strong>Resumen de Agenda (Profesional):</strong> Si activa esta opción, recibirá un correo diario a las 20:00h con el listado de visitas del día siguiente.</li>
                            </ul>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🛑 Gestión de Cuenta y Baja</h3>
                            <p className="leading-relaxed text-slate-600 mb-4">
                                Entendemos que su privacidad es fundamental. Si decide dar de baja su cuenta (desde <strong>Perfil {'>'} Eliminar Cuenta</strong>), el sistema iniciará un proceso seguro:
                            </p>
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                                <h4 className="font-bold text-amber-900 mb-2">Proceso de Eliminación y Recuperación (90 días)</h4>
                                <ul className="list-disc pl-5 space-y-2 text-amber-800 text-sm">
                                    <li><strong>Inicio (Día 0):</strong> Su cuenta se marca como "Eliminada". Ya no podrá acceder, pero sus datos siguen encriptados en nuestros servidores.</li>
                                    <li><strong>Periodo de Gracia (90 días):</strong> Durante este tiempo, si se arrepiente, simplemente <strong>inicie sesión</strong> de nuevo para reactivar su cuenta y todos sus datos automáticamente.</li>
                                    <li><strong>Borrado Definitivo (Día 91):</strong> El sistema ejecuta automáticamente un proceso de <strong>Anonimización Irreversible</strong>. Su nombre, email y datos de contacto se borran para siempre, cumpliendo con el RGPD.</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
