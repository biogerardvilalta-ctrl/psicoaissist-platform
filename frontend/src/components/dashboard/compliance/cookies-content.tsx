import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CookiesContent() {
    const t = useTranslations('Legal.Cookies');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Cookie className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">{t('title')}</h1>
                <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        {t('cardTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.what.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.what.text')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.used.title')}</h2>
                        <p className="text-slate-700 mb-4">
                            {t.rich('sections.used.text', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>

                        <div className="grid gap-4">
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">{t('sections.used.types.auth.title')}</h3>
                                <p className="text-sm text-slate-600">{t('sections.used.types.auth.text')}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">{t('sections.used.types.pref.title')}</h3>
                                <p className="text-sm text-slate-600">{t('sections.used.types.pref.text')}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">{t('sections.used.types.sec.title')}</h3>
                                <p className="text-sm text-slate-600">{t('sections.used.types.sec.text')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.third.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t.rich('sections.third.text', {
                                b: (chunks) => <strong>{chunks}</strong>
                            })}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">{t('sections.deactivate.title')}</h2>
                        <p className="text-slate-700 leading-relaxed">
                            {t('sections.deactivate.text')}
                        </p>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
