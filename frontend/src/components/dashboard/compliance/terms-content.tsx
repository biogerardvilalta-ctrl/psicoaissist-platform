import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Users, Gavel, AlertTriangle } from 'lucide-react';

export function TermsContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Scale className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Termes i Condicions d'Ús</h1>
                <p className="text-lg text-muted-foreground">Acord de servei per a professionals de la psicologia</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <Users className="h-5 w-5 text-blue-600" />
                        Relació Contractual
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. Naturalesa del Servei</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Aquesta aplicació és una <strong>eina de suport a la decisió clínica</strong> basada en Intel·ligència Artificial. El seu objectiu és assistir al professional en la gestió de sessions i la generació d'esborranys documentals.
                        </p>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 font-medium">
                                L'eina NO substitueix el criteri professional, ni realitza diagnòstics automàtics, ni prescriu tractaments mèdics o farmacològics.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Responsabilitat del Professional</h2>
                        <p className="text-slate-700 leading-relaxed">
                            L'usuari (psicòleg/oga col·legiat/da) reconeix i accepta que:
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>És l'únic responsable de verificar la informació generada per la IA abans d'utilitzar-la o incloure-la a la història clínica.</li>
                            <li>És responsable d'obtenir el consentiment informat dels pacients per a l'ús d'eines de suport a la sessió.</li>
                            <li>Manté la responsabilitat final sobre qualsevol decisió clínica presa respecte als seus pacients.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Propietat de les Dades</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Totes les dades clíniques, notes de sessió i informació dels pacients introduïda a la plataforma són <strong>propietat exclusiva del professional i/o del pacient</strong>, segons correspongui. La plataforma actua com a encarregada del tractament, limitant-se a custodiar i processar la informació segons les instruccions de l'usuari.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. Ús Acceptable</h2>
                        <p className="text-slate-700 leading-relaxed">
                            L'usuari es compromet a fer un ús ètic de la plataforma, respectant el Codi Deontològic de la professió i la normativa vigent. Queda prohibit utilitzar el sistema per a finalitats il·lícites, discriminatòries o que atemptin contra la dignitat de les persones.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">5. Limitació de Responsabilitat</h2>
                        <p className="text-slate-700 leading-relaxed">
                            La plataforma no es fa responsable de possibles errors en la transcripció o en els suggeriments de la IA, atès que es tracta d'una tecnologia probabilística. La verificació humana és indispensable en tots els casos.
                        </p>
                    </section>

                    <section className="space-y-3 pt-6 border-t font-medium text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Gavel className="h-4 w-4" />
                            <span>Darrera actualització: Desembre 2025</span>
                        </div>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
