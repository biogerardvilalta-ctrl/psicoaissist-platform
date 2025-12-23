'use client';

import { useState } from 'react';
import { User } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Users } from 'lucide-react';
import { UserAPI } from '@/lib/user-api';
import { useToast } from '@/hooks/use-toast';

interface GroupsSectionProps {
    groups: User[];
    professionals: User[];
    onGroupChange: () => void;
}

export function GroupsSection({ groups, professionals, onGroupChange }: GroupsSectionProps) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' });
            return;
        }
        if (selectedMembers.length < 2) {
            toast({ title: 'Error', description: 'Selecciona al menos 2 profesionales.', variant: 'destructive' });
            return;
        }

        try {
            setIsSubmitting(true);
            await UserAPI.createProfessionalGroup(groupName, selectedMembers);
            toast({ title: 'Éxito', description: 'Grupo creado correctamente.' });
            setIsDialogOpen(false);
            setGroupName('');
            setSelectedMembers([]);
            onGroupChange();
        } catch (error) {
            toast({ title: 'Error', description: 'Fallo al crear el grupo', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) return;
        try {
            await UserAPI.deleteProfessionalGroup(groupId);
            toast({ title: 'Eliminado', description: 'Grupo eliminado correctamente.' });
            onGroupChange();
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar el grupo.', variant: 'destructive' });
        }
    };

    const toggleMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6 mt-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-slate-800">Grupos de Profesionales</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Crear Grupo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre del Grupo</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej. Psicología Infantil"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Seleccionar Miembros</Label>
                                <div className="border rounded-md p-2 h-[200px] overflow-y-auto space-y-2">
                                    {professionals.length === 0 ? (
                                        <p className="text-sm text-muted-foreground p-2">No tienes profesionales disponibles.</p>
                                    ) : (
                                        professionals.map(pro => (
                                            <div key={pro.id} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded">
                                                <Checkbox
                                                    id={pro.id}
                                                    checked={selectedMembers.includes(pro.id)}
                                                    onCheckedChange={() => toggleMember(pro.id)}
                                                />
                                                <label
                                                    htmlFor={pro.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                                >
                                                    {pro.firstName} {pro.lastName}
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateGroup} disabled={isSubmitting}>
                                {isSubmitting ? 'Creando...' : 'Crear Grupo'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {groups.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No hay grupos creados.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <Card key={group.id} className="group relative">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle>{group.firstName}</CardTitle>
                                    <Badge variant="secondary">Grupo</Badge>
                                </div>
                                <CardDescription className="text-xs">ID: {group.id.substring(0, 8)}...</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-slate-700">Miembros:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {group.groupMembers && group.groupMembers.length > 0 ? (
                                                group.groupMembers.map((m: any) => (
                                                    <Badge key={m.id} variant="outline" className="bg-slate-50">
                                                        {m.firstName} {m.lastName}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">Sin miembros visibles</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteGroup(group.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar Grupo
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
