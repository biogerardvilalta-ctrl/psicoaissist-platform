'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Check, FileText, User, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReportsAPI, ReportType, ReportStatus, REPORT_TYPE_LABELS } from '@/lib/reports-api';
import { ClientsAPI } from '@/lib/clients-api';
import { SessionsAPI } from '@/lib/sessions-api';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export default function NewReportPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Wizard State
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [reportType, setReportType] = useState<ReportType>(ReportType.PROGRESS);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [draftContent, setDraftContent] = useState('');
    const [reportTitle, setReportTitle] = useState('');
    const [savedReportId, setSavedReportId] = useState<string | null>(null);
    const [savedReportStatus, setSavedReportStatus] = useState<ReportStatus | null>(null);

    // Data Loading
    const [clients, setClients] = useState<any[]>([]); // Placeholder type
    const [sessions, setSessions] = useState<any[]>([]); // Placeholder type

    // Load Draft if edit param exists
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    useEffect(() => {
        if (editId) {
            const loadDraft = async () => {
                try {
                    setIsLoading(true);
                    const report = await ReportsAPI.getById(editId);
                    if (report) {
                        setSavedReportId(report.id);
                        setReportTitle(report.title);
                        setReportType(report.reportType);
                        setSelectedClientId(report.clientId);
                        setDraftContent(report.content || '');
                        setStep(3); // Jump to Edit Step
                        setSavedReportStatus(report.status);
                    }
                } catch (error) {
                    console.error("Failed to load draft", error);
                    toast({ title: "Error", description: "No se pudo cargar el borrador.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            loadDraft();
        }
    }, [editId, toast]);

    // Mock Data Loading (Replace with real API calls later)
    useEffect(() => {
        // Load Clients
        const loadClients = async () => {
            try {
                const data = await ClientsAPI.getAll();
                setClients(data);
            } catch (error) {
                console.error("Failed to load clients", error);
            }
        };
        loadClients();
    }, []);

    // Load Sessions when Client Changes
    useEffect(() => {
        if (!selectedClientId) {
            setSessions([]);
            setSelectedSessionIds([]); // Clear selected sessions when client changes
            return;
        }
        const loadSessions = async () => {
            try {
                // Fetch completed sessions for this client
                const data = await SessionsAPI.getAll({ clientId: selectedClientId, status: 'COMPLETED' });
                setSessions(data);
            } catch (error) {
                console.error("Failed to load sessions", error);
                toast({ title: "Error", description: "No se pudieron cargar las sesiones del paciente.", variant: "destructive" });
            }
        };
        loadSessions();
    }, [selectedClientId, toast]);

    // Toggle Session Selection
    const toggleSession = (sessionId: string) => {
        setSelectedSessionIds(prev =>
            prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId]
        );
    };

    // Step Navigation
    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    // Handlers
    const handleGenerateDraft = async () => {
        if (selectedSessionIds.length === 0) {
            toast({ title: "Selecciona sesiones", description: "Debes seleccionar al menos una sesión para analizar.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const result = await ReportsAPI.generateDraft({
                clientId: selectedClientId,
                reportType,
                sessionIds: selectedSessionIds
            });
            setDraftContent(result.content);
            setReportTitle(`Informe de ${reportType === ReportType.PROGRESS ? 'Evolución' : 'Alta'} - ${new Date().toLocaleDateString()}`);
            nextStep(); // Move to Edit step
        } catch (error) {
            console.error(error);
            toast({
                title: "Error generando borrador",
                description: "No se pudo conectar con el servicio de IA.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsLoading(true);
        try {
            if (savedReportId) {
                await ReportsAPI.update(savedReportId, {
                    title: reportTitle,
                    content: draftContent,
                    status: ReportStatus.DRAFT
                });
                setSavedReportStatus(ReportStatus.DRAFT);
                // If we are editing (not finalized), we might stay on step 3 or go to success?
                // User asked for "save draft", usually implies staying or simple confirmation.
                // Let's go to step 4 for consistency but user can go back or to list.
                nextStep();
            } else {
                const report = await ReportsAPI.create({
                    clientId: selectedClientId,
                    title: reportTitle,
                    reportType,
                    content: draftContent,
                    status: ReportStatus.DRAFT
                });
                setSavedReportId(report.id);
                setSavedReportStatus(ReportStatus.DRAFT);
                nextStep(); // Move to Success Step
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al guardar borrador",
                description: "No se pudo guardar el borrador.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveReport = async () => {
        setIsLoading(true);
        try {
            if (savedReportId) {
                await ReportsAPI.update(savedReportId, {
                    title: reportTitle,
                    content: draftContent,
                    status: ReportStatus.COMPLETED
                });
                setSavedReportStatus(ReportStatus.COMPLETED);
                nextStep();
            } else {
                const report = await ReportsAPI.create({
                    clientId: selectedClientId,
                    title: reportTitle,
                    reportType,
                    content: draftContent,
                    status: ReportStatus.COMPLETED
                });
                setSavedReportId(report.id);
                setSavedReportStatus(ReportStatus.COMPLETED);
                nextStep(); // Move to Success Step
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error al guardar",
                description: "No se pudo guardar el informe.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Informe Clínico</h1>
                <p className="text-gray-500">Asistente de generación de informes con IA</p>
            </div>

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`flex flex-col items-center bg-white px-2`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'
                                }`}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            <span className={`text-xs mt-1 font-medium ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
                                {s === 1 ? 'Paciente' : s === 2 ? 'Datos' : s === 3 ? 'Borrador' : 'Revisión'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] p-6">

                {/* Step 1: Select Patient & Type */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center"><User className="w-5 h-5 mr-2" /> Selección de Paciente</h2>
                        {/* Client Selector Placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Paciente</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">Seleccionar paciente...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.firstName} {client.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tipo de Informe</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as ReportType)}
                                >
                                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={nextStep}
                                disabled={!selectedClientId}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Sessions */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center"><Calendar className="w-5 h-5 mr-2" /> Selección de Sesiones</h2>
                        <p className="text-sm text-gray-500">Selecciona las sesiones que la IA debe analizar para generar el borrador.</p>

                        {/* Session List */}
                        <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                            {sessions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 italic">
                                    {selectedClientId ? 'No hay sesiones completadas para este paciente.' : 'Selecciona un paciente primero.'}
                                </div>
                            ) : (
                                sessions.map(session => (
                                    <label key={session.id} className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${selectedSessionIds.includes(session.id) ? 'bg-blue-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="mr-3"
                                            checked={selectedSessionIds.includes(session.id)}
                                            onChange={() => toggleSession(session.id)}
                                        />
                                        <div>
                                            <div className="font-medium">Sesión {new Date(session.startTime).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">{session.sessionType || 'Consulta General'}</div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={prevStep} className="px-4 py-2 border rounded-lg">Atrás</button>
                            <button
                                onClick={handleGenerateDraft}
                                disabled={isLoading || selectedSessionIds.length === 0}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Generando...' : <><Sparkles className="w-4 h-4 mr-2" /> Generar Borrador con IA</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Edit Draft */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center"><FileText className="w-5 h-5 mr-2" /> Revisión del Borrador</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Título del Informe</label>
                                <input
                                    className="w-full p-2 border rounded-md mt-1"
                                    value={reportTitle}
                                    onChange={(e) => setReportTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Contenido del Informe</label>
                                <RichTextEditor
                                    value={draftContent}
                                    onChange={setDraftContent}
                                    placeholder="El contenido del informe generado aparecerá aquí..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={prevStep} className="px-4 py-2 border rounded-lg">Atrás</button>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={isLoading || !reportTitle}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {isLoading ? 'Guardando...' : 'Guardar Borrador'}
                                </button>
                                <button
                                    onClick={handleSaveReport}
                                    disabled={isLoading || !reportTitle}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    {isLoading ? 'Guardando...' : 'Finalizar y Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Step 4: Finalize */}
                {step === 4 && (
                    <div className="space-y-6 text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {savedReportStatus === ReportStatus.COMPLETED ? '¡Informe Guardado y Finalizado!' : '¡Borrador Guardado!'}
                        </h2>
                        <p className="text-gray-500">
                            {savedReportStatus === ReportStatus.COMPLETED
                                ? 'El informe se ha guardado correctamente y está listo para descargar.'
                                : 'El borrador se ha guardado correctamente. Puedes editarlo más tarde desde la lista de informes.'}
                        </p>

                        <div className="flex justify-center gap-4 pt-8">
                            <button onClick={() => router.push('/dashboard/reports')} className="px-4 py-2 border rounded-lg">
                                Volver a la lista
                            </button>
                            {savedReportStatus === ReportStatus.COMPLETED && (
                                <button
                                    onClick={async () => {
                                        if (savedReportId) {
                                            try {
                                                const blob = await ReportsAPI.download(savedReportId);
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `informe-${savedReportId}.pdf`;
                                                link.click();
                                                window.URL.revokeObjectURL(url);
                                            } catch (e) {
                                                console.error("Download failed", e);
                                                toast({ title: "Error", description: "No se pudo descargar el PDF", variant: "destructive" });
                                            }
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Descargar PDF
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
