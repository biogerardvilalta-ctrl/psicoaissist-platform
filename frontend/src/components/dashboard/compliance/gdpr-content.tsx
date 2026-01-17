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
                    <p className="text-gray-600 mb-6">
                        <strong>Última actualización:</strong> 12 de diciembre de 2025
                    </p>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. Responsable del Tratamiento</h2>
                        <p className="text-slate-700 leading-relaxed">
                            El responsable del tratamiento de los datos es <strong>PsicoAIssist</strong>. Nos comprometemos a tratar los datos de los pacientes y profesionales con la máxima confidencialidad, de acuerdo con el Reglamento (UE) 2016/679 (RGPD).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Información que Recopilamos</h2>
                        <h3 className="text-md font-semibold text-slate-800">2.1 Datos Personales</h3>
                        <p className="text-slate-700 mb-2">
                            Recopilamos información que usted nos proporciona directamente, incluyendo:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
                            <li>Nombre completo y información de contacto</li>
                            <li>Número de colegiado profesional</li>
                            <li>Especialidad médica</li>
                            <li>Información de facturación y pago</li>
                        </ul>

                        <h3 className="text-md font-semibold text-slate-800">2.2 Datos Clínicos</h3>
                        <p className="text-slate-700 mb-2">
                            Los datos clínicos de pacientes se procesan bajo estrictas medidas de seguridad:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li>Transcripciones de sesiones (encriptadas efímeramente)</li>
                            <li>Notas clínicas</li>
                            <li>Informes generados</li>
                            <li>Archivos de audio (opcional, encriptados)</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Finalidad del Tratamiento</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Utilizamos la información recopilada para:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>Proporcionar servicios de transcripción e IA (generar informes, análisis).</li>
                            <li>Gestionar el historial clínico y la agenda del profesional.</li>
                            <li>Procesar pagos y gestionar suscripciones.</li>
                            <li>Proporcionar soporte técnico y mejorar nuestros algoritmos (con datos anonimizados).</li>
                        </ul>
                        <p className="text-slate-700 mt-2">
                            <strong>No utilizamos los datos para fines publicitarios ni los cedemos a terceros</strong> sin consentimiento explícito, excepto por obligación legal o proveedores de servicio bajo contrato de confidencialidad.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. Base Legal del Tratamiento</h2>
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
                        <h2 className="text-lg font-bold text-blue-900">5. Minimización y Seguridad (Protección de Datos)</h2>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                            <ul className="space-y-2 text-slate-700">
                                <li className="flex gap-2">
                                    <Server className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span><strong>Minimización:</strong> Las transcripciones de audio se procesan de manera efímera siempre que es posible.</span>
                                </li>
                                <li className="flex gap-2">
                                    <Lock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span><strong>Encriptación:</strong> AES-256 para datos en reposo y TLS 1.3 para datos en tránsito. Claves rotadas periódicamente.</span>
                                </li>
                                <li className="flex gap-2">
                                    <UserCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span><strong>Control de Acceso:</strong> Autenticación de dos factores, acceso basado en roles y logs de auditoría completos.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="text-slate-700 text-sm">
                                <p className="font-medium text-red-900 mb-1">Nota Importante sobre IA</p>
                                A pesar de las medidas de seguridad, recordamos que ningún sistema es invulnerable. El uso de inteligencia artificial implica el procesamiento de datos en servidores seguros. Garantizamos que no se utilizan datos de los pacientes para el entrenamiento de modelos públicos.
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">6. Compartir Información</h2>
                        <p className="text-slate-700 mb-2">
                            <strong>No vendemos, alquilamos o compartimos</strong> sus datos personales con terceros, excepto:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li>Proveedores de servicios necesarios (bajo estrictos acuerdos de confidencialidad).</li>
                            <li>Cuando sea requerido por ley.</li>
                            <li>Con su consentimiento explícito.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">7. Derechos de los Interesados</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Tanto profesionales como pacientes tienen derecho a:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li><strong>Acceso:</strong> Obtener copias de sus datos.</li>
                            <li><strong>Rectificación:</strong> Corregir datos inexactos.</li>
                            <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos (Derecho al olvido).</li>
                            <li><strong>Limitación:</strong> Restringir el tratamiento.</li>
                            <li><strong>Oposición:</strong> Oponerse al tratamiento.</li>
                            <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">8. Retención de Datos</h2>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li><strong>Datos de cuenta:</strong> Mientras se mantenga la cuenta activa. En caso de solicitar la baja, los datos se mantendrán bloqueados durante 30 días (periodo de gracia) antes de ser anonimizados permanentemente.</li>
                            <li><strong>Datos clínicos:</strong> Según las regulaciones médicas aplicables.</li>
                            <li><strong>Datos de facturación:</strong> 7 años (requisito fiscal).</li>
                            <li><strong>Logs de auditoría:</strong> 3 años.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">9. Transferencias Internacionales</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Todos los datos se procesan y almacenan en servidores ubicados en la Unión Europea. No realizamos transferencias internacionales de datos fuera del Espacio Económico Europeo (EEE) sin las garantías adecuadas del RGPD.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">10. Contacto</h2>
                        <p className="text-slate-700 mb-2">
                            Para ejercer sus derechos o realizar consultas sobre privacidad:
                        </p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                            <p className="font-bold text-slate-800">Delegado de Protección de Datos (DPO)</p>
                            <p className="text-slate-700">Email: hola@psicoaissist.com</p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">11. Autoridad de Control</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos personales no cumple con la normativa vigente.
                        </p>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
