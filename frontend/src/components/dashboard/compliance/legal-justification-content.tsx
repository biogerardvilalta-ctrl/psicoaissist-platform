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
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Documentació Legal i Normativa</h1>
                <p className="text-lg text-muted-foreground">AI Act Ready • GDPR Compliant • Ètica Professional</p>
                <div className="flex justify-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Auditabil</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Transparent</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> Supervisat</span>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1">
                    <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <FileText className="h-4 w-4" />
                        Justificació General
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen className="h-4 w-4" />
                        Document de Compliment Normatiu
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="animate-in fade-in-50 duration-300">
                    <Card className="border-blue-100 shadow-lg">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Sistema d’IA de suport orientatiu en context de salut mental
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
                </TabsContent>

                <TabsContent value="compliance" className="animate-in fade-in-50 duration-300">
                    <Card className="border-slate-200 shadow-lg print:shadow-none print:border-none">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                            <CardTitle className="text-xl flex flex-col gap-2 text-slate-900">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Document de Compliment Normatiu</span>
                                <span>Sistema d’intel·ligència artificial per a la generació d’informes professionals</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 text-justify leading-relaxed text-slate-800">

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                    Objecte del document
                                </h3>
                                <p className="mb-4">
                                    Aquest document té per objecte descriure i acreditar el compliment normatiu, tècnic i ètic del sistema d’intel·ligència artificial (d’ara endavant, <strong>el sistema</strong>) utilitzat exclusivament com a eina de suport a la redacció d’informes professionals en l’àmbit de la salut mental.
                                </p>
                                <p className="mb-2 text-sm text-slate-700 font-semibold">Els tipus d’informe coberts pel sistema són:</p>
                                <ul className="list-disc pl-6 space-y-1 mb-4 text-slate-700">
                                    <li>Informe d’avaluació inicial</li>
                                    <li>Informe d’evolució</li>
                                    <li>Informe d’alta clínica</li>
                                    <li>Informe de derivació</li>
                                    <li>Informe legal-forense</li>
                                    <li>Informe per a asseguradores</li>
                                    <li>Informe personalitzat</li>
                                </ul>
                                <p className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 text-blue-900 leading-relaxed">
                                    El sistema <strong>no adopta decisions automatitzades</strong>, <strong>no emet diagnòstics clínics</strong>, <strong>no estableix causalitats</strong> ni <strong>substitueix el judici professional</strong>, i opera sota <strong>supervisió humana obligatòria</strong> en totes les fases.
                                </p>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                    Marc normatiu aplicable
                                </h3>
                                <p className="mb-4">El disseny, desenvolupament i ús del sistema s’ajusta al marc normatiu següent:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Reglament (UE) 2016/679, de 27 d’abril de 2016 (Reglament General de Protecció de Dades – GDPR).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Reglament Europeu d’Intel·ligència Artificial (Artificial Intelligence Act – AI Act).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Normativa professional i deontològica aplicable a l’exercici professional.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Principis ètics relatius a l’ús d’eines tecnològiques en l’elaboració d’informes professionals.</span>
                                    </li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                    Descripció general del sistema
                                </h3>
                                <p className="mb-4">
                                    El sistema és una eina d’assistència a la redacció basada en intel·ligència artificial que genera esborranys estructurats d’informes a partir de:
                                </p>
                                <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700">
                                    <li>Transcripcions de sessions.</li>
                                    <li>Notes clíniques redactades pel professional.</li>
                                    <li>Paràmetres explícits definits pel/la professional (tipus d’informe, estructura, perfil lingüístic).</li>
                                </ul>
                                <p className="font-semibold mb-2">Característiques principals:</p>
                                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Funció estrictament assistencial i redactora.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Absència total de capacitat decisòria autònoma.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Dependència exclusiva de les dades proporcionades.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded"><CheckCircle2 className="h-4 w-4 text-green-600" /> Prohibició explícita de generar contingut no fonamentat.</li>
                                    <li className="flex items-center gap-2 p-2 bg-slate-50 rounded col-span-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Resultats de caràcter orientatiu i no vinculant.</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                                    Classificació del risc segons el Reglament d’IA
                                </h3>
                                <p className="mb-4">
                                    Atesa la naturalesa dels informes generats i el seu possible impacte sobre drets i interessos de persones físiques, el sistema es classifica com a <strong>sistema d’IA d’alt risc</strong> segons el Reglament Europeu d’Intel·ligència Artificial.
                                </p>
                                <p className="mb-2">En conseqüència, el sistema incorpora les garanties exigides per a aquesta categoria, incloent:</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                                    <li>Supervisió humana efectiva i documentada.</li>
                                    <li>Transparència en l’ús d’IA.</li>
                                    <li>Traçabilitat completa del procés de generació.</li>
                                    <li>Mesures tècniques de prevenció d’errors, biaixos i usos indeguts.</li>
                                    <li>Controls reforçats per a usos especialment sensibles (informes legal-forenses).</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
                                    Supervisió humana i responsabilitat professional
                                </h3>
                                <div className="space-y-6">
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-amber-900 mb-2">5.1. Supervisió obligatòria</h4>
                                        <p className="text-amber-800 mb-2">Tots els informes generats amb suport del sistema requereixen obligatòriament:</p>
                                        <ul className="list-disc pl-6 space-y-1 text-amber-900 list-inside">
                                            <li>Revisió íntegra del contingut per part d’un/a professional qualificat/da.</li>
                                            <li>Validació expressa abans de qualsevol ús extern o comunicació a tercers.</li>
                                            <li>Confirmació explícita de revisió humana abans de marcar un informe com a finalitzat.</li>
                                        </ul>
                                        <p className="mt-4 text-sm text-amber-900 italic">
                                            En el cas dels informes legal-forenses, s’aplica un mode de supervisió reforçada, que impedeix la finalització de l’informe sense una validació humana específica.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">5.2. Responsabilitat</h4>
                                        <p className="mb-2">La responsabilitat del contingut final de l’informe recau exclusivament en el/la professional que el revisa, valida i signa.</p>
                                        <p className="font-medium text-slate-700">El sistema no pot ser considerat autor, coautor ni responsable del contingut de cap informe.</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">6</span>
                                    Compliment del Reglament General de Protecció de Dades (GDPR)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.1. Base jurídica</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>Consentiment informat, explícit i verificable de la persona interessada.</li>
                                            <li>Compliment d’obligacions professionals i legals.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.2. Minimització</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>Només dades estrictament necessàries.</li>
                                            <li>No es requereixen identificadors personals innecessaris.</li>
                                            <li>El sistema no infereix dades addicionals.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.3. Tractament de dades especials</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>Mesures de seguretat tècniques reforçades (xifratge, control d’accés).</li>
                                            <li>Dades no utilitzades per entrenar models d’IA.</li>
                                            <li>Conservació limitada al temps necessari.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">6.4. Exercici de drets</h4>
                                        <p className="text-sm text-slate-700">Es garanteix l’exercici dels drets d’accés, rectificació, supressió, limitació del tractament i informació sobre l’ús d’IA.</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">7</span>
                                    Transparència i informació a les persones interessades
                                </h3>
                                <p className="mb-4">Tots els informes generats incorporen una declaració explícita indicant:</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                                    <li>Que han estat redactats amb el suport d’una eina d’intel·ligència artificial.</li>
                                    <li>Que el contingut no és resultat d’una decisió automatitzada.</li>
                                    <li>Que l’informe ha estat revisat i validat per un/a professional responsable.</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">8</span>
                                    Principis ètics aplicats
                                </h3>
                                <div className="space-y-4">
                                    <p>El disseny i ús del sistema respecta els principis següents:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['No maleficència', 'Prudència interpretativa', 'Absència d’estigmatització', 'Respecte a la dignitat', 'Proporcionalitat i adequació al context'].map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700 font-medium">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <p className="font-semibold text-red-900 mb-2">El sistema evita expressament:</p>
                                        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-6 text-red-800">
                                            <li>Diagnòstics automàtics.</li>
                                            <li>Etiquetatges personals.</li>
                                            <li>Prediccions de conducta o evolució futura.</li>
                                            <li>Afirmacions causals no fonamentades.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">9</span>
                                    Controls específics per a informes legal-forenses
                                </h3>
                                <p className="mb-4 text-slate-700">
                                    Els informes legal-forenses estan subjectes a un mode de seguretat reforçat (<strong>Safe Forensic Mode</strong>) que inclou:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                                    <li>Prohibició tècnica d’afirmacions categòriques o causals.</li>
                                    <li>Obligació de diferenciació explícita entre fets observats i manifestacions del/la pacient.</li>
                                    <li>Llenguatge condicional i estrictament descriptiu.</li>
                                    <li>Validacions automàtiques del contingut abans de permetre la finalització.</li>
                                    <li>Confirmació expressa de revisió humana reforçada.</li>
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">10</span>
                                        Traçabilitat i control
                                    </h3>
                                    <p className="mb-2">El sistema manté registres interns auditable sobre:</p>
                                    <ul className="list-disc pl-6 space-y-1 text-slate-700 text-sm">
                                        <li>Data i hora de generació de cada esborrany.</li>
                                        <li>Tipus d’informe.</li>
                                        <li>Versió del sistema i del model d’IA utilitzat.</li>
                                        <li>Identitat del/la professional responsable.</li>
                                        <li>Confirmació de revisió humana.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">11</span>
                                        Limitacions del sistema
                                    </h3>
                                    <ul className="list-disc pl-6 space-y-1 text-slate-700 text-sm">
                                        <li>El sistema no substitueix l’avaluació ni el criteri professional.</li>
                                        <li>Els informes generats tenen caràcter orientatiu fins a la seva validació.</li>
                                        <li>L’ús fora del context professional o sense supervisió humana constitueix un ús indegut.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-slate-50 p-6 rounded-xl mt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">12</span>
                                    Declaració final de compliment
                                </h3>
                                <p className="leading-relaxed text-slate-300">
                                    El sistema d’intel·ligència artificial descrit en aquest document ha estat dissenyat i implementat conforme als requisits legals, tècnics i ètics exigibles segons la normativa europea vigent, i incorpora garanties específiques per a un ús responsable, transparent, traçable i sota control humà efectiu.
                                </p>
                            </div>

                            <p className="text-center text-sm text-slate-500 italic mt-8 pt-8 border-t">
                                *Document elaborat a efectes de justificació de compliment normatiu davant d’autoritats competents, auditories internes o externes i processos d’inspecció.*
                            </p>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
