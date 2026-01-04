import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Users, Gavel, AlertTriangle } from 'lucide-react';

export function TermsContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Scale className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Términos y Condiciones de Uso</h1>
                <p className="text-lg text-muted-foreground">Acuerdo de servicio para profesionales de la salud mental</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <Users className="h-5 w-5 text-blue-600" />
                        Relación Contractual
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. Naturaleza del Servicio</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Esta aplicación es una <strong>herramienta de apoyo a la decisión clínica</strong> basada en Inteligencia Artificial. Su objetivo es asistir al profesional en la gestión de sesiones y la generación de borradores documentales.
                        </p>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 font-medium">
                                La herramienta NO sustituye el criterio profesional, ni realiza diagnósticos automáticos, ni prescribe tratamientos médicos o farmacológicos.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Responsabilidad del Profesional</h2>
                        <p className="text-slate-700 leading-relaxed">
                            El usuario (profesional de la salud mental acreditado/a) reconoce y acepta que:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>Es el único responsable de verificar la información generada por la IA antes de utilizarla o incluirla en la historia clínica.</li>
                            <li>Es responsable de obtener el consentimiento informado de los pacientes para el uso de herramientas de apoyo a la sesión.</li>
                            <li>Mantiene la responsabilidad final sobre cualquier decisión clínica tomada respecto a sus pacientes.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Propiedad de los Datos</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Todos los datos clínicos, notas de sesión e información de los pacientes introducida en la plataforma son <strong>propiedad exclusiva del profesional y/o del paciente</strong>, según corresponda. La plataforma actúa como encargada del tratamiento, limitándose a custodiar y procesar la información según las instrucciones del usuario.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. Uso Aceptable</h2>
                        <p className="text-slate-700 leading-relaxed">
                            El usuario se compromete a hacer un uso ético de la plataforma, respetando el Código Deontológico de la profesión y la normativa vigente. Queda prohibido utilizar el sistema para fines ilícitos, discriminatorios o que atenten contra la dignidad de las personas.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">5. Límites Éticos y Profesionales</h2>
                        <div className="space-y-4">
                            <p className="text-slate-700 leading-relaxed">
                                El uso de la plataforma está sujeto a los siguientes límites éticos inquebrantables, alineados con la normativa deontológica vigente:
                            </p>
                            <div className="grid gap-3">
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">PROHIBICIÓN DE DIAGNÓSTICO AUTOMATIZADO</h4>
                                    <p className="text-sm text-slate-600">
                                        Queda estrictamente prohibido utilizar las salidas de la IA como diagnósticos clínicos definitivos. La IA es una herramienta de apoyo orientativo; el diagnóstico es acto exclusivo del profesional humano.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">DEBER DE EMERGENCIA</h4>
                                    <p className="text-sm text-slate-600">
                                        La aplicación NO es un dispositivo de emergencia ni de intervención en crisis. En situaciones de riesgo inminente de suicidio o daño a terceros, el profesional debe actuar según los protocolos de emergencia convencionales, sin depender del procesamiento de la herramienta.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">TRANSPARENCIA CON EL PACIENTE</h4>
                                    <p className="text-sm text-slate-600">
                                        Es obligación ética del profesional informar al paciente sobre el uso de herramientas tecnológicas de apoyo durante la sesión y garantizar que este uso no interfiere en la calidad de la alianza terapéutica.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">6. Política de Uso Razonable (Fair Use Policy)</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Para garantizar la estabilidad del sistema y la calidad del servicio para todos los usuarios, los planes con características "Ilimitadas" están sujetos a los siguientes topes de seguridad mensual:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Pacientes Activos</span>
                                <span className="text-lg font-bold text-slate-800">5.000</span>
                                <span className="text-xs text-slate-500 ml-1">expedientes</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Transcripción IA</span>
                                <span className="text-lg font-bold text-slate-800">300</span>
                                <span className="text-xs text-slate-500 ml-1">horas/mes</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Generación Informes</span>
                                <span className="text-lg font-bold text-slate-800">3.000</span>
                                <span className="text-xs text-slate-500 ml-1">informes/mes</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Simulador Clínico</span>
                                <span className="text-lg font-bold text-slate-800">500</span>
                                <span className="text-xs text-slate-500 ml-1">casos/mes</span>
                            </div>
                        </div>
                        <p className="text-xs text-red-700 mt-2 italic">
                            * El uso por encima de estos límites se considera abusivo y puede conllevar la suspensión temporal de la cuenta o contacto por parte de soporte.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">7. Planes de Suscripción y Características</h2>
                        <p className="text-slate-700 leading-relaxed">
                            A continuación se detallan los planes disponibles y sus características contractuales. Los precios pueden estar sujetos a impuestos aplicables.
                        </p>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3 text-sm my-4">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-800">
                                <strong>Política de Reinicio Mensual:</strong> Todas las cuotas incluidas en los planes (minutos de transcripción, casos de simulador, etc.) se reinician automáticamente al inicio de cada ciclo de facturación mensual. <u>Los recursos no utilizados durante el mes en curso no son acumulables para el mes siguiente.</u>
                            </p>
                        </div>

                        <div className="space-y-6 mt-4">
                            {/* DEMO PLAN - ADDED */}
                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🌱 Demo (Gratuito / Limitada)</span>
                                    <span className="text-base bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">Prueba 14 días</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Incluye:</h4>
                                        <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                                            <li><strong>3 Pacientes Activos</strong> máximo.</li>
                                            <li><strong>30 Minutos Transcripción + IA</strong> (Prueba).</li>
                                            <li><strong>5 Informes</strong> mensuales.</li>
                                            <li>Acceso básico a la plataforma.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-slate-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> Limitaciones:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li><strong>Sin Simulador Clínico</strong>.</li>
                                            <li>Caducidad automática a los 14 días.</li>
                                            <li>Sin sincronización de calendario.</li>
                                            <li>Sin soporte personalizado.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* BASIC PLAN */}
                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🥉 Basic</span>
                                    <span className="text-base bg-slate-200 px-3 py-1 rounded-full">29€ / mes</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Incluye:</h4>
                                        <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                                            <li><strong>25 Pacientes Activos</strong> totales.</li>
                                            <li><strong>10 Horas Transcripción</strong> (Literal).</li>
                                            <li><strong>Almacenamiento 5GB</strong>.</li>
                                            <li>Gestión de Citas Básica.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-slate-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> No Incluye:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>Análisis IA Avanzado (Resúmenes, Emojis).</li>
                                            <li>Simulador Clínico.</li>
                                            <li>Google Calendar Sync.</li>
                                            <li>Soporte Prioritario.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* PRO */}
                            <div className="p-5 bg-blue-50 rounded-lg border border-blue-200 ring-1 ring-blue-500/20">
                                <h3 className="font-bold text-blue-900 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🥈 Pro</span>
                                    <span className="text-base bg-blue-100 text-blue-800 px-3 py-1 rounded-full">59€ / mes</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Incluye:</h4>
                                        <ul className="space-y-1 text-blue-900 list-disc pl-4 text-xs">
                                            <li><strong>Pacientes Ilimitados</strong>.</li>
                                            <li><strong>15 Horas (900 min) IA Total</strong>.</li>
                                            <li><strong>Google Calendar Sync</strong> (Bidireccional).</li>
                                            <li><strong>Análisis IA Avanzado</strong> (Insights).</li>
                                            <li>Almacenamiento 50GB.</li>
                                            <li>Simulador (5 casos/mes).</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-blue-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> No Incluye:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>Simulador Ilimitado.</li>
                                            <li>Branding Personalizado (Logo).</li>
                                            <li>Videollamada de Soporte.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* PREMIUM PLUS */}
                            <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                                <h3 className="font-bold text-purple-900 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🥇 Premium</span>
                                    <span className="text-base bg-purple-100 text-purple-800 px-3 py-1 rounded-full">99€ / mes</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Incluye:</h4>
                                        <ul className="space-y-1 text-purple-900 list-disc pl-4 text-xs">
                                            <li><strong>50 Horas (3.000 min) IA</strong>.</li>
                                            <li><strong>Simulador Ilimitado</strong>.</li>
                                            <li><strong>Branding Personalizado</strong>.</li>
                                            <li><strong>Soporte Prioritario + Videollamada</strong>.</li>
                                            <li>Almacenamiento 1TB.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-purple-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> No Incluye:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>Gestión de Equipos (Multi-usuario).</li>
                                            <li>API / Integración HIS.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* CLINICS ONLY */}
                            <div className="grid md:grid-cols-1 gap-4">
                                <div className="p-5 bg-slate-100 rounded-lg border border-slate-300">
                                    <h3 className="font-bold text-slate-800 mb-2">🏥 Para Centros de Salud, Universidades y Hospitales</h3>
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Consultar</p>
                                    <div className="text-xs space-y-2">
                                        <div>
                                            <span className="font-bold text-green-700">✅ Incluye:</span>
                                            <ul className="list-disc pl-4 text-slate-700 mt-1">
                                                <li>Usuarios ilimitados.</li>
                                                <li>Simulador Clínico (casos/mes a medida).</li>
                                                <li>API / HIS & Compliance.</li>
                                                <li>SLA Garantizado.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 pt-6">
                        <h3 className="font-bold text-slate-800">Servicios Adicionales (Extras)</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">👤 Agenda Manager</h4>
                                <p className="text-xs text-slate-500 mt-1">15€ / mes</p>
                                <p className="text-xs text-slate-600 mt-2">Usuario administrativo adicional para gestión de citas. Sin acceso a historias clínicas.</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">⚡ Pack Minutos IA</h4>
                                <p className="text-xs text-slate-500 mt-1">15€ / pack</p>
                                <p className="text-xs text-slate-600 mt-2">500 minutos adicionales de procesamiento IA. Pago único, no caducan mientras la suscripción esté activa.</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">🚀 Onboarding Asistido</h4>
                                <p className="text-xs text-slate-500 mt-1">50€ (pago único)</p>
                                <p className="text-xs text-slate-600 mt-2">Sesión de 45 min con un especialista para configuración inicial e importación de datos.</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">🎓 Pack Simulador</h4>
                                <p className="text-xs text-slate-500 mt-1">15€ / pack</p>
                                <p className="text-xs text-slate-600 mt-2">Pack de 10 casos clínicos interactivos adicionales para práctica. Incluye feedback detallado de la IA.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">8. Limitación de Responsabilidad</h2>
                        <p className="text-slate-700 leading-relaxed">
                            La plataforma no se hace responsable de posibles errores en la transcripción o en las sugerencias de la IA, dado que se trata de una tecnología probabilística. La verificación humana es indispensable en todos los casos.
                        </p>
                    </section>

                    <section className="space-y-3 pt-6 border-t font-medium text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Gavel className="h-4 w-4" />
                            <span>Última actualización: Diciembre 2025</span>
                        </div>
                    </section>

                </CardContent >
            </Card >
        </div >
    );
}
