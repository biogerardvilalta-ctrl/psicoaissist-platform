'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const t = useTranslations('Legal');

  useEffect(() => {
    router.replace('/legal?tab=gdpr');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">{t('redirect.title')}</h1>
        <p className="text-gray-500">{t('redirect.message')}</p>
      </div>
    </div>
  );
}