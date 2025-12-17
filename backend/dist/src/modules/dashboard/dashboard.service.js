"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const clients_service_1 = require("../clients/clients.service");
const encryption_service_1 = require("../encryption/encryption.service");
let DashboardService = class DashboardService {
    constructor(prisma, clientsService, encryption) {
        this.prisma = prisma;
        this.clientsService = clientsService;
        this.encryption = encryption;
    }
    unpackEncryptedData(buffer, keyId) {
        const iv = buffer.subarray(0, 16).toString('base64');
        const tag = buffer.subarray(16, 32).toString('base64');
        const encryptedData = buffer.subarray(32);
        return { iv, tag, encryptedData, keyId };
    }
    async getStats(userId) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        const [allClients, newClientsThisMonth, totalSessions, currentMonthSessions, previousMonthSessions, totalReports, currentMonthReports, previousMonthReports, completedSessions] = await Promise.all([
            this.clientsService.findAll(userId),
            this.prisma.client.count({ where: { userId, isActive: true, createdAt: { gte: startOfCurrentMonth } } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED' } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' }, createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' }, createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),
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
        const totalMinutes = completedSessions.reduce((acc, s) => {
            if (s.duration && s.duration > 0) {
                return acc + s.duration;
            }
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
        const sessionTypesMap = new Map();
        completedSessions.forEach(s => {
            const type = s.sessionType;
            sessionTypesMap.set(type, (sessionTypesMap.get(type) || 0) + 1);
        });
        const sessionTypes = Array.from(sessionTypesMap.entries()).map(([label, value]) => ({
            label: label.charAt(0) + label.slice(1).toLowerCase(),
            value,
            color: this.getColorForType(label)
        })).sort((a, b) => b.value - a.value);
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
            'BDI', 'BDI-II', 'Beck Depresión',
            'BAI', 'Beck Ansiedad',
            'Hamilton', 'HDRS', 'HARS',
            'STAI', 'Ansiedad Estado-Rasgo',
            'HAD', 'Escala de Ansiedad y Depresión Hospitalaria',
            'MMPI', 'MMPI-2', 'MMPI-2-RF',
            'MCMI', 'Millon',
            '16PF', '16 PF',
            'NEO-PI-R', 'Big Five', 'Cinco Grandes',
            'SCL-90', 'SCL-90-R',
            'WAIS', 'WAIS-IV',
            'WISC', 'WISC-V',
            'Raven', 'Matrices Progresivas',
            'MMP',
            'MMSE', 'Mini-Mental',
            'Bender', 'Test Gestáltico Visomotor',
            'Rorschach',
            'TAT', 'Test de Apercepción Temática',
            'HTP', 'Casa-Árbol-Persona',
            'Figura Humana', 'Machover',
            'Familia Kinética',
            'ADOS', 'ADOS-2',
            'ADI-R',
            'Baron-Cohen',
            'Conners', 'TDAH',
            'Stroop',
            'Wisconsin', 'WCST'
        ];
        const techniqueCounts = new Map();
        const testCounts = new Map();
        await Promise.all(completedSessions.map(async (s) => {
            let noteContent = "";
            if (s.encryptedNotes && s.encryptionKeyId) {
                try {
                    const unpacked = this.unpackEncryptedData(s.encryptedNotes, s.encryptionKeyId);
                    const result = await this.encryption.decryptData(unpacked);
                    if (result.success && result.data && result.data.notes) {
                        noteContent = result.data.notes;
                    }
                }
                catch (e) {
                    console.error(`Failed to decrypt notes for session stats ${s.id}`, e);
                }
            }
            const combinedText = noteContent.toLowerCase();
            const aiData = s.aiMetadata;
            const manualMethodology = aiData?.manual_methodology;
            if (manualMethodology && manualMethodology.trim().length > 0) {
                const methods = manualMethodology.split(/[,;\n]+/).map(m => m.trim()).filter(m => m.length > 0);
                methods.forEach(method => {
                    const normalized = method.replace(/\b\w/g, c => c.toUpperCase());
                    techniqueCounts.set(normalized, (techniqueCounts.get(normalized) || 0) + 1);
                });
            }
            else {
                techniqueKeywords.forEach(tech => {
                    const safeTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
                    const isAcronym = /^[a-zA-Z0-9]{1,5}$/.test(tech);
                    if (isAcronym) {
                        const regex = new RegExp(`\\b${safeTech}\\b`, 'i');
                        if (regex.test(combinedText)) {
                            techniqueCounts.set(tech, (techniqueCounts.get(tech) || 0) + 1);
                        }
                    }
                    else {
                        if (combinedText.includes(safeTech)) {
                            techniqueCounts.set(tech, (techniqueCounts.get(tech) || 0) + 1);
                        }
                    }
                });
            }
            testKeywords.forEach(test => {
                const safeTest = test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
                const isAcronym = /^[a-zA-Z0-9-]{1,6}$/.test(test);
                if (isAcronym) {
                    const regex = new RegExp(`\\b${safeTest}\\b`, 'i');
                    if (regex.test(combinedText)) {
                        testCounts.set(test, (testCounts.get(test) || 0) + 1);
                    }
                }
                else {
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
    getColorForType(type) {
        switch (type) {
            case 'INDIVIDUAL': return 'bg-blue-500';
            case 'GROUP': return 'bg-green-500';
            case 'FAMILY': return 'bg-purple-500';
            case 'COUPLE': return 'bg-pink-500';
            default: return 'bg-gray-500';
        }
    }
    getColorForTechnique(tech) {
        const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
        let sum = 0;
        for (let i = 0; i < tech.length; i++)
            sum += tech.charCodeAt(i);
        return colors[sum % colors.length];
    }
    getRandomColor() {
        const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400', 'bg-red-400'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    calculateTrend(current, previous) {
        if (previous === 0) {
            return {
                value: current > 0 ? `+${current}` : "0",
                isPositive: current >= 0
            };
        }
        const numericTrend = ((current - previous) / previous) * 100;
        const roundedTrend = Math.round(numericTrend);
        const sign = roundedTrend > 0 ? "+" : (roundedTrend < 0 ? "" : "");
        return {
            value: `${sign}${roundedTrend}%`,
            isPositive: roundedTrend >= 0
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clients_service_1.ClientsService,
        encryption_service_1.EncryptionService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map