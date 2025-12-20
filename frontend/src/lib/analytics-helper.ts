import { Session, SessionStatus } from './sessions-api';
import { Client } from './clients-api';
import {
    addDays,
    isAfter,
    isBefore,
    isSameMonth,
    parseISO,
    startOfDay,
    startOfWeek,
    startOfMonth,
    format,
    subMonths,
    subYears,
    isSameDay,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    isWithinInterval,
    endOfDay,
    endOfWeek,
    endOfMonth,
    Interval
} from 'date-fns';
import { es } from 'date-fns/locale';

export type TimeRange = '1m' | '3m' | '6m' | '1y';

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


export function calculateDashboardStats(
    sessions: Session[],
    clients: Client[],
    hourlyRate: number = 60,
    timeRange: TimeRange = '6m'
): DashboardStats {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED).length;
    const totalPatients = clients.length;

    // Active patients
    const activePatientIds = new Set(sessions.map(s => s.clientId));
    const activePatients = activePatientIds.size;

    // --- DETERMINE DATE RANGE & GRANULARITY ---
    const now = new Date();
    // Normalize "now" to the END of the current unit to ensure the last interval is fully generated
    // e.g. if today is Wed, we want the whole week to be included in the interval check

    let startDate: Date;
    let endDate: Date = now;
    let intervalFn: (interval: Interval) => Date[];
    let dateFormat: string;
    let dateKeyFn: (date: Date) => string;

    switch (timeRange) {
        case '1m':
            startDate = startOfDay(subMonths(now, 1)); // From start of day 1 month ago
            endDate = endOfMonth(now);                 // To end of current month
            intervalFn = eachDayOfInterval;
            dateFormat = 'dd/MM';
            dateKeyFn = (date) => format(date, 'yyyy-MM-dd');
            break;
        case '3m':
            startDate = startOfWeek(subMonths(now, 3), { weekStartsOn: 1 });
            endDate = endOfMonth(now);                 // To end of current month
            intervalFn = eachWeekOfInterval;
            dateFormat = "'Sem' w - MMM";
            dateKeyFn = (date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            break;
        case '1y':
            startDate = startOfMonth(subYears(now, 1));
            endDate = endOfMonth(now); // Ensure current month is fully covered
            intervalFn = eachMonthOfInterval;
            dateFormat = 'MMM yy';
            dateKeyFn = (date) => format(startOfMonth(date), 'yyyy-MM');
            break;
        case '6m':
        default:
            startDate = startOfMonth(subMonths(now, 6));
            endDate = endOfMonth(now);
            intervalFn = eachMonthOfInterval;
            dateFormat = 'MMM yy';
            dateKeyFn = (date) => format(startOfMonth(date), 'yyyy-MM');
            break;
    }

    // Generate all time points (x-axis) to ensure continuous chart even with no data
    const allPoints = intervalFn({ start: startDate, end: endDate });

    // Initialize stats map with 0s for all points
    const statsMap = new Map<string, {
        sessions: number;
        completed: number;
        cancelled: number;
        income: number;
        newPatients: number;
        label: string;
        dateObj: Date;
    }>();

    allPoints.forEach(date => {
        const key = dateKeyFn(date);
        statsMap.set(key, {
            sessions: 0,
            completed: 0,
            cancelled: 0,
            income: 0,
            newPatients: 0,
            label: format(date, dateFormat, { locale: es }),
            dateObj: date
        });
    });

    // Helper to add data to the correct bucket
    const addToBucket = (dateStr: string | Date, type: 'session' | 'client', sessionStatus?: SessionStatus | string) => {
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;

        // Filter out if before range
        if (isBefore(date, startDate) || isAfter(date, endOfDay(now))) return;

        const key = dateKeyFn(date);

        // If key doesn't exist (e.g. edge cases of timezone), try to find closest or ignore
        // For simplicity, we only add if exists in our generated intervals (which cover the whole range)
        const entry = statsMap.get(key);
        if (entry) {
            if (type === 'session') {
                entry.sessions++;
                if (sessionStatus === SessionStatus.COMPLETED) {
                    entry.completed++;
                }

                // Income includes Completed AND Scheduled (Projected)
                if (sessionStatus === SessionStatus.COMPLETED || sessionStatus === SessionStatus.SCHEDULED) {
                    entry.income += hourlyRate;
                }

                if (sessionStatus === SessionStatus.CANCELLED || sessionStatus === SessionStatus.NO_SHOW) {
                    entry.cancelled++;
                }
            } else if (type === 'client') {
                entry.newPatients++;
            }
        }
    };

    // 1. Process Sessions
    sessions.forEach(session => {
        addToBucket(session.startTime, 'session', session.status);
    });

    // 2. Process Clients (New Patients)
    clients.forEach(client => {
        addToBucket(client.createdAt, 'client');
    });

    // 3. Transform to Chart Data (sorted naturally by generation order)
    const sortedEntries = Array.from(statsMap.values());

    const sessionsByMonth = sortedEntries.map(data => ({
        name: data.label,
        value: data.sessions
    }));

    const incomeByMonth = sortedEntries.map(data => ({
        name: data.label,
        value: data.income
    }));

    const patientsByMonth = sortedEntries.map(data => ({
        name: data.label,
        value: data.newPatients
    }));

    const attendanceByMonth = sortedEntries.map(data => {
        const total = data.completed + data.cancelled;
        const rate = total > 0 ? Math.round((data.completed / total) * 100) : 0;
        return {
            name: data.label,
            value: rate
        };
    });

    const cancellationByMonth = sortedEntries.map(data => {
        const total = data.completed + data.cancelled;
        const rate = total > 0 ? Math.round((data.cancelled / total) * 100) : 0;
        return {
            name: data.label,
            value: rate
        };
    });


    // 4. Top Themes (From Real Data)
    const themeCounts = new Map<string, number>();
    sessions.forEach(session => {
        session.aiMetadata?.emotionalElements?.forEach(element => {
            const count = themeCounts.get(element) || 0;
            themeCounts.set(element, count + 1);
        });
        // Also check narrativeIndicators if emotionalElements is empty? 
        // For now sticking to emotionalElements as primary source for "Themes"
    });

    const topThemes = Array.from(themeCounts.entries())
        .sort((a, b) => b[1] - a[1]) // Sort desc
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    // If no real themes found, fallback to empty to avoid "No Data" ugly state or keep mock if preferred?
    // User requested "preparado para datos reales", so empty is better than fake if we want truth.

    // 5. Sentiment Trend (From Real Data or Fallback)
    const sentimentTrend = sessions
        .filter(s => s.status === SessionStatus.COMPLETED)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) // Ensure chronological
        .slice(-20) // Show last 20 sessions max
        .map((s) => ({
            sessionDate: format(parseISO(s.startTime), 'dd/MM'),
            // Use real score if exists, otherwise null (chart handling needed) or default
            // If user wants only real data, this will be undefined/null until backend populates it.
            // For now, if no score, we return 0 or skip? 
            // Better to mapping only if score exists or show 0.
            sentiment: s.aiMetadata?.sentimentScore || 0
        }))
        .filter(item => item.sentiment > 0); // Only show points that have a score

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
    sessionsLast30Days: { date: string; count: number }[];
    weeklyLoad: { day: string; count: number }[];
}

