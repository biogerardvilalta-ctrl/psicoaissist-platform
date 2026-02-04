'use client';
import { LegalJustificationContent } from '@/components/dashboard/compliance/legal-justification-content';
import { GdprContent } from '@/components/dashboard/compliance/gdpr-content';
import { CookiesContent } from '@/components/dashboard/compliance/cookies-content';
import { TermsContent } from '@/components/dashboard/compliance/terms-content';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Printer, Shield, Lock, Cookie, Scale } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function CompliancePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('Dashboard.Compliance');
    const tabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState("legal-justification");

    useEffect(() => {
        if (tabParam && ['legal-justification', 'gdpr', 'cookies', 'terms'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    {t('back')}
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                    {t('print')}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="h-auto flex flex-col md:grid w-full md:grid-cols-4 max-w-2xl mx-auto mb-8">
                    <TabsTrigger value="legal-justification" className="gap-2">
                        <Shield className="h-4 w-4" />
                        {t('tabs.legal')}
                    </TabsTrigger>
                    <TabsTrigger value="gdpr" className="gap-2">
                        <Lock className="h-4 w-4" />
                        {t('tabs.gdpr')}
                    </TabsTrigger>
                    <TabsTrigger value="cookies" className="gap-2">
                        <Cookie className="h-4 w-4" />
                        {t('tabs.cookies')}
                    </TabsTrigger>
                    <TabsTrigger value="terms" className="gap-2">
                        <Scale className="h-4 w-4" />
                        {t('tabs.terms')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="legal-justification" className="animate-in fade-in-50 duration-300">
                    <LegalJustificationContent />
                </TabsContent>

                <TabsContent value="gdpr" className="animate-in fade-in-50 duration-300">
                    <GdprContent />
                </TabsContent>

                <TabsContent value="cookies" className="animate-in fade-in-50 duration-300">
                    <CookiesContent />
                </TabsContent>

                <TabsContent value="terms" className="animate-in fade-in-50 duration-300">
                    <TermsContent />
                </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground pt-8 pb-4 border-t border-slate-100 mt-8">
                <p>{t('footer')}</p>
            </div>
        </div>
    );
}
