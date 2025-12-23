import { useState, useEffect } from 'react';
import { UserAPI } from '@/lib/user-api';
import { User } from '@/types/auth';
import { Plus, Trash2, User as UserIcon, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Assuming you have these UI components
// If not, use standard HTML/Tailwind for now or verify component existence.
// To stay safe, I'll use standard HTML + Tailwind classes if I'm not sure, but since I saw 'shadcn' like imports before, I'll try to use basic HTML/Tailwind that looks like shadcn.

export function AgendaManagersSettings() {
    const [managers, setManagers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [newManager, setNewManager] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        loadManagers();
    }, []);

    const loadManagers = async () => {
        try {
            setIsLoading(true);
            const data = await UserAPI.getMyAgendaManagers();
            setManagers(data);
        } catch (error) {
            console.error('Failed to load managers', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            await UserAPI.createAgendaManager(newManager);
            setNewManager({ firstName: '', lastName: '', email: '', password: '' });
            await loadManagers();
        } catch (error) {
            console.error('Failed to create manager', error);
            // Add toast here if available
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este gestor?')) return;
        try {
            await UserAPI.deleteAgendaManager(id);
            setManagers(managers.filter(m => m.id !== id));
        } catch (error) {
            console.error('Failed to delete manager', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Gestores de Agenda</h3>
                    <p className="text-sm text-gray-500">
                        Permite que otras personas gestionen tu calendario y pacientes.
                    </p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 dark:bg-gray-800/20 dark:border-gray-800">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Nombre"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newManager.firstName}
                            onChange={(e) => setNewManager({ ...newManager, firstName: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Apellidos"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newManager.lastName}
                            onChange={(e) => setNewManager({ ...newManager, lastName: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newManager.email}
                            onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña Temporal"
                            required
                            minLength={6}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newManager.password}
                            onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Crear Gestor
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : managers.length === 0 ? (
                    <div className="text-center p-8 border rounded-lg border-dashed text-gray-400">
                        No tienes gestores asignados.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {managers.map((manager) => (
                            <div key={manager.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{manager.firstName} {manager.lastName}</div>
                                        <div className="text-sm text-gray-500">{manager.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(manager.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Eliminar gestor"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
