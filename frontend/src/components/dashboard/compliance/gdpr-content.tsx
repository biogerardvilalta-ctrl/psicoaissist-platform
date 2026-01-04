import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, UserCheck, Server, AlertCircle } from 'lucide-react';

export function GdprContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Lock className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Política de Privacidad y RGPD</h1>
                <p className="text-lg text-muted-foreground">Compromiso con la protección de datos personales y sensibles</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        Tratamiento de Datos Personales
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. Responsable del Tratamiento</h2>
                        <p className="text-slate-700 leading-relaxed">
                            El responsable del tratamiento de los datos es <strong>Psych Assistant AI</strong>. Nos comprometemos a tratar los datos de los pacientes y profesionales con la máxima confidencialidad, de acuerdo con el Reglamento (UE) 2016/679 (RGPD).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Finalidad del Tratamiento</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Los datos se recogen exclusivamente para las siguientes finalidades:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>Proporcionar apoyo orientativo al profesional durante las sesiones.</li>
                            <li>Generar transcripciones y análisis automatizados de las sesiones.</li>
                            <li>Gestionar el historial clínico y la agenda del profesional.</li>
                        </ul>
                        <p className="text-slate-700 mt-2">
                            <strong>No utilizamos los datos para fines publicitarios ni los cedemos a terceros</strong> sin consentimiento explícito, excepto por obligación legal.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Minimización y Seudonimización</h2>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <ul className="space-y-2 text-slate-700">
                                <li className="flex gap-2">
                                    <Server className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>Las transcripciones de audio se procesan de manera efímera siempre que es posible.</span>
                                </li>
                                <li className="flex gap-2">
                                    <Lock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>Los datos sensibles se almacenan cifrados en reposo utilizando estándares AES-256.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. Derechos de los Interesados</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Tanto profesionales como pacientes tienen derecho a:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li>Acceder a sus datos personales.</li>
                            <li>Rectificar datos inexactos.</li>
                            <li>Solicitar la supresión de los datos (Derecho al olvido).</li>
                            <li>Limitar el tratamiento de sus datos.</li>
                            <li>Oponerse al tratamiento.</li>
                            <li>Solicitar la portabilidad de los datos.</li>
                        </ul>
                        <p className="text-sm text-slate-500 mt-2">
                            Para ejercer estos derechos, puede contactar con nuestro Delegado de Protección de Datos (DPO) a través del canal de soporte de la aplicación.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">5. Seguridad de los Datos</h2>
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="text-slate-700 text-sm">
                                <p className="font-medium text-red-900 mb-1">Nota Importante sobre IA</p>
                                A pesar de las medidas de seguridad, recordamos que ningún sistema es invulnerable. El uso de inteligencia artificial implica el procesamiento de datos en servidores seguros. Garantizamos que no se utilizan datos de los pacientes para el entrenamiento de modelos públicos.
                            </div>
                        </div>
                    </section>

                </CardContent>
                <CardContent className="px-8 pb-8 space-y-8 pt-0">
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">6. Base Legal del Tratamiento</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Tratamos los datos bajo las siguientes bases legales del RGPD:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li><strong>Consentimiento:</strong> Para funcionalidades opcionales.</li>
                            <li><strong>Ejecución contractual:</strong> Para proporcionar nuestros servicios.</li>
                            <li><strong>Interés legítimo:</strong> Para mejorar la calidad del servicio.</li>
                            <li><strong>Cumplimiento legal:</strong> Para obligaciones regulatorias y fiscales.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">7. Retención de Datos</h2>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li><strong>Datos de cuenta:</strong> Mientras se mantenga la cuenta activa.</li>
                            <li><strong>Datos clínicos:</strong> Según las regulaciones médicas aplicables.</li>
                            <li><strong>Datos de facturación:</strong> 7 años (requisito fiscal).</li>
                            <li><strong>Logs de auditoría:</strong> 3 años.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">8. Transferencias Internacionales</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Todos los datos se procesan y almacenan en servidores ubicados en la Unión Europea. No realizamos transferencias internacionales de datos fuera del Espacio Económico Europeo (EEE) sin las garantías adecuadas del RGPD.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">9. Contacto</h2>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                            <p className="font-bold text-slate-800">Delegado de Protección de Datos (DPO)</p>
                            <p className="text-slate-700">Email: dpo@psychoai.com</p>
                            <p className="text-slate-700">Teléfono: +34 900 123 456</p>
                            <p className="text-slate-700">Dirección: C/ Serrano 123, 28006 Madrid, España</p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">10. Autoridad de Control</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos personales no cumple con la normativa vigente.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
