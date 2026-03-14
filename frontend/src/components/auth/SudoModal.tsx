'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthAPI } from '@/lib/auth-api';

interface SudoModalProps {
    isOpen: boolean;
    onVerified: () => void;
}

export function SudoModal({ isOpen, onVerified }: SudoModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const verified = await AuthAPI.verifyPassword(password);
            if (verified) {
                onVerified();
            } else {
                setError('Contraseña incorrecta');
            }
        } catch (err) {
            setError('Error al verificar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-full max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Verificación de Seguridad</DialogTitle>
                    <DialogDescription>
                        Para acceder al panel de administración, por favor verifica tu contraseña.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sudo-password">Contraseña</Label>
                        <Input
                            id="sudo-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            disabled={loading}
                            autoFocus
                        />
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !password}>
                            {loading ? 'Verificando...' : 'Verificar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
