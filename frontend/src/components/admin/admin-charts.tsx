'use client';

import { BarChart3, TrendingUp } from 'lucide-react';

interface RevenueData {
  label: string;
  totalRevenue: number;
  newRevenue: number;
  totalSubscriptions: number;
  newSubscriptions: number;
}

interface AdminChartsProps {
  revenueData?: RevenueData[];
  loading?: boolean;
}

// Demo data fallback
const defaultRevenueData: RevenueData[] = [
  { label: 'Ene', totalRevenue: 2400, newRevenue: 200, totalSubscriptions: 45, newSubscriptions: 5 },
  { label: 'Feb', totalRevenue: 3200, newRevenue: 300, totalSubscriptions: 52, newSubscriptions: 8 },
  { label: 'Mar', totalRevenue: 4100, newRevenue: 400, totalSubscriptions: 61, newSubscriptions: 12 },
  { label: 'Abr', totalRevenue: 3800, newRevenue: 150, totalSubscriptions: 58, newSubscriptions: 6 },
  { label: 'May', totalRevenue: 5200, newRevenue: 600, totalSubscriptions: 75, newSubscriptions: 18 },
  { label: 'Jun', totalRevenue: 6100, newRevenue: 500, totalSubscriptions: 82, newSubscriptions: 15 }
];

export default function AdminCharts({ revenueData, loading = false }: AdminChartsProps) {
  // Use passed data or default, but limit to last 6 for overview
  const data = (revenueData && revenueData.length > 0 ? revenueData : defaultRevenueData).slice(-6);

  // Map to display values (Total Revenue = MRR, Subscriptions = New Subs)
  const displayData = data.map(d => ({
    label: d.label,
    revenue: d.totalRevenue || 0,
    subscriptions: d.newSubscriptions || 0
  }));

  const maxRevenue = Math.max(...displayData.map(d => d.revenue));
  const maxSubscriptions = Math.max(...displayData.map(d => d.subscriptions));

  const totalRevenue = displayData.reduce((sum, d) => sum + d.revenue, 0); // Note: summing MRR over months is confusing, but this was original logic. 
  // Wait, original logic: data.reduce((sum, d) => sum + d.revenue, 0); 
  // If revenue was MRR, then sum is just sum of MRR snapshots? Sure, keeps original behavior.
  const totalSubscriptions = displayData.reduce((sum, d) => sum + d.subscriptions, 0);
  const avgRevenue = totalRevenue / displayData.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ingresos Mensuales</h3>
            <p className="text-sm text-gray-500">Últimos 6 meses</p>
          </div>
          <div className="flex items-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">+12.5%</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{totalRevenue}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{Math.round(avgRevenue)}</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{displayData[displayData.length - 1]?.revenue || 0}</p>
            <p className="text-xs text-gray-500">Este mes</p>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-2">
          {displayData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 text-xs text-gray-600 font-medium whitespace-nowrap">
                {item.label}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      €{item.revenue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Nuevas Suscripciones</h3>
            <p className="text-sm text-gray-500">Crecimiento mensual</p>
          </div>
          <div className="flex items-center text-purple-600">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">+8.3%</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalSubscriptions}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalSubscriptions / displayData.length)}</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{displayData[displayData.length - 1]?.subscriptions || 0}</p>
            <p className="text-xs text-gray-500">Este mes</p>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-2">
          {displayData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 text-xs text-gray-600 font-medium whitespace-nowrap">
                {item.label}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${maxSubscriptions > 0 ? (item.subscriptions / maxSubscriptions) * 100 : 0}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {item.subscriptions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}