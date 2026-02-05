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
import { useTranslations } from 'next-intl';

interface ConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (isMinor?: boolean) => void;
    clientName: string;
}

export function ConsentModal({ isOpen, onClose, onConfirm, clientName }: ConsentModalProps) {
    const t = useTranslations('ConsentModal');
    const [isChecked, setIsChecked] = useState(false);
    const [isMinorChecked, setIsMinorChecked] = useState(false);

    const handleConfirm = () => {
        if (isChecked) {
            onConfirm(isMinorChecked);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-700">
                        <ShieldCheck className="h-5 w-5" />
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('description').split('{clientName}')[0]}<strong>{clientName}</strong>{t('description').split('{clientName}')[1]}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">{t('clinicalToolTitle')}</AlertTitle>
                        <AlertDescription className="text-blue-700 text-sm">
                            {t('clinicalToolDescription').split('No realitza')[0]}
                            <strong>{t('clinicalToolDescription').split('No realitza')[1] ? 'No realitza' + t('clinicalToolDescription').split('No realitza')[1] : t('clinicalToolDescription')}</strong>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
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
                                    {t('consentLabel')}
                                </label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('audioDeleteNote')}
                                </p>
                            </div>
                        </div>

                        {/* Minor Checkbox */}
                        <div className="flex items-top space-x-2 border p-3 rounded-md bg-amber-50 border-amber-200">
                            <Checkbox
                                id="minor-consent"
                                checked={isMinorChecked}
                                onCheckedChange={(c) => setIsMinorChecked(c as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="minor-consent"
                                    className="text-sm font-bold text-amber-900 leading-none cursor-pointer"
                                >
                                    {t('minorLabel')}
                                </label>
                                <p className="text-xs text-amber-800 mt-1">
                                    {t('minorNote')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <div className="text-xs text-slate-400 mt-2 sm:mt-0 flex items-center">
                        {t('secureServer')} <ShieldCheck className="h-3 w-3 ml-1" />
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            {t('cancel')}
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={!isChecked}>
                            {t('startSession')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
