'use client';

import { useState, useEffect } from 'react';

export interface DashboardStats {
  activePatients: number;
  completedSessions: number;
  totalHours: number;
  generatedReports: number;
  trends: {
    patients: { value: number; isPositive: boolean };
    sessions: { value: number; isPositive: boolean };
    hours: { value: number; isPositive: boolean };
    reports: { value: number; isPositive: boolean };
  };
}

export interface SessionData {
  individual: number;
  group: number;
  family: number;
}

export interface TechniquesData {
  tcc: number;
  mindfulness: number;
  emdr: number;
  others: number;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [techniquesData, setTechniquesData] = useState<TechniquesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular datos desde el backend por ahora
    // TODO: Conectar con APIs reales
    setTimeout(() => {
      setStats({
        activePatients: 12,
        completedSessions: 48,
        totalHours: 36.5,
        generatedReports: 24,
        trends: {
          patients: { value: 25, isPositive: true },
          sessions: { value: 12, isPositive: true },
          hours: { value: 8, isPositive: true },
          reports: { value: 15, isPositive: true },
        }
      });

      setSessionData({
        individual: 32,
        group: 12,
        family: 4
      });

      setTechniquesData({
        tcc: 35,
        mindfulness: 25,
        emdr: 15,
        others: 10
      });

      setLoading(false);
    }, 1000);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implementar llamadas reales al backend
      // const response = await DashboardAPI.getStats();
      // setStats(response);
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      setLoading(false);
    }
  };

  return {
    stats,
    sessionData,
    techniquesData,
    loading,
    error,
    refreshData
  };
}