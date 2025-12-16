import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie } from 'lucide-react';

export function CookiesContent() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Cookie className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Política de Cookies</h1>
                <p className="text-lg text-muted-foreground">Informació sobre l'ús de galetes i tecnologies similars</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        Ús de Cookies
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. Què són les cookies?</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Una cookie és un petit fitxer de text que s'emmagatzema al vostre navegador quan visiteu gairebé qualsevol pàgina web. La seva utilitat és que el web sigui capaç de recordar la vostra visita quan torneu a navegar per aquesta pàgina.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Cookies que utilitza aquest lloc web</h2>
                        <p className="text-slate-700 mb-4">
                            Aquesta aplicació utilitza exclusivament <strong>cookies tècniques i de sessió</strong> necessàries per al funcionament del servei.
                        </p>

                        <div className="grid gap-4">
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">Cookies d'autenticació</h3>
                                <p className="text-sm text-slate-600">S'utilitzen per identificar l'usuari un cop ha iniciat sessió, permetent l'accés a les àrees privades i assegurant que la sessió es manté activa de manera segura.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">Cookies de preferències</h3>
                                <p className="text-sm text-slate-600">Emmagatzemen preferències de la interfície d'usuari (com ara l'idioma o la mida de la font) per personalitzar la vostra experiència.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">Cookies de seguretat</h3>
                                <p className="text-sm text-slate-600">Ajuden a prevenir atacs de seguretat i protegir les dades de l'usuari contra accessos no autoritzats.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Cookies de tercers</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Actualment, <strong>no utilitzem cookies publicitàries ni de seguiment</strong> de tercers (com Google Analytics o Facebook Pixel) dins de l'àrea privada de l'aplicació. La privacitat del professional i del pacient és prioritària.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. Com desactivar les cookies?</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Podeu restringir, bloquejar o esborrar les cookies del navegador en qualsevol moment. Consulteu l'ajuda del vostre navegador per saber com fer-ho. Tingueu en compte que desactivar les cookies tècniques podria impedir el correcte funcionament de l'aplicació.
                        </p>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
