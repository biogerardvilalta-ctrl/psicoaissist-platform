import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Users, Gavel, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TermsContent() {
    const t = useTranslations('Legal.Terms');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Scale className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">{t('title')}</h1>
                <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <Users className="h-5 w-5 text-blue-600" />
                        {t('cardTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.nature.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t.rich('sections.nature.text', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 font-medium">
                                {t('sections.nature.warning')}
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.responsibility.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.responsibility.text')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>{t('sections.responsibility.list.1')}</li>
                            <li>{t('sections.responsibility.list.2')}</li>
                            <li>{t('sections.responsibility.list.3')}</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.ownership.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t.rich('sections.ownership.text', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.usage.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.usage.text')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.ethics.title')}</h2>
                        <div className="space-y-4">
                            <p className="text-slate-700 leading-relaxed">
                                {t('sections.ethics.intro')}
                            </p>
                            <div className="grid gap-3">
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{t('sections.ethics.alerts.diagnosis.title')}</h4>
                                    <p className="text-sm text-slate-600">
                                        {t('sections.ethics.alerts.diagnosis.text')}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{t('sections.ethics.alerts.emergency.title')}</h4>
                                    <p className="text-sm text-slate-600">
                                        {t('sections.ethics.alerts.emergency.text')}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{t('sections.ethics.alerts.transparency.title')}</h4>
                                    <p className="text-sm text-slate-600">
                                        {t('sections.ethics.alerts.transparency.text')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.fairUse.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.fairUse.text')}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">{t('sections.fairUse.stats.activePatients.label')}</span>
                                <span className="text-lg font-bold text-slate-800">5.000</span>
                                <span className="text-xs text-slate-500 ml-1">{t('sections.fairUse.stats.activePatients.unit')}</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">{t('sections.fairUse.stats.transcription.label')}</span>
                                <span className="text-lg font-bold text-slate-800">300</span>
                                <span className="text-xs text-slate-500 ml-1">{t('sections.fairUse.stats.transcription.unit')}</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">{t('sections.fairUse.stats.reports.label')}</span>
                                <span className="text-lg font-bold text-slate-800">3.000</span>
                                <span className="text-xs text-slate-500 ml-1">{t('sections.fairUse.stats.reports.unit')}</span>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <span className="block text-xs text-red-600 font-bold uppercase">{t('sections.fairUse.stats.simulator.label')}</span>
                                <span className="text-lg font-bold text-slate-800">500</span>
                                <span className="text-xs text-slate-500 ml-1">{t('sections.fairUse.stats.simulator.unit')}</span>
                                <span className="block text-[10px] text-slate-400 mt-1">{t('sections.fairUse.stats.simulator.note')}</span>
                            </div>
                        </div>
                        <p className="text-xs text-red-700 mt-2 italic">
                            {t('sections.fairUse.warning')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.plans.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.plans.intro')}
                        </p>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3 text-sm my-4">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-800">
                                {t.rich('sections.plans.policy', {
                                    b: (chunks) => <strong>{chunks}</strong>,
                                    u: (chunks) => <u>{chunks}</u>
                                })}
                            </p>
                        </div>

                        <div className="space-y-6 mt-4">
                            {/* DEMO PLAN */}
                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🌱 {t('sections.plans.items.demo.title')} ({t('sections.plans.items.demo.subtitle')})</span>
                                    <span className="text-base bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">{t('sections.plans.items.demo.badge')}</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> {t('sections.plans.items.demo.includes.title')}</h4>
                                        <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                                            <li><strong>{t('sections.plans.items.demo.includes.list.0')}</strong></li>
                                            <li><strong>{t('sections.plans.items.demo.includes.list.1')}</strong></li>
                                            <li><strong>{t('sections.plans.items.demo.includes.list.2')}</strong></li>
                                            <li>{t('sections.plans.items.demo.includes.list.3')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-slate-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> {t('sections.plans.items.demo.excludes.title')}</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li><strong>{t('sections.plans.items.demo.excludes.list.0')}</strong></li>
                                            <li>{t('sections.plans.items.demo.excludes.list.1')}</li>
                                            <li>{t('sections.plans.items.demo.excludes.list.2')}</li>
                                            <li>{t('sections.plans.items.demo.excludes.list.3')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* BASIC PLAN */}
                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🥉 {t('sections.plans.items.basic.title')}</span>
                                    <span className="text-base bg-slate-200 px-3 py-1 rounded-full">{t('sections.plans.items.basic.price')}</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> {t('sections.plans.items.demo.includes.title')}</h4>
                                        <ul className="space-y-1 text-slate-700 list-disc pl-4 text-xs">
                                            <li><strong>{t('sections.plans.items.basic.includes.list.0')}</strong></li>
                                            <li><strong>{t('sections.plans.items.basic.includes.list.1')}</strong></li>
                                            <li><strong>{t('sections.plans.items.basic.includes.list.2')}</strong></li>
                                            <li>{t('sections.plans.items.basic.includes.list.3')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-slate-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> {t('sections.plans.items.demo.excludes.title')}</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>{t('sections.plans.items.basic.excludes.list.0')}</li>
                                            <li>{t('sections.plans.items.basic.excludes.list.1')}</li>
                                            <li>{t('sections.plans.items.basic.excludes.list.2')}</li>
                                            <li>{t('sections.plans.items.basic.excludes.list.3')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* PRO PLAN */}
                            <div className="p-5 bg-blue-50 rounded-lg border border-blue-200 ring-1 ring-blue-500/20">
                                <h3 className="font-bold text-blue-900 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🥈 {t('sections.plans.items.pro.title')}</span>
                                    <span className="text-base bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{t('sections.plans.items.pro.price')}</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> {t('sections.plans.items.demo.includes.title')}</h4>
                                        <ul className="space-y-1 text-blue-900 list-disc pl-4 text-xs">
                                            <li><strong>{t('sections.plans.items.pro.includes.list.0')}</strong></li>
                                            <li><strong>{t('sections.plans.items.pro.includes.list.1')}</strong></li>
                                            <li><strong>{t('sections.plans.items.pro.includes.list.2')}</strong></li>
                                            <li><strong>{t('sections.plans.items.pro.includes.list.3')}</strong></li>
                                            <li>{t('sections.plans.items.pro.includes.list.4')}</li>
                                            <li>{t('sections.plans.items.pro.includes.list.5')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-blue-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> {t('sections.plans.items.demo.excludes.title')}</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>{t('sections.plans.items.pro.excludes.list.0')}</li>
                                            <li>{t('sections.plans.items.pro.excludes.list.1')}</li>
                                            <li>{t('sections.plans.items.pro.excludes.list.2')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* PREMIUM PLAN */}
                            <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                                <h3 className="font-bold text-purple-900 text-lg flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-2">🥇 {t('sections.plans.items.premium.title')}</span>
                                    <span className="text-base bg-purple-100 text-purple-800 px-3 py-1 rounded-full">{t('sections.plans.items.premium.price')}</span>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1"><span className="text-xs">✅</span> {t('sections.plans.items.demo.includes.title')}</h4>
                                        <ul className="space-y-1 text-purple-900 list-disc pl-4 text-xs">
                                            <li><strong>{t('sections.plans.items.premium.includes.list.0')}</strong></li>
                                            <li><strong>{t('sections.plans.items.premium.includes.list.1')}</strong></li>
                                            <li><strong>{t('sections.plans.items.premium.includes.list.2')}</strong></li>
                                            <li><strong>{t('sections.plans.items.premium.includes.list.3')}</strong></li>
                                            <li>{t('sections.plans.items.premium.includes.list.4')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded border border-purple-100">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1"><span className="text-xs">❌</span> {t('sections.plans.items.demo.excludes.title')}</h4>
                                        <ul className="space-y-1 text-slate-500 list-disc pl-4 text-xs">
                                            <li>{t('sections.plans.items.premium.excludes.list.0')}</li>
                                            <li>{t('sections.plans.items.premium.excludes.list.1')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* CLINICS PLAN */}
                            <div className="grid md:grid-cols-1 gap-4">
                                <div className="p-5 bg-slate-100 rounded-lg border border-slate-300">
                                    <h3 className="font-bold text-slate-800 mb-2">🏥 {t('sections.plans.items.clinics.title')}</h3>
                                    <p className="text-sm font-semibold text-slate-700 mb-3">{t('sections.plans.items.clinics.consult')}</p>
                                    <div className="text-xs space-y-2">
                                        <div>
                                            <span className="font-bold text-green-700">✅ {t('sections.plans.items.demo.includes.title')}</span>
                                            <ul className="list-disc pl-4 text-slate-700 mt-1">
                                                <li>{t('sections.plans.items.clinics.includes.0')}</li>
                                                <li>{t('sections.plans.items.clinics.includes.1')}</li>
                                                <li>{t('sections.plans.items.clinics.includes.2')}</li>
                                                <li>{t('sections.plans.items.clinics.includes.3')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 pt-6">
                        <h3 className="font-bold text-slate-800">{t('sections.plans.extras.title')}</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">👤 {t('sections.plans.extras.items.agenda.title')}</h4>
                                <p className="text-xs text-slate-500 mt-1">{t('sections.plans.extras.items.agenda.price')}</p>
                                <p className="text-xs text-slate-600 mt-2">{t('sections.plans.extras.items.agenda.desc')}</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">⚡ {t('sections.plans.extras.items.aiPack.title')}</h4>
                                <p className="text-xs text-slate-500 mt-1">{t('sections.plans.extras.items.aiPack.price')}</p>
                                <p className="text-xs text-slate-600 mt-2">{t('sections.plans.extras.items.aiPack.desc')}</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">🚀 {t('sections.plans.extras.items.onboarding.title')}</h4>
                                <p className="text-xs text-slate-500 mt-1">{t('sections.plans.extras.items.onboarding.price')}</p>
                                <p className="text-xs text-slate-600 mt-2">{t('sections.plans.extras.items.onboarding.desc')}</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-sm text-slate-900">🎓 {t('sections.plans.extras.items.simPack.title')}</h4>
                                <p className="text-xs text-slate-500 mt-1">{t('sections.plans.extras.items.simPack.price')}</p>
                                <p className="text-xs text-slate-600 mt-2">{t('sections.plans.extras.items.simPack.desc')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.liability.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.liability.text')}
                        </p>
                    </section>

                    <section className="space-y-3 pt-6 border-t font-medium text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Gavel className="h-4 w-4" />
                            <span>{t('sections.footer.text')}</span>
                        </div>
                    </section>

                </CardContent >
            </Card >
        </div >
    );
}

