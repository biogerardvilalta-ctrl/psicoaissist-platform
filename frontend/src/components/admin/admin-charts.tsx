'use client';

import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
}

interface AdminChartsProps {
  revenueData?: RevenueData[];
  loading?: boolean;
}

// Demo data
const defaultRevenueData: RevenueData[] = [
  { month: 'Ene', revenue: 2400, subscriptions: 45 },
  { month: 'Feb', revenue: 3200, subscriptions: 52 },
  { month: 'Mar', revenue: 4100, subscriptions: 61 },
  { month: 'Abr', revenue: 3800, subscriptions: 58 },
  { month: 'May', revenue: 5200, subscriptions: 75 },
  { month: 'Jun', revenue: 6100, subscriptions: 82 }
];

export default function AdminCharts({ revenueData = defaultRevenueData, loading = false }: AdminChartsProps) {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
  const maxSubscriptions = Math.max(...revenueData.map(d => d.subscriptions));
  
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSubscriptions = revenueData.reduce((sum, d) => sum + d.subscriptions, 0);
  const avgRevenue = totalRevenue / revenueData.length;

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
            <p className="text-2xl font-bold text-gray-900">€{(totalRevenue / 1000).toFixed(1)}k</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{Math.round(avgRevenue)}</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{revenueData[revenueData.length - 1]?.revenue || 0}</p>
            <p className="text-xs text-gray-500">Este mes</p>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-2">
          {revenueData.map((data, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 text-xs text-gray-600 font-medium">
                {data.month}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      €{(data.revenue / 1000).toFixed(1)}k
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
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalSubscriptions / revenueData.length)}</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{revenueData[revenueData.length - 1]?.subscriptions || 0}</p>
            <p className="text-xs text-gray-500">Este mes</p>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-2">
          {revenueData.map((data, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 text-xs text-gray-600 font-medium">
                {data.month}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${(data.subscriptions / maxSubscriptions) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {data.subscriptions}
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