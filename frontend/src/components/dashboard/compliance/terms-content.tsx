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
                <p className="text-lg text-muted-foreground">Acord de servei per a professionals de la salut mental</p>
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
                            L'usuari (professional de la salut mental acreditat/da) reconeix i accepta que:
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
                        <h2 className="text-lg font-bold text-blue-900">5. Límits Ètics i Professionals</h2>
                        <div className="space-y-4">
                            <p className="text-slate-700 leading-relaxed">
                                L'ús de la plataforma està subjecte als següents límits ètics inquebrantables, alineats amb la normativa deontològica vigent:
                            </p>
                            <div className="grid gap-3">
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">PROHIBICIÓ DE DIAGNÒSTIC AUTOMATITZAT</h4>
                                    <p className="text-sm text-slate-600">
                                        Queda estrictament prohibit utilitzar les sortides de la IA com a diagnòstics clínics definitius. La IA és una eina de suport orientatiu; el diagnòstic és acte exclusiu del professional humà.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">DEURE D'EMERGÈNCIA</h4>
                                    <p className="text-sm text-slate-600">
                                        L'aplicació NO és un dispositiu d'emergència ni d'intervenció en crisi. En situacions de risc imminent de suïcidi o dany a tercers, el professional ha d'actuar segons els protocols d'emergència convencionals, sense dependre del processament de l'eina.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">TRANSPARÈNCIA AMB EL PACIENT</h4>
                                    <p className="text-sm text-slate-600">
                                        És obligació ètica del professional informar el pacient sobre l'ús d'eines tecnològiques de suport durant la sessió i garantir que aquest ús no interfereix en la qualitat de l'aliança terapèutica.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">6. Política d'Ús Raonable (Fair Use Policy)</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Per garantir l'estabilitat del sistema i la qualitat del servei per a tots els usuaris, els plans amb característiques "Ilimitades" estan subjectes als següents topalls de seguretat mensual:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Pacients Actius</span>
                                <span className="text-lg font-bold text-slate-800">5.000</span>
                                <span className="text-xs text-slate-500 ml-1">expedients</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Transcripció IA</span>
                                <span className="text-lg font-bold text-slate-800">300</span>
                                <span className="text-xs text-slate-500 ml-1">hores/mes</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Generació Informes</span>
                                <span className="text-lg font-bold text-slate-800">3.000</span>
                                <span className="text-xs text-slate-500 ml-1">informes/mes</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">Simulador Clínic</span>
                                <span className="text-lg font-bold text-slate-800">500</span>
                                <span className="text-xs text-slate-500 ml-1">casos/mes</span>
                            </div>
                        </div>
                        <p className="text-xs text-red-700 mt-2 italic">
                            * L'ús per sobre d'aquests límits es considera abusiu i pot comportar la suspensió temporal del compte o contacte per part de suport.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">7. Plans de Subscripció i Característiques</h2>
                        <p className="text-slate-700 leading-relaxed">
                            A continuació es detallen els plans disponibles i les seves característiques contractuals. Els preus poden estar subjectes a impostos aplicables.
                        </p>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3 text-sm my-4">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-800">
                                <strong>Política de Reinici Mensual:</strong> Totes les quotes incloses en els plans (minuts de transcripció, casos de simulador, etc.) es reinicien automàticament a l'inici de cada cicle de facturació mensual. <u>Els recursos no utilitzats durant el mes en curs no són acumulables per al mes següent.</u>
                            </p>
                        </div>

                        <div className="space-y-6 mt-4">
                            {/* DEMO PLAN - ADDED */}
                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🌱 Demo (Gratuït / Limitada)</span>
                                    <span className="text-base bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">Prova 14 dies</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Inclou:</h4>
                                        <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                                            <li><strong>3 Pacients Actius</strong> màxim.</li>
                                            <li><strong>30 Minuts Transcripció + IA</strong> (Prova).</li>
                                            <li><strong>5 Informes</strong> mensuals.</li>
                                            <li>Accés bàsic a la plataforma.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-slate-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> Limitacions:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li><strong>Sense Simulador Clínic</strong>.</li>
                                            <li>Caducitat automàtica als 14 dies.</li>
                                            <li>Sense sincronització de calendari.</li>
                                            <li>Sense suport personalitzat.</li>
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
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Inclou:</h4>
                                        <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                                            <li><strong>25 Pacients Actius</strong> totals.</li>
                                            <li><strong>10 Hores Transcripció</strong> (Literal).</li>
                                            <li><strong>Emmagatzematge 5GB</strong>.</li>
                                            <li>Gestió de Cites Bàsica.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-slate-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> No Inclou:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>Anàlisi IA Avançada (Resums, Emojis).</li>
                                            <li>Simulador Clínic.</li>
                                            <li>Google Calendar Sync.</li>
                                            <li>Suport Prioritari.</li>
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
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Inclou:</h4>
                                        <ul className="space-y-1 text-blue-900 list-disc pl-4 text-xs">
                                            <li><strong>Pacients Il·limitats</strong>.</li>
                                            <li><strong>15 Hores (900 min) IA Total</strong>.</li>
                                            <li><strong>Google Calendar Sync</strong> (Bidireccional).</li>
                                            <li><strong>Anàlisi IA Avançada</strong> (Insights).</li>
                                            <li>Emmagatzematge 50GB.</li>
                                            <li>Simulador (5 casos/mes).</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-blue-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> No Inclou:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>Simulador Il·limitat.</li>
                                            <li>Branding Personalitzat (Logo).</li>
                                            <li>Videotrucada de Suport.</li>
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
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> Inclou:</h4>
                                        <ul className="space-y-1 text-purple-900 list-disc pl-4 text-xs">
                                            <li><strong>50 Hores (3.000 min) IA</strong>.</li>
                                            <li><strong>Simulador Il·limitat</strong>.</li>
                                            <li><strong>Branding Personalitzat</strong>.</li>
                                            <li><strong>Suport Prioritari + Videotrucada</strong>.</li>
                                            <li>Emmagatzematge 1TB.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-purple-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> No Inclou:</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>Gestió d'Equips (Multi-usuari).</li>
                                            <li>API / Integració HIS.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* CLINICS ONLY */}
                            <div className="grid md:grid-cols-1 gap-4">
                                <div className="p-5 bg-slate-100 rounded-lg border border-slate-300">
                                    <h3 className="font-bold text-slate-800 mb-2">🏥 Clinics</h3>
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Consultar</p>
                                    <div className="text-xs space-y-2">
                                        <div>
                                            <span className="font-bold text-green-700">✅ Inclou:</span>
                                            <ul className="list-disc pl-4 text-slate-700 mt-1">
                                                <li>Usuaris il·limitats.</li>
                                                <li>API / HIS & Compliance.</li>
                                                <li>SLA Garantitzat.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 pt-6">
                        <h3 className="font-bold text-slate-800">Serveis Addicionals (Extras)</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">👤 Agenda Manager</h4>
                                <p className="text-xs text-slate-500 mt-1">15€ / mes</p>
                                <p className="text-xs text-slate-600 mt-2">Usuari administratiu addicional per a gestió de cites. Sense accés a històries clíniques.</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">⚡ Pack Minutos IA</h4>
                                <p className="text-xs text-slate-500 mt-1">15€ / pack</p>
                                <p className="text-xs text-slate-600 mt-2">500 minuts addicionals de processament IA. Pagament únic, no caducan mentre la subscripció estigui activa.</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">🚀 Onboarding Assistit</h4>
                                <p className="text-xs text-slate-500 mt-1">50€ (pagament únic)</p>
                                <p className="text-xs text-slate-600 mt-2">Sessió de 45 min amb un especialista per a configuració inicial i importació de dades.</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">🎓 Pack Simulador</h4>
                                <p className="text-xs text-slate-500 mt-1">15€ / pack</p>
                                <p className="text-xs text-slate-600 mt-2">Pack de 10 casos clínics interactius addicionals per pràctica. Inclou feedback detallat de la IA.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">8. Limitació de Responsabilitat</h2>
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

                </CardContent >
            </Card >
        </div >
    );
}
