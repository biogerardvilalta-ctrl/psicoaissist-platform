import { Link } from '@/navigation';
import { ArrowLeft, Book, AlertCircle, Play, Mic, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ManualPage() {
    const t = useTranslations('Docs.Manual');

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/docs" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('back')}
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Book className="h-8 w-8 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">{t('officialDocs')}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('title')}</h1>
                    <p className="text-xl text-slate-600 max-w-2xl">{t('subtitle')}</p>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar / Index */}
                    <div className="hidden lg:block col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <h3 className="font-semibold text-slate-900 uppercase text-sm tracking-wider">{t('index.title')}</h3>
                            <nav className="flex flex-col space-y-2 text-sm text-slate-600">
                                <a href="#intro" className="hover:text-blue-600 transition-colors">{t('index.items.intro')}</a>
                                <a href="#roles" className="hover:text-blue-600 transition-colors">{t('index.items.roles')}</a>
                                <a href="#plans" className="hover:text-blue-600 transition-colors">{t('index.items.plans')}</a>
                                <a href="#steps" className="hover:text-blue-600 transition-colors">{t('index.items.steps')}</a>
                                <a href="#dashboard" className="hover:text-blue-600 transition-colors">{t('index.items.dashboard')}</a>
                                <a href="#features" className="hover:text-blue-600 transition-colors">{t('index.items.features')}</a>
                                <a href="#export" className="hover:text-blue-600 transition-colors">{t('index.items.export')}</a>
                                <a href="#settings" className="hover:text-blue-600 transition-colors">{t('index.items.settings')}</a>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-1 lg:col-span-3 prose prose-slate max-w-none">

                        {/* 1. Introducción */}
                        <section id="intro" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('intro.title')}</h2>
                            <p className="text-lg leading-relaxed text-slate-600 mb-6">
                                {t('intro.text')}
                            </p>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('intro.capabilities.title')}</h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-blue-700 mb-2">{t('intro.capabilities.ai.title')}</h4>
                                        <ul className="text-sm space-y-2 text-slate-600">
                                            {['0', '1', '2', '3'].map((item) => (
                                                <li key={item} dangerouslySetInnerHTML={{ __html: t.raw(`intro.capabilities.ai.list.${item}`) }} />
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-700 mb-2">{t('intro.capabilities.management.title')}</h4>
                                        <ul className="text-sm space-y-2 text-slate-600">
                                            {['0', '1', '2'].map((item) => (
                                                <li key={item} dangerouslySetInnerHTML={{ __html: t.raw(`intro.capabilities.management.list.${item}`) }} />
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-700 mb-2">{t('intro.capabilities.agenda.title')}</h4>
                                        <ul className="text-sm space-y-2 text-slate-600">
                                            {['0', '1', '2'].map((item) => (
                                                <li key={item} dangerouslySetInnerHTML={{ __html: t.raw(`intro.capabilities.agenda.list.${item}`) }} />
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-700 mb-2">{t('intro.capabilities.extras.title')}</h4>
                                        <ul className="text-sm space-y-2 text-slate-600">
                                            {['0', '1', '2'].map((item) => (
                                                <li key={item} dangerouslySetInnerHTML={{ __html: t.raw(`intro.capabilities.extras.list.${item}`) }} />
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Roles de Usuario */}
                        <section id="roles" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('roles.title')}</h2>
                            <p className="mb-6">{t('roles.text')}</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                    <h3 className="font-bold text-blue-900 text-lg mb-2">👤 {t('roles.professional.title')}</h3>
                                    <p className="text-sm text-blue-800 mb-4">{t('roles.professional.desc')}</p>
                                    <ul className="space-y-2">
                                        {['0', '1', '2'].map(i => <li key={i} className="flex items-center text-sm text-blue-700"><CheckCircle2 className="h-4 w-4 mr-2" />{t(`roles.professional.list.${i}`)}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">📅 {t('roles.manager.title')}</h3>
                                    <p className="text-sm text-slate-700 mb-4">{t('roles.manager.desc')}</p>
                                    <ul className="space-y-2">
                                        {['0', '1', '2'].map(i => <li key={i} className="flex items-center text-sm text-slate-600">{t(`roles.manager.list.${i}`)}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 3. Planes y Suscripciones */}
                        <section id="plans" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('plans.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t.raw('plans.text') }} />
                            <p className="mt-2" dangerouslySetInnerHTML={{ __html: t.raw('plans.languages') }} />

                            <div className="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                                <h4 className="font-bold text-yellow-800">{t('plans.resetPolicy.title')}</h4>
                                <p className="text-sm text-yellow-700 mt-1">{t('plans.resetPolicy.text')}</p>
                                <p className="text-xs text-yellow-600 mt-2 italic">{t('plans.resetPolicy.note')}</p>
                            </div>

                            <h3 className="font-bold text-lg mt-6 text-slate-800 block">{t('plans.individual.title')} (Demo, Basic, Pro, Premium)</h3>
                            <h3 className="font-bold text-lg mt-6 text-slate-800 block">{t('plans.group.title')} (Clinics/Centers)</h3>
                            <h3 className="font-bold text-lg mt-6 text-slate-800 block">{t('plans.extras.title')} (Agenda, Packs extra)</h3>

                            <div className="my-6 p-4 bg-pink-50 rounded-lg border border-pink-100">
                                <h4 className="font-bold text-pink-800 mb-2">{t('plans.fairUse.title')}</h4>
                                <p className="text-sm text-pink-700 mb-2">
                                    {t('plans.fairUse.text')}
                                </p>
                                <p className="text-xs text-pink-600 italic">
                                    {t('plans.fairUse.warning')}
                                </p>
                            </div>
                        </section>

                        {/* 4. Primeros Pasos */}
                        <section id="steps" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('steps.title')}</h2>
                            <ol className="list-decimal pl-5 space-y-6 marker:font-bold marker:text-slate-400">
                                <li>
                                    <strong>{t('steps.access.title')}:</strong> {t('steps.access.text')}
                                </li>
                                <li>
                                    <strong>{t('steps.config.title')}:</strong> {t('steps.config.text')}
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                                        {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`steps.config.list.${i}`) }} />)}
                                    </ul>
                                </li>
                            </ol>
                        </section>

                        {/* 5. Dashboard */}
                        <section id="dashboard" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('dashboard.title')}</h2>
                            <p>{t('dashboard.text')}</p>

                            <h3 className="font-bold text-lg mt-4 text-slate-800 block">{t('dashboard.professional.title')}</h3>
                            <p>{t('dashboard.professional.text')}</p>
                            <p className="mt-2 text-sm text-slate-500">{t('dashboard.professional.widgets')}</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-slate-600">
                                {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`dashboard.professional.list.${i}`) }} />)}
                            </ul>
                            <p className="text-xs text-slate-400 mt-2" dangerouslySetInnerHTML={{ __html: t.raw('dashboard.professional.note') }} />

                            <h3 className="font-bold text-lg mt-6 text-slate-800 block">{t('dashboard.manager.title')}</h3>
                            <p>{t('dashboard.manager.text')}</p>
                        </section>

                        {/* 6. Funcionalidades */}
                        <section id="features" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('features.title')}</h2>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block flex items-center gap-2">
                                <div className="p-1 bg-green-100 rounded text-green-700"><CheckCircle2 className="h-5 w-5" /></div>
                                {t('features.patients.title')}
                            </h3>
                            <p>{t('features.patients.text')}</p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block flex items-center gap-2">
                                <div className="p-1 bg-purple-100 rounded text-purple-700"><Mic className="h-5 w-5" /></div>
                                {t('features.sessions.title')}
                            </h3>
                            <p className="mb-4">{t('features.sessions.text')}</p>

                            <div className="space-y-4 border-l-2 border-slate-200 pl-4">
                                <h4 className="font-bold text-slate-700">{t('features.sessions.flow.title')}</h4>
                                <div className="space-y-4">
                                    <div>
                                        <span className="font-bold text-slate-900">{t('features.sessions.flow.step1.title')}</span>
                                        <p className="text-sm text-slate-600">{t('features.sessions.flow.step1.text')}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900">{t('features.sessions.flow.step2.title')}</span>
                                        <p className="text-sm text-slate-600">{t('features.sessions.flow.step2.text')}</p>
                                        <ul className="list-disc pl-5 text-sm text-slate-500 mt-1">
                                            {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`features.sessions.flow.step2.list.${i}`) }} />)}
                                        </ul>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900">{t('features.sessions.flow.step3.title')}</span>
                                        <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: t.raw('features.sessions.flow.step3.text') }} />
                                        <p className="text-xs text-slate-400 italic mt-1">{t('features.sessions.flow.step3.note')}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900">{t('features.sessions.flow.step4.title')}</span>
                                        <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: t.raw('features.sessions.flow.step4.text') }} />
                                        <ul className="list-disc pl-5 text-sm text-slate-500 mt-1">
                                            {['0', '1', '2'].map(i => <li key={i}>{t(`features.sessions.flow.step4.list.${i}`)}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 text-sm bg-slate-100 p-3 rounded text-slate-600">
                                ℹ️ {t('features.sessions.cancelNote')}
                            </p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block flex items-center gap-2">
                                <div className="p-1 bg-red-100 rounded text-red-700"><Play className="h-5 w-5" /></div>
                                {t('features.video.title')}
                            </h3>
                            <p className="mb-4">{t('features.video.text')}</p>
                            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                                <li><strong dangerouslySetInnerHTML={{ __html: t.raw('features.video.step1.title') }} /> - {t('features.video.step1.text')}</li>
                                <li><strong dangerouslySetInnerHTML={{ __html: t.raw('features.video.step2.title') }} /> - {t('features.video.step2.text')}</li>
                                <li><strong dangerouslySetInnerHTML={{ __html: t.raw('features.video.step3.title') }} /> - {t('features.video.step3.text')}</li>
                            </ol>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🧠 {t('features.ai.title')}</h3>
                            <p className="mb-4">{t('features.ai.text')}</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg bg-white shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-1">{t('features.ai.types.summary.title')}</h4>
                                    <p className="text-sm text-slate-600">{t('features.ai.types.summary.text')}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-white shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-1">{t('features.ai.types.emotional.title')}</h4>
                                    <p className="text-sm text-slate-600">{t('features.ai.types.emotional.text')}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-white shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-1">{t('features.ai.types.themes.title')}</h4>
                                    <p className="text-sm text-slate-600">{t('features.ai.types.themes.text')}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-white shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-1">{t('features.ai.types.tests.title')}</h4>
                                    <p className="text-sm text-slate-600">{t('features.ai.types.tests.text')}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-red-50 border-red-100 shadow-sm col-span-2">
                                    <h4 className="font-bold text-red-900 mb-1">{t('features.ai.types.risks.title')}</h4>
                                    <p className="text-sm text-red-800">{t('features.ai.types.risks.text')}</p>
                                </div>
                            </div>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🎭 {t('features.simulator.title')}</h3>
                            <p className="mb-2">{t('features.simulator.text')}</p>
                            <div className="bg-slate-100 p-3 rounded text-sm">
                                <span className="font-semibold block mb-1">{t('features.simulator.availability.title')}</span>
                                <ul className="list-disc pl-5">
                                    {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`features.simulator.availability.list.${i}`) }} />)}
                                </ul>
                            </div>
                        </section>

                        {/* 7. Privacidad */}
                        <section id="export" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('export.title')}</h2>
                            <p className="mb-6">{t('export.text')}</p>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="p-2 bg-green-100 rounded text-green-700 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sheet"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="9" y2="21" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{t('export.csv.title')}</h3>
                                        <p className="text-slate-600 mb-2">{t('export.csv.text')}</p>
                                        <ul className="text-sm text-slate-500 space-y-1">
                                            {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`export.csv.list.${i}`) }} />)}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="p-2 bg-red-100 rounded text-red-700 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{t('export.pdf.title')}</h3>
                                        <p className="text-slate-600 mb-2">{t('export.pdf.text')}</p>
                                        <ul className="text-sm text-slate-500 space-y-1">
                                            {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`export.pdf.list.${i}`) }} />)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Configuración */}
                        <section id="settings" className="mb-16 scroll-mt-20 border-t pt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('settings.title')}</h2>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">📅 {t('settings.agenda.title')}</h3>
                            <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`settings.agenda.list.${i}`) }} />)}
                            </ul>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🔗 {t('settings.google.title')}</h3>
                            <p>{t('settings.google.text')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-700">
                                {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`settings.google.list.${i}`) }} />)}
                            </ul>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🎨 {t('settings.branding.title')}</h3>
                            <p>{t('settings.branding.text')}</p>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-700">
                                {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`settings.branding.list.${i}`) }} />)}
                            </ul>
                            <p className="text-sm text-slate-500 mt-2"><i>{t('settings.branding.note')}</i></p>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🤖 {t('settings.ai.title')}</h3>
                            <p dangerouslySetInnerHTML={{ __html: t.raw('settings.ai.text') }} />

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🔔 {t('settings.notifications.title')}</h3>
                            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                                {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`settings.notifications.list.${i}`) }} />)}
                            </ul>

                            <h3 className="mt-8 mb-3 text-xl font-bold text-slate-800 block">🛑 {t('settings.account.title')}</h3>
                            <p className="leading-relaxed text-slate-600 mb-4" dangerouslySetInnerHTML={{ __html: t.raw('settings.account.text') }} />
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                                <h4 className="font-bold text-amber-900 mb-2">{t('settings.account.process.title')}</h4>
                                <ul className="list-disc pl-5 space-y-2 text-amber-800 text-sm">
                                    {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`settings.account.process.list.${i}`) }} />)}
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
