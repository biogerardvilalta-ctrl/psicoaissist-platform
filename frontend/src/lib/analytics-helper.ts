import { Session, SessionStatus } from './sessions-api';
import { Client } from './clients-api';

export interface DashboardStats {
    totalSessions: number;
    completedSessions: number;
    totalPatients: number;
    activePatients: number; // For now, patients with at least 1 session
    sessionsByMonth: { name: string; value: number }[];
    topThemes: { name: string; value: number }[];
    sentimentTrend: { sessionDate: string; sentiment: number }[]; // 1-10 scale
}

export function calculateDashboardStats(sessions: Session[], clients: Client[]): DashboardStats {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED).length;
    const totalPatients = clients.length;

    // Active patients: those who have a session in the list (naive metric for MVP)
    const activePatientIds = new Set(sessions.map(s => s.clientId));
    const activePatients = activePatientIds.size;

    // Sessions by Month (Last 6 months)
    const sessionsByMonthMap = new Map<string, number>();
    sessions.forEach(session => {
        const date = new Date(session.startTime);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        sessionsByMonthMap.set(monthKey, (sessionsByMonthMap.get(monthKey) || 0) + 1);
    });

    // Convert to array and take last 6
    const sessionsByMonth = Array.from(sessionsByMonthMap.entries())
        .map(([name, value]) => ({ name, value }))
        .slice(-6);

    // Mock Themes (since we don't have tags on all sessions yet)
    const topThemes = [
        { name: 'Ansiedad', value: 35 },
        { name: 'Relaciones', value: 25 },
        { name: 'Autoestima', value: 20 },
        { name: 'Trabajo', value: 15 },
        { name: 'Duelo', value: 5 },
    ];

    // Mock Sentiment Trend (simulated from "valid" sessions)
    const sentimentTrend = sessions
        .filter(s => s.status === SessionStatus.COMPLETED)
        .slice(-10)
        .map((s, index) => ({
            sessionDate: new Date(s.startTime).toLocaleDateString(),
            sentiment: 5 + Math.random() * 4 // Random 5-9 score for MVP demo
        }));

    return {
        totalSessions,
        completedSessions,
        totalPatients,
        activePatients,
        sessionsByMonth,
        topThemes,
        sentimentTrend
    };
}
