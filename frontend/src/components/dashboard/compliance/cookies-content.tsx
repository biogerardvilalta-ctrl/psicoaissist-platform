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
                <p className="text-lg text-muted-foreground">Información sobre el uso de cookies y tecnologías similares</p>
            </div>

            <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                        Uso de Cookies
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">1. ¿Qué son las cookies?</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Una cookie es un pequeño archivo de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">2. Cookies que utiliza este sitio web</h2>
                        <p className="text-slate-700 mb-4">
                            Esta aplicación utiliza exclusivamente <strong>cookies técnicas y de sesión</strong> necesarias para el funcionamiento del servicio.
                        </p>

                        <div className="grid gap-4">
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">Cookies de autenticación</h3>
                                <p className="text-sm text-slate-600">Se utilizan para identificar al usuario una vez ha iniciado sesión, permitiendo el acceso a las áreas privadas y asegurando que la sesión se mantiene activa de manera segura.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">Cookies de preferencias</h3>
                                <p className="text-sm text-slate-600">Almacenan preferencias de la interfaz de usuario (como el idioma o el tamaño de la fuente) para personalizar su experiencia.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h3 className="font-semibold text-blue-800 mb-1">Cookies de seguridad</h3>
                                <p className="text-sm text-slate-600">Ayudan a prevenir ataques de seguridad y proteger los datos del usuario contra accesos no autorizados.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">3. Cookies de terceros</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Actualmente, <strong>no utilizamos cookies publicitarias ni de seguimiento</strong> de terceros (como Google Analytics o Facebook Pixel) dentro del área privada de la aplicación. La privacidad del profesional y del paciente es prioritaria.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-blue-900">4. ¿Cómo desactivar las cookies?</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Puede restringir, bloquear o borrar las cookies del navegador en cualquier momento. Consulte la ayuda de su navegador para saber cómo hacerlo. Tenga en cuenta que desactivar las cookies técnicas podría impedir el correcto funcionamiento de la aplicación.
                        </p>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
