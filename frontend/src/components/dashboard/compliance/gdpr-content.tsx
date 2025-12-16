import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, UserCheck, Server, AlertCircle } from 'lucide-react';

export function GdprContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Lock className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Política de Privacitat i GDPR</h1>
                <p className="text-lg text-muted-foreground">Compromís amb la protecció de dades personals i sensibles</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        Tractament de Dades Personals
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. Responsable del Tractament</h2>
                        <p className="text-slate-700 leading-relaxed">
                            El responsable del tractament de les dades és <strong>Psych Assistant AI</strong>. Ens comprometem a tractar les dades dels pacients i professionals amb la màxima confidencialitat, d'acord amb el Reglament (UE) 2016/679 (GDPR).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Finalitat del Tractament</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Les dades es recullen exclusivament per a les següents finalitats:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>Proporcionar suport orientatiu al professional durant les sessions.</li>
                            <li>Generar transcripcions i anàlisis automatitzades de les sessions.</li>
                            <li>Gestionar l'historial clínic i l'agenda del professional.</li>
                        </ul>
                        <p className="text-slate-700 mt-2">
                            <strong>No utilitzem les dades per a finalitats publicitàries ni les cedim a tercers</strong> sense consentiment explícit, excepte per obligació legal.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Minimització i Pseudonimització</h2>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <ul className="space-y-2 text-slate-700">
                                <li className="flex gap-2">
                                    <Server className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>Les transcripcions d'àudio es processen de manera efímera sempre que és possible.</span>
                                </li>
                                <li className="flex gap-2">
                                    <Lock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>Les dades sensibles s'emmagatzemen xifrades en repòs utilitzant estàndards AES-256.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. Drets dels Interessats</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Tant professionals com pacients tenen dret a:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            <li>Accedir a les seves dades personals.</li>
                            <li>Rectificar dades inexactes.</li>
                            <li>Sol·licitar la supressió de les dades (Dret a l'oblit).</li>
                            <li>Limitar el tractament de les seves dades.</li>
                            <li>Oposar-se al tractament.</li>
                            <li>Sol·licitar la portabilitat de les dades.</li>
                        </ul>
                        <p className="text-sm text-slate-500 mt-2">
                            Per exercir aquests drets, podeu contactar amb el nostre Delegat de Protecció de Dades (DPO) a través del canal de suport de l'aplicació.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">5. Seguretat de les Dades</h2>
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="text-slate-700 text-sm">
                                <p className="font-medium text-red-900 mb-1">Nota Important sobre IA</p>
                                Tot i les mesures de seguretat, recordem que cap sistema és invulnerable. L'ús d'intel·ligència artificial implica el processament de dades en servidors segurs. Garantim que no s'utilitzen dades dels pacients per a l'entrenament de models públics.
                            </div>
                        </div>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
