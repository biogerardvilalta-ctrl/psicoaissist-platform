'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // No mostrar el footer en páginas de admin
  // Check if pathname contains admin or dashboard segments
  const isExcluded =
    pathname?.includes('/admin') ||
    pathname?.includes('/dashboard');

  if (isExcluded) {
    return null;
  }

  return <Footer />;
}