'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // No mostrar el header normal en páginas de admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Header />;
}