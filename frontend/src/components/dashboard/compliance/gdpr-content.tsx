import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, UserCheck, Server, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function GdprContent() {
    const t = useTranslations('Legal.GDPR');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Lock className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">{t('title')}</h1>
                <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        {t('cardTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <p className="text-gray-600 mb-6">
                        {t.rich('update', { b: (chunks) => <strong>{chunks}</strong> })}
                    </p>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.controller.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t.rich('sections.controller.text', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.info.title')}</h2>
                        <h3 className="text-md font-semibold text-slate-800">{t('sections.info.sub1.title')}</h3>
                        <p className="text-slate-700 mb-2">
                            {t('sections.info.sub1.text')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
                            {[0, 1, 2, 3].map(i => (
                                <li key={i}>{t(`sections.info.sub1.list.${i}`)}</li>
                            ))}
                        </ul>

                        <h3 className="text-md font-semibold text-slate-800">{t('sections.info.sub2.title')}</h3>
                        <p className="text-slate-700 mb-2">
                            {t('sections.info.sub2.text')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            {[0, 1, 2, 3].map(i => (
                                <li key={i}>{t(`sections.info.sub2.list.${i}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.purpose.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.purpose.text')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            {[0, 1, 2, 3].map(i => (
                                <li key={i}>{t(`sections.purpose.list.${i}`)}</li>
                            ))}
                        </ul>
                        <p className="text-slate-700 mt-2">
                            {t.rich('sections.purpose.note', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.legal.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.legal.text')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            {[0, 1, 2, 3].map(i => (
                                <li key={i}>
                                    {t.rich(`sections.legal.list.${i}`, { b: (chunks) => <strong>{chunks}</strong> })}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.security.title')}</h2>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                            <ul className="space-y-2 text-slate-700">
                                <li className="flex gap-2">
                                    <Server className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>{t.rich('sections.security.list.0', { b: (chunks) => <strong>{chunks}</strong> })}</span>
                                </li>
                                <li className="flex gap-2">
                                    <Lock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>{t.rich('sections.security.list.1', { b: (chunks) => <strong>{chunks}</strong> })}</span>
                                </li>
                                <li className="flex gap-2">
                                    <UserCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>{t.rich('sections.security.list.2', { b: (chunks) => <strong>{chunks}</strong> })}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="text-slate-700 text-sm">
                                <p className="font-medium text-red-900 mb-1">{t('sections.security.alertTitle')}</p>
                                {t('sections.security.alertText')}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.sharing.title')}</h2>
                        <p className="text-slate-700 mb-2">
                            {t.rich('sections.sharing.text', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            {[0, 1, 2].map(i => (
                                <li key={i}>{t(`sections.sharing.list.${i}`)}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.rights.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.rights.text')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <li key={i}>
                                    {t.rich(`sections.rights.list.${i}`, { b: (chunks) => <strong>{chunks}</strong> })}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.retention.title')}</h2>
                        <ul className="list-disc pl-6 text-slate-700 space-y-1">
                            {[0, 1, 2, 3].map(i => (
                                <li key={i}>
                                    {t.rich(`sections.retention.list.${i}`, { b: (chunks) => <strong>{chunks}</strong> })}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.transfers.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.transfers.text')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.contact.title')}</h2>
                        <p className="text-slate-700 mb-2">
                            {t('sections.contact.text')}
                        </p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                            <p className="font-bold text-slate-800">{t('sections.contact.dpoTitle')}</p>
                            <p className="text-slate-700">{t('sections.contact.email')}</p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.authority.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.authority.text')}
                        </p>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
