'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, User, MoreVertical, Search, Filter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';


/* 
  Since we don't have a shared type for AdminTask on frontend yet (unless generated), 
  I'll define a local interface matching the backend model.
*/
interface AdminTask {
    id: string;
    type: 'ONBOARDING_SETUP' | 'SUPPORT_REQUEST' | 'ACCOUNT_REVIEW' | 'CUSTOM';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    metadata?: any;
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
}

export default function AdminTasksPage() {
    const { tokens } = useAuth();

    const [tasks, setTasks] = useState<AdminTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [search, setSearch] = useState('');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (filterPriority !== 'all') params.append('priority', filterPriority);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const baseUrl = apiUrl.endsWith('/api/v1') ? apiUrl : `${apiUrl}/api/v1`;

            const res = await fetch(`${baseUrl}/admin/tasks?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${tokens?.accessToken}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tokens?.accessToken) {
            fetchTasks();
        }
    }, [tokens, filterStatus, filterPriority]);

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const baseUrl = apiUrl.endsWith('/api/v1') ? apiUrl : `${apiUrl}/api/v1`;

            const res = await fetch(`${baseUrl}/admin/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens?.accessToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Optimistic update or refetch
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            task.title.toLowerCase().includes(searchLower) ||
            task.user.email.toLowerCase().includes(searchLower) ||
            (task.user.firstName && task.user.firstName.toLowerCase().includes(searchLower)) ||
            (task.user.lastName && task.user.lastName.toLowerCase().includes(searchLower))
        );
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'CANCELLED': return 'bg-gray-100 text-gray-500 line-through';
            default: return 'bg-yellow-50 text-yellow-700'; // Pending
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
                    <p className="text-gray-500">Administra las tareas pendientes y solicitudes de soporte.</p>
                </div>
                <Button onClick={fetchTasks} variant="outline" size="sm">
                    Todas
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder={'Título...'}
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-gray-500" />
                                        <span>{filterStatus === 'all' ? 'Todas' : filterStatus}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                    <SelectItem value="COMPLETED">Completada</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p>No hay tareas que coincidan con los filtros.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex flex-col md:flex-row border rounded-lg p-4 gap-4 transition-colors hover:bg-gray-50 ${task.status === 'COMPLETED' ? 'opacity-75 bg-gray-50' : 'bg-white'}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {task.type === 'ONBOARDING_SETUP' ? (
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow space-y-1">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{task.user.firstName} {task.user.lastName} ({task.user.email})</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                                                <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </Badge>
                                                <Badge className={`${getStatusColor(task.status)} border-0`}>
                                                    {task.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded border border-gray-100">
                                            {task.description}
                                        </p>

                                        {task.metadata && (
                                            <div className="text-xs text-mono text-gray-400 mt-2">
                                                Metadata: {JSON.stringify(task.metadata)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start md:items-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}>
                                                    Marcar En Progreso
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'COMPLETED')}>
                                                    Marcar Completado
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'CANCELLED')} className="text-red-600">
                                                    Cancelar Tarea
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
