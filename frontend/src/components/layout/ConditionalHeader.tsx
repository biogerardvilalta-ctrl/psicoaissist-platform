'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Check if pathname contains admin, legal, or dashboard segments
  // This handles paths like /es/admin, /en/dashboard, etc.
  const isExcluded =
    pathname?.includes('/admin') ||
    pathname?.includes('/legal') ||
    pathname?.includes('/dashboard');

  if (isExcluded) {
    return null;
  }

  return <Header />;
}