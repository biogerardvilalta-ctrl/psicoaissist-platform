'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ClientsAPI } from '@/lib/clients-api';
import { UserAPI } from '@/lib/user-api';
import { useRole } from '@/hooks/useRole';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ClientForm } from '@/components/clients/ClientForm';

export default function NewClientPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAgendaManager } = useRole();
    const [managedProfessionals, setManagedProfessionals] = useState<User[]>([]);

    useEffect(() => {
        if (isAgendaManager()) {
            UserAPI.getManagedProfessionals()
                .then(pros => setManagedProfessionals(pros))
                .catch(err => console.error('Failed to load professionals', err));
        }
    }, [isAgendaManager]);

    async function handleSubmit(values: any) {
        // Validate professional selection for Agenda Managers
        if (isAgendaManager() && !values.professionalId) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Debes seleccionar un profesional.',
            });
            return;
        }

        await ClientsAPI.create(values);
        toast({
            title: "Cliente creado exitosamente",
            description: "Se ha creado el expediente del nuevo paciente.",
        });
        router.push('/dashboard/clients');
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nuevo Paciente</h1>
                    <p className="text-muted-foreground">
                        Ingresa la información básica para abrir un nuevo expediente.
                    </p>
                </div>
            </div>

            <ClientForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                submitLabel="Guardar Paciente"
                managedProfessionals={managedProfessionals}
                isAgendaManager={isAgendaManager()}
            />
        </div>
    );
}
