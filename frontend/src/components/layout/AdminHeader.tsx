'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  LogoutIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  ClipboardListIcon
} from '@heroicons/react/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/ui/NotificationBell';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navigationItems = [
    { name: 'Panel', href: '/admin', icon: HomeIcon },
    { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
    { name: 'Facturación', href: '/admin/billing', icon: CreditCardIcon },
    { name: 'Logs', href: '/admin/audit-logs', icon: ClipboardListIcon },
    { name: 'Sistema', href: '/admin/system', icon: CogIcon },
  ];

  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center space-x-3 mr-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PA</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-semibold">PsicoAIssist</span>
                <span className="text-gray-400 text-sm ml-2">Admin</span>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors mr-4"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Volver a la App</span>
            </Link>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Usuario y acciones */}
          <div className="flex items-center space-x-4">
            <div className="text-gray-300 hover:text-white">
              <NotificationBell />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 focus:outline-none">
                  <Avatar className="h-8 w-8 bg-gray-700">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-right">
                    <div className="text-white text-sm font-medium">{user?.firstName}</div>
                    <div className="text-gray-400 text-xs">{user?.email}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer flex items-center">
                    <UserCircleIcon className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="w-full cursor-pointer flex items-center">
                    <CogIcon className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogoutIcon className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden border-t border-gray-700">
        <nav className="px-4 pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver a la App</span>
          </Link>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}