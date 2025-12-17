'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/hooks/useRole';
import { Heart, Home, Users, Settings, Shield, BarChart3, CreditCard, FileText } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { isAdmin, isPsychologist, isAuthenticated } = useRole();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path;

  const navItems = [
    // Common items for all authenticated users
    {
      name: 'Inicio',
      href: '/',
      icon: Home,
      show: true
    },

    // Psychologist items
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      show: isPsychologist()
    },
    {
      name: 'Informes',
      href: '/dashboard/reports',
      icon: FileText,
      show: isPsychologist()
    },

    // Admin items
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      show: isAdmin()
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: Users,
      show: isAdmin()
    },
    {
      name: 'Pagos',
      href: '/admin/payments',
      icon: CreditCard,
      show: isAdmin()
    },

    // Common settings
    {
      name: 'Configuración',
      href: '/dashboard/settings',
      icon: Settings,
      show: true
    }
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PsychoAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}