'use client';
import { LegalJustificationContent } from '@/components/dashboard/compliance/legal-justification-content';
import { GdprContent } from '@/components/dashboard/compliance/gdpr-content';
import { CookiesContent } from '@/components/dashboard/compliance/cookies-content';
import { TermsContent } from '@/components/dashboard/compliance/terms-content';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Printer, Shield, Lock, Cookie, Scale } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';

function LegalPageContent() {
    const router = useRouter();
    const t = useTranslations('Legal');
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    // Default to 'gdpr' for public legal page as it's the most common entry point
    const [activeTab, setActiveTab] = useState("gdpr");

    useEffect(() => {
        if (tabParam && ['legal-justification', 'gdpr', 'cookies', 'terms'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Simple Public Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            PsicoAIssist
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('header.back')}
                    </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                        {t('header.print')}
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto mb-8 h-auto p-1">
                            <TabsTrigger value="gdpr" className="gap-2 py-3">
                                <Lock className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('tabs.privacy')}</span>
                                <span className="sm:hidden">{t('tabs.privacyShort')}</span>
                            </TabsTrigger>
                            <TabsTrigger value="terms" className="gap-2 py-3">
                                <Scale className="h-4 w-4" />
                                {t('tabs.terms')}
                            </TabsTrigger>
                            <TabsTrigger value="cookies" className="gap-2 py-3">
                                <Cookie className="h-4 w-4" />
                                {t('tabs.cookies')}
                            </TabsTrigger>
                            <TabsTrigger value="legal-justification" className="gap-2 py-3">
                                <Shield className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('tabs.aiJustification')}</span>
                                <span className="sm:hidden">{t('tabs.aiJustificationShort')}</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="legal-justification" className="focus:outline-none">
                                <LegalJustificationContent />
                            </TabsContent>

                            <TabsContent value="gdpr" className="focus:outline-none">
                                <GdprContent />
                            </TabsContent>

                            <TabsContent value="cookies" className="focus:outline-none">
                                <CookiesContent />
                            </TabsContent>

                            <TabsContent value="terms" className="focus:outline-none">
                                <TermsContent />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <div className="text-center text-sm text-gray-500 pt-12 pb-4">
                    <p>{t('footer')}</p>
                </div>
            </main>
        </div>
    );
}

export default function LegalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <LegalPageContent />
        </Suspense>
    );
}
