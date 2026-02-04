'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Users, Mail, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/http-client';
import { useTranslations } from 'next-intl';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export default function CommunicationsPage() {
    const { toast } = useToast();
    const t = useTranslations('Admin.Communications');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // Form State
    const [target, setTarget] = useState<'ALL' | 'SPECIFIC'>('SPECIFIC');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sendEmail, setSendEmail] = useState(true);
    const [sendNotification, setSendNotification] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Search/Filter for users (simple client-side for now)
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoadingUsers(true);
            // Fetch all users for selection (may need pagination in future, but fetching first 100 or so for now)
            // Actually AdminController.getUsers supports pagination. 
            // For this feature, a specialized "get all users for dropdown" endpoint is better, 
            // but let's try to fetch a reasonably large list or just standard list.
            // We'll use limit=100 for now.
            const response = await httpClient.get<{ users: User[] }>('/api/v1/admin/users?limit=100&status=ACTIVE');
            setUsers(response.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los usuarios.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast({
                title: 'Campos requeridos',
                description: 'Por favor completa el asunto y el mensaje.',
                variant: 'destructive',
            });
            return;
        }

        if (!sendEmail && !sendNotification) {
            toast({
                title: 'Selecciona un canal',
                description: 'Debes seleccionar al menos Email o Notificación.',
                variant: 'destructive',
            });
            return;
        }

        if (target === 'SPECIFIC' && selectedUserIds.length === 0) {
            toast({
                title: 'Selecciona usuarios',
                description: 'Debes seleccionar al menos un usuario destinatario.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSending(true);
            const payload = {
                target,
                userIds: target === 'SPECIFIC' ? selectedUserIds : undefined,
                type: sendEmail && sendNotification ? 'BOTH' : (sendEmail ? 'EMAIL' : 'NOTIFICATION'),
                subject,
                message
            };

            await httpClient.post('/api/v1/admin/communicate', payload);

            toast({
                title: 'Enviado correctamente',
                description: 'Las notificaciones han sido enviadas.',
            });

            // Reset form
            setSubject('');
            setMessage('');
            setSelectedUserIds([]);
            setTarget('SPECIFIC');
        } catch (error) {
            console.error('Error sending communication:', error);
            toast({
                title: 'Error al enviar',
                description: 'Hubo un problema al enviar las notificaciones.',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
                <p className="text-gray-400">{t('subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Configuration */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                {t('sendEmail')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">{t('subject')}</Label>
                                <Input
                                    placeholder="Ej: Mantenimiento programado"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="bg-gray-900 border-gray-600 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">{t('message')}</Label>
                                <Textarea
                                    placeholder="Escribe aquí tu mensaje..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="bg-gray-900 border-gray-600 text-white min-h-[200px]"
                                />
                                <p className="text-xs text-gray-500">
                                    El correo se enviará con la plantilla oficial de PsicoAIssist.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Bell className="w-5 h-5 mr-2" />
                                Canales de Envío
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="channel-email"
                                        checked={sendEmail}
                                        onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                                        className="border-gray-500 data-[state=checked]:bg-blue-600"
                                    />
                                    <Label htmlFor="channel-email" className="text-gray-300 cursor-pointer">Email</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="channel-notification"
                                        checked={sendNotification}
                                        onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                                        className="border-gray-500 data-[state=checked]:bg-blue-600"
                                    />
                                    <Label htmlFor="channel-notification" className="text-gray-300 cursor-pointer">Notificación In-App</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Recipients */}
                <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                {t('recipients')}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                {t('subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex space-x-2 mb-4 bg-gray-900 p-1 rounded-lg">
                                <button
                                    onClick={() => setTarget('SPECIFIC')}
                                    className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${target === 'SPECIFIC' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {t('selectUsers')}
                                </button>
                                <button
                                    onClick={() => setTarget('ALL')}
                                    className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${target === 'ALL' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {t('allUsers')}
                                </button>
                            </div>

                            {target === 'SPECIFIC' && (
                                <>
                                    <Input
                                        placeholder="Buscar usuario..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-900 border-gray-600 text-white mb-3"
                                    />

                                    <div className="border border-gray-700 rounded-md bg-gray-900 flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
                                        {isLoadingUsers ? (
                                            <div className="flex justify-center p-4">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                            </div>
                                        ) : filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                                                    onClick={() => toggleUser(user.id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedUserIds.includes(user.id)}
                                                        onCheckedChange={() => toggleUser(user.id)}
                                                        className="border-gray-500"
                                                    />
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-white truncate">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center text-sm p-4">No se encontraron usuarios.</p>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 text-right">
                                        {selectedUserIds.length} {t('selectUsers')}
                                    </div>
                                </>
                            )}

                            {target === 'ALL' && (
                                <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4 text-center">
                                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <p className="text-blue-200 font-medium">Envío Masivo</p>
                                    <p className="text-sm text-blue-300/70 mt-1">
                                        El mensaje se enviará a todos los usuarios activos del sistema (excluyendo administradores).
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <Button
                    onClick={handleSend}
                    disabled={isSending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            {t('send')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
