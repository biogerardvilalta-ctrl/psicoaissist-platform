import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/auth-api';
import { Palette, Building, Image as ImageIcon } from 'lucide-react';

export function BrandingSettings() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [companyName, setCompanyName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [secondaryColor, setSecondaryColor] = useState('#1E293B');
    const [logoUrl, setLogoUrl] = useState('');
    const [showLogo, setShowLogo] = useState(true);

    useEffect(() => {
        if (user && (user as any).brandingConfig) {
            const config = (user as any).brandingConfig;
            setCompanyName(config.companyName || '');
            setPrimaryColor(config.primaryColor || '#4F46E5');
            setSecondaryColor(config.secondaryColor || '#1E293B');
            setLogoUrl(config.logoUrl || '');
            setShowLogo(config.showLogo !== false);
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const newConfig = {
                companyName,
                primaryColor,
                secondaryColor,
                logoUrl,
                showLogo
            };

            await AuthAPI.updateProfile({ brandingConfig: newConfig });
            updateUser({ ...user!, brandingConfig: newConfig } as any);

            toast({ title: 'Configuración guardada', description: 'Tus ajustes de branding se han actualizado.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Nombre de la Empresa / Clínica
                        </Label>
                        <Input
                            placeholder="Ej: Clínica Psicológica Avanzada"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">Este nombre aparecerá en la cabecera de tus informes PDF.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Color Primario
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Color Secundario
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Future Logo implementation. For now just placeholder URL input logic if needed, but keeping it simple for text branding first as per PDF service */}
                    {/* 
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Logo URL (No implementado en PDF aún)
                        </Label>
                        <Input 
                            placeholder="https://..." 
                            value={logoUrl} 
                            onChange={(e) => setLogoUrl(e.target.value)} 
                            disabled
                        />
                    </div> 
                    */}

                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="showLogo"
                            checked={showLogo}
                            onCheckedChange={(c) => setShowLogo(!!c)}
                        />
                        <Label htmlFor="showLogo">Mostrar icono en informes</Label>
                    </div>

                </div>

                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </div>
    );
}
