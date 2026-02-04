import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Scale, FileText, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

export function LegalJustificationContent() {
    const t = useTranslations('Legal.AIJustification');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <ShieldCheck className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">{t('title')}</h1>
                <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
                <div className="flex justify-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> {t('badges.auditable')}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> {t('badges.transparent')}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> {t('badges.supervised')}</span>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-8 bg-slate-100 p-1 h-auto">
                    <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <FileText className="h-4 w-4" />
                        {t('tabs.general')}
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen className="h-4 w-4" />
                        {t('tabs.compliance')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="animate-in fade-in-50 duration-300">
                    <Card className="border-blue-100 shadow-lg">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                <FileText className="h-5 w-5 text-blue-600" />
                                {t('General.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8 space-y-8">

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    {t('General.sections.nature.title')}
                                </h2>
                                <p className="text-slate-700 leading-relaxed pl-4 md:pl-8">
                                    {t.rich('General.sections.nature.text', {
                                        b: (chunks) => <strong>{chunks}</strong>
                                    })}
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    {t('General.sections.classification.title')}
                                </h2>
                                <p className="text-slate-700 leading-relaxed pl-4 md:pl-8">
                                    {t.rich('General.sections.classification.text', {
                                        b: (chunks) => <strong>{chunks}</strong>
                                    })}
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    {t('General.sections.humanControl.title')}
                                </h2>
                                <div className="pl-4 md:pl-8 grid md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t('General.sections.humanControl.outputs')}</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                            <li>{t('General.sections.humanControl.outputsList.0')}</li>
                                            <li>{t('General.sections.humanControl.outputsList.1')}</li>
                                            <li>{t('General.sections.humanControl.outputsList.2')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t('General.sections.humanControl.professionalControl')}</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                            <li>{t('General.sections.humanControl.controlList.0')}</li>
                                            <li>{t('General.sections.humanControl.controlList.1')}</li>
                                            <li>{t('General.sections.humanControl.controlList.2')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                    {t('General.sections.limitations.title')}
                                </h2>
                                <p className="text-slate-700 pl-4 md:pl-8">{t('General.sections.limitations.intro')}</p>
                                <ul className="list-disc pl-6 md:pl-12 text-slate-700 space-y-1">
                                    <li>{t('General.sections.limitations.list.0')}</li>
                                    <li>{t('General.sections.limitations.list.1')}</li>
                                    <li>{t('General.sections.limitations.list.2')}</li>
                                    <li>{t('General.sections.limitations.list.3')}</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                                    {t('General.sections.traceability.title')}
                                </h2>
                                <p className="text-slate-700 leading-relaxed pl-4 md:pl-8">
                                    {t.rich('General.sections.traceability.text', { code: (chunks) => <code>{chunks}</code> })}
                                </p>
                                <ul className="list-disc pl-6 md:pl-12 text-slate-700 space-y-1">
                                    <li>{t('General.sections.traceability.list.0')}</li>
                                    <li>{t('General.sections.traceability.list.1')}</li>
                                    <li>{t('General.sections.traceability.list.2')}</li>
                                </ul>
                                <p className="text-slate-700 pl-4 md:pl-8 mt-2 italic">{t('General.sections.traceability.footer')}</p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
                                    {t('General.sections.minors.title')}
                                </h2>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 ml-4 md:ml-8">
                                    <p className="text-slate-700 mb-2">{t('General.sections.minors.intro')}</p>
                                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                        <li>{t('General.sections.minors.list.0')}</li>
                                        <li>{t('General.sections.minors.list.1')}</li>
                                        <li>{t('General.sections.minors.list.2')}</li>
                                        <li>{t('General.sections.minors.list.3')}</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
                                    {t('General.sections.compliance.title')}
                                </h2>
                                <div className="pl-4 md:pl-8 grid gap-4">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100">
                                            <Scale className="h-5 w-5 text-green-700" />
                                            <span className="text-green-900 font-medium">{t(`General.sections.compliance.items.${i}`)}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="animate-in fade-in-50 duration-300">
                    <Card className="border-slate-200 shadow-lg print:shadow-none print:border-none">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                            <CardTitle className="text-xl flex flex-col gap-2 text-slate-900">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">{t('Compliance.title')}</span>
                                <span>{t('Compliance.subtitle')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8 space-y-8 text-justify leading-relaxed text-slate-800">

                            {/* 1. Object */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                    {t('Compliance.sections.object.title')}
                                </h3>
                                <p className="mb-4">
                                    {t.rich('Compliance.sections.object.text1', { b: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                                <p className="mb-2 text-sm text-slate-700 font-semibold">{t('Compliance.sections.object.text2')}</p>
                                <ul className="list-disc pl-6 space-y-1 mb-4 text-slate-700">
                                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                                        <li key={i}>{t(`Compliance.sections.object.list.${i}`)}</li>
                                    ))}
                                </ul>
                                <p className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 text-blue-900 leading-relaxed">
                                    {t.rich('Compliance.sections.object.alert', { b: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 2. Framework */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                    {t('Compliance.sections.framework.title')}
                                </h3>
                                <p className="mb-4">{t('Compliance.sections.framework.intro')}</p>
                                <ul className="space-y-2">
                                    {[0, 1, 2, 3].map(i => (
                                        <li key={i} className="flex items-start gap-2">
                                            <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <span>{t(`Compliance.sections.framework.list.${i}`)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 3. Description */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                    {t('Compliance.sections.description.title')}
                                </h3>
                                <p className="mb-4">{t('Compliance.sections.description.text')}</p>
                                <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700">
                                    {[0, 1, 2].map(i => (
                                        <li key={i}>{t(`Compliance.sections.description.list1.${i}`)}</li>
                                    ))}
                                </ul>
                                <p className="font-semibold mb-2">{t('Compliance.sections.description.featuresTitle')}</p>
                                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <li key={i} className={`flex items-center gap-2 p-2 bg-slate-50 rounded ${i === 4 ? 'col-span-2' : ''}`}>
                                            <CheckCircle2 className="h-4 w-4 text-green-600" /> {t(`Compliance.sections.description.featuresList.${i}`)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 4. Risk */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                                    {t('Compliance.sections.risk.title')}
                                </h3>
                                <p className="mb-4">
                                    {t.rich('Compliance.sections.risk.text', { b: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                                <p className="mb-2">{t('Compliance.sections.risk.intro')}</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <li key={i}>{t(`Compliance.sections.risk.list.${i}`)}</li>
                                    ))}
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 5. Supervision */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
                                    {t('Compliance.sections.supervision.title')}
                                </h3>
                                <div className="space-y-6">
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-amber-900 mb-2">{t('Compliance.sections.supervision.sub1.title')}</h4>
                                        <p className="text-amber-800 mb-2">{t('Compliance.sections.supervision.sub1.text')}</p>
                                        <ul className="list-disc pl-6 space-y-1 text-amber-900 list-inside">
                                            {[0, 1, 2].map(i => (
                                                <li key={i}>{t(`Compliance.sections.supervision.sub1.list.${i}`)}</li>
                                            ))}
                                        </ul>
                                        <p className="mt-4 text-sm text-amber-900 italic">
                                            {t('Compliance.sections.supervision.sub1.note')}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">{t('Compliance.sections.supervision.sub2.title')}</h4>
                                        <p className="mb-2">{t('Compliance.sections.supervision.sub2.text1')}</p>
                                        <p className="font-medium text-slate-700">{t('Compliance.sections.supervision.sub2.text2')}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 6. GDPR */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">6</span>
                                    {t('Compliance.sections.gdpr.title')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">{t('Compliance.sections.gdpr.sub1.title')}</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>{t('Compliance.sections.gdpr.sub1.list.0')}</li>
                                            <li>{t('Compliance.sections.gdpr.sub1.list.1')}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">{t('Compliance.sections.gdpr.sub2.title')}</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>{t('Compliance.sections.gdpr.sub2.list.0')}</li>
                                            <li>{t('Compliance.sections.gdpr.sub2.list.1')}</li>
                                            <li>{t('Compliance.sections.gdpr.sub2.list.2')}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">{t('Compliance.sections.gdpr.sub3.title')}</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700">
                                            <li>{t('Compliance.sections.gdpr.sub3.list.0')}</li>
                                            <li>{t('Compliance.sections.gdpr.sub3.list.1')}</li>
                                            <li>{t('Compliance.sections.gdpr.sub3.list.2')}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">{t('Compliance.sections.gdpr.sub4.title')}</h4>
                                        <p className="text-sm text-slate-700">{t('Compliance.sections.gdpr.sub4.text')}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 7. Transparency */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">7</span>
                                    {t('Compliance.sections.transparency.title')}
                                </h3>
                                <p className="mb-4">{t('Compliance.sections.transparency.text')}</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                                    {[0, 1, 2].map(i => (
                                        <li key={i}>{t(`Compliance.sections.transparency.list.${i}`)}</li>
                                    ))}
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 8. Ethics */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">8</span>
                                    {t('Compliance.sections.ethics.title')}
                                </h3>
                                <div className="space-y-4">
                                    <p>{t('Compliance.sections.ethics.text')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700 font-medium">{t(`Compliance.sections.ethics.tags.${i}`)}</span>
                                        ))}
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <p className="font-semibold text-red-900 mb-2">{t('Compliance.sections.ethics.avoidTitle')}</p>
                                        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-6 text-red-800">
                                            {[0, 1, 2, 3].map(i => (
                                                <li key={i}>{t(`Compliance.sections.ethics.avoidList.${i}`)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 9. Forensic */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">9</span>
                                    {t('Compliance.sections.forensic.title')}
                                </h3>
                                <p className="mb-4 text-slate-700">
                                    {t.rich('Compliance.sections.forensic.text', { b: (chunks) => <strong>{chunks}</strong> })}
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <li key={i}>{t(`Compliance.sections.forensic.list.${i}`)}</li>
                                    ))}
                                </ul>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 10. Traceability & 11. Limitations */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">10</span>
                                        {t('Compliance.sections.traceability_control.title')}
                                    </h3>
                                    <p className="mb-2">{t('Compliance.sections.traceability_control.text')}</p>
                                    <ul className="list-disc pl-6 space-y-1 text-slate-700 text-sm">
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <li key={i}>{t(`Compliance.sections.traceability_control.list.${i}`)}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">11</span>
                                        {t('Compliance.sections.limitations.title')}
                                    </h3>
                                    <ul className="list-disc pl-6 space-y-1 text-slate-700 text-sm">
                                        {[0, 1, 2].map(i => (
                                            <li key={i}>{t(`Compliance.sections.limitations.list.${i}`)}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* 12. Declaration */}
                            <div className="bg-slate-900 text-slate-50 p-6 rounded-xl mt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">12</span>
                                    {t('Compliance.sections.declaration.title')}
                                </h3>
                                <p className="leading-relaxed text-slate-300">
                                    {t('Compliance.sections.declaration.text')}
                                </p>
                            </div>

                            <p className="text-center text-sm text-slate-500 italic mt-8 pt-8 border-t">
                                {t('Compliance.sections.footer')}
                            </p>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
