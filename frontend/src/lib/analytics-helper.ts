import { Session, SessionStatus } from './sessions-api';
import { Client } from './clients-api';
import { addDays, isAfter, isBefore, isSameMonth, parseISO } from 'date-fns';

export interface DashboardStats {
    totalSessions: number;
    completedSessions: number;
    totalPatients: number;
    activePatients: number;
    sessionsByMonth: { name: string; value: number }[];
    topThemes: { name: string; value: number }[];
    sentimentTrend: { sessionDate: string; sentiment: number }[];
    clientTrend?: { value: string; isPositive: boolean };
    // New Trend Arrays
    incomeByMonth?: { name: string; value: number }[];
    attendanceByMonth?: { name: string; value: number }[];
    cancellationByMonth?: { name: string; value: number }[];
    patientsByMonth?: { name: string; value: number }[];
}


export function calculateDashboardStats(sessions: Session[], clients: Client[], hourlyRate: number = 60): DashboardStats {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED).length;
    const totalPatients = clients.length;

    // Active patients
    const activePatientIds = new Set(sessions.map(s => s.clientId));
    const activePatients = activePatientIds.size;

    // --- AGGREGATION BY MONTH ---
    const monthStats = new Map<string, {
        sessions: number;
        completed: number;
        cancelled: number;
        income: number;
        newPatients: number;
        dateObj: Date;
    }>();

    // Helper to get/init month entry
    const getMonthEntry = (date: Date) => {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        // Display Label: "MM/YYYY" ? Or "MMM"?
        // Let's keep key as sortable YYYY-MM
        if (!monthStats.has(key)) {
            monthStats.set(key, {
                sessions: 0,
                completed: 0,
                cancelled: 0,
                income: 0,
                newPatients: 0,
                dateObj: date
            });
        }
        return monthStats.get(key)!;
    };

    // 1. Process Sessions
    sessions.forEach(session => {
        const date = new Date(session.startTime);
        const entry = getMonthEntry(date);

        entry.sessions++;
        if (session.status === SessionStatus.COMPLETED) {
            entry.completed++;
            entry.income += hourlyRate;
        } else if (session.status === SessionStatus.CANCELLED || session.status === SessionStatus.NO_SHOW) {
            entry.cancelled++;
        }
    });

    // 2. Process Clients (New Patients)
    clients.forEach(client => {
        const date = new Date(client.createdAt);
        const entry = getMonthEntry(date);
        entry.newPatients++;
    });

    // 3. Sort and limit to last 6 months
    const sortedEntries = Array.from(monthStats.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6); // Last 6 months

    // 4. Transform to Chart Data
    const sessionsByMonth = sortedEntries.map(([key, data]) => ({
        name: `${data.dateObj.getMonth() + 1}/${data.dateObj.getFullYear()}`,
        value: data.sessions
    }));

    const incomeByMonth = sortedEntries.map(([key, data]) => ({
        name: `${data.dateObj.getMonth() + 1}/${data.dateObj.getFullYear()}`,
        value: data.income
    }));

    const patientsByMonth = sortedEntries.map(([key, data]) => ({
        name: `${data.dateObj.getMonth() + 1}/${data.dateObj.getFullYear()}`,
        value: data.newPatients
    }));

    const attendanceByMonth = sortedEntries.map(([key, data]) => {
        const total = data.completed + data.cancelled;
        const rate = total > 0 ? Math.round((data.completed / total) * 100) : 0;
        return {
            name: `${data.dateObj.getMonth() + 1}/${data.dateObj.getFullYear()}`,
            value: rate
        };
    });

    const cancellationByMonth = sortedEntries.map(([key, data]) => {
        const total = data.completed + data.cancelled;
        const rate = total > 0 ? Math.round((data.cancelled / total) * 100) : 0;
        return {
            name: `${data.dateObj.getMonth() + 1}/${data.dateObj.getFullYear()}`,
            value: rate
        };
    });


    // Mock Themes (Existing logic)
    const topThemes = [
        { name: 'Ansiedad', value: 35 },
        { name: 'Relaciones', value: 25 },
        { name: 'Autoestima', value: 20 },
        { name: 'Trabajo', value: 15 },
        { name: 'Duelo', value: 5 },
    ];

    // Mock Sentiment (Existing logic)
    const sentimentTrend = sessions
        .filter(s => s.status === SessionStatus.COMPLETED)
        .slice(-10)
        .map((s) => ({
            sessionDate: new Date(s.startTime).toLocaleDateString(),
            sentiment: 5 + Math.random() * 4
        }));

    return {
        totalSessions,
        completedSessions,
        totalPatients,
        activePatients,
        sessionsByMonth,
        topThemes,
        sentimentTrend,
        clientTrend: { value: "Estable", isPositive: true },
        incomeByMonth,
        attendanceByMonth,
        cancellationByMonth,
        patientsByMonth
    };
}

export interface AdvancedStats {
    sessionsNextWeek: number;
    pendingNotes: number;
    cancellationRate: number;
    attendanceRate: number;
    monthIncome: number;
    sessionsThisMonth: number;
}

export function calculateAdvancedStats(allSessions: Session[], ratePerHour: number = 60): AdvancedStats {
    const now = new Date();

    // 1. Next 7 Days
    const nextWeek = addDays(now, 7);
    const sessionsNextWeek = allSessions.filter(s =>
        s.status === 'SCHEDULED' && // Use string literal if enum problematic, but import works
        isAfter(parseISO(s.startTime), now) &&
        isBefore(parseISO(s.startTime), nextWeek)
    ).length;

    // 2. Pending Notes
    const pendingNotes = allSessions.filter(s =>
        s.status === SessionStatus.COMPLETED &&
        (!s.notes || s.notes.trim().length === 0)
    ).length;

    // 3. Month Income & Sessions
    const completedThisMonth = allSessions.filter(s =>
        s.status === SessionStatus.COMPLETED &&
        isSameMonth(parseISO(s.startTime), now)
    ).length;
    const monthIncome = completedThisMonth * ratePerHour;

    // 4. Rates
    const completed = allSessions.filter(s => s.status === SessionStatus.COMPLETED).length;
    const cancelled = allSessions.filter(s => s.status === SessionStatus.CANCELLED || s.status === SessionStatus.NO_SHOW).length;
    const totalForRate = completed + cancelled;

    const cancellationRate = totalForRate > 0 ? Math.round((cancelled / totalForRate) * 100) : 0;
    const attendanceRate = totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : 100;

    return {
        sessionsNextWeek,
        pendingNotes,
        monthIncome,
        cancellationRate,
        attendanceRate,
        sessionsThisMonth: completedThisMonth
    };
}