export function calculateAdvancedStats(allSessions: Session[], ratePerHour: number = 60): AdvancedStats {
    const now = new Date();

    // 0. Sessions Last 30 Days (Daily Evolution)
    const thirtyDaysAgo = subMonths(now, 1);
    const intervalDays = eachDayOfInterval({ start: thirtyDaysAgo, end: now });

    const sessionsLast30Days = intervalDays.map(day => {
        const count = allSessions.filter(s =>
            (s.status === SessionStatus.COMPLETED || s.status === SessionStatus.SCHEDULED) &&
            isSameDay(parseISO(s.startTime), day)
        ).length;
        return {
            date: format(day, 'dd/MM'),
            count
        };
    });

    // 0.5 Weekly Load (Mon-Sun)
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

    const weeklyLoad = daysOfWeek.map(day => {
        const count = allSessions.filter(s =>
            (s.status === SessionStatus.COMPLETED || s.status === SessionStatus.SCHEDULED) &&
            isSameDay(parseISO(s.startTime), day)
        ).length;
        // Format: "L", "M", "X", "J", "V", "S", "D"
        const dayLabel = format(day, 'EEEEEE', { locale: es }).toUpperCase(); // Short day name
        return {
            day: dayLabel,
            count
        };
    });

    // 1. Next 7 Days
    const nextWeek = addDays(now, 7);
    const sessionsNextWeek = allSessions.filter(s =>
        s.status === SessionStatus.SCHEDULED &&
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
        sessionsThisMonth: completedThisMonth,
        sessionsLast30Days,
        weeklyLoad
    };
}




