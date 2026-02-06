import { Link } from '@/navigation';
import { ArrowLeft, PlayCircle, Video } from 'lucide-react';

export default function TutorialsPage() {
    const tutorials = [
        {
            title: "Cómo crear tu primera sesión",
            duration: "2:15",
            description: "Aprende paso a paso cómo agendar una cita y vincularla a un paciente.",
            category: "Básico"
        },
        {
            title: "Interpretación del Dashboard de IA",
            duration: "4:30",
            description: "Descubre qué significan las métricas de bienestar y temas recurrentes.",
            category: "Avanzado"
        },
        {
            title: "Configurar Google Calendar",
            duration: "1:45",
            description: "Sincroniza tu agenda personal con la plataforma para evitar conflictos.",
            category: "Configuración"
        },
        {
            title: "Gestión para Secretarios (Agenda Managers)",
            duration: "3:20",
            description: "Cómo gestionar múltiples doctores y crear grupos de profesionales.",
            category: "Roles"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/docs" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Documentación
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Video Tutoriales</h1>
                    <p className="text-lg text-slate-600">Aprende viendo. Guías visuales para dominar la plataforma.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map((video, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {video.duration}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                                    {video.category}
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {video.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <Video className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">¿Buscas algo específico?</h3>
                    <p className="text-blue-700 mb-4">
                        Estamos creando nuevos tutoriales cada semana. Si necesitas ayuda con algo concreto, contáctanos.
                    </p>
                    <Link href="/contact" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Solicitar Tutorial
                    </Link>
                </div>
            </div>
        </div>
    );
}
