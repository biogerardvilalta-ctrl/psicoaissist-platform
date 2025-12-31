'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Check, FileText, User, Calendar, Sparkles, AlertCircle, Scale, PenTool, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReportsAPI, ReportType, ReportStatus, REPORT_TYPE_LABELS } from '@/lib/reports-api';
import { ClientsAPI } from '@/lib/clients-api';
import { SessionsAPI } from '@/lib/sessions-api';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

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
    const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);

    // Compliance State
    const [languageProfile, setLanguageProfile] = useState<'adult' | 'child' | 'school'>('adult');
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [checkContentReviewed, setCheckContentReviewed] = useState(false);
    const [checkLegalResponsibility, setCheckLegalResponsibility] = useState(false);

    // Data Loading
    const [clients, setClients] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

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

    // Load Clients
    useEffect(() => {
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
            setSelectedSessionIds([]);
            return;
        }
        const loadSessions = async () => {
            try {
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
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');

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
                sessionIds: selectedSessionIds,
                additionalInstructions: `Perfil linguístico: ${languageProfile}`
            });
            setDraftContent(result.content);
            setReportTitle(`Informe de ${reportType === ReportType.PROGRESS ? 'Evolución' : 'Alta'} - ${new Date().toLocaleDateString()}`);
            nextStep(); // Move to Edit step
        } catch (error: any) {
            console.error(error);
            // Check for 403 Forbidden specifically for limits (although generate draft usually doesn't have limit, but maybe AI limit)
            if (error?.response?.status === 403 || error?.status === 403 || error?.message?.includes('limit')) {
                setLimitMessage(error.message || 'Límite alcanzado');
                setShowUpgradeModal(true);
                return;
            }

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
                    status: ReportStatus.DRAFT,
                    humanReviewConfirmed: false
                });
                setSavedReportStatus(ReportStatus.DRAFT);
                nextStep();
            } else {
                const report = await ReportsAPI.create({
                    clientId: selectedClientId,
                    title: reportTitle,
                    reportType,
                    content: draftContent,
                    status: ReportStatus.DRAFT,
                    humanReviewConfirmed: false
                });
                setSavedReportId(report.id);
                setSavedReportStatus(ReportStatus.DRAFT);
                nextStep();
            }
        } catch (error: any) {
            console.error(error);
            // Check for 403 Forbidden
            if (error?.response?.status === 403 || error?.status === 403 || error?.message?.includes('limit')) {
                setLimitMessage(error.message || 'Límite de informes alcanzado');
                setShowUpgradeModal(true);
                return;
            }

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
            // NOTE: humanReviewConfirmed is handled by the modal logic now via onFinalizeClick
            const confirmed = true; // If we are here, modal passed

            if (savedReportId) {
                await ReportsAPI.update(savedReportId, {
                    title: reportTitle,
                    content: draftContent,
                    status: ReportStatus.COMPLETED,
                    humanReviewConfirmed: confirmed
                });
                setSavedReportStatus(ReportStatus.COMPLETED);
                nextStep();
            } else {
                const report = await ReportsAPI.create({
                    clientId: selectedClientId,
                    title: reportTitle,
                    reportType,
                    content: draftContent,
                    status: ReportStatus.COMPLETED,
                    humanReviewConfirmed: confirmed
                });
                setSavedReportId(report.id);
                setSavedReportStatus(ReportStatus.COMPLETED);
                nextStep();
            }
        } catch (error: any) {
            console.error(error);
            // Check for 403 Forbidden
            if (error?.response?.status === 403 || error?.status === 403 || error?.message?.includes('limit')) {
                setLimitMessage(error.message || 'Límite de informes alcanzado');
                setShowUpgradeModal(true);
                return;
            }

            toast({
                title: "Error al guardar",
                description: "No se pudo guardar el informe.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onFinalizeClick = () => {
        setCheckContentReviewed(false);
        setCheckLegalResponsibility(false);
        setShowFinalizeModal(true);
    };

    const confirmFinalize = async () => {
        setShowFinalizeModal(false);
        await handleSaveReport();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
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
                    <div className="space-y-8">
                        {/* AI Disclaimer Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Informació important sobre l'ús d'IA</p>
                                <p>
                                    Aquest informe serà redactat amb el suport d’una eina d’intel·ligència artificial i
                                    <strong> requerirà revisió humana obligatòria</strong> abans de ser finalitzat.
                                    L'eina actua com a suport a la redacció i no emet judicis clínics automàtics.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Basic Selection */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold flex items-center"><User className="w-5 h-5 mr-2" /> Dades Bàsiques</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Pacient</Label>
                                        <select
                                            className="w-full p-2 border rounded-md"
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(e.target.value)}
                                        >
                                            <option value="">Seleccionar pacient...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.firstName} {client.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tipus d'Informe</Label>
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
                            </div>

                            {/* Right Column: Language Profile */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold flex items-center"><PenTool className="w-5 h-5 mr-2" /> Perfil Lingüístic</h2>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
                                    <RadioGroup value={languageProfile} onValueChange={(v) => setLanguageProfile(v as any)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="adult" id="r-adult" />
                                            <Label htmlFor="r-adult">Adult (Estàndard)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="child" id="r-child" />
                                            <Label htmlFor="r-child">Infantil / Adolescent</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="school" id="r-school" />
                                            <Label htmlFor="r-school">Escolar / Educatiu</Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-xs text-gray-500 mt-2">
                                        El llenguatge de l’informe s’adaptarà al context seleccionat. Això no implica canvis en el contingut clínic, que sempre serà revisat pel professional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Forensic Warning (Dynamic) */}
                        {reportType === ReportType.LEGAL && (
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Scale className="h-5 w-5 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-amber-700">
                                            <strong>Mode Legal-Forense Actiu:</strong> Aquest tipus d'informe està destinat a ús legal o administratiu.
                                            El sistema aplicarà restriccions reforçades i no es permetrà la finalització sense una doble validació expressa.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-6 border-t">
                            <Button
                                onClick={nextStep}
                                disabled={!selectedClientId}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Sessions */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center"><Calendar className="w-5 h-5 mr-2" /> Selecció de Sessions</h2>
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-100 mb-4">
                            Selecciona les sessions que la IA utilitzarà com a base per a l'esborrany. Recorda que la IA només té accés al contingut transcrit o anotat.
                        </div>

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
                            <Button variant="outline" onClick={prevStep}>Enrere</Button>
                            <Button
                                onClick={handleGenerateDraft}
                                disabled={isLoading || selectedSessionIds.length === 0}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isLoading ? 'Generant...' : <><Sparkles className="w-4 h-4 mr-2" /> Generar Esborrany amb IA</>}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Edit Draft */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-lg font-semibold flex items-center"><FileText className="w-5 h-5 mr-2" /> Revisió i Edició</h2>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                Esborrany generat amb IA – pendent de revisió
                            </Badge>
                        </div>

                        {reportType === ReportType.LEGAL && (
                            <div className="bg-red-50 to-red-100 border-l-4 border-red-500 p-3 flex items-center gap-3">
                                <Scale className="w-5 h-5 text-red-700" />
                                <span className="font-bold text-red-800 text-sm">MODE LEGAL-FORENSE ACTIU: El contingut ha de ser revisat amb especial atenció a la neutralitat i objectivitat.</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <Label>Títol de l'Informe</Label>
                                <input
                                    className="w-full p-2 border rounded-md mt-1"
                                    value={reportTitle}
                                    onChange={(e) => setReportTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Contingut (Totalment Editable)</Label>
                                <RichTextEditor
                                    value={draftContent}
                                    onChange={setDraftContent}
                                    placeholder="El contenido del informe generado aparecerá aquí..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={prevStep}>Enrere</Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={handleSaveDraft}
                                    disabled={isLoading || !reportTitle}
                                >
                                    Guardar Esborrany
                                </Button>
                                <Button
                                    onClick={onFinalizeClick}
                                    disabled={isLoading || !reportTitle}
                                    className={reportType === ReportType.LEGAL ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Finalitzar i Validar
                                </Button>
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
                            {savedReportStatus === ReportStatus.COMPLETED ? 'Informe Validat i Finalitzat' : 'Esborrany Guardat'}
                        </h2>
                        {savedReportStatus === ReportStatus.COMPLETED && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mt-2">
                                <User className="w-4 h-4 mr-1" /> Validat per professional
                            </div>
                        )}
                        <p className="text-gray-500 mt-4">
                            {savedReportStatus === ReportStatus.COMPLETED
                                ? "L'informe ha estat bloquejat i guardat correctament."
                                : "L'esborrany s'ha guardat per continuar més tard."}
                        </p>

                        <div className="flex justify-center gap-4 pt-8">
                            <Button variant="outline" onClick={() => router.push('/dashboard/reports')}>
                                Tornar a la llista
                            </Button>
                            {savedReportStatus === ReportStatus.COMPLETED && (
                                <Button
                                    onClick={async () => {
                                        if (savedReportId) {
                                            try {
                                                const blob = await ReportsAPI.download(savedReportId);
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                const client = clients.find(c => c.id === selectedClientId);
                                                const clientName = client ? `${client.firstName}_${client.lastName}` : 'paciente';
                                                const dateStr = new Date().toISOString().split('T')[0];
                                                link.download = `${clientName.replace(/\s+/g, '_').toLowerCase()}_informe_${dateStr}.pdf`;
                                                link.click();
                                                window.URL.revokeObjectURL(url);
                                            } catch (e) {
                                                console.error("Download failed", e);
                                                toast({ title: "Error", description: "No se pudo descargar el PDF", variant: "destructive" });
                                            }
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Descarregar PDF Oficial
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* VALIDATION MODAL */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitType="reports"
                message={limitMessage}
            />
            <Dialog open={showFinalizeModal} onOpenChange={setShowFinalizeModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            {reportType === ReportType.LEGAL ? <Scale className="w-6 h-6 text-amber-600" /> : <ShieldAlert className="w-6 h-6 text-blue-600" />}
                            <DialogTitle className="text-xl">Validació Professional Obligatòria</DialogTitle>
                        </div>
                        <DialogDescription>
                            Per finalitzar aquest informe, és necessari que el professional assumeixi la responsabilitat del seu contingut.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        {/* Common Disclaimer */}
                        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 border">
                            Recorda: La IA és una eina de suport. La decisió clínica i la responsabilitat legal recauen exclusivament en el professional signant.
                        </div>

                        {/* Checkbox 1: Content Review (ALL TYPES) */}
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                id="check1"
                                className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={checkContentReviewed}
                                onChange={(e) => setCheckContentReviewed(e.target.checked)}
                            />
                            <label htmlFor="check1" className="text-sm font-medium text-gray-900 cursor-pointer">
                                He revisat íntegrament el contingut de l’informe i n’assumeixo la responsabilitat professional.
                            </label>
                        </div>

                        {/* Checkbox 2: Legal Responsibility (FORENSIC ONLY) */}
                        {reportType === ReportType.LEGAL && (
                            <div className="flex items-start space-x-3 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="check2"
                                    className="mt-1 w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                                    checked={checkLegalResponsibility}
                                    onChange={(e) => setCheckLegalResponsibility(e.target.checked)}
                                />
                                <label htmlFor="check2" className="text-sm font-bold text-amber-900 cursor-pointer">
                                    Confirmo que aquest informe pot tenir ús judicial o administratiu i n’assumeixo totes les implicacions legals.
                                </label>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalizeModal(false)}>Cancel·lar</Button>
                        <Button
                            onClick={confirmFinalize}
                            disabled={!checkContentReviewed || (reportType === ReportType.LEGAL && !checkLegalResponsibility)}
                            className={reportType === ReportType.LEGAL ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Signar i Finalitzar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
