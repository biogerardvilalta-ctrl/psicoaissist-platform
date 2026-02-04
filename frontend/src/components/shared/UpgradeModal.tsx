'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType?: 'clients' | 'reports' | 'transcription' | 'simulator' | 'trial';
    message?: string;
}

export function UpgradeModal({ isOpen, onClose, limitType = 'clients', message }: UpgradeModalProps) {
    const router = useRouter();

    const getLimitInfo = () => {
        switch (limitType) {
            case 'clients':
                return {
                    title: "Límite de Pacientes Alcanzado",
                    description: "Tu plan actual ha alcanzado el número máximo de pacientes activos permitidos."
                };
            case 'reports':
                return {
                    title: "Límite de Informes Alcanzado",
                    description: "Has utilizado todos los informes incluidos en tu plan este mes."
                };
            case 'transcription':
                return {
                    title: "Límite de Transcripción Alcanzado",
                    description: "Has consumido los minutos de IA/Transcripción disponibles en tu ciclo actual."
                };
            case 'simulator':
                return {
                    title: "Simulador No Disponible",
                    description: "El simulador clínico es una característica exclusiva de planes superiores."
                };
            case 'trial':
                return {
                    title: "Periodo de Prueba Finalizado",
                    description: "Tu periodo de prueba de 14 días ha expirado. Suscríbete para continuar."
                };
            default:
                return {
                    title: "Actualiza tu Plan",
                    description: message || "Has alcanzado un límite de tu suscripción actual."
                };
        }
    };

    const info = getLimitInfo();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                        <Crown className="h-6 w-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">{info.title}</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {info.description}
                        <br />
                        Actualiza a <strong>Pro</strong> o <strong>Premium</strong> para eliminar límites.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-col gap-2 mt-4">
                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        onClick={() => {
                            onClose();
                            router.push('/dashboard/settings');
                        }}
                    >
                        Ver Planes y Precios <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={onClose}>
                        Ahora no
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
