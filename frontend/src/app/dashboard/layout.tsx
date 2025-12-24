'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRole } from '@/hooks/useRole';
import { Heart, User, Settings, LogOut, Bell, Menu, X, Shield, LayoutDashboard, Users, FileText, Calendar, PieChart, Mic } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
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

    const navItems = [
        { name: 'Dashboard', title: 'Dashboard | PsicoAIssist', href: '/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Pacientes', href: '/dashboard/clients', icon: Users, show: true },
        { name: 'Sesiones', href: '/dashboard/sessions', icon: Calendar, show: true },
        { name: 'Informes', href: '/dashboard/reports', icon: FileText, show: !isAgendaManager() },
        { name: 'Estadísticas', href: '/dashboard/statistics', icon: PieChart, show: !isAgendaManager() },
        { name: 'Simulador', href: '/dashboard/simulator', icon: Mic, show: !isAgendaManager() },
        { name: 'Legal', href: '/dashboard/compliance', icon: Shield, extraMargin: true, show: true },
    ].filter(item => item.show);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Desktop Nav */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">PsicoAIssist</h1>
                            </Link>

                            <nav className="hidden md:flex items-center gap-4">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                } ${item.extraMargin ? 'ml-8' : ''}`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-4">
                            {/* Admin Link if capable */}
                            {user?.role === 'ADMIN' && (
                                <Link href="/admin">
                                    <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Admin
                                    </Button>
                                </Link>
                            )}

                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                                <Bell className="w-5 h-5" />
                            </button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                            <Badge variant="outline" className="mt-1 w-fit text-[10px] pointer-events-none">
                                                {user?.role}
                                            </Badge>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {!isAgendaManager() && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/settings" className="w-full cursor-pointer flex items-center">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Configuración</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile" className="w-full cursor-pointer flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Mi Perfil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 text-gray-600"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t">
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === item.href
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {user?.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50"
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
