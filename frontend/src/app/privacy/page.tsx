'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/legal?tab=gdpr');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Redirigiendo...</h1>
        <p className="text-gray-500">Te estamos llevando a nuestra nueva sección legal unificada.</p>
      </div>
    </div>
  );
}