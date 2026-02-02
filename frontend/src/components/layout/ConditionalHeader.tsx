'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // No mostrar el header normal en páginas de admin, legal o videollamadas
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/legal') || pathname?.startsWith('/video-call')) {
    return null;
  }

  return <Header />;
}