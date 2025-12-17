import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly clientsService: ClientsService,
        private readonly encryption: EncryptionService
    ) { }

    // Helper to unpack data
    private unpackEncryptedData(buffer: Buffer, keyId: string) {
        const iv = buffer.subarray(0, 16).toString('base64');
        const tag = buffer.subarray(16, 32).toString('base64');
        const encryptedData = buffer.subarray(32);
        return { iv, tag, encryptedData, keyId };
    }

    async getStats(userId: string) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Calculate start/end of current month
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        // Calculate start/end of previous month
        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        // Fetch counts and complex data
        const [
            allClients,
            newClientsThisMonth,

            totalSessions,
            currentMonthSessions,
            previousMonthSessions,

            totalReports,
            currentMonthReports,
            previousMonthReports,

            // New: Detailed Session Data for advanced metrics
            completedSessions
        ] = await Promise.all([
            this.clientsService.findAll(userId),
            this.prisma.client.count({ where: { userId, isActive: true, createdAt: { gte: startOfCurrentMonth } } }),

            this.prisma.session.count({ where: { userId, status: 'COMPLETED' } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),

            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' }, createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' }, createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),

            // Fetch ALL completed sessions 
            this.prisma.session.findMany({
                where: { userId, status: 'COMPLETED' },
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                    duration: true,
                    sessionType: true,
                    aiMetadata: true,
                    encryptedNotes: true,
                    encryptionKeyId: true
                }
            })
        ]);

        const activeClientsCount = allClients.length;
        const previousActiveClients = Math.max(0, activeClientsCount - newClientsThisMonth);

        // Calculate Hours
        // Calculate Hours with fallback to timestamps
        const totalMinutes = completedSessions.reduce((acc, s) => {
            if (s.duration && s.duration > 0) {
                return acc + s.duration;
            }
            // Fallback: Calculate from start/end times if duration is missing
            if (s.startTime && s.endTime) {
                const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
                const diffMins = Math.round(diffMs / 60000);
                return acc + (diffMins > 0 ? diffMins : 0);
            }
            return acc;
        }, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const formattedHours = `${hours}h ${minutes}m`;

        // Calculate Session Types
        const sessionTypesMap = new Map<string, number>();
        completedSessions.forEach(s => {
            const type = s.sessionType;
            sessionTypesMap.set(type, (sessionTypesMap.get(type) || 0) + 1);
        });

        const sessionTypes = Array.from(sessionTypesMap.entries()).map(([label, value]) => ({
            label: label.charAt(0) + label.slice(1).toLowerCase(), // Capitalize
            value,
            color: this.getColorForType(label)
        })).sort((a, b) => b.value - a.value);


        // Calculate Techniques & Tests via Notes Decryption + AI Metadata
        // Comprehensive Market Lists
        const techniqueKeywords = [
            'TCC', 'Cognitivo-Conductual', 'Cognitivo Conductual',
            'Mindfulness', 'Atención Plena',
            'EMDR',
            'Gestalt',
            'Psicoanálisis', 'Psicodinámica',
            'Sistémica', 'Familiar Sistémica',
            'Humanista',
            'Terapia Breve', 'Estratégica Breve',
            'ACT', 'Aceptación y Compromiso',
            'DBT', 'Dialéctica Conductual',
            'Hipnosis', 'Hipnoterapia',
            'PNL', 'Programación Neurolingüística',
            'Rogeriana', 'Centrada en el Cliente',
            'Biofeedback', 'Neurofeedback',
            'Arteterapia', 'Musicoterapia', 'Dramaterapia',
            'Sandplay', 'Caja de Arena',
            'Narrativa', 'Esquemas', 'Centrada en Soluciones',
            'Interpersonal', 'Racional Emotiva', 'TREC'
        ];

        const testKeywords = [
            // Depression & Anxiety
            'BDI', 'BDI-II', 'Beck Depresión',
            'BAI', 'Beck Ansiedad',
            'Hamilton', 'HDRS', 'HARS',
            'STAI', 'Ansiedad Estado-Rasgo',
            'HAD', 'Escala de Ansiedad y Depresión Hospitalaria',

            // Personality & Psychopathology
            'MMPI', 'MMPI-2', 'MMPI-2-RF',
            'MCMI', 'Millon',
            '16PF', '16 PF',
            'NEO-PI-R', 'Big Five', 'Cinco Grandes',
            'SCL-90', 'SCL-90-R',

            // Intelligence & Cognitive
            'WAIS', 'WAIS-IV',
            'WISC', 'WISC-V',
            'Raven', 'Matrices Progresivas',
            'MMP', // Mini-Mental
            'MMSE', 'Mini-Mental',
            'Bender', 'Test Gestáltico Visomotor',

            // Projective
            'Rorschach',
            'TAT', 'Test de Apercepción Temática',
            'HTP', 'Casa-Árbol-Persona',
            'Figura Humana', 'Machover',
            'Familia Kinética',

            // Neuro/Developmental
            'ADOS', 'ADOS-2',
            'ADI-R',
            'Baron-Cohen',
            'Conners', 'TDAH',
            'Stroop',
            'Wisconsin', 'WCST'
        ];

        const techniqueCounts = new Map<string, number>();
        const testCounts = new Map<string, number>();

        // We process sequentially or parallel? Parallel is fine for decryption.
        await Promise.all(completedSessions.map(async (s) => {
            let noteContent = "";

            // Decrypt notes if available
            if (s.encryptedNotes && s.encryptionKeyId) {
                try {
                    const unpacked = this.unpackEncryptedData(s.encryptedNotes, s.encryptionKeyId);
                    const result = await this.encryption.decryptData<{ notes: string }>(unpacked);
                    if (result.success && result.data && result.data.notes) {
                        noteContent = result.data.notes; // Keep case for regex, but usually we prefer case insensitive matching
                    }
                } catch (e) {
                    console.error(`Failed to decrypt notes for session stats ${s.id}`, e);
                }
            }

            // Combine text
            // User Request: Only scan manual notes for detection to avoid counting AI Detected suggestions or fluff
            // const aiData = JSON.stringify(s.aiMetadata || ""); 
            // const combinedText = (noteContent + " " + aiData).toLowerCase();

            const combinedText = noteContent.toLowerCase();

            // Scan Techniques
            // Scan Techniques from Methodology Field (Priority)
            const aiData = s.aiMetadata as any;
            const manualMethodology = aiData?.manual_methodology as string;

            if (manualMethodology && manualMethodology.trim().length > 0) {
                // Split by common separators (comma, semicolon, newline)
                const methods = manualMethodology.split(/[,;\n]+/).map(m => m.trim()).filter(m => m.length > 0);

                methods.forEach(method => {
                    // Capitalize first letter of each word or just sentence case
                    // Let's normalize to Title Case for consistency
                    const normalized = method.replace(/\b\w/g, c => c.toUpperCase());
                    techniqueCounts.set(normalized, (techniqueCounts.get(normalized) || 0) + 1);
                });
            } else {
                // Fallback: Scan notes if no manual methodology set
                techniqueKeywords.forEach(tech => {
                    const safeTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
                    const isAcronym = /^[a-zA-Z0-9]{1,5}$/.test(tech);

                    if (isAcronym) {
                        const regex = new RegExp(`\\b${safeTech}\\b`, 'i');
                        if (regex.test(combinedText)) {
                            techniqueCounts.set(tech, (techniqueCounts.get(tech) || 0) + 1);
                        }
                    } else {
                        if (combinedText.includes(safeTech)) {
                            techniqueCounts.set(tech, (techniqueCounts.get(tech) || 0) + 1);
                        }
                    }
                });
            }

            // Scan Tests using same logic
            testKeywords.forEach(test => {
                const safeTest = test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
                const isAcronym = /^[a-zA-Z0-9-]{1,6}$/.test(test); // Allow hyphen for BDI-II

                if (isAcronym) {
                    const regex = new RegExp(`\\b${safeTest}\\b`, 'i');
                    if (regex.test(combinedText)) {
                        testCounts.set(test, (testCounts.get(test) || 0) + 1);
                    }
                } else {
                    if (combinedText.includes(safeTest)) {
                        testCounts.set(test, (testCounts.get(test) || 0) + 1);
                    }
                }
            });
        }));

        const techniques = Array.from(techniqueCounts.entries()).map(([label, value]) => ({
            label,
            value,
            color: this.getColorForTechnique(label)
        })).sort((a, b) => b.value - a.value);

        const tests = Array.from(testCounts.entries()).map(([label, value]) => ({
            label,
            value,
            color: this.getRandomColor()
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        return {
            activeClients: activeClientsCount,
            totalSessions,
            totalReports,
            formattedHours,

            clientTrend: this.calculateTrend(newClientsThisMonth, previousActiveClients),
            sessionTrend: this.calculateTrend(currentMonthSessions, previousMonthSessions),
            reportTrend: this.calculateTrend(currentMonthReports, previousMonthReports),

            sessionTypes,
            techniques,
            tests
        };
    }

    private getColorForType(type: string): string {
        switch (type) {
            case 'INDIVIDUAL': return 'bg-blue-500';
            case 'GROUP': return 'bg-green-500';
            case 'FAMILY': return 'bg-purple-500';
            case 'COUPLE': return 'bg-pink-500';
            default: return 'bg-gray-500';
        }
    }

    private getColorForTechnique(tech: string): string {
        // Just deterministic colors based on name roughly or predefined
        const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
        let sum = 0;
        for (let i = 0; i < tech.length; i++) sum += tech.charCodeAt(i);
        return colors[sum % colors.length];
    }

    private getRandomColor(): string {
        const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400', 'bg-red-400'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private calculateTrend(current: number, previous: number): { value: string; isPositive: boolean } {
        if (previous === 0) {
            return {
                value: current > 0 ? `+${current}` : "0",
                isPositive: current >= 0
            };
        }

        const numericTrend = ((current - previous) / previous) * 100;
        const roundedTrend = Math.round(numericTrend);
        const sign = roundedTrend > 0 ? "+" : (roundedTrend < 0 ? "" : ""); // Fix: Only add '+' for positive, '' for negative or zero

        return {
            value: `${sign}${roundedTrend}%`,
            isPositive: roundedTrend >= 0
        };
    }
}
