import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

export function LegalJustificationContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <ShieldCheck className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Document de Justificació Legal</h1>
                <p className="text-lg text-muted-foreground">AI Act Ready • GDPR Compliant • Ètica Professional</p>
                <div className="flex justify-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Auditabil</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Transparent</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Supervisat</span>
                </div>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Sistema d’IA de suport orientatiu en context psicològic
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Naturalesa del sistema
                        </h2>
                        <p className="text-slate-700 leading-relaxed pl-8">
                            El sistema d’inteligència artificial actua exclusivament com a <strong>eina de suport orientatiu per a professionals</strong>, sense capacitat de diagnòstic, prescripció ni presa de decisions clíniques automatitzades.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            Classificació segons l’AI Act
                        </h2>
                        <p className="text-slate-700 leading-relaxed pl-8">
                            El sistema s’emmarca dins dels sistemes d’IA d’alt risc com a <strong>suport a la presa de decisions</strong>, però <strong>no realitza decisions automatitzades</strong>, d’acord amb els articles 14 i 22 del GDPR i el marc del Reglament Europeu d’IA.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                            Control humà efectiu
                        </h2>
                        <div className="pl-8 grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h3 className="font-semibold text-slate-800 mb-2">Totes les sortides són:</h3>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    <li>Orientatives</li>
                                    <li>No prescriptives</li>
                                    <li>Editables o ignorables</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h3 className="font-semibold text-slate-800 mb-2">El professional manté el control sobre:</h3>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    <li>Selecció d’instruments</li>
                                    <li>Aplicació</li>
                                    <li>Interpretació de resultats</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                            Limitació funcional
                        </h2>
                        <p className="text-slate-700 pl-8">El sistema:</p>
                        <ul className="list-disc pl-12 text-slate-700 space-y-1">
                            <li>No suggereix instruments en temps real.</li>
                            <li>Només mostra opcions al final de la sessió.</li>
                            <li>Limita explícitament el nombre de temes i instruments.</li>
                            <li>Utilitza catàlegs professionals predefinits.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                            Traçabilitat i auditabilitat
                        </h2>
                        <p className="text-slate-700 leading-relaxed pl-8">
                            Cada suggeriment d’instrument inclou una justificació descriptiva (<code>why_this_test_was_suggested</code>) basada en:
                        </p>
                        <ul className="list-disc pl-12 text-slate-700 space-y-1">
                            <li>Contingut verbalitzat</li>
                            <li>Temes emergents</li>
                            <li>Mapa estàtic de correspondència</li>
                        </ul>
                        <p className="text-slate-700 pl-8 mt-2 italic">No hi ha cap decisió opaca ni model no explicable.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
                            Protecció de menors
                        </h2>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 ml-8">
                            <p className="text-slate-700 mb-2">Quan el sistema s’utilitza amb menors:</p>
                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                <li>S’activen restriccions addicionals.</li>
                                <li>Només es mostren instruments adequats a l’edat.</li>
                                <li>S’utilitza llenguatge evolutiu i no diagnòstic.</li>
                                <li>La decisió final correspon sempre a l’adult responsable i al professional.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
                            Compliment normatiu
                        </h2>
                        <div className="pl-8 grid gap-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                <Scale className="h-5 w-5 text-green-700" />
                                <span className="text-green-900 font-medium">Reglament General de Protecció de Dades (GDPR)</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                <Scale className="h-5 w-5 text-green-700" />
                                <span className="text-green-900 font-medium">Reglament Europeu sobre Intel·ligència Artificial (Llei d’IA)</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                <Scale className="h-5 w-5 text-green-700" />
                                <span className="text-green-900 font-medium">Principis ètics de l’ús de proves psicològiques</span>
                            </div>
                        </div>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
