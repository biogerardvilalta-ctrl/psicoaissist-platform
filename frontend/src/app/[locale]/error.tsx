'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured by Next.js Error Boundary:', error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-6 text-center px-4">
      <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          {t('error.title') || 'Oops! Alguna cosa ha anat malament.'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-[500px] mx-auto">
          {t('error.description') || "Hem detectat un error inesperat i el nostre equip ja n'està informat. Pots provar de tornar a carregar la pàgina."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button 
          onClick={() => reset()}
          size="lg"
          className="font-medium"
        >
          {t('error.retry') || 'Tornar a intentar'}
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => router.push('/')}
        >
          {t('error.backHome') || "Tornar a l'Inici"}
        </Button>
      </div>
    </div>
  );
}
