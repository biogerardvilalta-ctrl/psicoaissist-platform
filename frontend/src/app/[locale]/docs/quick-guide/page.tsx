import { Link } from '@/navigation';
import { ArrowLeft, Zap, CheckCircle2, HelpCircle, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function QuickGuidePage() {
    const t = useTranslations('Docs.QuickGuide');

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/docs" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back')}
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-amber-100 font-medium">{t('cheatSheet')}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
                        <p className="text-amber-100 text-lg max-w-2xl">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="p-8 md:p-12">

                        {/* Quick Actions Grid */}
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">{t('agenda.title')}</h2>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">{t('agenda.create.title')}</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        {['0', '1', '2'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`agenda.create.steps.${i}`) }} />)}
                                        <li className="text-green-600 font-medium flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> {t('agenda.create.steps.3')}
                                        </li>
                                    </ol>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">{t('agenda.sync.title')}</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        {['0', '1', '2', '3'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`agenda.sync.steps.${i}`) }} />)}
                                    </ol>
                                    <p className="mt-2 text-xs text-slate-500 italic">
                                        {t('agenda.sync.note')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">{t('patients.title')}</h2>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">{t('patients.add.title')}</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        {['0', '1', '2', '3'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`patients.add.steps.${i}`) }} />)}
                                    </ol>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-lg mb-3 text-slate-800">{t('patients.dashboard.title')}</h3>
                                    <ol className="space-y-3 text-slate-600 list-decimal list-inside marker:text-amber-600 marker:font-bold">
                                        {['0', '1', '2', '3'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`patients.dashboard.steps.${i}`) }} />)}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Tips & Tricks Section (New) */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5" /> {t('tips.config.title')}
                                </h3>
                                <ul className="space-y-3 text-sm text-amber-800">
                                    {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`tips.config.list.${i}`) }} />)}
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> {t('tips.professional.title')}
                                </h3>
                                <ul className="space-y-3 text-sm text-blue-800">
                                    {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`tips.professional.list.${i}`) }} />)}
                                </ul>
                            </div>

                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                    <Users className="w-5 h-5" /> {t('tips.manager.title')}
                                </h3>
                                <ul className="space-y-3 text-sm text-purple-800">
                                    {['0', '1'].map(i => <li key={i} dangerouslySetInnerHTML={{ __html: t.raw(`tips.manager.list.${i}`) }} />)}
                                </ul>
                            </div>
                        </div>

                        {/* Troubleshooting Section */}
                        <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <HelpCircle className="w-6 h-6 text-slate-600" />
                                <h2 className="text-2xl font-bold text-slate-900">{t('troubleshooting.title')}</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">{t('troubleshooting.google.title')}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {t('troubleshooting.google.text')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">{t('troubleshooting.dashboard.title')}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {t('troubleshooting.dashboard.text')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
