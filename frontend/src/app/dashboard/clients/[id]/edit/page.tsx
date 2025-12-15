'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ClientForm } from '@/components/clients/ClientForm';

export default function EditClientPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchClient() {
            try {
                const data = await ClientsAPI.getById(params.id);
                setClient(data);
            } catch (error) {
                console.error('Error fetching client:', error);
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información del paciente.",
                    variant: "destructive",
                });
                router.push('/dashboard/clients');
            } finally {
                setIsLoading(false);
            }
        }

        fetchClient();
    }, [params.id, router, toast]);

    async function handleSubmit(values: any) {
        try {
            await ClientsAPI.update(params.id, values);
            toast({
                title: "Cliente actualizado",
                description: "La información del paciente se ha guardado correctamente.",
            });
            router.push('/dashboard/clients');
        } catch (error) {
            console.error('Error updating client:', error);
            // Error handling is also done in the form component, this acts as a fallback or side check
            throw error;
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Paciente</h1>
                    <p className="text-muted-foreground">
                        Modifica los datos del expediente de {client.firstName} {client.lastName}.
                    </p>
                </div>
            </div>

            <ClientForm
                initialData={client}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                submitLabel="Actualizar Paciente"
            />
        </div>
    );
}
