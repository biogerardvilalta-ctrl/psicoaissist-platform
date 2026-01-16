'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // No mostrar el header normal en páginas de admin o legal (tiene su propio header)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/legal')) {
    return null;
  }

  return <Header />;
}