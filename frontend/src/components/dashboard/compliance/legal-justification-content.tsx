import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Scale, FileText, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LegalJustificationContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <ShieldCheck className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Documentación Legal y Normativa</h1>
                <p className="text-lg text-muted-foreground">AI Act Ready • GDPR Compliant • Ética Profesional</p>
                <div className="flex justify-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Auditable</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Transparente</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Supervisado</span>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1">
                    <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <FileText className="h-4 w-4" />
                        Justificación General
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen className="h-4 w-4" />
                        Documento de Cumplimiento Normativo
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="animate-in fade-in-50 duration-300">
                    <Card className="border-blue-100 shadow-lg">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Sistema de IA de apoyo orientativo en contexto de salud mental
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Naturaleza del sistema
                                </h2>
                                <p className="text-slate-700 leading-relaxed pl-8">
                                    El sistema de inteligencia artificial actúa exclusivamente como <strong>herramienta de apoyo orientativo para profesionales</strong>, sin capacidad de diagnóstico, prescripción ni toma de decisiones clínicas automatizadas.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    Clasificación según la AI Act
                                </h2>
                                <p className="text-slate-700 leading-relaxed pl-8">
                                    El sistema se enmarca dentro de los sistemas de IA de alto riesgo como <strong>apoyo a la toma de decisiones</strong>, pero <strong>no realiza decisiones automatizadas</strong>, de acuerdo con los artículos 14 y 22 del RGPD y el marco del Reglamento Europeo de IA.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Control humano efectivo
                                </h2>
                                <div className="pl-8 grid md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-2">Todas las salidas son:</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                            <li>Orientativas</li>
                                            <li>No prescriptivas</li>
                                            <li>Editables o ignorables</li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-2">El profesional mantiene el control sobre:</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                            <li>Selección de instrumentos</li>
                                            <li>Aplicación</li>
                                            <li>Interpretación de resultados</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                    Limitación funcional
                                </h2>
                                <p className="text-slate-700 pl-8">El sistema:</p>
                                <ul className="list-disc pl-12 text-slate-700 space-y-1">
                                    <li>No sugiere instrumentos en tiempo real.</li>
                                    <li>Solo muestra opciones al final de la sesión.</li>
                                    <li>Limita explícitamente el número de temas e instrumentos.</li>
                                    <li>Utiliza catálogos profesionales predefinidos.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                                    Trazabilidad y auditabilidad
                                </h2>
                                <p className="text-slate-700 leading-relaxed pl-8">
                                    Cada sugerencia de instrumento incluye una justificación descriptiva (<code>why_this_test_was_suggested</code>) basada en:
                                </p>
                                <ul className="list-disc pl-12 text-slate-700 space-y-1">
                                    <li>Contenido verbalizado</li>
                                    <li>Temas emergentes</li>
                                    <li>Mapa estático de correspondencia</li>
                                </ul>
                                <p className="text-slate-700 pl-8 mt-2 italic">No hay ninguna decisión opaca ni modelo no explicable.</p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
                                    Protección de menores
                                </h2>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 ml-8">
                                    <p className="text-slate-700 mb-2">Cuando el sistema se utiliza con menores:</p>
                                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                        <li>Se activan restricciones adicionales.</li>
                                        <li>Solo se muestran instrumentos adecuados a la edad.</li>
                                        <li>Se utiliza lenguaje evolutivo y no diagnóstico.</li>
                                        <li>La decisión final corresponde siempre al adulto responsable y al profesional.</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
                                    Cumplimiento normativo
                                </h2>
                                <div className="pl-8 grid gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                        <Scale className="h-5 w-5 text-green-700" />
                                        <span className="text-green-900 font-medium">Reglamento General de Protección de Datos (RGPD)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                        <Scale className="h-5 w-5 text-green-700" />
                                        <span className="text-green-900 font-medium">Reglamento Europeo sobre Inteligencia Artificial (Ley de IA)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                        <Scale className="h-5 w-5 text-green-700" />
                                        <span className="text-green-900 font-medium">Principios éticos del uso de pruebas psicológicas</span>
                                    </div>
                                </div>
                            </section>

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="animate-in fade-in-50 duration-300">
                    <Card className="border-slate-200 shadow-lg print:shadow-none print:border-none">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                            <CardTitle className="text-xl flex flex-col gap-2 text-slate-900">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Documento de Cumplimiento Normativo</span>
                                <span>Sistema de inteligencia artificial para la generación de informes profesionales</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 text-justify leading-relaxed text-slate-800">

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                    Objeto del documento
                                </h3>
                                <p className="mb-4">
                                    Este documento tiene por objeto describir y acreditar el cumplimiento normativo, técnico y ético del sistema de inteligencia artificial (en adelante, <strong>el sistema</strong>) utilizado exclusivamente como herramienta de apoyo a la redacción de informes profesionales en el ámbito de la salud mental.
                                </p>
                                <p className="mb-2 text-sm text-slate-700 font-semibold">Los tipos de informe cubiertos por el sistema son:</p>
                                <ul className="list-disc pl-6 space-y-1 mb-4 text-slate-700">
                                    <li>Informe de evaluación inicial</li>
                                    <li>Informe de evolución</li>
                                    <li>Informe de alta clínica</li>
                                    <li>Informe de derivación</li>
                                    <li>Informe legal-forense</li>
                                    <li>Informe para aseguradoras</li>
                                    <li>Informe personalizado</li>
                                </ul>
                                <p className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 text-blue-900 leading-relaxed">
                                    El sistema <strong>no adopta decisiones automatizadas</strong>, <strong>no emite diagnósticos clínicos</strong>, <strong>no establece causalidades</strong> ni <strong>sustituye el juicio profesional</strong>, y opera bajo <strong>supervisión humana obligatoria</strong> en todas las fases.
                                </p>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                    Marco normativo aplicable
                                </h3>
                                <p className="mb-4">El diseño, desarrollo y uso del sistema se ajusta al marco normativo siguiente:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Reglamento (UE) 2016/679, de 27 de abril de 2016 (Reglamento General de Protección de Datos – RGPD).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Reglamento Europeo de Inteligencia Artificial (Artificial Intelligence Act – AI Act).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Normativa profesional y deontológica aplicable al ejercicio profesional.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Principios éticos relativos al uso de herramientas tecnológicas en la elaboración de informes profesionales.</span>
                                    </li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                    Descripción general del sistema
                                </h3>
                                <p className="mb-4">
                                    El sistema es una herramienta de asistencia a la redacción basada en inteligencia artificial que genera borradores estructurados de informes a partir de:
                                </p>
                                <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700">
                                    <li>Transcripciones de sesiones.</li>
                                    <li>Notas clínicas redactadas por el profesional.</li>
                                    <li>Parámetros explícitos definidos por el/la profesional (tipo de informe, estructura, perfil lingüístico).</li>
                                </ul>
                                <p className="font-semibold mb-2">Características principales:</p>
                                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Función estrictamente asistencial y redactora.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Ausencia total de capacidad decisoria autónoma.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Dependencia exclusiva de los datos proporcionados.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Prohibición explícita de generar contenido no fundamentado.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded col-span-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Resultados de carácter orientativo y no vinculante.</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                                    Clasificación del riesgo según el Reglamento de IA
                                </h3>
                                <p className="mb-4">
                                    Dada la naturaleza de los informes generados y su posible impacto sobre derechos e intereses de personas físicas, el sistema se clasifica como <strong>sistema de IA de alto riesgo</strong> según el Reglamento Europeo de Inteligencia Artificial.
                                </p>
                                <p className="mb-2">En consecuencia, el sistema incorpora las garantías exigidas para esta categoría, incluyendo:</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                                    <li>Supervisión humana efectiva y documentada.</li>
                                    <li>Transparencia en el uso de IA.</li>
                                    <li>Trazabilidad completa del proceso de generación.</li>
                                    <li>Medidas técnicas de prevención de errores, sesgos y usos indebidos.</li>
                                    <li>Controles reforzados para usos especialmente sensibles (informes legal-forenses).</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
                                    Supervisión humana y responsabilidad profesional
                                </h3>
                                <div className="space-y-6">
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-amber-900 mb-2">5.1. Supervisión obligatoria</h4>
                                        <p className="text-amber-800 mb-2">Todos los informes generados con apoyo del sistema requieren obligatoriamente:</p>
                                        <ul className="list-disc pl-6 space-y-1 text-amber-900 list-inside">
                                            <li>Revisión íntegra del contenido por parte de un/a profesional cualificado/a.</li>
                                            <li>Validación expresa antes de cualquier uso externo o comunicación a terceros.</li>
                                            <li>Confirmación explícita de revisión humana antes de marcar un informe como finalizado.</li>
                                        </ul>
                                        <p className="mt-4 text-sm text-amber-900 italic">
                                            En el caso de los informes legal-forenses, se aplica un modo de supervisión reforzada, que impide la finalización del informe sin una validación humana específica.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">5.2. Responsabilidad</h4>
                                        <p className="mb-2">La responsabilidad del contenido final del informe recae exclusivamente en el/la profesional que lo revisa, valida y firma.</p>
                                        <p className="font-medium text-slate-700">El sistema no puede ser considerado autor, coautor ni responsable del contenido de ningún informe.</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">6</span>
                                    Cumplimiento del Reglamento General de Protección de Datos (RGPD)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.1. Base jurídica</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>Consentimiento informado, explícito y verificable de la persona interesada.</li>
                                            <li>Cumplimiento de obligaciones profesionales y legales.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.2. Minimización</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>Solo datos estrictamente necesarios.</li>
                                            <li>No se requieren identificadores personales innecesarios.</li>
                                            <li>El sistema no infiere datos adicionales.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.3. Tratamiento de datos especiales</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>Medidas de seguridad técnicas reforzadas (cifrado, control de acceso).</li>
                                            <li>Datos no utilizados para entrenar modelos de IA.</li>
                                            <li>Conservación limitada al tiempo necesario.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.4. Ejercicio de derechos</h4>
                                        <p className="text-sm text-slate-700">Se garantiza el ejercicio de los derechos de acceso, rectificación, supresión, limitación del tratamiento e información sobre el uso de IA.</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">7</span>
                                    Transparencia e información a las personas interesadas
                                </h3>
                                <p className="mb-4">Todos los informes generados incorporan una declaración explícita indicando:</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                                    <li>Que han sido redactados con el apoyo de una herramienta de inteligencia artificial.</li>
                                    <li>Que el contenido no es resultado de una decisión automatizada.</li>
                                    <li>Que el informe ha sido revisado y validado por un/a profesional responsable.</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">8</span>
                                    Principios éticos aplicados
                                </h3>
                                <div className="space-y-4">
                                    <p>El diseño y uso del sistema respeta los principios siguientes:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['No maleficencia', 'Prudencia interpretativa', 'Ausencia de estigmatización', 'Respeto a la dignidad', 'Proporcionalidad y adecuación al contexto'].map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700 font-medium">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <p className="font-semibold text-red-900 mb-2">El sistema evita expresamente:</p>
                                        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-6 text-red-800">
                                            <li>Diagnósticos automáticos.</li>
                                            <li>Etiquetajes personales.</li>
                                            <li>Predicciones de conducta o evolución futura.</li>
                                            <li>Afirmaciones causales no fundamentadas.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">9</span>
                                    Controles específicos para informes legal-forenses
                                </h3>
                                <p className="mb-4 text-slate-700">
                                    Los informes legal-forenses están sujetos a un modo de seguridad reforzado (<strong>Safe Forensic Mode</strong>) que incluye:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                                    <li>Prohibición técnica de afirmaciones categóricas o causales.</li>
                                    <li>Obligación de diferenciación explícita entre hechos observados y manifestaciones del/la paciente.</li>
                                    <li>Lenguaje condicional y estrictamente descriptivo.</li>
                                    <li>Validaciones automáticas del contenido antes de permitir la finalización.</li>
                                    <li>Confirmación expresa de revisión humana reforzada.</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">10</span>
                                        Trazabilidad y control
                                    </h3>
                                    <p className="mb-2">El sistema mantiene registros internos auditables sobre:</p>
                                    <ul className="list-disc pl-6 space-y-1 text-slate-700 text-sm">
                                        <li>Fecha y hora de generación de cada borrador.</li>
                                        <li>Tipo de informe.</li>
                                        <li>Versión del sistema y del modelo de IA utilizado.</li>
                                        <li>Identidad del/la profesional responsable.</li>
                                        <li>Confirmación de revisión humana.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">11</span>
                                        Limitaciones del sistema
                                    </h3>
                                    <ul className="list-disc pl-6 space-y-1 text-slate-700 text-sm">
                                        <li>El sistema no sustituye la evaluación ni el criterio profesional.</li>
                                        <li>Los informes generados tienen carácter orientativo hasta su validación.</li>
                                        <li>El uso fuera del contexto profesional o sin supervisión humana constituye un uso indebido.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-slate-50 p-6 rounded-xl mt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">12</span>
                                    Declaración final de cumplimiento
                                </h3>
                                <p className="leading-relaxed text-slate-300">
                                    El sistema de inteligencia artificial descrito en este documento ha sido diseñado e implementado conforme a los requisitos legales, técnicos y éticos exigibles según la normativa europea vigente, e incorpora garantías específicas para un uso responsable, transparente, trazable y bajo control humano efectivo.
                                </p>
                            </div>

                            <p className="text-center text-sm text-slate-500 italic mt-8 pt-8 border-t">
                                *Documento elaborado a efectos de justificación de cumplimiento normativo ante autoridades competentes, auditorías internas o externas y procesos de inspección.*
                            </p>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
