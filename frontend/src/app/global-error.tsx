'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal Global Error:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-50 flex items-center justify-center min-h-screen font-sans">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg border border-red-100 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Crític del Sistema</h1>
          <p className="text-slate-600 mb-6">
            S'ha produït un error de configuració inesperat. Torna a carregar la pàgina o contacta amb suport si el problema persisteix.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            Tornar a carregar
          </button>
        </div>
      </body>
    </html>
  );
}
