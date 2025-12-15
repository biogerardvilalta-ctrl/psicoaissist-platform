'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // No mostrar el footer en páginas de admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}