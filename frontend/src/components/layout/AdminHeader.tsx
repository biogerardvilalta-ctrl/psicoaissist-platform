'use client';

import React from 'react';
import { Link } from '@/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, LogOut, LayoutDashboard, Users, Settings, Mail, ClipboardList, Sparkles, CreditCard, UserCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminHeader() {
  const t = useTranslations('Dashboard.Header');
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navigationItems = [
    { name: t('panel'), href: '/admin', icon: LayoutDashboard },
    { name: t('users'), href: '/admin/users', icon: Users },
    { name: t('tasks'), href: '/admin/tasks', icon: Sparkles },
    { name: t('communications'), href: '/admin/communications', icon: Mail },
    { name: t('billing'), href: '/admin/billing', icon: CreditCard },
    { name: t('logs'), href: '/admin/audit-logs', icon: ClipboardList },
    { name: t('system'), href: '/admin/system', icon: Settings },
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
                <span className="text-gray-400 text-sm ml-2">{t('adminLabel')}</span>
              </div>
            </Link>


            {/* Navegación */}
            <nav className="hidden lg:flex space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Usuario y acciones */}
          <div className="flex items-center gap-4">
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
                    <div className="text-gray-400 text-xs text-xs-custom-color">
                      {user?.role === 'PSYCHOLOGIST_PREMIUM' ? t('roles.premium') :
                        user?.role === 'PSYCHOLOGIST' ? t('roles.psychologist') :
                          user?.role === 'MANAGER' || user?.role === 'AGENDA_MANAGER' ? t('roles.manager') :
                            user?.role === 'ADMIN' ? t('roles.admin') :
                              user?.role}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="w-full cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Sidebar (Sheet) */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 text-gray-300 hover:text-white">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white text-gray-900">
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <SheetTitle className="text-xl font-bold text-gray-900 mb-2">PsicoAIssist</SheetTitle>
                      <p className="text-sm text-gray-500">{t('adminPanelTitle')}</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                      {t('copyright')}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}