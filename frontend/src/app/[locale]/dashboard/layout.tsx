'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/hooks/useRole';
import { Heart, User, Settings, LogOut, Menu, X, Shield, LayoutDashboard, Users, FileText, Calendar, PieChart, Mic } from 'lucide-react';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Link } from '@/navigation';
import { useRouter, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HelpWidget } from '@/components/dashboard/widgets/HelpWidget';
import LanguageSwitcher from '@/components/language-switcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('Dashboard.Navigation');
    const tHeader = useTranslations('Dashboard.Header');
    const { user, logout } = useAuth();
    const { isAgendaManager } = useRole();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/auth/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    // Force redirect for INACTIVE users trying to access dashboard
    useEffect(() => {
        if (user && user.status === 'INACTIVE') {
            router.push('/payment/plans');
        }
    }, [user, router]);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const navItems = [
        { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard, show: true },
        { name: t('clients'), href: '/dashboard/clients', icon: Users, show: true },
        { name: t('sessions'), href: '/dashboard/sessions', icon: Calendar, show: true },
        { name: t('reports'), href: '/dashboard/reports', icon: FileText, show: !isAgendaManager() },
        { name: t('statistics'), href: '/dashboard/statistics', icon: PieChart, show: !isAgendaManager() },
        { name: t('simulator'), href: '/dashboard/simulator', icon: Mic, show: !isAgendaManager() },
        { name: t('legal'), href: '/dashboard/compliance', icon: Shield, extraMargin: true, show: true },
    ].filter(item => item.show);

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-50/80 flex flex-col" id="dashboard-layout">
                {/* Header */}
                <header className="glass-strong shadow-soft border-b border-gray-200/60 sticky top-0 z-50" id="dashboard-header">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between gap-4">
                            {/* Logo and Desktop Nav */}
                            <div className="flex items-center gap-6 lg:gap-8 min-w-0">
                                <Link href="/dashboard" className="flex items-center flex-shrink-0 group" id="dashboard-logo">
                                    <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center mr-2.5 shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
                                        <Heart className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <h1 className="text-lg font-bold text-gray-900 hidden sm:block tracking-tight">
                                        Psico<span className="text-gradient-primary">AIssist</span>
                                    </h1>
                                </Link>

                                <nav className="hidden xl:flex items-center gap-1" id="dashboard-nav">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                    ? 'bg-primary/10 text-primary shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                                                    } ${item.extraMargin ? 'ml-4' : ''}`}
                                                id={`nav-${item.href.replace(/\//g, '-')}`}
                                            >
                                                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : ''}`} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Right section */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Admin Link if capable */}
                                {user?.role === 'ADMIN' && (
                                    <Link href="/admin" className="hidden sm:block">
                                        <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-2 text-sm" id="admin-panel-link">
                                            <Shield className="w-4 h-4" />
                                            <span className="hidden lg:inline">{t('adminPanel')}</span>
                                        </Button>
                                    </Link>
                                )}

                                <div className="hidden sm:block h-5 w-px bg-gray-200" />
                                <div className="hidden sm:block">
                                    <LanguageSwitcher />
                                </div>
                                <NotificationBell />

                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-gray-100 hover:ring-primary/20 transition-all" id="user-menu-trigger">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">
                                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-60 rounded-xl shadow-elevated border-gray-200/80" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal p-3">
                                            <div className="flex flex-col space-y-1.5">
                                                <p className="text-sm font-semibold leading-none text-gray-900">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-xs leading-none text-gray-500">
                                                    {user?.email}
                                                </p>
                                                <Badge variant="outline" className="mt-1.5 w-fit text-2xs pointer-events-none font-semibold">
                                                    {user?.role === 'PSYCHOLOGIST_PREMIUM' ? tHeader('roles.premium') :
                                                        user?.role === 'PSYCHOLOGIST' ? tHeader('roles.psychologist') :
                                                            user?.role === 'MANAGER' || user?.role === 'AGENDA_MANAGER' ? tHeader('roles.manager') :
                                                                user?.role === 'ADMIN' ? tHeader('roles.admin') :
                                                                    user?.role}
                                                </Badge>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {!isAgendaManager() && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard/settings" className="w-full cursor-pointer flex items-center py-2.5" id="menu-settings">
                                                    <Settings className="mr-2.5 h-4 w-4 text-gray-500" />
                                                    <span>{tHeader('settings')}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/profile" className="w-full cursor-pointer flex items-center py-2.5" id="menu-profile">
                                                <User className="mr-2.5 h-4 w-4 text-gray-500" />
                                                <span>{tHeader('profile')}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="text-red-600 focus:text-red-600 cursor-pointer py-2.5"
                                            id="menu-logout"
                                        >
                                            <LogOut className="mr-2.5 h-4 w-4" />
                                            <span>{tHeader('logout')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Mobile menu button */}
                                <button
                                    className="xl:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus-ring"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label="Toggle navigation"
                                    id="dashboard-mobile-toggle"
                                >
                                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Nav Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 xl:hidden" style={{ top: '64px' }}>
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <div className="absolute top-0 left-0 right-0 bg-white shadow-elevated animate-fade-in-down max-h-[calc(100vh-4rem)] overflow-y-auto" id="dashboard-mobile-menu">
                            <div className="px-4 py-4 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {/* Mobile-only items */}
                                {user?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-purple-600 hover:bg-purple-50 transition-all duration-200"
                                    >
                                        <Shield className="w-5 h-5 mr-3" />
                                        {t('adminPanel')}
                                    </Link>
                                )}

                                {/* Language switcher in mobile */}
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 mt-2">
                                    <span className="text-sm font-medium text-gray-600">Idioma</span>
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 animate-fade-in" id="dashboard-main">
                    {children}
                </main>

                <HelpWidget />
            </div>
        </NotificationProvider>
    );
}
