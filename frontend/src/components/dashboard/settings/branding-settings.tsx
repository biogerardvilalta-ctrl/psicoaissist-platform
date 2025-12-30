import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/auth-api';
import { Palette, Building, Image as ImageIcon, X } from 'lucide-react';

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

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Logo de la Empresa
                        </Label>

                        <div className="flex items-center gap-4">
                            {logoUrl && (
                                <div className="relative w-16 h-16 border rounded bg-slate-100 overflow-visible flex items-center justify-center group">
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl('')}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                                        title="Eliminar logo"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    {/* Backend implementation serves files at root/uploads, frontend proxy or direct URL needs mapping.
                                        If local dev, full URL might be needed or relative path if served by Next/Backend.
                                        Assuming backend is at same origin or proxied. If backend is 3001 and frontend 3000, we might need full path if not proxied.
                                        Ideally, use a safe relative path or ensure backend serves cors. 
                                        Since we use a proxy or env vars, let's treat it as relative path if starting with /uploads.
                                    */}
                                    <img
                                        src={logoUrl.startsWith('http') ? logoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${logoUrl}`}
                                        alt="Logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setLoading(true);
                                        try {
                                            const res = await AuthAPI.uploadLogo(file);
                                            setLogoUrl(res.url);
                                            toast({ title: 'Logo subido', description: 'El logo se ha cargado correctamente.' });
                                        } catch (error) {
                                            console.error(error);
                                            toast({ title: 'Error', description: 'No se pudo subir el logo.', variant: 'destructive' });
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="h-auto py-2 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Formatos: PNG, JPG. Máx 2MB. Recomendado fondo transparente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="showLogo"
                            checked={showLogo}
                            onCheckedChange={(c) => setShowLogo(!!c)}
                        />
                        <Label htmlFor="showLogo">Mostrar icono/logo en informes</Label>
                    </div>

                </div>

                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </div>
    );
}
