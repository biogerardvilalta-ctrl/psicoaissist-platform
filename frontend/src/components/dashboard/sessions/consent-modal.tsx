'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Info, FileText } from 'lucide-react';

interface ConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    clientName: string;
}

export function ConsentModal({ isOpen, onClose, onConfirm, clientName }: ConsentModalProps) {
    const [isChecked, setIsChecked] = useState(false);

    const handleConfirm = () => {
        if (isChecked) {
            onConfirm();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-700">
                        <ShieldCheck className="h-5 w-5" />
                        Consentiment Informat
                    </DialogTitle>
                    <DialogDescription>
                        Abans d'iniciar la sessió amb <strong>{clientName}</strong>, confirma el següent:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Eina de Suport Clínic</AlertTitle>
                        <AlertDescription className="text-blue-700 text-sm">
                            Aquesta eina ofereix suport orientatiu exclusivament per a professionals de la psicologia.
                            <strong> No realitza diagnòstics ni substitueix el criteri clínic.</strong>
                        </AlertDescription>
                    </Alert>

                    <div className="flex items-top space-x-2 border p-3 rounded-md bg-slate-50">
                        <Checkbox
                            id="consent"
                            checked={isChecked}
                            onCheckedChange={(c) => setIsChecked(c as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="consent"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Confirmo que he informat al pacient sobre l'ús d'aquesta eina de suport i el processament de dades conforme a GDPR.
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Les dades d'àudio s'eliminaran automàticament després del processament.
                            </p>
                            <a
                                href="/documents/consentiment-informat.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                                <FileText className="h-3 w-3" />
                                Descarregar document d'informació sobre el tractament de dades
                            </a>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <div className="text-xs text-slate-400 mt-2 sm:mt-0 flex items-center">
                        Secure EU Server <ShieldCheck className="h-3 w-3 ml-1" />
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel·lar
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={!isChecked}>
                            Iniciar Sessió
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
